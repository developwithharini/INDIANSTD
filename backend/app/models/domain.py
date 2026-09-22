import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

class Standard(Base):
    __tablename__ = "standards"

    id = Column(String(100), primary_key=True) # e.g. IS_10322_5_1_2012
    standard_number = Column(String(100), nullable=False, index=True)
    title = Column(Text, nullable=False)
    domain = Column(String(100), nullable=False, index=True) # e.g., lighting, PPE, construction
    category = Column(String(100), nullable=False, index=True) # e.g., Luminaires, Helmets
    scope_summary = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="CURRENT") # CURRENT, SUPERSEDED, WITHDRAWN, AMENDED
    publication_year = Column(Integer, nullable=False)
    revision_date = Column(String(50), nullable=True)
    source_url = Column(Text, nullable=True)
    verified = Column(Boolean, default=True)
    source_type = Column(String(50), default="PUBLIC") # PUBLIC, LICENSED, DEMO

    versions = relationship("StandardVersion", back_populates="standard", cascade="all, delete-orphan")
    amendments = relationship("StandardAmendment", back_populates="standard", cascade="all, delete-orphan")
    outgoing_relationships = relationship("StandardRelationship", foreign_keys="StandardRelationship.source_standard_id", back_populates="source_standard")
    incoming_relationships = relationship("StandardRelationship", foreign_keys="StandardRelationship.target_standard_id", back_populates="target_standard")

class StandardVersion(Base):
    __tablename__ = "standard_versions"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    edition = Column(String(50), nullable=False)
    publication_year = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)
    scope_changes = Column(Text, nullable=True)
    amendments_count = Column(Integer, default=0)

    standard = relationship("Standard", back_populates="versions")

class StandardAmendment(Base):
    __tablename__ = "standard_amendments"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    amendment_number = Column(Integer, nullable=False)
    issue_date = Column(String(50), nullable=False)
    summary_of_changes = Column(Text, nullable=False)
    affected_clauses = Column(JSON, nullable=True)

    standard = relationship("Standard", back_populates="amendments")

class StandardRelationship(Base):
    __tablename__ = "standard_relationships"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    target_standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    relationship_type = Column(String(100), nullable=False) # PRIMARY_PRODUCT_STANDARD, NORMATIVE_REFERENCE, TEST_METHOD, SAFETY_STANDARD, ALLIED_STANDARD, MATERIAL_STANDARD, INSTALLATION_STANDARD
    evidence_text = Column(Text, nullable=True)
    source_clause = Column(String(100), nullable=True)

    source_standard = relationship("Standard", foreign_keys=[source_standard_id], back_populates="outgoing_relationships")
    target_standard = relationship("Standard", foreign_keys=[target_standard_id], back_populates="incoming_relationships")

class QCO(Base):
    __tablename__ = "qcos"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(Text, nullable=False)
    ministry = Column(String(200), nullable=False)
    order_number = Column(String(100), nullable=False)
    effective_date = Column(String(50), nullable=False)
    hs_codes = Column(JSON, nullable=True)
    target_standard_ids = Column(JSON, nullable=False) # List of standard IDs
    mandatory_certification_type = Column(String(100), nullable=False) # e.g. BIS Scheme-I (ISI Mark)
    source_url = Column(Text, nullable=False)
    verified = Column(Boolean, default=True)

class ProcurementProject(Base):
    __tablename__ = "procurement_projects"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    organization = Column(String(200), nullable=False)
    department = Column(String(200), nullable=True)
    status = Column(String(50), default="DRAFT") # DRAFT, IN_REVIEW, APPROVED
    created_at = Column(DateTime, default=datetime.utcnow)

    requests = relationship("ProcurementRequest", back_populates="project")

class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(100), ForeignKey("procurement_projects.id"), nullable=True)
    title = Column(String(200), nullable=False)
    raw_input_text = Column(Text, nullable=False)
    language = Column(String(20), default="en")
    extracted_model = Column(JSON, nullable=True) # Extracted parameters JSON
    readiness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProcurementProject", back_populates="requests")
    recommendations = relationship("Recommendation", back_populates="request", cascade="all, delete-orphan")
    findings = relationship("TenderFinding", back_populates="request", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String(100), ForeignKey("procurement_requests.id"), nullable=False)
    standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    applicability_score = Column(Float, nullable=False)
    relationship_type = Column(String(50), nullable=False) # PRIMARY, ALLIED, TEST, SAFETY, INSTALLATION, MATERIAL
    reasons = Column(JSON, nullable=False) # Why it matched
    rejection_reasons = Column(JSON, nullable=True) # Why not matched/rejected
    score_breakdown = Column(JSON, nullable=False)
    regulatory_status = Column(String(50), default="NOT_IDENTIFIED") # REQUIRED, POTENTIALLY_APPLICABLE, NOT_IDENTIFIED, VERIFY_REQUIRED
    status = Column(String(50), default="PROPOSED") # PROPOSED, ACCEPTED, REJECTED, UNDER_REVIEW

    request = relationship("ProcurementRequest", back_populates="recommendations")
    standard = relationship("Standard")

class TenderFinding(Base):
    __tablename__ = "tender_findings"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String(100), ForeignKey("procurement_requests.id"), nullable=False)
    category = Column(String(50), nullable=False) # MISSING_STANDARD, OUTDATED_REF, MISSING_TEST, AMBIGUOUS_PHRASE, REGULATORY_GAP
    severity = Column(String(20), nullable=False) # BLOCKING, HIGH, MEDIUM, LOW, INFORMATIONAL
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    evidence_text = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    related_standard_id = Column(String(100), nullable=True)
    status = Column(String(20), default="OPEN") # OPEN, ACCEPTED, DISMISSED

    request = relationship("ProcurementRequest", back_populates="findings")

class SpecificationDocument(Base):
    __tablename__ = "specification_documents"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String(100), nullable=False)
    version = Column(Integer, default=1)
    content = Column(JSON, nullable=False) # Structured sections
    created_at = Column(DateTime, default=datetime.utcnow)

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), default="default_user")
    standard_id = Column(String(100), ForeignKey("standards.id"), nullable=False)
    alert_on_amendments = Column(Boolean, default=True)
    alert_on_revisions = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    standard = relationship("Standard")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")
    read = Column(Boolean, default=False)
    related_standard_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False)
    performed_by = Column(String(100), default="procurement_officer")
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
