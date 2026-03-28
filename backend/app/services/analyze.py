
from app.models.models import DomainExpertise
from app.core.llm import get_basic_response
import re
import json

ALLOWED_DOMAINS = [d.value for d in DomainExpertise if d != DomainExpertise.GENERAL]

# Criticality levels
CRITICALITY_LEVELS = ["low", "moderate", "high", "critical"]

# Common mental health concerns
MENTAL_HEALTH_CONCERNS = [
    "anxiety",
    "depression", 
    "stress",
    "burnout",
    "grief",
    "loneliness",
    "relationship_issues",
    "self_esteem",
    "trauma",
    "sleep_issues",
    "anger_management",
    "general_wellbeing"
]

def onboarding_assesment(user_input: str) -> dict:
    """
    Analyze user's questionnaire responses to determine:
    - Criticality level of their mental state
    - Potential mental health concerns
    - Domain/situation causing the problem
    
    Args:
        user_input: The user's responses to mental health questionnaire
        
    Returns:
        dict with assessment results
    """
    
    prompt = f"""You are a mental health assessment specialist. Analyze the following questionnaire responses and provide an initial assessment.

IMPORTANT: You are NOT diagnosing - you are providing an initial screening to guide appropriate support.

Analyze for:
1. CRITICALITY LEVEL - How urgent is this person's need for support?
   - "low": General wellness concerns, seeking self-improvement
   - "moderate": Noticeable distress affecting daily life, would benefit from support
   - "high": Significant distress, struggling to cope, needs prompt attention
   - "critical": Signs of crisis, self-harm thoughts, or immediate danger - needs urgent professional help

2. MENTAL HEALTH CONCERNS - What issues are indicated? (can be multiple)
   Options: {MENTAL_HEALTH_CONCERNS}

3. PROBLEM DOMAIN - What life area is primarily affected?
   Options: {ALLOWED_DOMAINS}
   Use "general" if unclear or multiple areas equally affected.

4. BRIEF SUMMARY - A compassionate, non-diagnostic summary (2-3 sentences)

5. RECOMMENDED ACTION - What type of support would be most helpful

User's Questionnaire Responses:
{user_input}

Return ONLY a JSON object in this exact format:
{{
    "criticality": "low|moderate|high|critical",
    "mental_health_concerns": ["concern1", "concern2"],
    "primary_concern": "main_concern",
    "domain": "relationship|financial|study|work|general",
    "summary": "Brief compassionate summary of the assessment",
    "recommended_action": "Suggested next steps",
    "crisis_detected": true|false
}}
"""

    response_text = get_basic_response(prompt)
    
    # Clean and parse the JSON response
    clean = re.sub(r"```json|```", "", response_text).strip()
    result = json.loads(clean)
    
    # Validate and sanitize the response
    if result.get("criticality") not in CRITICALITY_LEVELS:
        result["criticality"] = "moderate"
    
    if result.get("domain") not in ALLOWED_DOMAINS + ["general"]:
        result["domain"] = "general"
        
    # Ensure mental_health_concerns is a list
    if not isinstance(result.get("mental_health_concerns"), list):
        result["mental_health_concerns"] = ["general_wellbeing"]
    
    # Filter to valid concerns only
    result["mental_health_concerns"] = [
        c for c in result["mental_health_concerns"] 
        if c in MENTAL_HEALTH_CONCERNS
    ] or ["general_wellbeing"]
    
    # Ensure crisis_detected is boolean
    result["crisis_detected"] = bool(result.get("crisis_detected", False))
    
    # If critical, ensure crisis resources are mentioned
    if result["criticality"] == "critical" or result["crisis_detected"]:
        result["crisis_resources"] = {
            "message": "If you are in immediate danger, please contact emergency services or a crisis hotline.",
            "hotlines": [
                {"name": "Suicide prevention helpline", "number": "1166"},
                {"name": "Crisis Text Line", "number": "Text to 9847386158 "},
                {"name": "International Association for Suicide Prevention", "url": "https://www.iasp.info/resources/Crisis_Centres/"}
            ]
        }
    
    return result


def analyze_conversation(conversation: str) -> dict:

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

    response_text = get_basic_response(prompt)

    clean = re.sub(r"```json|```", "", response_text).strip()
    result = json.loads(clean)

    if result["domain"] not in ALLOWED_DOMAINS:
        result["domain"] = DomainExpertise.GENERAL.value

    return result