from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from processing import convert_grayscale, quantize_image, histogram_equalization, smooth_filter, sharpen_filter
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return jsonify({"message": "Image Processing API Running!"})

@app.route("/upload", methods=["POST"])
def upload_image():
    """Upload an image and return its path."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    return jsonify({"message": "File uploaded", "file_path": file_path})

@app.route("/process/<operation>", methods=["POST"])
def process_image(operation):
    """Apply processing based on the selected operation."""
    data = request.json
    file_path = data.get("file_path")
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 400

    image = Image.open(file_path)  # Load image once

    # Select operation
    if operation == "grayscale":
        processed_img = convert_grayscale(image)
    elif operation == "quantize":
        processed_img = quantize_image(image, levels=4)
    elif operation == "histogram":
        processed_img = histogram_equalization(image)
    elif operation == "smooth":
        processed_img = smooth_filter(image)
    elif operation == "sharpen":
        processed_img = sharpen_filter(image)
    else:
        return jsonify({"error": "Invalid operation"}), 400

    processed_path = os.path.join(UPLOAD_FOLDER, f"processed_{operation}.png")
    processed_img.save(processed_path)

    return send_file(processed_path, mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
