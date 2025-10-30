from flask import Flask, request, jsonify, render_template, send_from_directory
import torch
from torchvision import transforms, models
from PIL import Image
import os
import cv2
import numpy as np
from ultralytics import YOLO
from tensorflow.keras.models import load_model
from scipy.special import expit
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from datetime import datetime
import time
import stripe

app = Flask(__name__)

# Add this route to serve static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Initialize Stripe (replace with your actual secret key)
stripe.api_key = 'sk_test_51Rjh6sFtkmvD4yRye72uhZbXH5QcXgdMVGMQS1AKboQnnZg8vBiYnthPDgUYa0t4uAVmbxmHCXyI71gbAu8Ziz8S00ju01LrJn'

# === Model Paths ===
vgg_model_path = os.path.join('models', 'dogsbreedsvgg16.pt')
yolo_model_path = os.path.join('models', 'best.pt')
cat_dog_model_path = os.path.join('models', 'cats_vs_dogs_tf_model.h5')
class_labels_path = "breed_labels.txt"
output_image_path = os.path.join("static", "last_output.jpg")

# === VGG16 Model (Dog Breed Classification) ===
num_classes = 133
vgg_model = models.vgg16(weights=None)
vgg_model.classifier[6] = torch.nn.Linear(4096, num_classes)
vgg_model.load_state_dict(torch.load(vgg_model_path, map_location='cpu'))
vgg_model.eval()

# === Load Class Labels (1-indexed) ===
breed_labels = {}
if os.path.exists(class_labels_path):
    with open(class_labels_path, "r") as f:
        for line in f:
            parts = line.strip().split(maxsplit=1)
            if len(parts) == 2 and parts[0].isdigit():
                breed_labels[int(parts[0])] = parts[1]

# === YOLOv11 (Skin Disease Detection) ===
skin_model = YOLO(yolo_model_path)

# === Keras Model (Cat vs Dog Classification) ===
cat_dog_model = load_model(cat_dog_model_path)

# === Image Preprocessing ===
vgg_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def preprocess_catdog_image(image_pil):
    image = image_pil.resize((128, 128))  # Adjusted to match model input
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

