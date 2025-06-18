import smtplib
from email.message import EmailMessage
import os
from fpdf import FPDF
from io import BytesIO
import io
from dotenv import load_dotenv
from weasyprint import HTML


# טוען משתני סביבה מהקובץ .env
load_dotenv()

# משתני סביבה מהמייל
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))

def send_reset_email(to_email: str, reset_link: str):
   
    msg = EmailMessage()
    msg['Subject'] = 'איפוס סיסמה - טעם של שמחה 🍲'
    msg['From'] = f"טעם של שמחה <{EMAIL_ADDRESS}>"
    msg['To'] = to_email

    msg.set_content(f"""
היי 👋

קיבלת את המייל הזה כי ביקשת לאפס סיסמה באתר 'טעם של שמחה'.

להשלמת התהליך לחץ/י על הקישור הבא:

{reset_link}

אם לא אתה ביקשת – פשוט תתעלם.

בברכה,
צוות טעם של שמחה 💛
""")


    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print("✅ מייל נשלח בהצלחה!")
    except Exception as e:
        print("❌ שגיאה בשליחת מייל:", e)


def reverse_rtl(text: str) -> str:
    return text[::-1]



def generate_recipe_pdf(recipe) -> bytes:
    html_content = f"""
    <html lang="he" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    direction: rtl;
                    padding: 20px;
                    font-size: 16px;
                    line-height: 1.6;
                }}
                h1 {{
                    text-align: center;
                    color: #333;
                }}
                .section {{
                    margin-bottom: 20px;
                }}
                .label {{
                    font-weight: bold;
                    color: #444;
                }}
            </style>
        </head>
        <body>
            <h1>{recipe.title}</h1>
            <div class="section"><span class="label">תיאור:</span> {recipe.description or "אין"}</div>
            <div class="section"><span class="label">מצרכים:</span> {recipe.ingredients}</div>
            <div class="section"><span class="label">הוראות הכנה:</span> {recipe.instructions or "אין"}</div>
            <div class="section"><span class="label">נוצר על ידי:</span> {recipe.creator.username if recipe.creator else "לא ידוע"}</div>
        </body>
    </html>
    """
    pdf_bytes = HTML(string=html_content).write_pdf()
    return pdf_bytes


def send_recipe_email_with_pdf(to_email: str, recipe):
    pdf_bytes = generate_recipe_pdf(recipe)

    msg = EmailMessage()
    msg['Subject'] = f"📩 המתכון שביקשת - {recipe.title}"
    msg['From'] = f"טעם של שמחה <{EMAIL_ADDRESS}>"
    msg['To'] = to_email

    msg.set_content(f"""
שלום 👋

מצורף קובץ PDF עם המתכון שלך מתוך אתר 'טעם של שמחה'.

בתיאבון! 🍲

צוות טעם של שמחה 💛
""")

    msg.add_attachment(
        pdf_bytes,
        maintype='application',
        subtype='pdf',
        filename=f"{recipe.title}.pdf"
    )

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print("✅ PDF נשלח במייל בהצלחה!")
    except Exception as e:
        print("❌ שגיאה בשליחת מתכון במייל:", e)



def send_rating_notification_email(to_email: str, recipe_title: str, rating: int):
    msg = EmailMessage()
    msg['Subject'] = f"⭐ דירוג חדש למתכון שלך - {recipe_title}"
    msg['From'] = f"טעם של שמחה <{EMAIL_ADDRESS}>"
    msg['To'] = to_email

    msg.set_content(f"""
שלום 👋

המתכון שלך "{recipe_title}" קיבל דירוג חדש של {rating} כוכבים!

שמור/י על הקצב ושתף/י מתכונים נוספים 💛

צוות טעם של שמחה
""")

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
            print("📬 נשלח מייל לבעל המתכון על דירוג חדש!")
    except Exception as e:
        print("❌ שגיאה בשליחת מייל התראה על דירוג:", e)
