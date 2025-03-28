import numpy as np
from PIL import Image, ImageFile

# Fix for truncated images
ImageFile.LOAD_TRUNCATED_IMAGES = True

def convert_grayscale(image):
    """Convert an image to grayscale from scratch."""
    image.load()
    img_array = np.array(image)
    
    if len(img_array.shape) == 2:  # Already grayscale
        return image  

    gray_img = np.dot(img_array[..., :3], [0.299, 0.587, 0.114]).astype(np.uint8)
    return Image.fromarray(gray_img)

def quantize_image(image, levels=4):
    """Reduce intensity levels in an image while preserving color."""
    image.load()
    img_array = np.array(image)
    
    factor = 256 // levels
    quantized_img = (img_array // factor) * factor
    return Image.fromarray(quantized_img.astype(np.uint8))

def histogram_equalization(image):
    """Apply histogram equalization while preserving color or handling grayscale."""
    image.load()
    img_array = np.array(image)

    if len(img_array.shape) == 2:  # Grayscale
        hist, bins = np.histogram(img_array.flatten(), bins=256, range=[0, 256])
        cdf = hist.cumsum()
        cdf_normalized = (cdf - cdf.min()) * 255 / (cdf.max() - cdf.min())
        equalized_img = cdf_normalized[img_array].astype(np.uint8)
        return Image.fromarray(equalized_img)

    for c in range(img_array.shape[2]):  # R, G, B channels
        hist, bins = np.histogram(img_array[:, :, c].flatten(), bins=256, range=[0, 256])
        cdf = hist.cumsum()
        cdf_normalized = (cdf - cdf.min()) * 255 / (cdf.max() - cdf.min())
        img_array[:, :, c] = cdf_normalized[img_array[:, :, c]].astype(np.uint8)

    return Image.fromarray(img_array)

def smooth_filter(image):
    """Apply a 3x3 smoothing filter while preserving color or grayscale."""
    image.load()
    img_array = np.array(image)

    kernel = np.ones((3, 3)) / 9
    pad = 1
    smoothed_img = np.zeros_like(img_array)

    if len(img_array.shape) == 2:  # Grayscale
        padded_img = np.pad(img_array, pad, mode='constant', constant_values=0)
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                smoothed_img[i, j] = np.sum(padded_img[i:i+3, j:j+3] * kernel)
    else:
        for c in range(3):  # R, G, B channels
            padded_channel = np.pad(img_array[:, :, c], pad, mode='constant', constant_values=0)
            for i in range(img_array.shape[0]):
                for j in range(img_array.shape[1]):
                    smoothed_img[i, j, c] = np.sum(padded_channel[i:i+3, j:j+3] * kernel)

    return Image.fromarray(smoothed_img.astype(np.uint8))

def sharpen_filter(image):
    """Apply a sharpening filter while preserving color or grayscale."""
    image.load()
    img_array = np.array(image)

    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    pad = 1
    sharpened_img = np.zeros_like(img_array)

    if len(img_array.shape) == 2:  # Grayscale
        padded_img = np.pad(img_array, pad, mode='constant', constant_values=0)
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                sharpened_img[i, j] = np.clip(np.sum(padded_img[i:i+3, j:j+3] * kernel), 0, 255)
    else:
        for c in range(3):  # R, G, B channels
            padded_channel = np.pad(img_array[:, :, c], pad, mode='constant', constant_values=0)
            for i in range(img_array.shape[0]):
                for j in range(img_array.shape[1]):
                    sharpened_img[i, j, c] = np.clip(np.sum(padded_channel[i:i+3, j:j+3] * kernel), 0, 255)

    return Image.fromarray(sharpened_img.astype(np.uint8))

def high_pass_filter(image):
    """Apply a high-pass filter for edge detection while preserving color or grayscale."""
    image.load()
    img_array = np.array(image)

    kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
    pad = 1
    high_pass_img = np.zeros_like(img_array)

    if len(img_array.shape) == 2:  # Grayscale
        padded_img = np.pad(img_array, pad, mode='constant', constant_values=0)
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                high_pass_img[i, j] = np.clip(np.sum(padded_img[i:i+3, j:j+3] * kernel), 0, 255)
    else:
        for c in range(3):  # R, G, B channels
            padded_channel = np.pad(img_array[:, :, c], pad, mode='constant', constant_values=0)
            for i in range(img_array.shape[0]):
                for j in range(img_array.shape[1]):
                    high_pass_img[i, j, c] = np.clip(np.sum(padded_channel[i:i+3, j:j+3] * kernel), 0, 255)

    return Image.fromarray(high_pass_img.astype(np.uint8))

def low_pass_filter(image):
    """Apply a low-pass filter for blurring while preserving color or grayscale."""
    image.load()
    img_array = np.array(image)

    kernel = np.ones((5, 5)) / 25
    pad = 2
    low_pass_img = np.zeros_like(img_array)

    if len(img_array.shape) == 2:  # Grayscale
        padded_img = np.pad(img_array, pad, mode='constant', constant_values=0)
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                low_pass_img[i, j] = np.sum(padded_img[i:i+5, j:j+5] * kernel)
    else:
        for c in range(3):  # R, G, B channels
            padded_channel = np.pad(img_array[:, :, c], pad, mode='constant', constant_values=0)
            for i in range(img_array.shape[0]):
                for j in range(img_array.shape[1]):
                    low_pass_img[i, j, c] = np.sum(padded_channel[i:i+5, j:j+5] * kernel)

    return Image.fromarray(low_pass_img.astype(np.uint8))
