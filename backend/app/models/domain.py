import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship as sqla_relationship
from app.core.database import Base

class Standard(Base):
    __tablename__ = "standards"

    id = Column(String, primary_key=True, index=True) # e.g. IS_10322_5_1_2012
    standard_number = Column(String, index=True, nullable=False) # e.g. IS 10322 (Part 5/Sec 1): 2012
    title = Column(Text, nullable=False)
    scope = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=True) # e.g. Luminaires
    domain = Column(String, index=True, nullable=True)   # e.g. Electrotechnical
    ministry = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    status = Column(String, default="CURRENT") # CURRENT, SUPERSEDED, WITHDRAWN, UNKNOWN
    source_url = Column(String, nullable=True)
    source_file = Column(String, nullable=True)
    source_sheet = Column(String, nullable=True)
    source_row = Column(Integer, nullable=True)
    source_type = Column(String, default="BIS_PUBLISHED_SNAPSHOT")
    verified = Column(Boolean, default=True)
    extra_metadata = Column(JSON, nullable=True)

    # Relationships
    versions = sqla_relationship("StandardVersion", back_populates="standard", cascade="all, delete-orphan")
    amendments = sqla_relationship("StandardAmendment", back_populates="standard", cascade="all, delete-orphan")
    outgoing_relationships = sqla_relationship("StandardRelationship", foreign_keys="[StandardRelationship.source_standard_id]", back_populates="source_standard")
    incoming_relationships = sqla_relationship("StandardRelationship", foreign_keys="[StandardRelationship.target_standard_id]", back_populates="target_standard")


class StandardVersion(Base):
    __tablename__ = "standard_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    edition = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    status = Column(String, default="CURRENT")
    scope_changes = Column(Text, nullable=True)
    amendments_count = Column(Integer, default=0)

    standard = sqla_relationship("Standard", back_populates="versions")


class StandardAmendment(Base):
    __tablename__ = "standard_amendments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    amendment_number = Column(Integer, nullable=False)
    issue_date = Column(String, nullable=True)
    summary_of_changes = Column(Text, nullable=True)

    standard = sqla_relationship("Standard", back_populates="amendments")


class StandardRelationship(Base):
    __tablename__ = "standard_relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    target_standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    relationship_type = Column(String, nullable=False) # NORMATIVE_REFERENCE, TEST_METHOD, SAFETY, INSTALLATION, TERMINOLOGY, MATERIAL, RELATED_PRODUCT, SUPERSEDES
    evidence_text = Column(Text, nullable=True)
    source_clause = Column(String, nullable=True)
    verified = Column(Boolean, default=True)

    source_standard = sqla_relationship("Standard", foreign_keys=[source_standard_id], back_populates="outgoing_relationships")
    target_standard = sqla_relationship("Standard", foreign_keys=[target_standard_id], back_populates="incoming_relationships")


class QCO(Base):
    __tablename__ = "qcos"

    id = Column(String, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    ministry = Column(String, nullable=False)
    order_number = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    mandatory_certification_type = Column(String, default="Scheme-I (ISI)") # Scheme-I (ISI), CRS
    covered_standards = Column(JSON, nullable=True) # List of standard numbers or IDs covered


class ProcurementAnalysis(Base):
    __tablename__ = "procurement_analyses"

    id = Column(String, primary_key=True, index=True)
    input_type = Column(String, nullable=False) # DESCRIBE, PDF, DOCX, TXT
    raw_text = Column(Text, nullable=False)
    requirement_json = Column(JSON, nullable=False)
    execution_mode = Column(String, default="LOCAL_FALLBACK") # GEMINI_FLASH, LOCAL_FALLBACK
    score_version = Column(String, default="applicability_v1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recommendations = sqla_relationship("Recommendation", back_populates="analysis", cascade="all, delete-orphan")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String, ForeignKey("procurement_analyses.id"), nullable=False)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    applicability_score = Column(Float, nullable=False) # 0.0 - 100.0
    rank = Column(Integer, nullable=False)
    rec_relationship = Column(String, default="PRIMARY") # PRIMARY, RELATED, ALTERNATIVE
    status_signal = Column(String, default="CURRENT")
    score_breakdown_json = Column(JSON, nullable=False)
    reasons_json = Column(JSON, nullable=False)
    why_not_json = Column(JSON, nullable=True)

    analysis = sqla_relationship("ProcurementAnalysis", back_populates="recommendations")
    standard = sqla_relationship("Standard")


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(String, primary_key=True, index=True)
    source_file = Column(String, nullable=False)
    sheets_discovered = Column(Integer, default=0)
    sheets_used = Column(Integer, default=0)
    records_count = Column(Integer, default=0)
    valid_count = Column(Integer, default=0)
    inserted_count = Column(Integer, default=0)
    updated_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    dataset_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SourceRecord(Base):
    __tablename__ = "source_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ingestion_run_id = Column(String, ForeignKey("ingestion_runs.id"), nullable=False)
    source_file = Column(String, nullable=False)
    source_sheet = Column(String, nullable=False)
    source_row = Column(Integer, nullable=False)
    standard_number = Column(String, nullable=True)
    raw_payload_json = Column(JSON, nullable=False)
    status = Column(String, default="PROCESSED")
