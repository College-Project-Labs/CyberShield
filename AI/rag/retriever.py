from pathlib import Path

KNOWLEDGE_BASE = Path(__file__).resolve().parent / "knowledge_base"


def retrieve_context(query):
    file_path = KNOWLEDGE_BASE / "fraud_patterns.txt"

    text = file_path.read_text(encoding="utf-8")

    query_words = set(query.lower().split())

    sections = text.split("\n\n")

    relevant_sections = []

    for section in sections:
        section_words = set(section.lower().split())

        if query_words.intersection(section_words):
            relevant_sections.append(section)

    if not relevant_sections:
        return sections[-1]

    return "\n\n".join(relevant_sections)
