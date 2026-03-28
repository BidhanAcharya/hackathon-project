import logging

from typing import Any

from dataclasses import dataclass
from pathlib import Path

from app.core.config import settings
from app.core.llm import get_basic_response

    
def rewrite_query(query: str, chat_context: str) -> str:
        """
        Function to rewrite the query using a large language model.
        
        Args:
            query (str): The original query to be rewritten.
        
        Returns:
            str: The rewritten query.
        """
        if chat_context is None:
            return query
        else:
            prompt = f"""You are a query rewriting specialist for a Mental Health Support Chatbot.
From the input of previous chat history and the human input, generate a clear, empathetic query that captures the user's emotional state and concerns. Keep it concise - no more than two sentences.

STRICTLY RESPOND WITH THE FINAL QUERY ONLY, NO ADDITIONAL TEXT AND PREAMBLE.

Previous Chat History (for context, if relevant):
{chat_context}

User Input: {query}

Rewritten Query:"""
            
            new_query = get_basic_response(prompt)
            return new_query.strip()
