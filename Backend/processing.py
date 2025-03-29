import numpy as np
import cv2
from PIL import Image, ImageFile

# Fix for truncated images
ImageFile.LOAD_TRUNCATED_IMAGES = True

def convert_grayscale(image):
    """Convert an image to grayscale using OpenCV for speed."""
    image.load()
    img_array = np.array(image)

    if len(img_array.shape) == 2:  # Already grayscale
        return image

    # Use OpenCV for fast grayscale conversion
    gray_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    return Image.fromarray(gray_img)

def quantize_image(image, levels=4):
    """Reduce intensity levels in an image while preserving color."""
    image.load()
    img_array = np.array(image)

    factor = 256 // levels
    quantized_img = (img_array // factor) * factor

    return Image.fromarray(quantized_img.astype(np.uint8))

def histogram_equalization(image):
    """Apply histogram equalization with OpenCV for speed."""
    image.load()
    img_array = np.array(image)

    if len(img_array.shape) == 2:  # Grayscale
        equalized_img = cv2.equalizeHist(img_array)
        return Image.fromarray(equalized_img)

    # For color images, apply histogram equalization to each channel separately
    img_yuv = cv2.cvtColor(img_array, cv2.COLOR_RGB2YUV)
    img_yuv[:, :, 0] = cv2.equalizeHist(img_yuv[:, :, 0])  # Apply only on Y channel
    equalized_img = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2RGB)

    return Image.fromarray(equalized_img)

def smooth_filter(image):
    """Apply a 3x3 smoothing filter using OpenCV."""
    image.load()
    img_array = np.array(image)

    smoothed_img = cv2.GaussianBlur(img_array, (3, 3), 0)  # Faster with OpenCV
    return Image.fromarray(smoothed_img)

def sharpen_filter(image):
    """Apply a sharpening filter using OpenCV."""
    image.load()
    img_array = np.array(image)

    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
    sharpened_img = cv2.filter2D(img_array, -1, kernel)  # Faster with OpenCV

    return Image.fromarray(sharpened_img)

def high_pass_filter(image):
    """Apply a high-pass filter for edge detection using OpenCV."""
    image.load()
    img_array = np.array(image)

    kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], dtype=np.float32)
    high_pass_img = cv2.filter2D(img_array, -1, kernel)  # Faster with OpenCV

    return Image.fromarray(high_pass_img)

def low_pass_filter(image):
    """Apply a low-pass filter for blurring using OpenCV."""
    image.load()
    img_array = np.array(image)

    low_pass_img = cv2.GaussianBlur(img_array, (5, 5), 0)  # Faster with OpenCV
    return Image.fromarray(low_pass_img)
