# **Image Enhancer**  

A simple image processing tool built using **Flask** and **React**. This project provides various image enhancement techniques such as grayscale conversion, histogram equalization, smoothing, and sharpening, all implemented from scratch without using OpenCV.

---

## **Features**  
- 📷 **Upload Images**: Users can upload images for processing.  
- 🎨 **Grayscale Conversion**: Converts an image to grayscale using custom logic.  
- 📊 **Histogram Equalization**: Enhances contrast by redistributing intensity values.  
- 🔄 **Quantization**: Reduces the number of intensity levels in an image.  
- 🔍 **Smoothing Filter**: Applies a 3×3 filter to blur the image.  
- ✨ **Sharpening Filter**: Enhances image details using a sharpening kernel.  
- 🖼️ **Download Processed Image**: Save the enhanced image locally.  

---

## **Tech Stack**  
### 🔹 **Frontend**  
- React (with Vite)  
- Tailwind CSS (or any UI framework you used)  

### 🔹 **Backend**  
- Flask  
- NumPy  
- Pillow (PIL)  

---

## **Installation**  

### **Clone the repository**  
```sh
git clone https://github.com/prajjwal-17/Image-Enhancer.git
cd Image-Enhancer

# Backend Setup

## Install dependencies globally (without virtual environment):
```sh
pip install -r requirements.txt
