import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
from datetime import datetime, date
from sqlalchemy.orm import Session

import pypdf
import docx

from app.models import (
    CandidateProfile, CandidateSkill, Resume, Skill, SkillAlias, User,
    Education, Experience, CandidatePreference, CareerRole
)
from app.services.matching_engine import evaluate_candidate_profile
from app.services.career_catalog import detect_role_name
from app.config import UPLOAD_DIR


def extract_text_from_file(file_path: Path, file_ext: str) -> str:
    """Extracts raw text content from PDF or DOCX resume files."""
    text = ""
    ext = file_ext.lower().replace(".", "")

    if ext == "pdf":
        try:
            reader = pypdf.PdfReader(str(file_path))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            print(f"[PDF Extract Error] {e}")

    elif ext in ["docx", "doc"]:
        try:
            doc = docx.Document(str(file_path))
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text:
                            text += cell.text + " "
                    text += "\n"
        except Exception as e:
            print(f"[DOCX Extract Error] {e}")

    else:
        # Fallback to UTF-8 text read
        try:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            print(f"[Text Extract Error] {e}")

    return text.strip()


def extract_skills_from_text(text: str, db: Session) -> List[Skill]:
    """Matches text against database skills catalog and aliases."""
    normalized_text = " " + re.sub(r"[^\w\s\+\#\.]", " ", text.lower()) + " "
    db_skills = db.query(Skill).filter(Skill.active_status == 1).all()
    aliases = db.query(SkillAlias).all()

    alias_map: Dict[str, int] = {}
    for a in aliases:
        alias_map[a.alias_name.lower().strip()] = a.skill_id

    matched_skill_ids = set()
    skill_lookup = {s.skill_id: s for s in db_skills}

    for s in db_skills:
        s_name = s.skill_name.lower().strip()
        norm_name = (s.normalized_name or "").lower().strip()

        pattern = r"(?<!\w)" + re.escape(s_name) + r"(?!\w)"
        if re.search(pattern, normalized_text):
            matched_skill_ids.add(s.skill_id)
        elif norm_name and re.search(r"(?<!\w)" + re.escape(norm_name) + r"(?!\w)", normalized_text):
            matched_skill_ids.add(s.skill_id)

    for alias_name, s_id in alias_map.items():
        pattern = r"(?<!\w)" + re.escape(alias_name) + r"(?!\w)"
        if re.search(pattern, normalized_text):
            matched_skill_ids.add(s_id)

    return [skill_lookup[sid] for sid in matched_skill_ids if sid in skill_lookup]


def extract_basic_info(text: str) -> Dict[str, str]:
    """Extracts email, phone, education, and experience keywords from resume text."""
    info = {
        "email": "",
        "phone": "",
        "education": "Degree in Computer Science / IT / Engineering",
        "experience": "Fresher / Entry Level",
    }

    # Email extraction
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    if email_match:
        info["email"] = email_match.group(0)

    # Phone extraction
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    if phone_match:
        info["phone"] = phone_match.group(0)

    # Education detection
    edu_patterns = [
        ("MCA - Master of Computer Applications", r"\b(mca|master of computer applications?)\b"),
        ("B.Tech / B.E. in Computer Science", r"\b(b\.?tech|b\.?e\.?|bachelor of technology|bachelor of engineering)\b"),
        ("BCA - Bachelor of Computer Applications", r"\b(bca|bachelor of computer applications?)\b"),
        ("B.Sc / M.Sc in Computer Science / IT", r"\b(b\.?sc|m\.?sc|master of science|bachelor of science)\b"),
        ("MBA - Information Technology / Business Analytics", r"\b(mba|master of business administration)\b"),
    ]
    for label, pat in edu_patterns:
        if re.search(pat, text, re.IGNORECASE):
            info["education"] = label
            break

    # Experience detection
    exp_match = re.search(r"(\d+)\+?\s*(?:years?|yrs?|months?|mos?)\s*(?:of)?\s*experience", text, re.IGNORECASE)
    if exp_match:
        info["experience"] = exp_match.group(0).capitalize()
    elif re.search(r"\bintern(?:ship)?\b", text, re.IGNORECASE):
        info["experience"] = "Internship Experience"
    elif re.search(r"\bfresher|entry[- ]level|student\b", text, re.IGNORECASE):
        info["experience"] = "Fresher / Graduate"

    return info


# -----------------------------------------------------------------------------
# Section-based extraction (education / experience lines exactly as written)
# -----------------------------------------------------------------------------
EDUCATION_HEADINGS = ("education", "academic qualification", "academic qualifications",
                      "qualification", "qualifications", "academic background")
