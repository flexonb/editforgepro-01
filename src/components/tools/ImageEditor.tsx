import React, { useRef, useEffect, useState } from 'react';
import { Upload, Download, RotateCw, Palette, Layers, Undo, Redo, Sliders, Filter, Zap, Settings } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeFile, addFile } = useEditor();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);
  
  // History for undo/redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Layer state
  const [hasLayer, setHasLayer] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await addFile(file);
      setHasLayer(false);
      saveToHistory();
    }
  };

  const saveToHistory = () => {
    const state = {
      brightness,
      contrast,
      saturation,
      rotation,
      hue,
      blur,
      sepia,
      grayscale,
      invert,
      opacity,
      hasLayer
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setSaturation(prevState.saturation);
      setRotation(prevState.rotation);
      setHue(prevState.hue);
      setBlur(prevState.blur);
      setSepia(prevState.sepia);
      setGrayscale(prevState.grayscale);
      setInvert(prevState.invert);
      setOpacity(prevState.opacity);
      setHasLayer(prevState.hasLayer || false);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setSaturation(nextState.saturation);
      setRotation(nextState.rotation);
      setHue(nextState.hue);
      setBlur(nextState.blur);
      setSepia(nextState.sepia);
      setGrayscale(nextState.grayscale);
      setInvert(nextState.invert);
      setOpacity(nextState.opacity);
      setHasLayer(nextState.hasLayer || false);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const autoFix = () => {
    setBrightness(110);
    setContrast(115);
    setSaturation(105);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
    setOpacity(100);
    saveToHistory();
  };

  const addLayer = () => {
    if (!activeFile || !canvasRef.current) return;
    setHasLayer(true);
    saveToHistory();
  };

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity / 100;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      
      // Apply layer effects if enabled
      if (hasLayer) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.1)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        const vignette = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    };
    img.src = activeFile.data as string;
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
    setOpacity(100);
    setHasLayer(false);
    saveToHistory();
  };

  const downloadImage = () => {
    if (!activeFile) return;

    const exportCanvas = exportCanvasRef.current;
    if (!exportCanvas) return;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set export canvas size to match image
      exportCanvas.width = img.width;
      exportCanvas.height = img.height;
      
      ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      ctx.save();
      ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity / 100;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      
      // Apply layer effects
      if (hasLayer) {
        const gradient = ctx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.1)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        ctx.restore();
        
        const vignette = ctx.createRadialGradient(
          exportCanvas.width / 2, exportCanvas.height / 2, 0,
          exportCanvas.width / 2, exportCanvas.height / 2, Math.max(exportCanvas.width, exportCanvas.height) / 2
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        ctx.restore();
      }

      // Create download link
      const link = document.createElement('a');
      const fileName = `edited-${activeFile.name}`;
      link.download = fileName;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded ${fileName} - Dimensions: ${exportCanvas.width}x${exportCanvas.height}`);
    };
    
    img.src = activeFile.data as string;
  };

  useEffect(() => {
    if (activeFile && activeFile.type.startsWith('image/') && canvasRef.current) {
      applyFilters();
    }
  }, [activeFile, brightness, contrast, saturation, rotation, hue, blur, sepia, grayscale, invert, opacity, hasLayer]);

  useEffect(() => {
    if (history.length === 0) {
      saveToHistory();
    }
  }, []);

  return (
    <div className="h-full grid grid-rows-[auto,1fr,auto] bg-gradient-to-br from-white/90 via-purple-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-teal-500/10">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              Professional Image Editor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Advanced photo editing with real-time filters</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-lg sm:rounded-xl transition-all shadow-lg text-sm sm:text-base"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium hidden sm:inline">Upload Image</span>
            <span className="font-medium sm:hidden">Upload</span>
          </button>
          {activeFile && (
            <button
              onClick={downloadImage}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl transition-all shadow-lg text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium hidden sm:inline">Export</span>
              <span className="font-medium sm:hidden">Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Main area: Left | Canvas | Right */}
      <div className="min-h-0 grid grid-cols-[14rem,1fr,14rem]">
        {/* Left Sidebar */}
        <div className="min-h-0 overflow-y-auto p-3 sm:p-6 border-r border-white/20 space-y-4 sm:space-y-6 bg-gradient-to-b from-white/50 to-white/30">
          {/* Basic Adjustments */}
          <div className="bg-white/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-purple-600" />
              Basic Adjustments
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: 'Brightness', value: brightness, setter: setBrightness, min: 0, max: 200 },
                { label: 'Contrast', value: contrast, setter: setContrast, min: 0, max: 200 },
                { label: 'Saturation', value: saturation, setter: setSaturation, min: 0, max: 200 },
                { label: 'Opacity', value: opacity, setter: setOpacity, min: 0, max: 100 }
              ].map((control) => (
                <div key={control.label}>
                  <label className="block text-xs font-medium text-slate-700 mb-1 sm:mb-2">
                    {control.label}: {control.value}%
                  </label>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={control.value}
                    onChange={(e) => {
                      control.setter(Number(e.target.value));
                      saveToHistory();
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Color Effects */}
          <div className="bg-white/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-purple-600" />
              Color Effects
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: 'Hue', value: hue, setter: setHue, min: 0, max: 360, unit: '°' },
                { label: 'Sepia', value: sepia, setter: setSepia, min: 0, max: 100 },
                { label: 'Grayscale', value: grayscale, setter: setGrayscale, min: 0, max: 100 },
                { label: 'Invert', value: invert, setter: setInvert, min: 0, max: 100 }
              ].map((control) => (
                <div key={control.label}>
                  <label className="block text-xs font-medium text-slate-700 mb-1 sm:mb-2">
                    {control.label}: {control.value}{control.unit || '%'}
                  </label>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={control.value}
                    onChange={(e) => {
                      control.setter(Number(e.target.value));
                      saveToHistory();
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transform */}
          <div className="bg-white/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
              <RotateCw className="w-4 h-4 mr-2 text-purple-600" />
              Transform
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 sm:mb-2">
                  Rotation: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => {
                    setRotation(Number(e.target.value));
                    saveToHistory();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 sm:mb-2">
                  Blur: {blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => {
                    setBlur(Number(e.target.value));
                    saveToHistory();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Center */}
        <div className="min-h-0 p-3 sm:p-6 overflow-auto">
          {activeFile && activeFile.type.startsWith('image/') ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-2xl border border-white/30">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full rounded-xl shadow-lg border border-white/50"
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                  />
                  {/* Status indicators */}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    {hasLayer && (
                      <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
                        🎨 Layer Applied
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Palette className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                    Professional Image Editor
                  </h3>
                  <p className="text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                    Upload an image to start editing with powerful filters, color adjustments, and professional effects.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl font-medium text-sm sm:text-base"
                  >
                    Choose Image File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Quick actions + Export */}
        <div className="min-h-0 overflow-y-auto p-3 sm:p-6 border-l border-white/20 space-y-4 sm:space-y-6 bg-gradient-to-b from-white/50 to-white/30">
          {/* Quick Actions */}
          <div className="bg-white/60 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-purple-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button 
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 sm:p-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Undo className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                Undo
              </button>
              
              <button 
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 sm:p-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Redo className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                Redo
              </button>
              
              <button 
                onClick={autoFix}
                className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                Auto Fix
              </button>
              
              <button 
                onClick={addLayer}
                disabled={!activeFile}
                className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  hasLayer 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-400 text-white'
                }`}
              >
                <Layers className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                {hasLayer ? 'Layered' : 'Add Layer'}
              </button>
            </div>
            
            <button 
              onClick={resetFilters}
              className="w-full mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
              Reset All
            </button>
          </div>

          {/* Export Panel */}
          {activeFile && (
            <div className="bg-white/70 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <Download className="w-4 h-4 mr-2 text-purple-600" />
                Export
              </h3>
              <button
                onClick={downloadImage}
                className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                Export PNG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Dock (compact) */}
      <div className="border-t border-white/20 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 p-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs text-slate-700">
          <span className="truncate">{activeFile ? activeFile.name : 'No file loaded'}</span>
          <div className="flex items-center gap-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="px-3 py-1 rounded bg-slate-600 text-white disabled:bg-slate-400">Undo</button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="px-3 py-1 rounded bg-slate-600 text-white disabled:bg-slate-400">Redo</button>
            {activeFile && (
              <button onClick={downloadImage} className="px-3 py-1 rounded bg-teal-600 text-white">Export</button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} className="hidden" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}