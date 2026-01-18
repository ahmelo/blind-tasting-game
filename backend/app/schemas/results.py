from pydantic import BaseModel
from typing import List

class ResultItem(BaseModel):
    key: str
    label: str
    participant: str
    answer_key: str
    status: str  # "correct" | "wrong"

class ResultBlock(BaseModel):
    key: str
    label: str
    items: List[ResultItem]

class EvaluationResultResponse(BaseModel):
    round_id: str
    blocks: List[ResultBlock]
