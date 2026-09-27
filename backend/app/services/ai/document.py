import os
from typing import Tuple

def extract_text_from_file(file_bytes: bytes, filename: str) -> Tuple[str, str]:
    """
    Extract readable text from uploaded file.
    Supports PDF (.pdf), DOCX (.docx), and TXT (.txt).
    Returns (extracted_text, detected_input_type).
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        try:
            import fitz # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text_blocks = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_blocks.append(page.get_text())
            full_text = "\n".join(text_blocks).strip()
            if not full_text:
                return "The uploaded PDF contains no extractable text.", "PDF"
            return full_text, "PDF"
        except Exception as e:
            return f"Error reading PDF file: {str(e)}", "PDF"

    elif ext == ".docx":
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            full_text = "\n".join(paragraphs).strip()
            if not full_text:
                return "The uploaded DOCX document contains no text.", "DOCX"
            return full_text, "DOCX"
        except Exception as e:
            return f"Error reading DOCX file: {str(e)}", "DOCX"

    else:
        # Default to plain text parser
        try:
            full_text = file_bytes.decode('utf-8', errors='ignore').strip()
            return full_text or "Empty text file uploaded.", "TXT"
        except Exception as e:
            return f"Error reading text file: {str(e)}", "TXT"
