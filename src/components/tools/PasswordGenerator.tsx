import React, { useState } from 'react';
import { Zap, Copy, RefreshCw, Shield } from 'lucide-react';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  const generatePassword = () => {
    let charset = '';
    
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (!charset) {
      setPassword('Please select at least one character type');
      return;
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(result);
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score < 3) return { text: 'Weak', color: 'red' };
    if (score < 5) return { text: 'Medium', color: 'yellow' };
    return { text: 'Strong', color: 'green' };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  React.useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Password Generator</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Generated Password */}
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Generated Password</span>
              <div className="flex items-center space-x-2">
                {strength && (
                  <span className={`text-xs px-2 py-1 rounded-full bg-${strength.color}-100 text-${strength.color}-700`}>
                    {strength.text}
                  </span>
                )}
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={generatePassword}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="font-mono text-lg bg-white p-3 rounded border break-all">
              {password || 'Click generate to create a password'}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Length: {length}
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Numbers (0-9)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Symbols (!@#$%)</span>
              </label>

              <label className="flex items-center space-x-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Exclude similar characters (il1Lo0O)</span>
              </label>
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Generate New Password
          </button>
        </div>
      </div>
    </div>
  );
}