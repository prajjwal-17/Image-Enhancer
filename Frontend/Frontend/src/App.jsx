import { useState } from "react";
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

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setProcessedImage(null);
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
      const res = await axios.post("http://127.0.0.1:5000/upload", formData);
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
    setProcessedImage(null);

    const filePath = await uploadImage();
    if (!filePath) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/process/${op}`,
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

  const removePhoto = () => {
    setImage(null);
    setPreview(null);
    setProcessedImage(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center px-6 relative">
      <motion.h1
        className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🔥 Image Processor 🔥
      </motion.h1>

      {/* Drag & Drop */}
      <motion.div
        {...getRootProps()}
        className="mt-6 w-96 h-48 border-4 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-800/40 hover:scale-105"
        whileHover={{ scale: 1.05 }}
      >
        <input {...getInputProps()} />
        <p className="text-gray-300 text-lg font-semibold">📂 Drag & Drop or Click to Upload</p>
      </motion.div>

      {/* Image & Processed Image Side-by-Side */}
      {preview && (
        <div className="mt-6 flex flex-row gap-8">
          <motion.img
            src={preview}
            alt="Uploaded"
            className="w-80 h-80 object-cover rounded-xl shadow-lg border-2 border-blue-500 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {processedImage && !loading && (
            <motion.img
              src={processedImage}
              alt="Processed"
              className="w-80 h-80 object-cover rounded-xl shadow-lg border-2 border-green-500 transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      )}

      {/* Buttons */}
      {preview && (
        <div className="flex space-x-4 mt-6">
          <button onClick={() => processImage("grayscale")} className="btn">Grayscale</button>
          <button onClick={() => processImage("quantize")} className="btn">Quantization</button>
          <button onClick={() => processImage("histogram")} className="btn">Histogram</button>
          <button onClick={() => processImage("smooth")} className="btn">Smooth</button>
          <button onClick={() => processImage("sharpen")} className="btn">Sharpen</button>
          <button onClick={() => processImage("highpass")} className="btn">High-Pass</button>
          <button onClick={() => processImage("lowpass")} className="btn">Low-Pass</button>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="mt-6 flex flex-col items-center">
          <ClipLoader color="#4A90E2" size={50} />
          <p className="mt-2 text-lg font-semibold text-gray-300">
            {processing ? `Processing ${operation}...` : "Uploading image..."}
          </p>
        </div>
      )}

      {/* Remove Photo Button */}
      {preview && (
        <button
          onClick={removePhoto}
          className="mt-6 bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          ❌ Remove Photo
        </button>
      )}

      {/* Save Processed Image Button */}
      {processedImage && (
        <button
          onClick={saveImage}
          className="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          💾 Save Image
        </button>
      )}

      {/* Footer */}
      <motion.div
        className="absolute bottom-4 right-4 bg-gray-800/80 text-gray-300 text-sm px-4 py-2 rounded-lg shadow-lg border border-gray-600"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Project by <span className="font-semibold text-blue-400">Prajjwal Rawat</span>  
        <br />
        Req. No: <span className="text-purple-400">RA2311026010224</span> | Sec: <span className="text-green-400">AE-1</span>
        <br />
        <span className="text-white">Project submitted to:</span> <span className="text-yellow-400 font-semibold">Dr. S Nagar</span>
      </motion.div>
    </div>
  );
}