EXPERIENCE_HEADINGS = ("experience", "work experience", "professional experience", "employment",
                       "employment history", "internship", "internships", "internship experience", "work history")

BULLET_CHARS = "•●▪‣⁃�◦·"


def _clean_lines(text: str) -> List[str]:
    lines = []
    for raw in (text or "").splitlines():
        line = "".join(" " if ch in BULLET_CHARS else ch for ch in raw)
        line = re.sub(r"\s+", " ", line).strip(" -–—|:\t")
        if line:
            lines.append(line)
    return lines


def _is_heading(line: str) -> bool:
    letters = [c for c in line if c.isalpha()]
    if not letters or len(line) > 60:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    return upper_ratio > 0.8 and len(line.split()) <= 6


def _section_lines(lines: List[str], headings: Tuple[str, ...]) -> List[str]:
    """Returns the content lines that follow the first matching section heading."""
    for i, line in enumerate(lines):
        norm = re.sub(r"[^a-z ]", "", line.lower()).strip()
        if _is_heading(line) and any(norm == h or norm.startswith(h + " ") for h in headings):
            out = []
            for nxt in lines[i + 1:]:
                if _is_heading(nxt):
                    break
                out.append(nxt)
            return out
    return []


def extract_education_detail(text: str) -> Dict[str, Any]:
    """Degree, college and graduation year as written in the EDUCATION section."""
    body = _section_lines(_clean_lines(text), EDUCATION_HEADINGS)
    if not body:
        return {}
    degree = body[0]
    college_line = body[1] if len(body) > 1 else ""
    # Skip detail lines such as "GPA: 9.5/10" or "Relevant Coursework: ..."
    if re.match(r"^(gpa|cgpa|percentage|relevant|coursework|score)\b", college_line, re.IGNORECASE):
        college_line = ""
    college = college_line.split("|")[0].strip()
    years = re.findall(r"(?:19|20)\d{2}", " ".join(body[:2]))
    return {
        "degree": degree[:150],
        "college": college[:200],
        "end_year": int(years[-1]) if years else None,
    }


def extract_experience_detail(text: str) -> Dict[str, str]:
    """First role in the EXPERIENCE / INTERNSHIP section, e.g. 'Data Analyst Intern - ABC Ltd'."""
    body = _section_lines(_clean_lines(text), EXPERIENCE_HEADINGS)
    if not body:
        return {}
    first = body[0]
    parts = re.split(r"\s+[–—-]\s+|\s+at\s+|\s*\|\s*|,\s+", first, maxsplit=2)
    designation = parts[0].strip()
    if len(parts) > 1:
        company = parts[1].strip()
    else:
        company = body[1].split("|")[0].strip() if len(body) > 1 else ""
    return {"designation": designation[:150], "company": company[:200]}


def detect_resume_role(text: str, db: Session):
    """Career role named by the resume title / content, e.g. 'Android Developer' (see career_catalog)."""
    name = detect_role_name(text)
    if not name:
        return None
    return db.query(CareerRole).filter(CareerRole.role_name == name, CareerRole.active_status == 1).first()


def save_profile_details_from_resume(profile: CandidateProfile, raw_text: str, info: Dict[str, str], db: Session) -> Dict[str, str]:
    """Stores education and experience from the resume so the Profile page shows them."""
    edu = extract_education_detail(raw_text)
    exp = extract_experience_detail(raw_text)

    degree = edu.get("degree") or info.get("education", "")
    college = edu.get("college", "")
    edu_row = db.query(Education).filter(Education.profile_id == profile.profile_id).first()
    if not edu_row:
        edu_row = Education(profile_id=profile.profile_id, degree=degree, college=college)
        db.add(edu_row)
    edu_row.degree = degree
    edu_row.college = college
    edu_row.end_year = edu.get("end_year")

    designation = exp.get("designation") or info.get("experience", "")
    company = exp.get("company", "")
    exp_row = db.query(Experience).filter(Experience.profile_id == profile.profile_id).first()
    if not exp_row:
        exp_row = Experience(profile_id=profile.profile_id, designation=designation, company=company, start_date=date.today())
        db.add(exp_row)
    exp_row.designation = designation
    exp_row.company = company

    return {
        "education": f"{degree} — {college}" if college else degree,
        "experience": f"{designation} at {company}" if company else designation,
    }


