import React, { useState, useRef } from 'react';
import { Code, Play, Download, Copy, Save, FileText, Zap, Settings, Eye, Edit } from 'lucide-react';

export function CodeEditor() {
  const [code, setCode] = useState(`// Welcome to the Advanced Code Editor
// Supports multiple languages with syntax highlighting

// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// CSS Example
const styles = \`
  .gradient-bg {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    padding: 20px;
  }
\`;

// HTML Example
const htmlTemplate = \`
  <div class="gradient-bg">
    <h1>Hello, World!</h1>
    <p>This is a dynamic template.</p>
  </div>
\`;

// Return result
"Code editor ready! 🚀";`);

  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { value: 'javascript', name: 'JavaScript', ext: 'js' },
    { value: 'typescript', name: 'TypeScript', ext: 'ts' },
    { value: 'html', name: 'HTML', ext: 'html' },
    { value: 'css', name: 'CSS', ext: 'css' },
    { value: 'python', name: 'Python', ext: 'py' },
    { value: 'json', name: 'JSON', ext: 'json' },
    { value: 'markdown', name: 'Markdown', ext: 'md' },
    { value: 'xml', name: 'XML', ext: 'xml' },
    { value: 'sql', name: 'SQL', ext: 'sql' },
    { value: 'yaml', name: 'YAML', ext: 'yaml' },
  ];

  const themes = [
    { value: 'dark', name: 'Dark' },
    { value: 'light', name: 'Light' },
    { value: 'monokai', name: 'Monokai' },
    { value: 'github', name: 'GitHub' },
  ];

  const runCode = () => {
    setIsRunning(true);
    setOutput('');

    try {
      if (language === 'javascript' || language === 'typescript') {
        // Capture console output
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;

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

        // Execute code
        const func = new Function(code);
        const result = func();
        
        if (result !== undefined) {
          logs.push('RETURN: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
        }

        setOutput(logs.join('\n'));

        // Restore console
        console.log = originalLog;
        console.error = originalError;
      } else if (language === 'html') {
        setOutput('HTML code ready for preview. Click "Preview" to see the result.');
      } else if (language === 'css') {
        setOutput('CSS code ready. Use with HTML for styling.');
      } else {
        setOutput(`${language.toUpperCase()} code formatted and ready.`);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCode = () => {
    try {
      if (language === 'json') {
        const parsed = JSON.parse(code);
        setCode(JSON.stringify(parsed, null, tabSize));
      } else if (language === 'javascript' || language === 'typescript') {
        // Basic formatting for JS/TS
        const formatted = code
          .replace(/;/g, ';\n')
          .replace(/{/g, '{\n')
          .replace(/}/g, '\n}')
          .replace(/,/g, ',\n');
        setCode(formatted);
      }
    } catch (error) {
      setOutput(`Formatting error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const insertSnippet = (snippet: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newCode = code.substring(0, start) + snippet + code.substring(end);
      setCode(newCode);
    }
  };

  const downloadCode = () => {
    const lang = languages.find(l => l.value === language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${lang?.ext || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  const renderPreview = () => {
    if (language === 'html') {
      return (
        <iframe
          srcDoc={code}
          className="w-full h-full border-0 bg-white rounded"
          title="HTML Preview"
        />
      );
    } else if (language === 'markdown') {
      // Basic markdown rendering
      const htmlContent = code
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      
      return (
        <div 
          className="w-full h-full p-4 bg-white rounded prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }
    return <div className="flex items-center justify-center h-full text-slate-500">Preview not available for {language}</div>;
  };

  const snippets = {
    javascript: [
      { name: 'Function', code: 'function functionName() {\n  // code here\n}' },
      { name: 'Arrow Function', code: 'const functionName = () => {\n  // code here\n};' },
      { name: 'For Loop', code: 'for (let i = 0; i < array.length; i++) {\n  // code here\n}' },
      { name: 'If Statement', code: 'if (condition) {\n  // code here\n}' },
    ],
    html: [
      { name: 'HTML5 Template', code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>' },
      { name: 'Div', code: '<div class="container">\n  <!-- content -->\n</div>' },
      { name: 'Form', code: '<form>\n  <input type="text" placeholder="Enter text">\n  <button type="submit">Submit</button>\n</form>' },
    ],
    css: [
      { name: 'Flexbox', code: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}' },
      { name: 'Grid', code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}' },
      { name: 'Animation', code: '@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}' },
    ],
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Advanced Code Editor</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-sm"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${
              isPreview ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Settings Sidebar */}
        {!isPreview && (
          <div className="w-64 p-4 border-r border-slate-200 space-y-4 overflow-y-auto">
            {/* Editor Settings */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Editor Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-100 border border-slate-300 rounded text-sm"
                  >
                    {themes.map(t => (
                      <option key={t.value} value={t.value}>{t.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tab Size: {tabSize}</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={tabSize}
                    onChange={(e) => setTabSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={wordWrap}
                      onChange={(e) => setWordWrap(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Word Wrap</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={lineNumbers}
                      onChange={(e) => setLineNumbers(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Line Numbers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Code Snippets */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Snippets
              </h3>
              <div className="space-y-1">
                {snippets[language as keyof typeof snippets]?.map((snippet, index) => (
                  <button
                    key={index}
                    onClick={() => insertSnippet(snippet.code)}
                    className="w-full text-left px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    {snippet.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={formatCode}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Format Code
                </button>
                
                <button
                  onClick={copyCode}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copy Code
                </button>
                
                <button
                  onClick={downloadCode}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {isPreview ? (
            <div className="flex-1 p-4">
              {renderPreview()}
            </div>
          ) : (
            <>
              {/* Code Editor */}
              <div className="flex-1 flex">
                {lineNumbers && (
                  <div className="w-12 p-2 bg-slate-100 border-r border-slate-200 text-right">
                    <pre className="text-xs text-slate-500 font-mono leading-6">
                      {getLineNumbers()}
                    </pre>
                  </div>
                )}
                
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full h-full p-4 font-mono resize-none focus:outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-900 text-green-400' 
                        : 'bg-white text-slate-900'
                    }`}
                    style={{ 
                      fontSize: `${fontSize}px`,
                      tabSize: tabSize,
                      whiteSpace: wordWrap ? 'pre-wrap' : 'pre'
                    }}
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Output Panel */}
              <div className="h-48 border-t border-slate-200 bg-slate-50">
                <div className="p-2 border-b border-slate-200 bg-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700">Output</h4>
                </div>
                <div className="p-4 h-40 overflow-y-auto">
                  {output ? (
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {output}
                    </pre>
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Run your code to see output here</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}