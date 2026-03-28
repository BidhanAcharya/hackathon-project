"""
Mental Health Chatbot - Retriever Setup
Vector store for mental health knowledge base
"""

# ============== MOCK RETRIEVER FOR TESTING ==============
# Use this for testing the workflow without dependencies

USE_MOCK = True  # Set to False when dependencies are installed

if USE_MOCK:
    from langchain_core.documents import Document
    
    class MockRetriever:
        """Mock retriever for testing graph visualization"""
        def invoke(self, query):
            # Return mock mental health content
            return [
                Document(
                    page_content="Depression is a common mental health condition. Symptoms include persistent sadness, loss of interest, and fatigue. Treatment options include therapy, medication, and lifestyle changes.",
                    metadata={"source": "mock"}
                ),
                Document(
                    page_content="Anxiety disorders involve excessive worry and fear. Coping strategies include deep breathing, mindfulness, and cognitive behavioral therapy.",
                    metadata={"source": "mock"}
                )
            ]
        
        def get_relevant_documents(self, query):
            return self.invoke(query)

    retriever = MockRetriever()
    print("\n🔧 Using MOCK retriever for testing")

else:
    # ============== REAL IMPLEMENTATION ==============
    import os
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.document_loaders import TextLoader
    from langchain_chroma import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings

    # Initialize the embedding model
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    
    # Paths for mental health knowledge base
    CHROMA_PERSIST_DIR = "AdaptiveRagChatbot/mental_health_db"
    KNOWLEDGE_BASE_FILE = "AdaptiveRagChatbot/mental_health_kb.txt"

    # Load or create vector store
    if os.path.exists(CHROMA_PERSIST_DIR):
        vector_store = Chroma(
            persist_directory=CHROMA_PERSIST_DIR, 
            embedding_function=embeddings
        )
        print("\n✅ Mental health knowledge base loaded from storage")
    else:
        print("\n📚 Creating mental health knowledge base...")
        loader = TextLoader(KNOWLEDGE_BASE_FILE)
        docs = loader.load()
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            separators=["\n---\n", "\n\n", "\n", " ", ""]
        )
        all_splits = text_splitter.split_documents(docs)
        
        # Create vector store
        vector_store = Chroma.from_documents(
            all_splits, 
            embeddings, 
            persist_directory=CHROMA_PERSIST_DIR
        )
        print(f"✅ Mental health knowledge base created with {len(all_splits)} chunks")

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})