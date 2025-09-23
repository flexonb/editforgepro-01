import React, { useState, useRef } from 'react';
import { Upload, Grid3X3, Download, Plus, X, RotateCw, Move, Palette, Crop, Layers, Settings } from 'lucide-react';

interface GridImage {
  id: string;
  src: string;
  name: string;
  rotation: number;
  scale: number;
  x: number;
  y: number;
}

interface GridSettings {
  rows: number;
  cols: number;
  gap: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  backgroundColor: string;
  shape: 'rectangle' | 'circle' | 'rounded' | 'hexagon' | 'diamond';
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export function PhotoGrid() {
  const [images, setImages] = useState<GridImage[]>([]);
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    rows: 2,
    cols: 2,
    gap: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    shape: 'rounded',
    shadowBlur: 10,
    shadowColor: '#00000040',
    shadowOffsetX: 0,
    shadowOffsetY: 4
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: GridImage = {
            id: crypto.randomUUID(),
            src: e.target?.result as string,
            name: file.name,
            rotation: 0,
            scale: 1,
            x: 0,
            y: 0
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const updateImage = (id: string, updates: Partial<GridImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const generateGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridImages = images.slice(0, gridSettings.rows * gridSettings.cols);
    const cellSize = 400;
    const totalWidth = gridSettings.cols * cellSize + (gridSettings.cols - 1) * gridSettings.gap + 40;
    const totalHeight = gridSettings.rows * cellSize + (gridSettings.rows - 1) * gridSettings.gap + 40;
    
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = gridSettings.backgroundColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    let loadedImages = 0;
    const totalImages = gridImages.length;

    gridImages.forEach((imageData, index) => {
      const img = new Image();
      img.onload = () => {
        const row = Math.floor(index / gridSettings.cols);
        const col = index % gridSettings.cols;
        const x = 20 + col * (cellSize + gridSettings.gap);
        const y = 20 + row * (cellSize + gridSettings.gap);

        ctx.save();

        // Apply shadow
        ctx.shadowBlur = gridSettings.shadowBlur;
        ctx.shadowColor = gridSettings.shadowColor;
        ctx.shadowOffsetX = gridSettings.shadowOffsetX;
        ctx.shadowOffsetY = gridSettings.shadowOffsetY;

        // Create clipping path based on shape
        ctx.beginPath();
        switch (gridSettings.shape) {
          case 'circle':
            ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - gridSettings.borderWidth, 0, 2 * Math.PI);
            break;
          case 'hexagon':
            const hexRadius = cellSize/2 - gridSettings.borderWidth;
            const hexX = x + cellSize/2;
            const hexY = y + cellSize/2;
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const px = hexX + hexRadius * Math.cos(angle);
              const py = hexY + hexRadius * Math.sin(angle);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
          case 'diamond':
            const diamondSize = cellSize/2 - gridSettings.borderWidth;
            ctx.moveTo(x + cellSize/2, y + gridSettings.borderWidth);
            ctx.lineTo(x + cellSize - gridSettings.borderWidth, y + cellSize/2);
            ctx.lineTo(x + cellSize/2, y + cellSize - gridSettings.borderWidth);
            ctx.lineTo(x + gridSettings.borderWidth, y + cellSize/2);
            ctx.closePath();
            break;
          case 'rounded':
            ctx.roundRect(
              x + gridSettings.borderWidth, 
              y + gridSettings.borderWidth, 
              cellSize - 2 * gridSettings.borderWidth, 
              cellSize - 2 * gridSettings.borderWidth, 
              gridSettings.borderRadius
            );
            break;
          default: // rectangle
            ctx.rect(
              x + gridSettings.borderWidth, 
              y + gridSettings.borderWidth, 
              cellSize - 2 * gridSettings.borderWidth, 
              cellSize - 2 * gridSettings.borderWidth
            );
        }
        
        ctx.clip();

        // Transform for image positioning and rotation
        ctx.translate(x + cellSize/2, y + cellSize/2);
        ctx.rotate((imageData.rotation * Math.PI) / 180);
        ctx.scale(imageData.scale, imageData.scale);
        ctx.translate(imageData.x, imageData.y);

        // Draw image
        ctx.drawImage(img, -cellSize/2, -cellSize/2, cellSize, cellSize);

        ctx.restore();

        // Draw border
        if (gridSettings.borderWidth > 0) {
          ctx.strokeStyle = gridSettings.borderColor;
          ctx.lineWidth = gridSettings.borderWidth;
          ctx.beginPath();
          
          switch (gridSettings.shape) {
            case 'circle':
              ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - gridSettings.borderWidth/2, 0, 2 * Math.PI);
              break;
            case 'hexagon':
              const hexRadius = cellSize/2 - gridSettings.borderWidth/2;
              const hexX = x + cellSize/2;
              const hexY = y + cellSize/2;
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const px = hexX + hexRadius * Math.cos(angle);
                const py = hexY + hexRadius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              break;
            case 'diamond':
              ctx.moveTo(x + cellSize/2, y + gridSettings.borderWidth/2);
              ctx.lineTo(x + cellSize - gridSettings.borderWidth/2, y + cellSize/2);
              ctx.lineTo(x + cellSize/2, y + cellSize - gridSettings.borderWidth/2);
              ctx.lineTo(x + gridSettings.borderWidth/2, y + cellSize/2);
              ctx.closePath();
              break;
            case 'rounded':
              ctx.roundRect(
                x + gridSettings.borderWidth/2, 
                y + gridSettings.borderWidth/2, 
                cellSize - gridSettings.borderWidth, 
                cellSize - gridSettings.borderWidth, 
                gridSettings.borderRadius
              );
              break;
            default:
              ctx.rect(
                x + gridSettings.borderWidth/2, 
                y + gridSettings.borderWidth/2, 
                cellSize - gridSettings.borderWidth, 
                cellSize - gridSettings.borderWidth
              );
          }
          
          ctx.stroke();
        }

        loadedImages++;
        if (loadedImages === totalImages) {
          console.log('Grid generated successfully');
        }
      };
      img.src = imageData.src;
    });
  };

