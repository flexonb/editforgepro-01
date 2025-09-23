import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Copy, Smartphone, Settings, Palette, Zap } from 'lucide-react';
import QRCodeLib from 'qrcode';

export function QRGenerator() {
  const [text, setText] = useState('https://editforge.pro');
  const [qrCode, setQrCode] = useState('');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(4);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!text.trim()) {
      setQrCode('');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCodeLib.toCanvas(canvas, text, {
        errorCorrectionLevel,
        width: size,
        margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      // Convert canvas to data URL for display
      const dataURL = canvas.toDataURL('image/png', 1.0);
      setQrCode(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrCode('');
    }
  };

  useEffect(() => {
    generateQR();
  }, [text, errorCorrectionLevel, size, margin, darkColor, lightColor]);

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const presetTexts = [
    { label: 'Website URL', value: 'https://editforge.pro' },
    { label: 'Hello World', value: 'Hello, World!' },
    { label: 'Email Contact', value: 'mailto:contact@example.com' },
    { label: 'Phone Number', value: 'tel:+1234567890' },
    { label: 'WiFi Network', value: 'WIFI:T:WPA;S:MyNetwork;P:password123;;' },
    { label: 'SMS Message', value: 'sms:+1234567890:Hello from QR code!' },
  ];

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">QR Code Generator</h2>
        </div>
        
        {qrCode && (
          <button
            onClick={downloadQR}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 p-4 border-r border-slate-200 space-y-4 overflow-y-auto">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, or any data..."
              className="w-full h-24 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quick Presets</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {presetTexts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setText(preset.value)}
                  className="w-full text-left px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                >
                  <div className="font-medium text-slate-900">{preset.label}</div>
                  <div className="text-slate-600 truncate">{preset.value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* QR Settings */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </h3>
            
            <div>
              <label className="block text-xs text-slate-600 mb-1">Size: {size}px</label>
              <input
                type="range"
                min="200"
                max="600"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Margin: {margin}</label>
              <input
                type="range"
                min="0"
                max="8"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">Error Correction</label>
              <select
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          {/* Color Settings */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Foreground</label>
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-full h-8 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Background</label>
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-full h-8 rounded border border-slate-300"
                />
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">Presets</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => { setDarkColor('#000000'); setLightColor('#ffffff'); }}
                  className="h-6 rounded border border-slate-300 bg-gradient-to-r from-black to-white"
                  title="Black & White"
                />
                <button
                  onClick={() => { setDarkColor('#8B5CF6'); setLightColor('#ffffff'); }}
                  className="h-6 rounded border border-slate-300 bg-gradient-to-r from-purple-500 to-white"
                  title="Purple & White"
                />
                <button
                  onClick={() => { setDarkColor('#14B8A6'); setLightColor('#ffffff'); }}
                  className="h-6 rounded border border-slate-300 bg-gradient-to-r from-teal-500 to-white"
                  title="Teal & White"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={copyToClipboard}
              disabled={!text}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Text</span>
            </button>
            
            <button
              onClick={downloadQR}
              disabled={!qrCode}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download QR Code</span>
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex-1 p-6 overflow-auto">
          {qrCode ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 max-w-full">
                <img 
                  src={qrCode} 
                  alt="Generated QR Code" 
                  className="max-w-full max-h-96 rounded-lg"
                  style={{ 
                    imageRendering: 'pixelated',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
              
              <div className="text-center space-y-2 max-w-md">
                <div className="text-sm text-slate-600">
                  {size}×{size}px • {errorCorrectionLevel} Error Correction
                </div>
                <div className="text-xs text-slate-500 break-all px-4">
                  {text.length > 50 ? `${text.substring(0, 50)}...` : text}
                </div>
                <button
                  onClick={downloadQR}
                  className="mt-4 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg mx-auto"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-lg">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Create QR Codes Instantly
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Generate QR codes for URLs, text, contact info, WiFi credentials, and more.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/50 rounded-lg p-4">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <h4 className="font-medium text-slate-900 mb-1">Instant Generation</h4>
                      <p className="text-slate-600">Real-time QR code creation</p>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <Palette className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                      <h4 className="font-medium text-slate-900 mb-1">Customizable</h4>
                      <p className="text-slate-600">Colors, size, and error correction</p>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <Download className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <h4 className="font-medium text-slate-900 mb-1">High Quality</h4>
                      <p className="text-slate-600">PNG export up to 600px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for QR generation */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}