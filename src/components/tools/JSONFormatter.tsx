import React, { useState } from 'react';
import { Cpu, Copy, Check, AlertCircle } from 'lucide-react';

export function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const formatJSON = (text: string) => {
    try {
      if (!text.trim()) {
        setOutput('');
        setError('');
        setIsValid(false);
        return;
      }

      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
      setIsValid(false);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  React.useEffect(() => {
    formatJSON(input);
  }, [input]);

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">JSON Formatter</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {isValid && (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Valid</span>
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Invalid</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Input JSON</label>
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
                placeholder='{"name": "John", "age": 30}'
                className="w-full h-96 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Formatted JSON</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={minifyJSON}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm transition-colors"
                  >
                    Minify
                  </button>
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-96 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">JSON Error</span>
              </div>
              <p className="text-red-700 mt-1 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Format & Validate</h3>
              <p className="text-sm text-slate-600">Automatically formats and validates JSON syntax</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Minify</h3>
              <p className="text-sm text-slate-600">Remove whitespace to reduce file size</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Error Detection</h3>
              <p className="text-sm text-slate-600">Detailed error messages for debugging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}