def process_resume_upload(
    user_id: int,
    original_filename: str,
    file_bytes: bytes,
    db: Session
) -> Dict[str, Any]:
    """
    Saves resume file, extracts text and skills, assigns skills to candidate profile,
    runs matching engine, and returns complete analysis metrics.
    """
    # 1. Fetch or create CandidateProfile
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise ValueError("User not found.")

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.user_id).first()
    if not profile:
        profile = CandidateProfile(user_id=user.user_id)
        db.add(profile)
        db.flush()

    # 2. Save physical file
    file_ext = Path(original_filename).suffix.lower()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"resume_user_{user_id}_{timestamp}{file_ext}"
    dest_path = UPLOAD_DIR / safe_filename
    dest_path.write_bytes(file_bytes)

    # 3. Extract text
    raw_text = extract_text_from_file(dest_path, file_ext)

    # 4. Extract basic info and skills
    info = extract_basic_info(raw_text)
    matched_skills = extract_skills_from_text(raw_text, db)

    # Only skills actually written in the resume are used (no made-up default skills)
    resume_role = detect_resume_role(raw_text, db)

    # 5. Record Resume in database
    resume = Resume(
        profile_id=profile.profile_id,
        file_name=original_filename,
        storage_path=str(dest_path),
        extracted_text=raw_text[:5000] if raw_text else "",
        parser_status="completed"
    )
    db.add(resume)
    db.flush()

    # 6. Update Candidate Skills in database
    # Clear previous resume-parsed skills for fresh profile sync
    db.query(CandidateSkill).filter(
        CandidateSkill.profile_id == profile.profile_id,
        CandidateSkill.source == "resume"
    ).delete()

    for s in matched_skills:
        existing = db.query(CandidateSkill).filter(
            CandidateSkill.profile_id == profile.profile_id,
            CandidateSkill.skill_id == s.skill_id
        ).first()

        if not existing:
            cand_skill = CandidateSkill(
                profile_id=profile.profile_id,
                skill_id=s.skill_id,
                proficiency_level=3,
                experience_months=6,
                source="resume",
                extraction_confidence=0.92
            )
            db.add(cand_skill)

    db.flush()

    # 6b. Save education / experience shown on the Profile page
    profile_details = save_profile_details_from_resume(profile, raw_text, info, db)

    # 7. Execute AI Evaluation / Matching Engine for this profile
    analysis_id = evaluate_candidate_profile(
        profile_id=profile.profile_id, db=db,
        resume_role_name=resume_role.role_name if resume_role else "",
    )

    # 8. Query newly generated scores and top recommendations
    from app.models import AnalysisRun, CareerRecommendation, CareerRole, ReadinessScore
    top_rec = db.query(CareerRecommendation, CareerRole).join(
        CareerRole, CareerRecommendation.career_role_id == CareerRole.career_role_id
    ).filter(CareerRecommendation.analysis_id == analysis_id).order_by(CareerRecommendation.recommendation_rank.asc()).first()
    # Readiness rows are stored per role: use the one for the top role
    readiness = None
    if top_rec:
        readiness = db.query(ReadinessScore).filter(
            ReadinessScore.analysis_id == analysis_id,
            ReadinessScore.career_role_id == top_rec.CareerRole.career_role_id,
        ).first()

    # 8b. Target role follows the newly uploaded resume: the role named on the resume,
    #     else the top recommendation. The candidate can still change it on the Profile page.
    pref = db.query(CandidatePreference).filter(CandidatePreference.profile_id == profile.profile_id).first()
    if not pref:
        pref = CandidatePreference(profile_id=profile.profile_id)
        db.add(pref)
    new_target = resume_role or (top_rec.CareerRole if top_rec else None)
    if new_target:
        pref.target_role_id = new_target.career_role_id
        try:
            settings = json.loads(profile.settings_json) if profile.settings_json else {}
        except Exception:
            settings = {}
        if settings.pop("custom_target_role", None) is not None:
            profile.settings_json = json.dumps(settings)

    readiness_score = float(readiness.overall_score) if readiness else 0.0
    top_role_name = top_rec.CareerRole.role_name if top_rec else "No matching role"
    top_match_pct = float(top_rec.CareerRecommendation.match_percentage) if top_rec else 0.0

    db.commit()

    return {
        "success": True,
        "resume_id": resume.resume_id,
        "file_name": original_filename,
        "skills_extracted": [s.skill_name for s in matched_skills],
        "total_skills": len(matched_skills),
        "overall_readiness": readiness_score,
        "top_career_match": top_role_name,
        "top_match_percentage": top_match_pct,
        "analysis_id": analysis_id,
        "resume_role": resume_role.role_name if resume_role else None,
        "candidate_name": user.full_name,
        "candidate_email": info["email"] or user.email,
        "education": profile_details["education"],
        "experience": profile_details["experience"],
        "message": "Resume successfully analyzed! AI recommendations and readiness metrics generated."
    }
