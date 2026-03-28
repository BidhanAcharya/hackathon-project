from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from Chatbot.llm_config import llm

# Data model for routing user queries
class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource"""
    datasource: Literal["vectorstore", "websearch", "general_query"] = Field(
        ..., description="Given a user query choose to route it to vectorstore, websearch, or general_query"
    )

structured_llm_router = llm.with_structured_output(RouteQuery)

# Mental Health Query Router Prompt
system = """You are an expert mental health assistant routing system. Your job is to route user questions to the most appropriate handler.

**Route to 'vectorstore'** when the user asks about:
- Specific mental health conditions (depression, anxiety, PTSD, bipolar disorder, etc.)
- Treatment methods, therapies, or medications
- Symptoms and diagnosis information
- Coping strategies and techniques
- Mental health resources and support systems

**Route to 'websearch'** when the user asks about:
- Current mental health news or statistics
- Specific mental health organizations or hotlines
- Local mental health services or therapists
- Recent research or studies
- Information that requires up-to-date data

**Route to 'general_query'** when the user:
- Needs emotional support or someone to talk to
- Asks general wellness questions
- Wants general advice or encouragement
- Has conversational or casual questions
- Asks anything not specifically about mental health conditions

Always prioritize user safety. If someone appears to be in crisis, route to 'general_query' for immediate supportive response."""

route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}")
    ]
)

question_router = route_prompt | structured_llm_router