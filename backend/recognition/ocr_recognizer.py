import pytesseract
import cv2
import numpy as np
import os
from PIL import Image

class OCRRecognizer:
    """OCR recognition module, responsible for recognizing serial numbers from preprocessed images"""
    def __init__(self):

        # Read config from .env
        self.tessdata_dir = os.getenv('TESSDATA_DIR', r'C:\Program Files\Tesseract-OCR\tessdata')
        self.tessdata_dir = os.getenv('TESSDATA_DIR')

        self.model_name = os.getenv('MODEL_NAME', 'foo')

        # Configure Tesseract path (if not added to system environment variables)
        pytesseract.pytesseract.tesseract_cmd = os.getenv('TESSERACT_CMD', r'C:\Program Files\Tesseract-OCR\tesseract.exe')

        # basic config
        base_config = f'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-'
        
        # if set tessdata dir, add to config
        if self.tessdata_dir:
            self.config = f'--tessdata-dir {self.tessdata_dir} {base_config}'
        else:
            self.config = base_config
        
        # confidence threshold
        self.confidence_threshold = 60
        
        # create temp dir
        self.temp_dir = 'temp_ocr_images'
        if not os.path.exists(self.temp_dir):
            os.makedirs(self.temp_dir)

    def recognize(self, image_path):
        """
        Recognize serial number from image
        :param image_path: Preprocessed image path
        :return: Recognition result (serial number, confidence), success status
        """
        try:
            # Read image
            image = Image.open(image_path)
            
            # Use Tesseract for OCR recognition, get detailed data
            data = pytesseract.image_to_data(
                image, 
                config=self.config,
                lang=self.model_name,
                output_type=pytesseract.Output.DICT
            )
            
            # Extract recognition results and confidence
            text = []
            confidences = []
            
            for i in range(len(data['text'])):
                confidence = int(data['conf'][i])
                if confidence > self.confidence_threshold:
                    text.append(data['text'][i])
                    confidences.append(confidence)
            
            # If no text is recognized
            if not text:
                return ("", 0.0), False
            
            # Merge text and calculate average confidence
            serial_number = ''.join(text).strip()
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Filter invalid results
            if not serial_number or avg_confidence < self.confidence_threshold:
                return ("", avg_confidence), False
            
            return (serial_number, avg_confidence), True
            
        except Exception as e:
            print(f"OCR recognition failed: {str(e)}")
            return ("", 0.0), False

    def preprocess_for_ocr(self, image_path):
        """
        Specific image optimization for OCR recognition
        :param image_path: Input image path
        :return: Optimized image path
        """
        try:
            # Read image
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            # Further denoising
            denoised = cv2.medianBlur(img, 3)
            
            # Save optimized image
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            optimized_path = os.path.join(self.temp_dir, f'optimized_{timestamp}.jpg')
            cv2.imwrite(optimized_path, denoised)
            
            return optimized_path
            
        except Exception as e:
            print(f"OCR preprocessing failed: {str(e)}")
            return image_path