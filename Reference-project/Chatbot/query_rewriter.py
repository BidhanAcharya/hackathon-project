from typing import Literal
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from Chatbot.llm_config import llm

# ============== QUERY REWRITER FOR MENTAL HEALTH ==============
class RewriteQuery(BaseModel):
    """Rewrite a user query to a more specific mental health question."""
    query: str = Field(
        ..., description="Rewritten query optimized for mental health knowledge retrieval"
    )

structured_llm_query_rewriter = llm.with_structured_output(RewriteQuery)

system = """You are a mental health query optimizer. Your job is to rewrite user questions to improve retrieval from a mental health knowledge base.

Guidelines:
- Preserve the core intent and emotional context of the question
- Add relevant mental health terminology when appropriate
- Make the query more specific while keeping it natural
- If the question is about symptoms, include relevant condition names
- If about coping, include relevant therapeutic approaches

Examples:
- "I feel sad all the time" → "depression symptoms persistent sadness daily mood"
- "how to stop worrying" → "anxiety management techniques reduce worry coping strategies"
- "can't sleep lately" → "insomnia sleep problems mental health causes treatment"

Rewrite to optimize for finding helpful mental health information."""

re_write_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        (
            "human",
            "Here is the initial question: \n\n {question} \n Formulate an improved question for mental health retrieval.",
        ),
    ]
)

question_rewriter = re_write_prompt | structured_llm_query_rewriter



