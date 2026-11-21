from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session
from app.models import (
    CandidateProfile, CandidateSkill, CareerRole, CareerRoleSkill,
    AnalysisRun, CareerRecommendation, JobMatch, MatchExplanation,
    ReadinessScore, SkillGap, LearningRoadmap, RoadmapStep,
    Job, JobSkill, Skill, LearningResource, LearningResourceSkill, Resume
)
from app.services.career_catalog import detect_role_name, title_fit

ALGORITHM_VERSION = "v2.0-resume-title-aware"

# Career match = 60% skill coverage + 40% fit with the job title written on the resume.
# Readiness = skill coverage only (how ready the candidate is for that role today).
SKILL_WEIGHT = 0.6
TITLE_WEIGHT = 0.4


def skill_coverage(requirements, cand_skill_map: Dict[int, int]) -> float:
    """Weighted % of required skills the candidate has (partial credit for lower levels).
    `requirements` is a list of objects with skill_id, required_level and importance_weight."""
    total = earned = 0.0
    for req in requirements:
        weight = float(req.importance_weight)
        total += weight
        level = cand_skill_map.get(req.skill_id, 0)
        if level >= req.required_level:
            earned += weight
        elif level > 0:
            earned += weight * (level / req.required_level)
    return round(earned / total * 100, 2) if total > 0 else 0.0


def career_match(skill_pct: float, fit: float, resume_role_name: Optional[str]) -> float:
    """Blends skill coverage with title fit. Without a detected resume title it is skill coverage alone."""
    if not resume_role_name:
        return round(skill_pct, 2)
    return round(SKILL_WEIGHT * skill_pct + TITLE_WEIGHT * fit, 2)


def latest_resume_role_name(profile_id: int, db: Session) -> Optional[str]:
    """Career role named in the candidate's latest resume (e.g. 'Android Developer'), if any."""
    resume = db.query(Resume).filter(Resume.profile_id == profile_id).order_by(Resume.resume_id.desc()).first()
    if not resume or not resume.extracted_text:
        return None
    name = detect_role_name(resume.extracted_text)
    if name and db.query(CareerRole).filter(CareerRole.role_name == name, CareerRole.active_status == 1).first():
        return name
    return None


def evaluate_candidate_profile(profile_id: int, db: Session, resume_role_name: Optional[str] = None) -> int:
    """
    Executes full career match evaluation for a candidate profile against all career roles and jobs.
    Roles and jobs are ranked by skill coverage AND by how well they fit the job title on the resume,
    so an Android resume ranks Android roles/jobs first.
    Saves results in analysis_runs, career_recommendations, job_matches, readiness_scores,
    skill_gaps and learning_roadmaps.
    """
    if resume_role_name is None:
        resume_role_name = latest_resume_role_name(profile_id, db)

    # 1. Candidate skills
    cand_skills = db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile_id).all()
    cand_skill_map = {cs.skill_id: cs.proficiency_level for cs in cand_skills}

    latest_resume = db.query(Resume).filter(Resume.profile_id == profile_id).order_by(Resume.resume_id.desc()).first()

    # 2. Analysis run
    run = AnalysisRun(
        profile_id=profile_id,
        resume_id=latest_resume.resume_id if latest_resume else None,
        algorithm_version=ALGORITHM_VERSION,
        status="completed"
    )
    db.add(run)
    db.flush()

    # 3. Evaluate each career role
    roles = db.query(CareerRole).filter(CareerRole.active_status == 1).all()
    role_names = {r.career_role_id: r.role_name for r in roles}
    rec_list = []
    for role in roles:
        role_skills = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == role.career_role_id).all()
        if not role_skills:
            continue
        skill_pct = skill_coverage(role_skills, cand_skill_map)
        fit = title_fit(role.role_name, resume_role_name)
        gaps = []
        for rs in role_skills:
            level = cand_skill_map.get(rs.skill_id, 0)
            if level < rs.required_level:
                gaps.append((rs.skill_id, level, rs.required_level, rs.importance_weight, "weak" if level > 0 else "missing"))
        rec_list.append((role, career_match(skill_pct, fit, resume_role_name), skill_pct, fit, gaps))

    # Best match first; on a tie prefer the better title fit, then more skills
    rec_list.sort(key=lambda x: (x[1], x[3], x[2]), reverse=True)

    top_role_id = None
    for rank, (role, match_pct, skill_pct, fit, gaps) in enumerate(rec_list, start=1):
        if rank == 1:
            top_role_id = role.career_role_id

        if fit == 100:
            why = f"Matches the job title on your resume ({resume_role_name}) and {skill_pct:.0f}% of the required skills."
        elif fit >= 60:
            why = f"Closely related to your resume title ({resume_role_name}); you cover {skill_pct:.0f}% of the required skills."
        elif fit > 0:
            why = f"A neighbouring path to {resume_role_name}; you cover {skill_pct:.0f}% of the required skills."
        else:
            why = f"You cover {skill_pct:.0f}% of the required skills for this role."

        db.add(CareerRecommendation(
            analysis_id=run.analysis_id,
            career_role_id=role.career_role_id,
            match_percentage=match_pct,
            recommendation_rank=rank,
            summary_explanation=why
        ))

        # Readiness = skill coverage for the role (what the candidate can do today)
        db.add(ReadinessScore(
            analysis_id=run.analysis_id,
            career_role_id=role.career_role_id,
            overall_score=skill_pct,
            skills_score=skill_pct,
            education_score=85.00,
            experience_score=70.00,
            projects_score=75.00
        ))

        for skill_id, cur_lvl, req_lvl, imp, gap_status in gaps:
            p_score = float(imp) * 50.0
            db.add(SkillGap(
                analysis_id=run.analysis_id,
                career_role_id=role.career_role_id,
                skill_id=skill_id,
                current_level=cur_lvl,
                required_level=req_lvl,
                priority_score=p_score,
                status=gap_status
            ))
    db.flush()

    # 4. Job matches: same blend, using the role each job belongs to
    job_rank_list = []
    for job in db.query(Job).all():
        j_skills = db.query(JobSkill).filter(JobSkill.job_id == job.job_id).all()
        if not j_skills:
            continue
        j_skill_pct = skill_coverage(j_skills, cand_skill_map)
        j_fit = title_fit(role_names.get(job.career_role_id, ""), resume_role_name)
        job_rank_list.append((job, career_match(j_skill_pct, j_fit, resume_role_name), j_fit, j_skill_pct))

    job_rank_list.sort(key=lambda x: (x[1], x[2], x[3]), reverse=True)
    for j_rank, (job, j_pct, j_fit, j_skill_pct) in enumerate(job_rank_list, start=1):
        db.add(JobMatch(
            analysis_id=run.analysis_id,
            job_id=job.job_id,
            match_percentage=j_pct,
            match_rank=j_rank,
            summary_explanation=f"{j_pct}% match for {job.job_title} at {job.company_name} ({j_skill_pct:.0f}% of required skills)."
        ))

    # 5. Learning roadmap for the top role: most important missing skills first
    if top_role_id:
        top_role = db.query(CareerRole).filter(CareerRole.career_role_id == top_role_id).first()
        roadmap = LearningRoadmap(
            analysis_id=run.analysis_id,
            career_role_id=top_role_id,
            roadmap_title=f"30-Day Accelerated {top_role.role_name} Career Roadmap",
            status="in_progress"
        )
        db.add(roadmap)
        db.flush()

        top_gaps = db.query(SkillGap).filter(
            SkillGap.analysis_id == run.analysis_id,
            SkillGap.career_role_id == top_role_id
        ).all()
        top_gaps.sort(key=lambda g: (g.status != "missing", -float(g.priority_score)))

        for step_num, g in enumerate(top_gaps[:4], start=1):
            lrs = db.query(LearningResourceSkill).filter(LearningResourceSkill.skill_id == g.skill_id).first()
            db.add(RoadmapStep(
                roadmap_id=roadmap.roadmap_id,
                skill_id=g.skill_id,
                resource_id=lrs.resource_id if lrs else None,
                step_number=step_num,
                expected_days=7,
                completion_status="in_progress" if step_num == 1 else "not_started"
            ))

    db.commit()
    return run.analysis_id


