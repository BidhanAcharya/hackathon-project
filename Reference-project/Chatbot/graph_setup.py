from typing import List
from typing_extensions import TypedDict
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from Chatbot.retriever_setup import retriever
from Chatbot.llm_config import llm
from Chatbot.graders import retrieval_grader, hallucination_grader, answer_grader
from Chatbot.query_rewriter import question_rewriter
from Chatbot.web_search import web_search_tool
from Chatbot.routes import question_router


class GraphState(TypedDict):
    """
    Represents the state of the mental health chatbot graph
    
    Attributes:
        question: User's question
        generation: LLM generated response
        documents: List of retrieved documents
    """
    question: str
    generation: str
    documents: List[str]


# ============== RAG PROMPT FOR MENTAL HEALTH ==============
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a compassionate and knowledgeable mental health assistant. Your role is to provide helpful, accurate, and supportive information about mental health topics.

Guidelines:
- Be empathetic and non-judgmental in your responses
- Use the retrieved context to provide accurate information
- If discussing sensitive topics, always encourage professional help
- Never diagnose conditions - only provide general information
- If someone appears to be in crisis, prioritize safety resources
- Keep responses clear, supportive, and actionable

Use the following retrieved context to answer the question. If the context doesn't contain relevant information, acknowledge this and provide general supportive guidance."""),
    ("human", """Question: {question}

Context: {context}

Provide a helpful and compassionate response:""")
])

rag_chain = rag_prompt | llm | StrOutputParser()


# ============== GENERAL QUERY PROMPT ==============
general_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a compassionate mental health support assistant. Your role is to:

1. **Provide emotional support**: Be warm, understanding, and non-judgmental
2. **Offer general wellness advice**: Share evidence-based tips for mental wellbeing
3. **Encourage professional help**: When appropriate, gently suggest seeking professional support
4. **Crisis awareness**: If someone appears to be in crisis, provide crisis resources:
   - National Suicide Prevention Lifeline: 988 (US)
   - Crisis Text Line: Text HOME to 741741
   - International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

Remember:
- You are NOT a replacement for professional mental health care
- Never diagnose or prescribe treatments
- Be supportive but know your limitations
- Validate feelings while encouraging healthy coping"""),
    ("human", "{question}")
])

general_chain = general_prompt | llm | StrOutputParser()


# ============== WEB SEARCH FORMAT PROMPT ==============
web_format_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a mental health assistant formatting web search results. 
Present the information in a clear, supportive manner. Focus on:
- Accurate, helpful information from the search results
- Practical takeaways for the user
- Any relevant resources or next steps
- Always maintain a compassionate tone

If the search results don't adequately answer the question, acknowledge this and provide general supportive guidance instead."""),
    ("human", """User's question: {question}

Web search results: {documents}

Provide a helpful response based on these results:""")
])

web_format_chain = web_format_prompt | llm | StrOutputParser()


# ============== NODE FUNCTIONS ==============

def retrieve(state):
    """
    Retrieve documents from mental health knowledge base
    """
    print("\n🔍 RETRIEVING from knowledge base...")
    question = state['question']
    documents = retriever.invoke(question)
    return {"documents": documents, "question": question}


def generate(state):
    """
    Generate mental health response using RAG
    """
    print("\n💭 GENERATING response from knowledge base...")
    question = state['question']
    documents = state['documents']
    
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"documents": documents, "question": question, "generation": generation}


def grade_documents(state):
    """
    Filter documents for relevance to the mental health question
    """
    print("\n📋 GRADING document relevance...")
    question = state["question"]
    documents = state["documents"]

    filtered_docs = []
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.binary_score
        if grade == "yes":
            print("  ✓ Document relevant")
            filtered_docs.append(d)
        else:
            print("  ✗ Document not relevant")
            continue
    return {"documents": filtered_docs, "question": question}


def transform_query(state):
    """
    Rewrite query for better retrieval
    """
    print("\n✏️ TRANSFORMING query...")
    question = state["question"]
    documents = state.get("documents", [])

    res = question_rewriter.invoke({"question": question})
    print(f"  Transformed: {res.query}")
    return {"documents": documents, "question": res.query}


def web_search(state):
    """
    Search the web for mental health information
    """
    print("\n🌐 WEB SEARCHING...")
    question = state["question"]

    try:
        docs = web_search_tool.invoke({"query": f"mental health {question}"})
        web_results = "\n".join([d["content"] for d in docs])
        web_results = Document(page_content=web_results)
        return {"documents": web_results, "question": question}
    except Exception as e:
        print(f"  Web search failed: {e}")
        # Fallback to empty document
        return {"documents": Document(page_content=""), "question": question}


def format_web_results(state):
    """
    Format web search results into a helpful response
    """
    print("\n📝 FORMATTING web results...")
    question = state['question']
    documents = state['documents']
    
    # Check if we have valid web results
    doc_content = documents.page_content if hasattr(documents, 'page_content') else str(documents)
    
    if not doc_content or doc_content.strip() == "":
        # Fallback to general query if no web results
        print("  No web results, falling back to general response...")
        generation = general_chain.invoke({"question": question})
    else:
        generation = web_format_chain.invoke({"question": question, "documents": doc_content})
    
    return {"question": question, "generation": generation}


def general_query(state):
    """
    Handle general mental health queries with supportive responses
    """
    print("\n💚 GENERAL QUERY - Providing supportive response...")
    question = state['question']
    
    generation = general_chain.invoke({"question": question})
    return {"question": question, "generation": generation}


# ============== CONDITIONAL EDGE FUNCTIONS ==============

def route_question(state):
    """
    Route question to appropriate handler:
    - vectorstore: For specific mental health information
    - websearch: For current info, resources, local services
    - general_query: For emotional support and general wellness
    """
    print("\n🔀 ROUTING question...")
    question = state["question"]

    source = question_router.invoke({"question": question})
    print(f"  Route: {source.datasource}")
    
    if source.datasource == "vectorstore":
        return "vectorstore"
    elif source.datasource == "websearch":
        return "websearch"
    else:
        return "general_query"


def decide_to_generate(state):
    """
    Decide whether to generate answer or try web search
    """
    print("\n🤔 DECIDING next step...")
    filtered_documents = state["documents"]

    if not filtered_documents:
        print("  → No relevant docs, trying web search...")
        return "websearch"
    else:
        print("  → Relevant docs found, generating...")
        return "generate"


def grade_generation(state):
    """
    Check if generation is grounded and useful
    """
    print("\n✅ GRADING generation quality...")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]
    
    # Check for hallucination
    score = hallucination_grader.invoke(
        {"documents": documents, "generation": generation}
    )
    
    if score.binary_score == "yes":
        print("  ✓ Response grounded in documents")
        # Check if it answers the question
        answer_score = answer_grader.invoke(
            {"question": question, "generation": generation}
        )
        if answer_score.binary_score == "yes":
            print("  ✓ Response addresses question")
            return "useful"
        else:
            print("  ✗ Response doesn't address question, trying web search...")
            return "not_useful"
    else:
        print("  ✗ Hallucination detected, regenerating...")
        return "hallucination"