  const downloadGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `photo-grid-${gridSettings.rows}x${gridSettings.cols}-${gridSettings.shape}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  React.useEffect(() => {
    if (images.length > 0) {
      generateGrid();
    }
  }, [images, gridSettings]);

  const selectedImage = images.find(img => img.id === selectedImageId);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/90 via-purple-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-teal-500/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl">
            <Grid3X3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              Advanced Photo Grid Maker
            </h2>
            <p className="text-sm text-slate-600">Create stunning collages with custom shapes and effects</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/60 rounded-xl px-3 py-2">
            <span className="text-sm font-medium text-slate-700">Grid:</span>
            <select
              value={`${gridSettings.rows}x${gridSettings.cols}`}
              onChange={(e) => {
                const [rows, cols] = e.target.value.split('x').map(Number);
                setGridSettings(prev => ({ ...prev, rows, cols }));
              }}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="1x1">1×1</option>
              <option value="1x2">1×2</option>
              <option value="2x1">2×1</option>
              <option value="2x2">2×2</option>
              <option value="2x3">2×3</option>
              <option value="3x2">3×2</option>
              <option value="3x3">3×3</option>
              <option value="3x4">3×4</option>
              <option value="4x3">4×3</option>
              <option value="4x4">4×4</option>
            </select>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Add Photos</span>
          </button>
          
          {images.length > 0 && (
            <button
              onClick={downloadGrid}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Export</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Enhanced Settings Sidebar */}
        <div className="w-80 p-6 border-r border-white/20 space-y-6 overflow-y-auto bg-gradient-to-b from-white/50 to-white/30">
          {/* Image Library */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-purple-600" />
              Images ({images.length})
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div 
                    className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                      selectedImageId === image.id 
                        ? 'border-purple-500 shadow-lg scale-105' 
                        : 'border-white/30 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedImageId(image.id)}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-20 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
              >
                <Plus className="w-8 h-8 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Image Controls */}
          {selectedImage && (
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Move className="w-4 h-4 mr-2 text-purple-600" />
                Image Controls
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Rotation: {selectedImage.rotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedImage.rotation}
                    onChange={(e) => updateImage(selectedImage.id, { rotation: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Scale: {selectedImage.scale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={selectedImage.scale}
                    onChange={(e) => updateImage(selectedImage.id, { scale: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    X Position: {selectedImage.x}px
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={selectedImage.x}
                    onChange={(e) => updateImage(selectedImage.id, { x: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Y Position: {selectedImage.y}px
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={selectedImage.y}
                    onChange={(e) => updateImage(selectedImage.id, { y: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Grid Settings */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-purple-600" />
              Grid Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shape</label>
                <select
                  value={gridSettings.shape}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, shape: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white/80 border border-white/30 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="rounded">Rounded Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gap: {gridSettings.gap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={gridSettings.gap}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, gap: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Border Width: {gridSettings.borderWidth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={gridSettings.borderWidth}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, borderWidth: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {gridSettings.shape === 'rounded' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Border Radius: {gridSettings.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gridSettings.borderRadius}
                    onChange={(e) => setGridSettings(prev => ({ ...prev, borderRadius: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Border Color</label>
                <input
                  type="color"
                  value={gridSettings.borderColor}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, borderColor: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-white/30"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={gridSettings.backgroundColor}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Shadow Settings */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-purple-600" />
              Shadow Effects
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Shadow Blur: {gridSettings.shadowBlur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={gridSettings.shadowBlur}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, shadowBlur: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Shadow Offset X: {gridSettings.shadowOffsetX}px
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={gridSettings.shadowOffsetX}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, shadowOffsetX: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Shadow Offset Y: {gridSettings.shadowOffsetY}px
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={gridSettings.shadowOffsetY}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, shadowOffsetY: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shadow Color</label>
                <input
                  type="color"
                  value={gridSettings.shadowColor.slice(0, 7)}
                  onChange={(e) => setGridSettings(prev => ({ ...prev, shadowColor: e.target.value + '40' }))}
                  className="w-full h-10 rounded-lg border border-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Grid Preview */}
        <div className="flex-1 p-6 overflow-auto">
          {images.length > 0 ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-2xl border border-white/50">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-96 rounded-xl shadow-lg"
                />
              </div>
              
              <div className="text-center bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Grid: {gridSettings.rows}×{gridSettings.cols} | Shape: {gridSettings.shape} | Using {Math.min(images.length, gridSettings.rows * gridSettings.cols)} of {images.length} images
                </p>
                {images.length > gridSettings.rows * gridSettings.cols && (
                  <p className="text-xs text-amber-600">
                    Extra images will be ignored. Consider increasing grid size or removing images.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Grid3X3 className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Create Stunning Photo Collages
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Upload multiple images to create beautiful grid layouts with custom shapes, borders, shadows, and effects.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl font-medium"
                  >
                    Add Your First Photos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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