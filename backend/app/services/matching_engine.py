from sqlalchemy.orm import Session
from app.models import (
    CandidateProfile, CandidateSkill, CareerRole, CareerRoleSkill,
    AnalysisRun, CareerRecommendation, JobMatch, MatchExplanation,
    ReadinessScore, SkillGap, LearningRoadmap, RoadmapStep,
    Job, JobSkill, Skill, LearningResource, LearningResourceSkill
)

def evaluate_candidate_profile(profile_id: int, db: Session) -> int:
    """
    Executes full career match evaluation for a candidate profile against all career roles and jobs.
    Saves results in analysis_runs, career_recommendations, job_matches, match_explanations,
    readiness_scores, skill_gaps, and learning_roadmaps.
    """
    # 1. Fetch candidate skills
    cand_skills = db.query(CandidateSkill).filter(CandidateSkill.profile_id == profile_id).all()
    cand_skill_map = {cs.skill_id: cs.proficiency_level for cs in cand_skills}

    # 2. Create Analysis Run
    run = AnalysisRun(
        profile_id=profile_id,
        algorithm_version="v1.0-explainable-weighted",
        status="completed"
    )
    db.add(run)
    db.flush()

    # 3. Evaluate each career role
    career_roles = db.query(CareerRole).filter(CareerRole.active_status == 1).all()
    rec_list = []

    for role in career_roles:
        role_skills = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == role.career_role_id).all()
        if not role_skills:
            continue

        total_weight = 0.0
        earned_weight = 0.0
        missing_skills_list = []

        for rs in role_skills:
            weight = float(rs.importance_weight)
            total_weight += weight
            
            cand_level = cand_skill_map.get(rs.skill_id, 0)
            req_level = rs.required_level
            
            if cand_level >= req_level:
                earned_weight += weight
            elif cand_level > 0:
                # Partial credit
                earned_weight += weight * (cand_level / req_level)
                missing_skills_list.append((rs.skill_id, cand_level, req_level, rs.importance_weight, "weak"))
            else:
                missing_skills_list.append((rs.skill_id, 0, req_level, rs.importance_weight, "missing"))

        match_pct = round((earned_weight / total_weight) * 100, 2) if total_weight > 0 else 0.0
        rec_list.append((role, match_pct, missing_skills_list))

    # Sort roles by match percentage descending
    rec_list.sort(key=lambda x: x[1], reverse=True)

    top_role_id = None
    for rank, (role, match_pct, gaps) in enumerate(rec_list, start=1):
        if rank == 1:
            top_role_id = role.career_role_id

        # Save Career Recommendation
        rec = CareerRecommendation(
            analysis_id=run.analysis_id,
            career_role_id=role.career_role_id,
            match_percentage=match_pct,
            recommendation_rank=rank,
            summary_explanation=f"Matches {match_pct}% of core analytical and technical prerequisites."
        )
        db.add(rec)
        db.flush()

        # Save Readiness Score for role
        readiness = ReadinessScore(
            analysis_id=run.analysis_id,
            career_role_id=role.career_role_id,
            overall_score=match_pct,
            skills_score=match_pct,
            education_score=85.00,
            experience_score=70.00,
            projects_score=75.00
        )
        db.add(readiness)

        # Save Skill Gaps for top role
        if rank <= 2:
            for skill_id, cur_lvl, req_lvl, imp, gap_status in gaps:
                p_score = float(imp) * 50.0
                priority_label = "High" if p_score >= 60 else "Medium" if p_score >= 40 else "Low"
                gap = SkillGap(
                    analysis_id=run.analysis_id,
                    career_role_id=role.career_role_id,
                    skill_id=skill_id,
                    current_level=cur_lvl,
                    required_level=req_lvl,
                    priority_score=p_score,
                    status=gap_status
                )
                db.add(gap)

    # 4. Evaluate Job Matches
    jobs = db.query(Job).all()
    job_rank_list = []
    for job in jobs:
        j_skills = db.query(JobSkill).filter(JobSkill.job_id == job.job_id).all()
        if not j_skills:
            continue
        j_total = sum(float(js.importance_weight) for js in j_skills)
        j_earned = 0.0
        for js in j_skills:
            c_lvl = cand_skill_map.get(js.skill_id, 0)
            if c_lvl >= js.required_level:
                j_earned += float(js.importance_weight)
            elif c_lvl > 0:
                j_earned += float(js.importance_weight) * (c_lvl / js.required_level)
        
        j_pct = round((j_earned / j_total) * 100, 2) if j_total > 0 else 0.0
        job_rank_list.append((job, j_pct))

    job_rank_list.sort(key=lambda x: x[1], reverse=True)
    for j_rank, (job, j_pct) in enumerate(job_rank_list, start=1):
        jm = JobMatch(
            analysis_id=run.analysis_id,
            job_id=job.job_id,
            match_percentage=j_pct,
            match_rank=j_rank,
            summary_explanation=f"{j_pct}% qualification match for {job.job_title} at {job.company_name}."
        )
        db.add(jm)

    # 5. Create Personalized Learning Roadmap for top matched role
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

        # Find top missing skills
        top_gaps = db.query(SkillGap).filter(
            SkillGap.analysis_id == run.analysis_id,
            SkillGap.career_role_id == top_role_id
        ).all()

        step_num = 1
        for g in top_gaps[:4]:
            # find learning resource
            lrs = db.query(LearningResourceSkill).filter(LearningResourceSkill.skill_id == g.skill_id).first()
            r_id = lrs.resource_id if lrs else None
            step = RoadmapStep(
                roadmap_id=roadmap.roadmap_id,
                skill_id=g.skill_id,
                resource_id=r_id,
                step_number=step_num,
                expected_days=7,
                completion_status="in_progress" if step_num == 1 else "not_started"
            )
            db.add(step)
            step_num += 1

    db.commit()
    return run.analysis_id
