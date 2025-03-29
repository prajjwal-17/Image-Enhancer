import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { ClipLoader } from "react-spinners";

export default function ImageProcessor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [operation, setOperation] = useState("");
  const [filterInfo, setFilterInfo] = useState({
    title: "About Image Processing",
    description: "This application allows you to apply various image processing techniques to your photos. Upload an image and experiment with different filters to see their effects in real-time."
  });

  // Filter information
  const filterInfoData = {
    default: {
      title: "About Image Processing",
      description: "This application allows you to apply various image processing techniques to your photos. Upload an image and experiment with different filters to see their effects in real-time."
    },
    grayscale: {
      title: "Grayscale Filter",
      description: "Converts the image to black and white by removing all color information. Each pixel's value is determined by its luminance, preserving the image's brightness and contrast while eliminating hue and saturation."
    },
    quantize: {
      title: "Quantize Filter",
      description: "Reduces the number of colors in the image while maintaining visual similarity. This process creates a more stylized look with fewer distinct colors, similar to poster art or old video games."
    },
    histogram: {
      title: "Histogram Equalization",
      description: "Enhances image contrast by redistributing pixel intensity values. This technique helps reveal details in over or underexposed areas by stretching the intensity range across the entire spectrum."
    },
    smooth: {
      title: "Smooth Filter",
      description: "Reduces noise and details in the image using a Gaussian blur. This filter softens sharp edges and creates a more even appearance, useful for removing grain or imperfections."
    },
    sharpen: {
      title: "Sharpen Filter",
      description: "Enhances edges and fine details in the image by increasing contrast between neighboring pixels. This makes the image appear more defined and crisp."
    },
    highpass: {
      title: "High-Pass Filter",
      description: "Emphasizes high-frequency components like edges and details while removing low-frequency information. This filter is useful for edge detection and highlighting texture details."
    },
    lowpass: {
      title: "Low-Pass Filter",
      description: "Preserves low-frequency components while attenuating high frequencies, resulting in a smoother image. This reduces noise and small details while maintaining the overall structure."
    }
  };

  // Cleanup function when component unmounts or page reloads
  useEffect(() => {
    // Cleanup function for when component unmounts
    return () => {
      if (image) {
        cleanupImage();
      }
      
      // Revoke any object URLs to prevent memory leaks
      if (preview) URL.revokeObjectURL(preview);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [image, preview, processedImage]);

  // Add event listener for page unload/reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (image) {
        cleanupImage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [image]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      // Clean up previous image if exists
      if (image) {
        cleanupImage();
      }
      
      const file = acceptedFiles[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setOperation("");
      setFilterInfo(filterInfoData.default);
    },
  });

  const uploadImage = async () => {
    if (!image) {
      alert("Upload an image first!");
      return null;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post("https://image-enhancer-hqtl.onrender.com/upload", formData);
      return res.data.file_path;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const processImage = async (op) => {
    if (!image) return alert("Upload an image first!");

    setLoading(true);
    setProcessing(true);
    setOperation(op);
    setFilterInfo(filterInfoData[op] || filterInfoData.default);
    
    // Clean up previous processed image if exists
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }

    const filePath = await uploadImage();
    if (!filePath) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `https://image-enhancer-hqtl.onrender.com/process/${op}`,
        { file_path: filePath },
        { responseType: "blob" }
      );
      setProcessedImage(URL.createObjectURL(response.data));
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const cleanupImage = async () => {
    if (!image) return;

    try {
      await axios.post("https://image-enhancer-hqtl.onrender.com/delete", { file_path: image.name });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const removePhoto = async () => {
    if (!image) return;

    cleanupImage();

    // Clean up object URLs to prevent memory leaks
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);

    setImage(null);
    setPreview(null);
    setProcessedImage(null);
    setOperation("");
    setFilterInfo(filterInfoData.default);
  };

  const saveImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `processed_${operation}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-8 px-4 sm:px-6 md:px-8 lg:px-12 relative">
      <motion.div
        className="absolute top-4 right-4 md:top-8 md:right-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <a 
          href="#contact" 
          className="bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm shadow-lg"
        >
          Contact Me
        </a>
      </motion.div>
    
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-lg text-center mb-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🔥 Image Processor 🔥
      </motion.h1>
      
      <motion.p 
        className="text-gray-300 text-base sm:text-lg mb-8 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Upload an image and apply various filters with just one click
      </motion.p>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column - Upload & Controls */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Drag & Drop */}
          <motion.div
            {...getRootProps()}
            className="w-full h-48 border-4 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-800/40 hover:scale-105 bg-gray-800/20"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-300 text-lg font-semibold text-center px-4">Drag & Drop or Click to Upload</p>
            <p className="text-gray-400 text-sm mt-1">Supports JPG, PNG, WebP</p>
          </motion.div>

          {/* Filter Buttons */}
          {preview && (
            <motion.div 
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-gray-700 pb-2">Image Filters</h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => processImage("grayscale")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "grayscale" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Grayscale
                </button>
                <button 
                  onClick={() => processImage("quantize")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "quantize" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Quantize
                </button>
                <button 
                  onClick={() => processImage("histogram")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "histogram" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Histogram
                </button>
                <button 
                  onClick={() => processImage("smooth")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "smooth" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Smooth
                </button>
                <button 
                  onClick={() => processImage("sharpen")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "sharpen" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Sharpen
                </button>
                <button 
                  onClick={() => processImage("highpass")} 
                  className={`btn px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "highpass" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  High-Pass
                </button>
                <button 
                  onClick={() => processImage("lowpass")} 
                  className={`btn col-span-2 px-3 py-2.5 rounded-lg text-sm sm:text-base transition-all ${operation === "lowpass" && processedImage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Low-Pass
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {preview && (
            <motion.div 
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                onClick={removePhoto}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 text-base flex items-center justify-center"
              >
                <span className="mr-2">❌</span> Remove Photo
              </button>
              
              {processedImage && (
                <button
                  onClick={saveImage}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 text-base flex items-center justify-center"
                >
                  <span className="mr-2">💾</span> Save Processed Image
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column - Image Preview & Results */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {preview ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Original Image Card */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
                <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-700">
                  <h3 className="font-medium text-gray-200">Original Image</h3>
                </div>
                <div className="p-4 flex-grow flex items-center justify-center overflow-hidden">
                  <img
                    src={preview}
                    alt="Original"
                    className="max-w-full max-h-64 object-contain shadow-lg transition-all duration-300"
                  />
                </div>
                <div className="bg-gray-700/30 px-4 py-2 text-xs text-gray-400">
                  {image && `${image.name} (${(image.size / 1024).toFixed(1)} KB)`}
                </div>
              </div>

              {/* Processed Image Card or Loading */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
                <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-700">
                  <h3 className="font-medium text-gray-200">
                    {loading ? "Processing..." : processedImage ? `${operation.charAt(0).toUpperCase() + operation.slice(1)} Filter` : "Processed Result"}
                  </h3>
                </div>
                <div className="p-4 flex-grow flex items-center justify-center min-h-64">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <ClipLoader color="#4A90E2" size={40} />
                      <p className="mt-3 text-sm text-gray-400">
                        {processing ? `Applying ${operation} filter...` : "Uploading image..."}
                      </p>
                    </div>
                  ) : processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-w-full max-h-64 object-contain shadow-lg transition-all duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p className="text-center">Select a filter to see the processed result here</p>
                    </div>
                  )}
                </div>
                {processedImage && (
                  <div className="bg-gray-700/30 px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
                    <span>Filter: {operation}</span>
                    <button 
                      onClick={saveImage} 
                      className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-8 border border-gray-700 flex flex-col items-center justify-center min-h-64 text-center shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl mb-4">🖼️</div>
              <h2 className="text-xl font-medium text-gray-300 mb-2">No Image Selected</h2>
              <p className="text-gray-400 max-w-md">Upload an image using the panel on the left to start processing</p>
            </motion.div>
          )}
          
          {/* Image Processing Info */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-blue-400 mb-2">{filterInfo.title}</h3>
            <p className="text-gray-300 text-sm">{filterInfo.description}</p>
          </motion.div>
        </div>
      </div>

      {/* Contact Section */}
      <motion.div
        id="contact"
        className="w-full max-w-6xl mx-auto mt-12 bg-gray-900/60 backdrop-blur-md rounded-xl shadow-xl border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Contact Me</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Card */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 shadow-lg col-span-1">
            <h3 className="font-semibold text-lg text-blue-400 mb-4">Prajjwal Rawat</h3>
            <div className="space-y-3">
              <a 
                href="mailto:prajjwalchamp17@gmail.com" 
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
              >
                <i className="fas fa-envelope mr-3 text-lg"></i>
                <span>prajjwalchamp17@gmail.com</span>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/prajjwal-rawat-886151278/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
              >
                <i className="fab fa-linkedin mr-3 text-lg"></i>
                <span>LinkedIn</span>
              </a>
              
              <a 
                href="https://github.com/prajjwal-17" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <i className="fab fa-github mr-3 text-lg"></i>
                <span>GitHub</span>
              </a>
              
              <a 
                href="https://www.instagram.com/prajjwal_17_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-gray-300 hover:text-pink-400 transition-colors"
              >
                <i className="fab fa-instagram mr-3 text-lg"></i>
                <span>Instagram</span>
              </a>
            </div>
          </div>
          
          {/* About Me */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 shadow-lg md:col-span-2">
            <h3 className="font-semibold text-lg text-blue-400 mb-3">About This Project</h3>
            <p className="text-gray-300 mb-4">
              This Image Processing application was created using React for the frontend and a Python backend
              for image manipulation. It demonstrates various image processing techniques including filters, 
              edge detection, and color manipulation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-900/50 rounded-full text-xs text-blue-300 border border-blue-800">React</span>
              <span className="px-3 py-1 bg-blue-900/50 rounded-full text-xs text-blue-300 border border-blue-800">Python</span>
              <span className="px-3 py-1 bg-blue-900/50 rounded-full text-xs text-blue-300 border border-blue-800">Image Processing</span>
              <span className="px-3 py-1 bg-blue-900/50 rounded-full text-xs text-blue-300 border border-blue-800">Tailwind CSS</span>
              <span className="px-3 py-1 bg-blue-900/50 rounded-full text-xs text-blue-300 border border-blue-800">Framer Motion</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900/80 px-6 py-3 text-center text-gray-400 text-sm border-t border-gray-800">
          © {new Date().getFullYear()} Prajjwal Rawat. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}