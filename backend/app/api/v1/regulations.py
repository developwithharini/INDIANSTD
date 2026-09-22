from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.domain import QCO

router = APIRouter()

@router.get("/qcos")
def list_qcos(db: Session = Depends(get_db)):
    qcos = db.query(QCO).all()
    return qcos

@router.get("/certifications")
def list_certifications():
    return [
        {
            "id": "BIS_SCHEME_1",
            "name": "BIS Product Certification Scheme-I (ISI Mark)",
            "governing_body": "Bureau of Indian Standards",
            "type": "Mandatory / Voluntary",
            "description": "Standard Mark licensed for products complying with mandatory or voluntary Indian Standards."
        },
        {
            "id": "BIS_CRS",
            "name": "Compulsory Registration Scheme (CRS)",
            "governing_body": "Ministry of Electronics and Information Technology (MeitY) / BIS",
            "type": "Mandatory",
            "description": "Self-declaration of conformity for electronic and IT products."
        }
    ]
