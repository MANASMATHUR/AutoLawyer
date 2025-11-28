from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer


@dataclass
class ClauseRAGIndex:
    collection_name: str
    num_items: int


class ClauseRAG:
    def __init__(
        self,
        persist_directory: Path | None = None,
        embedding_model: str = "all-MiniLM-L6-v2",
    ) -> None:
        self.persist_directory = persist_directory
        if self.persist_directory:
            self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.Client(
            Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=str(persist_directory) if persist_directory else None,
            )
        )
        self.embedder = SentenceTransformer(embedding_model)

    def upsert(self, clauses: List[Dict], collection_name: str) -> ClauseRAGIndex:
        """
        Store clause-level embeddings with metadata for later retrieval.
        """
        collection = self.client.get_or_create_collection(collection_name)
        texts = [clause["body"] for clause in clauses]
        embeddings = self.embedder.encode(texts, batch_size=16, show_progress_bar=False)
        ids = [clause["clause_id"] for clause in clauses]
        metas = [{"heading": clause["heading"], "doc": clause["source_document"]} for clause in clauses]
        collection.upsert(ids=ids, embeddings=embeddings.tolist(), documents=texts, metadatas=metas)
        if self.persist_directory:
            self.client.persist()
        return ClauseRAGIndex(collection_name=collection_name, num_items=len(ids))

    def retrieve(self, query: str, collection_name: str, top_k: int = 5) -> List[Dict]:
        collection = self.client.get_collection(collection_name)
        embedding = self.embedder.encode([query])[0]
        results = collection.query(query_embeddings=[embedding.tolist()], n_results=top_k)
        return [
            {
                "id": rid,
                "document": doc,
                "metadata": meta,
                "score": score,
            }
            for rid, doc, meta, score in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            )
        ]


def build_clause_index(clauses: List[Dict], collection_name: str) -> Dict:
    # Vercel is read-only except for /tmp. Use /tmp for temporary storage.
    import tempfile
    temp_dir = Path(tempfile.gettempdir()) / "rag"
    rag = ClauseRAG(persist_directory=temp_dir)
    index = rag.upsert(clauses, collection_name=collection_name)
    return index.__dict__


