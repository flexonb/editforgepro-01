import React, { useState, useRef } from 'react';
import { FileText, Download, Eye, Edit, Bold, Italic, List, Type, Save, Copy, Zap, Settings, Code, Hash } from 'lucide-react';

export function TextEditor() {
  const [content, setContent] = useState(`# Welcome to EditForge Pro Text Editor

Start typing your **markdown** content here...

## Features

- **Rich Text Editing** with live preview
- **Markdown Support** with syntax highlighting
- **Export Options** (PDF, MD, HTML)
- **Auto-save** functionality
- **Word Count** and statistics

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

> This is a blockquote with **bold** text and *italic* text.

---

**Happy writing!** 🚀`);

  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState('light');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-slate-900">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 text-slate-800">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-3 text-slate-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-1">$2</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-6 py-2 my-4 bg-purple-50 italic text-slate-700">$1</blockquote>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-green-400 p-6 rounded-xl mb-6 overflow-x-auto shadow-lg"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-purple-600 px-2 py-1 rounded font-mono text-sm">$1</code>')
      .replace(/---/g, '<hr class="my-8 border-slate-300">')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-slate-700">')
      .replace(/\n/g, '<br>');
  };

  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        break;
      case 'heading1':
        newText = `# ${selectedText}`;
        break;
      case 'heading2':
        newText = `## ${selectedText}`;
        break;
      case 'heading3':
        newText = `### ${selectedText}`;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        h1, h2, h3 { color: #1e293b; }
        code { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
        pre { background: #1e293b; color: #10b981; padding: 1.5rem; border-radius: 0.5rem; overflow-x: auto; }
        blockquote { border-left: 4px solid #8b5cf6; padding-left: 1.5rem; background: #faf5ff; margin: 1rem 0; }
    </style>
</head>
<body>
    <div>${formatMarkdown(content)}</div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  React.useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Text Editor
            </h2>
            <p className="text-sm text-slate-600">Markdown editor with live preview and export options</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/60 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-slate-700">Words: {wordCount}</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-medium text-slate-700">Chars: {charCount}</span>
          </div>
          
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
              isPreview 
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {isPreview ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span className="font-medium">{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadAsMarkdown}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">MD</span>
            </button>
            
            <button
              onClick={downloadAsHTML}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">HTML</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Enhanced Toolbar */}
        {!isPreview && (
          <div className="w-64 p-6 border-r border-white/20 space-y-6 bg-gradient-to-b from-white/50 to-white/30">
            {/* Formatting Tools */}
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Type className="w-4 h-4 mr-2 text-blue-600" />
                Formatting
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => insertFormatting('bold')}
                  className="flex items-center justify-center space-x-1 p-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <Bold className="w-4 h-4" />
                  <span className="text-xs font-medium">Bold</span>
                </button>
                
                <button
                  onClick={() => insertFormatting('italic')}
                  className="flex items-center justify-center space-x-1 p-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <Italic className="w-4 h-4" />
                  <span className="text-xs font-medium">Italic</span>
                </button>
                
                <button
                  onClick={() => insertFormatting('list')}
                  className="flex items-center justify-center space-x-1 p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs font-medium">List</span>
                </button>
                
                <button
                  onClick={() => insertFormatting('code')}
                  className="flex items-center justify-center space-x-1 p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <Code className="w-4 h-4" />
                  <span className="text-xs font-medium">Code</span>
                </button>
              </div>
            </div>

            {/* Headings */}
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-blue-600" />
                Headings
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => insertFormatting('heading1')}
                  className="w-full text-left p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <span className="text-lg font-bold">H1</span>
                </button>
                <button
                  onClick={() => insertFormatting('heading2')}
                  className="w-full text-left p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <span className="text-base font-semibold">H2</span>
                </button>
                <button
                  onClick={() => insertFormatting('heading3')}
                  className="w-full text-left p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <span className="text-sm font-medium">H3</span>
                </button>
              </div>
            </div>

            {/* Editor Settings */}
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-blue-600" />
                Editor Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Line Height: {lineHeight}</label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-white/80 border border-white/30 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="sepia">Sepia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy Text</span>
                </button>
                <button
                  onClick={() => insertFormatting('quote')}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <span className="text-sm font-medium">Add Quote</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Editor/Preview Area */}
        <div className="flex-1 p-6">
          {isPreview ? (
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div 
                  className="prose prose-lg max-w-none bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30"
                  dangerouslySetInnerHTML={{ __html: `<p class="mb-4 leading-relaxed text-slate-700">${formatMarkdown(content)}</p>` }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg overflow-hidden">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full h-full p-8 bg-transparent border-none outline-none resize-none font-mono leading-relaxed ${
                  theme === 'dark' 
                    ? 'text-green-400 bg-slate-900' 
                    : theme === 'sepia'
                    ? 'text-amber-900 bg-amber-50'
                    : 'text-slate-900 bg-transparent'
                }`}
                style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight
                }}
                placeholder="Start typing your markdown content..."
                spellCheck={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}