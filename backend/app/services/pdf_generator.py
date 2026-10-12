import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def generate_user_data_pdf(user_data: dict) -> io.BytesIO:
    """
    Generates a professional PDF document containing the user's
    CareerIQ account data, profile, verified skills, and career recommendations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1e3a8a')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("CareerIQ — Candidate Data & Intelligence Report", header_style))
    story.append(Paragraph(f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} | Official Export", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=2, spaceAfter=14))

    account = user_data.get("account", {})
    profile = user_data.get("profile", {})
    preferences = user_data.get("preferences", {})

    # 2. Account Details Table
    story.append(Paragraph("1. Account & Personal Information", section_title_style))
    account_info = [
        [Paragraph("Candidate Name:", bold_body_style), Paragraph(str(account.get("full_name", "N/A")), body_style),
         Paragraph("User ID:", bold_body_style), Paragraph(f"#{account.get('user_id', 'N/A')}", body_style)],
        [Paragraph("Email Address:", bold_body_style), Paragraph(str(account.get("email", "N/A")), body_style),
         Paragraph("Account Role:", bold_body_style), Paragraph(str(account.get("role", "Candidate")).capitalize(), body_style)],
        [Paragraph("Phone Number:", bold_body_style), Paragraph(str(profile.get("phone") or "Not provided"), body_style),
         Paragraph("Location / City:", bold_body_style), Paragraph(str(profile.get("city") or "Not provided"), body_style)],
    ]
    t1 = Table(account_info, colWidths=[110, 160, 100, 170])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t1)
    story.append(Spacer(1, 12))

    # Summary
    if profile.get("summary"):
        story.append(Paragraph("Profile Summary:", bold_body_style))
        story.append(Paragraph(str(profile.get("summary")), body_style))
        story.append(Spacer(1, 10))

    # 3. Preferences Table
    story.append(Paragraph("2. Career Preferences & Target Role", section_title_style))
    pref_info = [
        [Paragraph("Preferred Location:", bold_body_style), Paragraph(str(preferences.get("preferred_location") or "Any"), body_style)],
        [Paragraph("Work Mode:", bold_body_style), Paragraph(str(preferences.get("work_mode") or "Flexible / Any"), body_style)],
        [Paragraph("Expected Salary:", bold_body_style), Paragraph(f"INR {preferences.get('expected_salary'):,.2f}" if preferences.get("expected_salary") else "Not specified", body_style)],
    ]
    t2 = Table(pref_info, colWidths=[140, 400])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 12))

    # 4. Verified Skills
    skills = user_data.get("skills", [])
    story.append(Paragraph(f"3. Verified Skills Catalog ({len(skills)} Skills Found)", section_title_style))
    if skills:
        skill_names = [f"• {s.get('skill')} ({s.get('source', 'verified')})" for s in skills]
        # Arrange in 3 columns
        cols = 3
        rows = []
        for i in range(0, len(skill_names), cols):
            chunk = skill_names[i:i+cols]
            while len(chunk) < cols:
                chunk.append("")
            rows.append([Paragraph(item, body_style) for item in chunk])
        
        t3 = Table(rows, colWidths=[180, 180, 180])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t3)
    else:
        story.append(Paragraph("No skills recorded in profile yet. Upload a resume to automatically extract skills.", body_style))
    story.append(Spacer(1, 12))

    # 5. AI Career Recommendations
    analysis_history = user_data.get("analysis_history", [])
    story.append(Paragraph("4. AI Career Recommendation Results", section_title_style))
    if analysis_history:
        latest = analysis_history[-1]
        recs = latest.get("recommendations", [])
        rec_table_data = [[
            Paragraph("Rank", bold_body_style),
            Paragraph("Recommended Role", bold_body_style),
            Paragraph("Match Score", bold_body_style)
        ]]
        for r in recs:
            rec_table_data.append([
                Paragraph(f"#{r.get('rank', 1)}", body_style),
                Paragraph(str(r.get("role", "")), bold_body_style),
                Paragraph(f"{r.get('match', 0)}%", body_style)
            ])
        t4 = Table(rec_table_data, colWidths=[60, 360, 120])
        t4.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t4)
    else:
        story.append(Paragraph("No AI recommendations generated yet.", body_style))
    story.append(Spacer(1, 20))

    # Footer note
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=8, spaceAfter=8))
    footer_text = Paragraph(
        "CareerIQ Platform — Autonomous Career Intelligence System. Confidential Candidate Record.",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)
    )
    story.append(footer_text)

    doc.build(story)
    buffer.seek(0)
    return buffer
