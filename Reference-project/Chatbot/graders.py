from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from Chatbot.llm_config import llm

# ============== RETRIEVAL GRADER ==============
class GradeDocument(BaseModel):
    """Binary score for relevance check on retrieved documents."""
    binary_score: str = Field(
        description="Document is relevant to the mental health question, 'yes' or 'no'"
    )

structured_llm_grader = llm.with_structured_output(GradeDocument)

# Grader Prompt for Mental Health
system = """You are a grader assessing the relevance of retrieved documents to mental health questions.

Consider a document relevant if it contains:
- Information about mental health conditions, symptoms, or treatments
- Coping strategies, therapeutic techniques, or wellness advice
- Resources, support systems, or professional guidance
- Related psychological or emotional wellbeing content

The goal is to filter out completely unrelated documents while being inclusive of potentially helpful content.
Give a binary score 'yes' or 'no' to indicate document relevance."""

grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)

retrieval_grader = grade_prompt | structured_llm_grader


# ============== HALLUCINATION GRADER ==============
class GradeHallucination(BaseModel):
    """Binary score for hallucination check on generated text."""
    binary_score: str = Field(
        description="Response is grounded in the provided facts, 'yes' or 'no'"
    )

structured_llm_hallucination_grader = llm.with_structured_output(GradeHallucination)

system = """You are a grader assessing whether an LLM's mental health response is grounded in the retrieved facts.

This is important for mental health content to ensure:
- Information is accurate and not fabricated
- Advice aligns with the source material
- No harmful misinformation is generated

Give a binary score 'yes' or 'no'. 'Yes' means the response is supported by the facts."""

hallucination_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"),
    ]
)

hallucination_grader = hallucination_prompt | structured_llm_hallucination_grader


# ============== ANSWER GRADER ==============
class GradeAnswer(BaseModel):
    """Binary score to assess if answer addresses the question."""
    binary_score: str = Field(
        description="Response addresses the user's mental health question, 'yes' or 'no'"
    )

structured_llm_answer_grader = llm.with_structured_output(GradeAnswer)

system = """You are a grader assessing whether a mental health response adequately addresses the user's question.

Consider:
- Does the response directly answer what was asked?
- Is the information relevant and helpful?
- Does it provide actionable guidance or support?

Give a binary score 'yes' or 'no'. 'Yes' means the response addresses the question."""

answer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "User question: \n\n {question} \n\n LLM generation: {generation}"),
    ]
)

answer_grader = answer_prompt | structured_llm_answer_grader
