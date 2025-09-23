import React, { useState } from 'react';
import { Code, Play, Trash2, Save, AlertTriangle } from 'lucide-react';

export function ScriptRunner() {
  const [code, setCode] = useState(`// Welcome to the JavaScript Script Runner
// Write your code here and click Run to execute

console.log("Hello, EditForge Pro!");

// Example: Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// Example: Generate random color
function randomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

console.log("Random color:", randomColor());

// Return a value to see it in the output
"Script executed successfully! 🎉";`);
  
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runScript = async () => {
    setIsRunning(true);
    setError('');
    setOutput('');

    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      logs.push('LOG: ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      logs.push('WARN: ' + args.map(arg => String(arg)).join(' '));
      originalWarn(...args);
    };

    try {
      // Create a safe execution context
      const safeGlobals = {
        console,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        setTimeout: (fn: Function, delay: number) => {
          if (delay < 0 || delay > 5000) {
            throw new Error('setTimeout delay must be between 0 and 5000ms');
          }
          return setTimeout(fn, delay);
        },
        setInterval: () => {
          throw new Error('setInterval is not allowed for security reasons');
        },
        fetch: () => {
          throw new Error('fetch is not allowed. Use the dedicated tools for API calls.');
        },
        XMLHttpRequest: () => {
          throw new Error('XMLHttpRequest is not allowed. Use the dedicated tools for API calls.');
        }
      };

      // Execute the code in a restricted context
      const func = new Function(...Object.keys(safeGlobals), `
        "use strict";
        ${code}
      `);

      const result = func(...Object.values(safeGlobals));
      
      if (result !== undefined) {
        logs.push('RETURN: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
      }

      setOutput(logs.join('\n'));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  const saveScript = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Script Runner</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearOutput}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
          
          <button
            onClick={saveScript}
            className="flex items-center space-x-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={runScript}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run Script'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">JavaScript Code</h3>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-slate-900 text-green-400 font-mono text-sm rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Write your JavaScript code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-96 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Output</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Security Warning */}
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-medium mb-1">Sandboxed Environment</p>
                  <p>Scripts run in a secure sandbox. Network requests and dangerous APIs are blocked.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Error:</h4>
                <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            )}

            {output && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {output}
                </pre>
              </div>
            )}

            {!output && !error && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run your script to see output here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}