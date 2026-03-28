"""
Centralized LLM Provider for Mental Health Chatbot
Configures Google Gemini with safety settings appropriate for mental health support.
"""

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
from dotenv import load_dotenv

load_dotenv()

# Get API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure the API
genai.configure(api_key=GEMINI_API_KEY)

# Safety settings optimized for mental health support
# We need to be careful but not overly restrictive for mental health conversations
MENTAL_HEALTH_SAFETY_SETTINGS = {
    # Allow discussion of mental health topics including self-harm for supportive responses
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    # More permissive for dangerous content to allow mental health crisis discussions
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
}

# System instruction for mental health context
MENTAL_HEALTH_SYSTEM_INSTRUCTION = """You are a compassionate mental health support assistant.

CORE GUIDELINES:
- Listen empathetically and validate feelings without judgment
- Offer evidence-based coping strategies when appropriate
- Encourage professional help for serious concerns
- NEVER diagnose conditions or prescribe medications
- NEVER minimize users' experiences

CRISIS PROTOCOL:
If someone mentions self-harm or suicide, express care, provide crisis resources (1166 Lifeline for Nepal), and encourage professional help.

TONE: Warm, patient, hopeful, and professional."""

# Create the configured model
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    safety_settings=MENTAL_HEALTH_SAFETY_SETTINGS,
    system_instruction=MENTAL_HEALTH_SYSTEM_INSTRUCTION
)

# For tasks that don't need the mental health system instruction (like analysis)
model_basic = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    safety_settings=MENTAL_HEALTH_SAFETY_SETTINGS
)


def get_chat_response(prompt: str, user_assessment: dict = None) -> str:
    """
    Get a response from the mental health-configured model.
    
    Args:
        prompt: The user's message or query
        user_assessment: Optional dict with user's initial assessment data
        
    Returns:
        The model's response text
    """
    # Build personalized context if assessment is available
    personalized_context = ""
    if user_assessment:
        criticality = user_assessment.get("criticality", "unknown")
        concerns = user_assessment.get("mental_health_concerns", [])
        domain = user_assessment.get("domain", "general")
        primary = user_assessment.get("primary_concern", "")
        
        personalized_context = f"""
USER CONTEXT (keep this in mind but don't explicitly mention unless relevant):
- Primary concern area: {primary}
- Related concerns: {', '.join(concerns) if concerns else 'Not specified'}
- Life domain affected: {domain}
- Support level needed: {criticality}

Tailor your response to be sensitive to these factors.

"""
    
    full_prompt = personalized_context + prompt
    response = model.generate_content(full_prompt)
    return response.text


def get_basic_response(prompt: str) -> str:
    """
    Get a response from the basic model (for analysis tasks).
    
    Args:
        prompt: The prompt for analysis
        
    Returns:
        The model's response text
    """
    response = model_basic.generate_content(prompt)
    return response.text
