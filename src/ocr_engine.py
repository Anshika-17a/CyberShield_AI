# src/ocr_engine.py
import easyocr
import cv2
import numpy as np

class OCREngine:
    def __init__(self):
        # We load English (en) and Hindi (hi) models. 
        # EasyOCR will automatically download the models the first time you run this.
        print("Loading OCR Model... (This might take a moment)")
        self.reader = easyocr.Reader(['en', 'hi'], gpu=False) 

    def extract_text(self, image_path):
        """
        Reads an image and returns all the text found inside it.
        """
        try:
            # Read text from the image
            result = self.reader.readtext(image_path)
            
            # The result is a list of tuples: (box, text, confidence)
            # We only want the text strings combined into one paragraph.
            extracted_text = " ".join([item[1] for item in result])
            
            return extracted_text
        except Exception as e:
            return f"Error reading image: {str(e)}"

# --- TEST AREA ---
if __name__ == "__main__":
    # Create a dummy image with text to test the system
    print("Creating a test image...")
    
    # Create a blank white image
    img = np.zeros((100, 500, 3), dtype=np.uint8)
    img.fill(255)
    
    # Write some text on it (Simulating a spam screenshot)
    # Note: OpenCV putText only supports English standard fonts. 
    cv2.putText(img, 'YOU WON $1000 LOTTERY', (20, 60), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    # Save it to disk
    test_img_path = "test_spam_screenshot.png"
    cv2.imwrite(test_img_path, img)
    
    # Run OCR
    engine = OCREngine()
    text = engine.extract_text(test_img_path)
    
    print("\n--- RESULT ---")
    print(f"Original Image Text: 'YOU WON $1000 LOTTERY'")
    print(f"AI Read: '{text}'")