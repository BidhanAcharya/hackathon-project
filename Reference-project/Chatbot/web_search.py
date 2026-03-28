"""
Web Search Tool for Mental Health Chatbot
Simplified version focused on mental health queries
"""

from langchain_tavily import TavilySearch

# Initialize web search tool for mental health searches
# Note: Replace with your actual Tavily API key
web_search_tool = TavilySearch(
    max_results=3,
    tavily_api_key="TAVILY_API_KEY"  # TODO: Use environment variable
)
