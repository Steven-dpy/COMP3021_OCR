# -*- coding: utf-8 -*-
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import uvicorn
import os
from datetime import datetime
import uuid

app = FastAPI(title="OCR Service")

# allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# global OCR model
ocr_model = None

# create temp dir
temp_dir = '../share'
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)

@app.on_event("startup")
async def startup_event():
    """Initialize OCR model when service starts."""
    global ocr_model
    print("Initializing PaddleOCR model...")
    ocr_model = PaddleOCR(
        use_doc_orientation_classify=False, 
        use_doc_unwarping=False, 
        use_textline_orientation=False
    )
    
    print("PaddleOCR model initialized successfully!")

class ImagePathRequest(BaseModel):
    image_path: str

@app.post("/recognize")
async def recognize_serial_number(request: ImagePathRequest):
    """
    Recognize serial number from image
    :param image_path: Preprocessed image path
    :return: Recognition result (serial number, confidence), success status
    """
    try:
        image_path = request.image_path
        print(f"image_path: {image_path}")


        timestamp = datetime.now().strftime('%Y%m%d')
        id = uuid.uuid4()
        ocr_image_path = os.path.join(temp_dir, f'ocr_{timestamp}_{id}.jpg')

        # Read image
        data = ocr_model.predict(image_path)
        for res in data:
            res.print()
            res.save_to_img(ocr_image_path)
            res.save_to_json(temp_dir)
        
        # Extract recognition results and confidence
        text = []
        confidences = []
        
        if len(data) > 0:
            for i in range(len(data[0]['rec_texts'])):
                confidence = float(data[0]['rec_scores'][i])
                text.append(data[0]['rec_texts'][i])
                confidences.append(confidence)

        print(data)
        print(text)
        print(confidences)

        # Init service results
        serial_number = ""
        avg_confidence = 0.0
        ocr_image_path = ""

        # If no text is recognized
        if not text:
            return {"serial_number": "", "confidence": 0.0, "ocr_image": "", "success": False}
        
        # Merge text and calculate average confidence
        serial_number = ''.join(text).strip()
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {"serial_number": serial_number, "confidence": avg_confidence, "ocr_image": ocr_image_path, "success": True}
        
    except Exception as e:
        print(f"OCR recognition failed: {str(e)}")
        return {"serial_number": "", "confidence": 0.0, "ocr_image": "", "success": False}

@app.get("/health")
async def health_check():
    """Check if service is ok."""
    return {"status": "healthy", "model_loaded": ocr_model is not None}

if __name__ == "__main__":
    uvicorn.run(
        "ocr_service:app", 
        host="0.0.0.0", 
        port=8001
    )