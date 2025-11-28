from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass
class Clause:
    clause_id: str
    heading: str
    body: str
    source_document: str
    start_char: int
    end_char: int


HEADING_PATTERN = re.compile(r"^(Section|Clause|Article)?\s*\d+(\.\d+)*[:\.\-]?\s*(.+)$", re.IGNORECASE)


def segment_documents(documents: Iterable[Dict], strategy: str = "semantic") -> List[Dict]:
    clauses: List[Dict] = []
    for doc in documents:
        text = doc["content"]
        blocks = _split_into_blocks(text)
        cursor = 0
        for idx, block in enumerate(blocks):
            heading = block.split("\n", 1)[0][:120]
            match = HEADING_PATTERN.match(heading)
            normalized_heading = match.group(0) if match else heading
            start = cursor
            end = cursor + len(block)
            clauses.append(
                Clause(
                    clause_id=f"{doc['name']}-{idx+1}",
                    heading=normalized_heading.strip(),
                    body=block.strip(),
                    source_document=doc["name"],
                    start_char=start,
                    end_char=end,
                ).__dict__
            )
            cursor = end + 1
    return clauses


def _split_into_blocks(text: str) -> List[str]:
    clean = text.replace("\r\n", "\n")
    return [block.strip() for block in re.split(r"\n{2,}", clean) if block.strip()]


