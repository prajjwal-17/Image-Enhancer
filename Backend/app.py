from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from processing import (
    convert_grayscale, quantize_image, histogram_equalization,
    smooth_filter, sharpen_filter, high_pass_filter, low_pass_filter
)
from PIL import Image
import os
import io
import shutil
import time
import threading

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to periodically clean up old files
def cleanup_old_files(directory, max_age_seconds=3600):  # Default: 1 hour
    """Remove files older than max_age_seconds from the directory"""
    while True:
        try:
            current_time = time.time()
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                # Check if it's a file (not a directory) and older than max_age
                if os.path.isfile(file_path) and (current_time - os.path.getmtime(file_path)) > max_age_seconds:
                    try:
                        os.remove(file_path)
                        print(f"Cleaned up old file: {file_path}")
                    except Exception as e:
                        print(f"Failed to remove {file_path}: {e}")
        except Exception as e:
            print(f"Error in cleanup task: {e}")
        
        # Sleep for a while before next cleanup
        time.sleep(1800)  # Check every 30 minutes

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_files, args=(UPLOAD_FOLDER,), daemon=True)
cleanup_thread.start()

@app.route("/")
def home():
    return jsonify({"message": "Image Processing API Running!"})

@app.route("/upload", methods=["POST"])
def upload_image():
    """Upload an image and return its path."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400
        
    # Generate a unique filename to avoid collisions
    timestamp = int(time.time())
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return jsonify({"message": "File uploaded", "file_path": file_path})

@app.route("/process/<operation>", methods=["POST"])
def process_image(operation):
    """Apply processing based on the selected operation."""
    data = request.json
    file_path = data.get("file_path")

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 400

    try:
        image = Image.open(file_path)

        # Apply the selected filter
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
        elif operation == "highpass":
            processed_img = high_pass_filter(image)
        elif operation == "lowpass":
            processed_img = low_pass_filter(image)
        else:
            return jsonify({"error": "Invalid operation"}), 400

        # Save processed image in memory (not on disk)
        img_io = io.BytesIO()
        processed_img.save(img_io, format="PNG")
        img_io.seek(0)

        # Delete the uploaded image after processing
        try:
            os.remove(file_path)
            print(f"Deleted uploaded file: {file_path}")
        except Exception as e:
            print(f"Error deleting uploaded file: {e}")

        return send_file(img_io, mimetype="image/png")
    
    except Exception as e:
        # Make sure to delete the uploaded file even if processing fails
        try:
            os.remove(file_path)
            print(f"Deleted uploaded file after error: {file_path}")
        except:
            pass
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route("/delete", methods=["POST"])
def delete_file():
    """Delete a file from the server."""
    data = request.json
    file_name = data.get("file_path")
    
    if not file_name:
        return jsonify({"error": "No file path provided"}), 400
    
    # For security, make sure we're only deleting from the uploads folder
    file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(file_name))
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": f"File {file_name} deleted"})
        else:
            return jsonify({"message": f"File {file_name} not found, may have been already deleted"})
    except Exception as e:
        return jsonify({"error": f"Failed to delete file: {str(e)}"}), 500

@app.route("/cleanup", methods=["POST"])
def cleanup_all():
    """Admin endpoint to clean up all files in the uploads directory."""
    try:
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        return jsonify({"message": "All files cleaned up"})
    except Exception as e:
        return jsonify({"error": f"Cleanup failed: {str(e)}"}), 500

# Add this for full cleanup when the server shuts down
def cleanup_on_shutdown():
    try:
        shutil.rmtree(UPLOAD_FOLDER)
        print(f"Cleaned up {UPLOAD_FOLDER} directory on shutdown")
    except Exception as e:
        print(f"Failed to clean up on shutdown: {e}")

# Register the cleanup function to run at exit
import atexit
atexit.register(cleanup_on_shutdown)

if __name__ == "__main__":
    app.run(debug=True)