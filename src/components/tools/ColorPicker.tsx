import React, { useState } from 'react';
import { Palette, Copy, Eye, Pipette } from 'lucide-react';

export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [colorHistory, setColorHistory] = useState<string[]>(['#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444']);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const addToHistory = (color: string) => {
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 11)]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const rgb = hexToRgb(selectedColor);
  const hsl = hexToHsl(selectedColor);

  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Color Picker</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Color Preview */}
          <div className="text-center">
            <div 
              className="w-32 h-32 mx-auto rounded-xl shadow-lg border-4 border-white"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="mt-4">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  addToHistory(e.target.value);
                }}
                className="w-20 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Color Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">HEX</span>
                <button
                  onClick={() => copyToClipboard(selectedColor)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-lg">{selectedColor}</div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">RGB</span>
                <button
                  onClick={() => copyToClipboard(`rgb(${rgb?.r}, ${rgb?.g}, ${rgb?.b})`)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-sm">
                rgb({rgb?.r}, {rgb?.g}, {rgb?.b})
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">HSL</span>
                <button
                  onClick={() => copyToClipboard(`hsl(${hsl?.h}, ${hsl?.s}%, ${hsl?.l}%)`)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-sm">
                hsl({hsl?.h}, {hsl?.s}%, {hsl?.l}%)
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Preset Colors</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedColor(color);
                    addToHistory(color);
                  }}
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Color History */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Colors</h3>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {colorHistory.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}