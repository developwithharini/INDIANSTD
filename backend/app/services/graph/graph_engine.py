from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import Standard, StandardRelationship, QCO
from app.schemas.domain import GraphDataResponse, GraphNode, GraphEdge

def build_standards_graph(
    db: Session,
    focus_standard_id: str = None,
    depth: int = 2
) -> GraphDataResponse:
    """Builds node and edge graph data for standards relationship traversal."""
    standards = db.query(Standard).all()
    relationships = db.query(StandardRelationship).all()
    qcos = db.query(QCO).all()

    nodes_dict: Dict[str, GraphNode] = {}
    edges: List[GraphEdge] = []

    # 1. Standard Nodes
    for std in standards:
        nodes_dict[std.id] = GraphNode(
            id=std.id,
            label=std.standard_number,
            type="STANDARD",
            domain=std.domain,
            status=std.status
        )

    # 2. QCO / Certification Nodes
    for q in qcos:
        nodes_dict[q.id] = GraphNode(
            id=q.id,
            label=f"QCO: {q.order_number}",
            type="QCO",
            domain="regulatory",
            status="ACTIVE"
        )
        for target_id in q.target_standard_ids:
            if target_id in nodes_dict:
                edges.append(GraphEdge(
                    source=q.id,
                    target=target_id,
                    relationship="GOVERNED_BY_QCO",
                    evidence=q.mandatory_certification_type
                ))

    # 3. Relationship Edges
    for rel in relationships:
        if rel.source_standard_id in nodes_dict and rel.target_standard_id in nodes_dict:
            edges.append(GraphEdge(
                source=rel.source_standard_id,
                target=rel.target_standard_id,
                relationship=rel.relationship_type,
                evidence=rel.evidence_text
            ))

    nodes = list(nodes_dict.values())
    return GraphDataResponse(nodes=nodes, edges=edges)
