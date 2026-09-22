# MANAK Data Model Specification

## Core Database Tables (PostgreSQL)

```sql
-- Standards Table
CREATE TABLE standards (
    id VARCHAR(50) PRIMARY KEY, -- e.g., IS_10322_5_1_2012
    standard_number VARCHAR(100) NOT NULL, -- e.g., IS 10322 (Part 5/Sec 1)
    title TEXT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    scope_summary TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CURRENT', -- CURRENT, SUPERSEDED, WITHDRAWN, AMENDED
    publication_year INTEGER NOT NULL,
    revision_date DATE,
    source_url TEXT,
    verified BOOLEAN DEFAULT TRUE,
    source_type VARCHAR(50) DEFAULT 'PUBLIC', -- PUBLIC, LICENSED, DEMO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Standard Versions Table
CREATE TABLE standard_versions (
    id UUID PRIMARY KEY,
    standard_id VARCHAR(50) REFERENCES standards(id),
    edition VARCHAR(50) NOT NULL,
    publication_year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    scope_changes TEXT,
    amendments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Standard Relationships Table
CREATE TABLE standard_relationships (
    id UUID PRIMARY KEY,
    source_standard_id VARCHAR(50) REFERENCES standards(id),
    target_standard_id VARCHAR(50) REFERENCES standards(id),
    relationship_type VARCHAR(50) NOT NULL, -- NORMATIVE_REFERENCE, TEST_METHOD, SAFETY_STANDARD, ALLIED_STANDARD, MATERIAL_STANDARD, INSTALLATION_STANDARD
    evidence_text TEXT,
    source_clause VARCHAR(100)
);

-- Regulations & QCOs Table
CREATE TABLE qcos (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    ministry VARCHAR(200) NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    effective_date DATE NOT NULL,
    hs_codes TEXT[],
    target_standard_ids VARCHAR(50)[],
    mandatory_certification_type VARCHAR(100) NOT NULL,
    source_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE
);
```
