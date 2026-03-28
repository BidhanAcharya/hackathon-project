from langgraph.graph import START, END, StateGraph
from Chatbot.graph_setup import (
    GraphState,
    retrieve,
    generate,
    grade_documents,
    transform_query,
    web_search,
    format_web_results,
    general_query,
    route_question,
    decide_to_generate,
    grade_generation
)

# Create the workflow
workflow = StateGraph(GraphState)

# ============== DEFINE NODES ==============
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("transform_query", transform_query)
workflow.add_node("web_search", web_search)
workflow.add_node("format_web_results", format_web_results)
workflow.add_node("general_query", general_query)


# ============== BUILD GRAPH ==============

# Entry point: Route the question
workflow.add_conditional_edges(
    START,
    route_question,
    {
        "vectorstore": "retrieve",
        "websearch": "web_search",
        "general_query": "general_query",
    }
)

# RAG Flow: retrieve -> grade -> decide
workflow.add_edge("retrieve", "grade_documents")

workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "generate": "generate",
        "websearch": "web_search",  # Fallback to web search if no relevant docs
    }
)

# Grade the generation
workflow.add_conditional_edges(
    "generate",
    grade_generation,
    {
        "useful": END,
        "not_useful": "web_search",  # Fallback to web search
        "hallucination": "generate",  # Retry generation
    }
)

# Web Search Flow: search -> format -> end (with fallback to general)
workflow.add_edge("web_search", "format_web_results")
workflow.add_edge("format_web_results", END)

# General Query Flow: directly to end
workflow.add_edge("general_query", END)

# Compile the graph
chatbot = workflow.compile()