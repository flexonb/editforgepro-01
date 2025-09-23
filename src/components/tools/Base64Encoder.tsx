import React, { useState } from 'react';
import { Code, Copy, ArrowUpDown } from 'lucide-react';

export function Base64Encoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const processText = (text: string, operation: 'encode' | 'decode') => {
    try {
      if (operation === 'encode') {
        return btoa(unescape(encodeURIComponent(text)));
      } else {
        return decodeURIComponent(escape(atob(text)));
      }
    } catch (error) {
      return 'Invalid input for ' + operation;
    }
  };

  React.useEffect(() => {
    if (input) {
      setOutput(processText(input, mode));
    } else {
      setOutput('');
    }
  }, [input, mode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const swapInputOutput = () => {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Base64 Encoder/Decoder</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-3 py-1 rounded ${mode === 'encode' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-3 py-1 rounded ${mode === 'decode' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  {mode === 'encode' ? 'Plain Text' : 'Base64 Text'}
                </label>
                <button
                  onClick={() => copyToClipboard(input)}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                className="w-full h-64 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Swap Button */}
            <div className="lg:hidden flex justify-center">
              <button
                onClick={swapInputOutput}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  {mode === 'encode' ? 'Base64 Text' : 'Plain Text'}
                </label>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg resize-none"
              />
            </div>
          </div>

          {/* Swap Button for Desktop */}
          <div className="hidden lg:flex justify-center">
            <button
              onClick={swapInputOutput}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Swap & Switch Mode</span>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">About Base64</h3>
            <p className="text-sm text-blue-800">
              Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format. 
              It's commonly used for encoding data in email, URLs, and web applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}