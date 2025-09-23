import React, { useState, useRef } from 'react';
import { Upload, Download, Minimize, Image as ImageIcon, Sliders } from 'lucide-react';

interface CompressedImage {
  original: File;
  compressed: string;
  originalSize: number;
  compressedSize: number;
  quality: number;
}

export function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        compressImage(file);
      }
    });
  };

  const compressImage = (file: File) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      
      // Calculate compressed size (approximate)
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

      const compressedImage: CompressedImage = {
        original: file,
        compressed: compressedDataUrl,
        originalSize: file.size,
        compressedSize,
        quality,
      };

      setImages(prev => [...prev, compressedImage]);
    };

    img.src = URL.createObjectURL(file);
  };

  const downloadImage = (image: CompressedImage) => {
    const link = document.createElement('a');
    link.href = image.compressed;
    link.download = `compressed-${image.original.name.replace(/\.[^/.]+$/, '')}.jpg`;
    link.click();
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number) => {
    const savings = ((original - compressed) / original) * 100;
    return Math.round(savings);
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Minimize className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Image Compressor</h2>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Images</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Settings */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Compression Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Width (px)
              </label>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Height (px)
              </label>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {images.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Compressed Images</h3>
            
            {images.map((image, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={image.compressed}
                      alt="Compressed"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-2">{image.original.name}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Original:</span>
                        <div className="font-medium">{formatFileSize(image.originalSize)}</div>
                      </div>
                      
                      <div>
                        <span className="text-slate-600">Compressed:</span>
                        <div className="font-medium">{formatFileSize(image.compressedSize)}</div>
                      </div>
                      
                      <div>
                        <span className="text-slate-600">Savings:</span>
                        <div className="font-medium text-green-600">
                          {calculateSavings(image.originalSize, image.compressedSize)}%
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-slate-600">Quality:</span>
                        <div className="font-medium">{image.quality}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadImage(image)}
                      className="flex items-center space-x-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Compress Your Images
            </h3>
            <p className="text-slate-600 mb-4">
              Reduce file sizes while maintaining quality. Perfect for web optimization.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all"
            >
              Select Images to Compress
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}