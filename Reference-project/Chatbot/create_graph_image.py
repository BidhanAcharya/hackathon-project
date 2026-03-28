import os
# Disable LangSmith tracing
os.environ["LANGCHAIN_TRACING_V2"] = "false"
os.environ["LANGCHAIN_TRACING"] = "false"

import argparse
from create_graph import chatbot

# Parse command-line arguments
parser = argparse.ArgumentParser(description="Generate and save a graph image.")
parser.add_argument("filename", type=str, help="Output filename (e.g., graph.md)")
args = parser.parse_args()

# Get the mermaid code
mermaid_code = chatbot.get_graph().draw_mermaid()

# Save mermaid code to file
output_path = f"AdaptiveRagChatbot/graph_images/{args.filename}"
with open(output_path, "w") as f:
    f.write("```mermaid\n")
    f.write(mermaid_code)
    f.write("\n```")

print(f"Mermaid diagram saved as {args.filename}")
print("\nYou can view it at https://mermaid.live or in any Markdown viewer that supports mermaid.")
print(f"\nMermaid code:\n{mermaid_code}")
