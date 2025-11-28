"""
MongoDB integration for persistent case storage and audit logs.
"""
from __future__ import annotations

import os
from typing import Dict, List, Optional

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo import MongoClient
except ImportError:
    AsyncIOMotorClient = None
    MongoClient = None


class MongoDBStorage:
    """
    MongoDB storage for cases, audit logs, and embeddings metadata.
    """

    def __init__(self, connection_string: Optional[str] = None):
        if not connection_string:
            connection_string = os.getenv(
                "MONGODB_URI", "mongodb://localhost:27017/autolawyer"
            )
        self.connection_string = connection_string
        self.client = None
        self.db = None

    def connect(self):
        """Initialize MongoDB connection."""
        if MongoClient is None:
            raise ImportError("Install pymongo and motor: pip install pymongo motor")
        self.client = MongoClient(self.connection_string)
        self.db = self.client.get_database("autolawyer")
        return self

    def save_case(self, case_id: str, case_data: Dict) -> bool:
        """Persist case results to MongoDB."""
        if not self.db:
            self.connect()
        collection = self.db.cases
        case_data["_id"] = case_id
        collection.replace_one({"_id": case_id}, case_data, upsert=True)
        return True

    def get_case(self, case_id: str) -> Optional[Dict]:
        """Retrieve case by ID."""
        if not self.db:
            self.connect()
        return self.db.cases.find_one({"_id": case_id})

    def list_cases(self, limit: int = 50) -> List[Dict]:
        """List recent cases."""
        if not self.db:
            self.connect()
        return list(self.db.cases.find().sort("_id", -1).limit(limit))

    def save_audit_log(self, case_id: str, log_entry: Dict) -> bool:
        """Append audit log entry."""
        if not self.db:
            self.connect()
        collection = self.db.audit_logs
        log_entry["case_id"] = case_id
        collection.insert_one(log_entry)
        return True

    def get_audit_logs(self, case_id: str) -> List[Dict]:
        """Retrieve all audit logs for a case."""
        if not self.db:
            self.connect()
        return list(self.db.audit_logs.find({"case_id": case_id}).sort("timestamp", 1))

    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()

