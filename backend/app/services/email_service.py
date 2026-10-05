import smtplib
import socket
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME,
)

DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "sharklasers.com",
    "getairmail.com",
    "throwawaymail.com",
    "temp-mail.org",
    "trashmail.com",
    "yopmail.com",
}

def is_valid_email_domain(email: str) -> tuple[bool, str]:
    """
    Validates if the email syntax is correct, domain has valid MX/A DNS records,
    and is not a temporary disposable inbox.
    """
    if "@" not in email:
        return False, "Invalid email format. Missing '@'."
    
    parts = email.strip().split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        return False, "Invalid email address format."
    
    domain = parts[1].lower()

    if domain in DISPOSABLE_DOMAINS:
        return False, "Disposable / temporary email addresses are not allowed. Please use a real email."

    # DNS check for domain validity
    try:
        socket.gethostbyname(domain)
    except socket.gaierror:
        return False, f"The email domain '@{domain}' does not exist or cannot receive emails."
    
    return True, "Valid domain"


def generate_otp() -> str:
    """Generates a secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def send_otp_email(to_email: str, full_name: str, otp_code: str) -> tuple[bool, str]:
    """
    Sends a formatted HTML verification email containing the 6-digit OTP.
    Falls back gracefully if SMTP credentials are not yet configured.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"\n=======================================================")
        print(f"[CareerIQ DEV OTP] To: {to_email} | Name: {full_name}")
        print(f"[CareerIQ DEV OTP] Code: {otp_code} (Valid for 10 minutes)")
        print(f"[CareerIQ DEV OTP] Notice: Set SMTP_USER & SMTP_PASSWORD in backend/.env for real inbox delivery")
        print(f"=======================================================\n")
        return True, "DEV_MODE"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your CareerIQ Verification Code: {otp_code}"
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL or SMTP_USER}>"
        msg["To"] = to_email

        text_content = f"Hello {full_name},\n\nYour CareerIQ verification code is: {otp_code}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email."

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }}
            .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; }}
            .content {{ padding: 32px 28px; }}
            .greeting {{ font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }}
            .text {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }}
            .otp-box {{ background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }}
            .otp-label {{ font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1d4ed8; letter-spacing: 1px; margin-bottom: 6px; }}
            .otp-code {{ font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #1e40af; letter-spacing: 8px; margin: 0; }}
            .expiry {{ font-size: 12px; color: #64748b; margin-top: 8px; }}
            .footer {{ background: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CareerIQ</h1>
              <p>AI Career Intelligence & Recommendation Platform</p>
            </div>
            <div class="content">
              <div class="greeting">Hello {full_name},</div>
              <p class="text">Thank you for getting started with CareerIQ. Please use the following 6-digit verification code to confirm your email and complete your registration.</p>
              
              <div class="otp-box">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">{otp_code}</div>
                <div class="expiry">Expires in 10 minutes</div>
              </div>

              <p class="text" style="font-size: 13px; margin-bottom: 0;">If you did not attempt to create a CareerIQ account, please disregard this email. Your email address remains secure.</p>
            </div>
            <div class="footer">
              &copy; 2026 CareerIQ Platform. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Connect to SMTP server
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL or SMTP_USER, to_email, msg.as_string())

        return True, "Email sent successfully"

    except Exception as e:
        print(f"[Email Error] Failed to send email to {to_email}: {str(e)}")
        return False, str(e)


def test_smtp_connection(host=None, port=None, user=None, password=None) -> tuple[bool, str]:
    """Tests the SMTP credentials handshake."""
    h = host or SMTP_HOST
    p = port or SMTP_PORT
    u = user or SMTP_USER
    pwd = password or SMTP_PASSWORD

    if not u or not pwd:
        return False, "SMTP Username and Password are required."

    try:
        with smtplib.SMTP(h, p, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(u, pwd)
        return True, "SMTP connection and authentication successful!"
    except Exception as e:
        return False, f"SMTP Authentication failed: {str(e)}"
