import logging

from typing import Any

from dataclasses import dataclass
from pathlib import Path

from app.core.config import settings
from Chatbot.llm_config import llm
from langchain_core.prompts import ChatPromptTemplate

    
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
            query_template = ChatPromptTemplate.from_messages([
                ("system",
                "You are a query rewriting specialist for a Mental Health Support Chatbot."
                " From the input of previous chat history and the human input, generate a clear, empathetic query that captures the user's emotional state and concerns. Keep it concise - no more than two sentences."),
                ("system", "STRICTLY RESPOND WITH THE FINAL QUERY ONLY, NO ADDITIONAL TEXT AND PREAMBLE."),
                ("system", f"Previous Chat History (for context, if relevant):\n{chat_context}"),
                ("human", "{input}")
            ])
            
            query = query_template.format(input= query)
            response = llm.invoke(query)
            new_query = response.content
            return new_query
