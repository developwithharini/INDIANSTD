import networkx as nx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import StandardRelationship, Standard

class GraphEngine:
    """
    NetworkX + SQLite Graph Engine for Indian Standards relationships.
    Processes explicit relationship types: NORMATIVE_REFERENCE, TEST_METHOD, SAFETY, INSTALLATION, TERMINOLOGY, MATERIAL, RELATED_PRODUCT.
    """
    def __init__(self):
        self.G = nx.DiGraph()

    def build_graph(self, db: Session):
        """Build NetworkX directed graph from SQLite relationship edges."""
        self.G.clear()
        relationships = db.query(StandardRelationship).all()
        for rel in relationships:
            self.G.add_edge(
                rel.source_standard_id,
                rel.target_standard_id,
                type=rel.relationship_type,
                evidence=rel.evidence_text,
                verified=rel.verified
            )

    def get_related_standards(self, standard_id: str, db: Session) -> List[Dict[str, Any]]:
        """Fetch verified outgoing and incoming relationships for a standard."""
        relationships = db.query(StandardRelationship).filter(
            (StandardRelationship.source_standard_id == standard_id) |
            (StandardRelationship.target_standard_id == standard_id)
        ).all()

        results = []
        for rel in relationships:
            other_id = rel.target_standard_id if rel.source_standard_id == standard_id else rel.source_standard_id
            other_std = db.query(Standard).filter(Standard.id == other_id).first()
            if other_std:
                results.append({
                    "relationship_type": rel.relationship_type,
                    "target_standard_id": other_std.id,
                    "target_standard_number": other_std.standard_number,
                    "target_title": other_std.title,
                    "evidence_text": rel.evidence_text,
                    "verified": rel.verified
                })
        return results

graph_engine = GraphEngine()