def ensure_current_analysis(profile: CandidateProfile, db: Session) -> Optional[AnalysisRun]:
    """
    Latest analysis for the profile. Analyses made by the old engine (before resume-title
    matching) are recalculated once from the saved resume, so existing users get
    resume-based results without uploading again.
    """
    run = db.query(AnalysisRun).filter(AnalysisRun.profile_id == profile.profile_id).order_by(AnalysisRun.analysis_id.desc()).first()
    if run and run.algorithm_version != ALGORITHM_VERSION:
        has_resume = db.query(Resume).filter(Resume.profile_id == profile.profile_id).first() is not None
        if has_resume:
            new_id = evaluate_candidate_profile(profile.profile_id, db)
            run = db.query(AnalysisRun).filter(AnalysisRun.analysis_id == new_id).first()
    return run


def user_job_scores(user_id: int, db: Session) -> Tuple[Optional[str], Dict[int, dict]]:
    """
    Live match of every job for a user, with the same formula as the analysis
    (skill coverage + fit with the resume's job title).
    Returns (resume role name, {job_id: {match, fit, skill_pct, matched, missing}}).
    Empty when the user has not uploaded a resume.
    """
    from app.services.career_catalog import title_fit as _fit
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if not profile or not db.query(Resume).filter(Resume.profile_id == profile.profile_id).first():
        return None, {}
    resume_role = latest_resume_role_name(profile.profile_id, db)
    levels = {cs.skill_id: cs.proficiency_level for cs in
              db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile.profile_id).all()}
    role_names = {r.career_role_id: r.role_name for r in db.query(CareerRole).all()}

    reqs_by_job: Dict[int, list] = {}
    for js, sk in db.query(JobSkill, Skill).join(Skill, JobSkill.skill_id == Skill.skill_id).all():
        reqs_by_job.setdefault(js.job_id, []).append((js, sk.skill_name))

    scores = {}
    for job in db.query(Job).all():
        reqs = reqs_by_job.get(job.job_id, [])
        skill_pct = skill_coverage([js for js, _ in reqs], levels) if reqs else 0.0
        fit = _fit(role_names.get(job.career_role_id, ""), resume_role)
        scores[job.job_id] = {
            "match": career_match(skill_pct, fit, resume_role),
            "fit": "resume" if fit == 100 else "related" if fit >= 60 else None,
            "skill_pct": round(skill_pct, 1),
            "matched": [name for js, name in reqs if levels.get(js.skill_id, 0) >= js.required_level],
            "missing": [name for js, name in reqs if levels.get(js.skill_id, 0) < js.required_level],
        }
    return resume_role, scores
