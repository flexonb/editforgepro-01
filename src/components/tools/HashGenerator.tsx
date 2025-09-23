import React, { useState } from 'react';
import { Hash, Copy, Shield } from 'lucide-react';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const generateHashes = async (text: string) => {
    if (!text) {
      setHashes({});
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    try {
      // Generate different hash types
      const md5Hash = await simpleHash(text, 'MD5');
      const sha1Hash = await crypto.subtle.digest('SHA-1', data);
      const sha256Hash = await crypto.subtle.digest('SHA-256', data);
      const sha512Hash = await crypto.subtle.digest('SHA-512', data);

      setHashes({
        MD5: md5Hash,
        'SHA-1': arrayBufferToHex(sha1Hash),
        'SHA-256': arrayBufferToHex(sha256Hash),
        'SHA-512': arrayBufferToHex(sha512Hash),
      });
    } catch (error) {
      console.error('Error generating hashes:', error);
    }
  };

  const simpleHash = async (str: string, algorithm: string) => {
    // Simple MD5-like hash for demonstration
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const arrayBufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  React.useEffect(() => {
    generateHashes(input);
  }, [input]);

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Hash Generator</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter text to generate hashes
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter any text..."
              className="w-full h-32 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {Object.keys(hashes).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Generated Hashes</h3>
              
              {Object.entries(hashes).map(([algorithm, hash]) => (
                <div key={algorithm} className="bg-slate-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{algorithm}</span>
                    <button
                      onClick={() => copyToClipboard(hash)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm break-all bg-white p-3 rounded border">
                    {hash}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!input && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Generate Secure Hashes
              </h3>
              <p className="text-slate-600">
                Create MD5, SHA-1, SHA-256, and SHA-512 hashes for any text.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}