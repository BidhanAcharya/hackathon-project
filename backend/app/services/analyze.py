
import google.generativeai as genai
from app.models.models import DomainExpertise
import re
import json

genai.configure(api_key="AIzaSyCOIO38luqg-jil4gw18h-5VhqvpApeu7E")
model = genai.GenerativeModel("gemini-2.0-flash")
ALLOWED_DOMAINS = [d.value for d in DomainExpertise if d != DomainExpertise.GENERAL]


def analyze_conversation(conversation: str) -> dict:
    try:
        prompt = f"""
You are a mental health assistant.
Analyze the following conversation and determine the domain of the problem.
You MUST return only one of these exact values:
{ALLOWED_DOMAINS}

If the conversation does not clearly match any of these, return "general".
Return ONLY a JSON object like this, nothing else:
{{
    "domain": "financial"
}}

Conversation:
{conversation}
"""
        response = model.generate_content(prompt)
        clean = re.sub(r"```json|```", "", response.text).strip()
        result = json.loads(clean)

        if result.get("domain") not in ALLOWED_DOMAINS:
            result["domain"] = DomainExpertise.GENERAL.value

        return result
    except Exception:
        return {"domain": DomainExpertise.GENERAL.value}