# === Vet Verification Endpoint ===
@app.route('/verify-vet', methods=['POST'])
def verify_vet():
    data = request.get_json()
    reg_no = data.get('reg_no')
    name = data.get('name')
    fname = data.get('fname')

    # Set up Chrome
    chrome_options = Options()
    # Run in headless mode
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
    driver = webdriver.Chrome(options=chrome_options)
    
    # Stealth: set navigator.webdriver to undefined
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': """
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined})
        """
    })
    driver.get("https://pvmc.gov.pk/Registration/Search")

    wait = WebDriverWait(driver, 20)
    try:
        wait.until(EC.presence_of_element_located((By.NAME, "reg_no")))
        wait.until(EC.presence_of_element_located((By.NAME, "name")))
        wait.until(EC.presence_of_element_located((By.NAME, "fname")))

        driver.find_element(By.NAME, "reg_no").send_keys(reg_no)
        driver.find_element(By.NAME, "name").send_keys(name)
        driver.find_element(By.NAME, "fname").send_keys(fname)
        driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()

        time.sleep(5)
        result = {
            "PVMC": False,
            "details": None,
            "is_valid": False
        }
        try:
            table = driver.find_element(By.TAG_NAME, "table")
            rows = table.find_elements(By.TAG_NAME, "tr")
            if len(rows) > 1:
                result_cells = rows[1].find_elements(By.TAG_NAME, "td")
                if result_cells:
                    reg_no_match = result_cells[0].text.strip().lower() == reg_no.strip().lower()
                    name_match = result_cells[1].text.strip().lower() == name.strip().lower()
                    fname_match = result_cells[2].text.strip().lower() == fname.strip().lower()
                    if reg_no_match and name_match and fname_match:
                        try:
                            details_button = rows[1].find_element(By.CSS_SELECTOR, "a.btn.btn-success")
                            details_button.click()
                            
                            time.sleep(3)
                            
                            try:
                                validity_row = driver.find_element(By.XPATH, "//th[contains(text(), 'Validity Date')]/following-sibling::td")
                                validity_date_str = validity_row.text.strip()
                                
                                validity_date = datetime.strptime(validity_date_str, "%d/%m/%Y")
                                current_date = datetime.now()
                                
                                is_valid = validity_date > current_date
                                
                                result = {
                                    "PVMC": True,
                                    "details": {
                                        "reg_no": result_cells[0].text,
                                        "name": result_cells[1].text,
                                        "fname": result_cells[2].text,
                                        "gender": result_cells[3].text,
                                        "type": result_cells[4].text,
                                        "status": result_cells[5].text if len(result_cells) > 5 else "",
                                        "validity_date": validity_date_str,
                                        "is_valid": is_valid
                                    },
                                    "is_valid": is_valid
                                }
                            except Exception as e:
                                result = {
                                    "PVMC": True,
                                    "details": {
                                        "reg_no": result_cells[0].text,
                                        "name": result_cells[1].text,
                                        "fname": result_cells[2].text,
                                        "gender": result_cells[3].text,
                                        "type": result_cells[4].text,
                                        "status": result_cells[5].text if len(result_cells) > 5 else ""
                                    },
                                    "is_valid": False,
                                    "error": "Could not verify validity date: " + str(e)
                                }
                        except Exception as e:
                            result = {
                                "PVMC": True,
                                "details": {
                                    "reg_no": result_cells[0].text,
                                    "name": result_cells[1].text,
                                    "fname": result_cells[2].text,
                                    "gender": result_cells[3].text,
                                    "type": result_cells[4].text,
                                    "status": result_cells[5].text if len(result_cells) > 5 else ""
                                },
                                "is_valid": False,
                                "error": "Could not access details page: " + str(e)
                            }
                    else:
                        result = {
                            "PVMC": False,
                            "details": None,
                            "reason": "Name or father's name does not match",
                            "is_valid": False
                        }
        except Exception as e:
            result["error"] = "Error processing results: " + str(e)
            
        driver.quit()
        return jsonify(result)
    except Exception as e:
        driver.quit()
        return jsonify({"PVMC": False, "error": str(e), "is_valid": False}), 500

# === Create Checkout Session ===
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json
        required_fields = ['plan_price', 'plan_email', 'plan_name', 'plan_duration', 'num_posts']

        if not all(field in data and data[field] is not None for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        unit_amount = int(float(data['plan_price']) * 100)

        payment_intent = stripe.PaymentIntent.create(
            amount=unit_amount,
            currency='pkr',
            setup_future_usage='off_session'
        )
        print(f"Stripe Payment Intent created: {payment_intent}")
        return jsonify({'clientSecret': payment_intent.client_secret})
    except Exception as err:
        print(f"Error creating Payment Intent: {str(err)}")
        return jsonify({'error': str(err)}), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict-breed', methods=['POST'])
def predict_breed():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = Image.open(request.files['image']).convert('RGB')
    input_tensor = vgg_transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = vgg_model(input_tensor)
        _, predicted = torch.max(outputs, 1)

    predicted_index = int(predicted.item()) + 1
    predicted_label = breed_labels.get(predicted_index, f"Unknown (index {predicted_index})")

    return jsonify({
        'predicted_breed_index': predicted_index,
        'predicted_breed_label': predicted_label
    })

@app.route('/detect-skin-disease', methods=['POST'])
def detect_skin_disease():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    temp_path = 'temp_input.jpg'
    image.save(temp_path)

    results = skin_model(temp_path)[0]
    detections = []

    img = cv2.imread(temp_path)

    for box in results.boxes:
        label = results.names[int(box.cls.item())]
        bbox = [int(coord) for coord in box.xyxy[0]]

        cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(img, f"{label}", (bbox[0], bbox[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        detections.append({
            'label': label,
            'bbox': bbox
        })

    cv2.imwrite(output_image_path, img)
    os.remove(temp_path)

    return jsonify({
        'detections': detections,
        'output_image': f"/{output_image_path}"
    })

# === Hugging Face Cat vs Dog Classifier ===
# Remove: hf_catdog_classifier = pipeline("image-classification", model="aifanfant/cats_vs_dogs")

# Restore the previous /classify-cat-dog endpoint using Keras model
@app.route('/classify-cat-dog', methods=['POST'])
def classify_cat_dog():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    print('Received file:', file.filename, file.content_type, file.content_length)
    try:
        save_path = os.path.join('static', 'debug_upload.jpg')
        file.save(save_path)
        print(f'File saved successfully at {save_path}!')
    except Exception as e:
        print('Error saving file:', e)

    # If cat or dog, proceed to model
    try:
        image = Image.open(save_path).convert('RGB')
        input_tensor = preprocess_catdog_image(image)
        prediction = cat_dog_model.predict(input_tensor)[0][0]
        print(f"Raw model prediction: {prediction}")
        if prediction < 0 or prediction > 1:
            prediction = expit(prediction)
            print(f"After sigmoid: {prediction}")
        threshold = 0.5
        label = 'Dog' if prediction < threshold else 'Cat'
        if label == 'Dog':
            confidence = 1 - (prediction / threshold)
        else:
            confidence = (prediction - threshold) / (1 - threshold)
        confidence = max(0, min(1, confidence))
        print(f"Final classification with threshold {threshold}: {label} with confidence {confidence}")
        os.remove(save_path)
        if confidence < 0.2:
            return jsonify({'result': 'This is not a dog nor a cat.'}), 200
        return jsonify({
            'predicted_label': label,
            'confidence': float(confidence)
        })
    except Exception as e:
        print(f"Exception during prediction: {str(e)}")
        os.remove(save_path)
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

cat_breed_model_path = os.path.join('models', 'cat_37breed_xception_model.h5')
cat_breed_model = load_model(cat_breed_model_path)

cat_breed_labels = [
    "Abyssinian", "American Shorthair", "Balinese", "Bengal", "Birman", "Bombay", "British Shorthair", "Burmese",
    "Chartreux", "Chausie", "Domestic Longhair", "Egyptian Mau", "Exotic Shorthair", "Himalayan", "Japanese Bobtail",
    "Khao Manee", "Kurilian Bobtail", "LaPerm", "Maine Coon", "Manx", "Neva Masquerade", "Ocicat", "Peterbald",
    "Persian", "Ragamuffin", "Ragdoll", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Serengeti",
    "Siamese", "Singapura", "Sphynx", "Tonkinese", "Turkish Angora", "Turkish Van"
]

def preprocess_catbreed_image(image_pil):
    image = image_pil.resize((299, 299))
    image_array = np.array(image) / 255.0
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    return np.expand_dims(image_array, axis=0)

@app.route('/predict-cat-breed', methods=['POST'])
def predict_cat_breed():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    try:
        image = Image.open(request.files['image']).convert('RGB')
        input_tensor = preprocess_catbreed_image(image)
        preds = cat_breed_model.predict(input_tensor)
        pred_idx = int(np.argmax(preds))
        pred_label = cat_breed_labels[pred_idx] if pred_idx < len(cat_breed_labels) else f"Unknown (index {pred_idx})"
        confidence = float(np.max(preds))
        return jsonify({
            'predicted_breed_index': pred_idx,
            'predicted_breed_label': pred_label,
            'confidence_score': confidence
        })
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
