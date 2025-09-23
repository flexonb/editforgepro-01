import React from 'react';
import { Home, Image, Music, Video, FileText, Palette, Download, Search, Code, Minimize, Camera, QrCode, Compass, Zap, Cpu, ChevronDown, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  categoryFilter?: 'all' | 'main' | 'editors' | 'tools' | 'expert';
}

const tools = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, category: 'main', keywords: ['home', 'start', 'overview'] },
  
  // Editors (keep only these)
  { id: 'image-editor', name: 'Image Editor', icon: Image, category: 'editors', keywords: ['photo', 'picture', 'edit', 'filter', 'crop'] },
  { id: 'audio-editor', name: 'Audio Editor', icon: Music, category: 'editors', keywords: ['sound', 'music', 'audio', 'wave', 'trim'] },
  { id: 'video-editor', name: 'Video Editor', icon: Video, category: 'editors', keywords: ['video', 'movie', 'clip', 'trim', 'cut'] },
  { id: 'text-editor', name: 'Text Editor', icon: FileText, category: 'editors', keywords: ['text', 'markdown', 'document', 'write'] },
  { id: 'code-editor', name: 'Code Editor', icon: Code, category: 'editors', keywords: ['code', 'programming', 'javascript', 'html', 'css'] },
  
  // Essential Tools (keep only these in main sidebar)
  { id: 'converter', name: 'File Converter', icon: Download, category: 'tools', keywords: ['convert', 'format', 'transform', 'export'] },
  { id: 'qr-generator', name: 'QR Generator', icon: QrCode, category: 'tools', keywords: ['qr', 'code', 'barcode', 'generate'] },
  { id: 'pdf-tools', name: 'PDF Tools', icon: FileText, category: 'tools', keywords: ['pdf', 'merge', 'split', 'extract'] },
  { id: 'image-compressor', name: 'Image Compressor', icon: Minimize, category: 'tools', keywords: ['compress', 'optimize', 'reduce'] },
  { id: 'screen-recorder', name: 'Screen Recorder', icon: Camera, category: 'tools', keywords: ['screen', 'record', 'capture', 'video'] },
];

// Utilities (dropdown section, not part of main sidebar categories)
const utilities = [
  { id: 'color-picker', name: 'Color Picker', icon: Palette, keywords: ['color', 'picker', 'palette', 'hex'] },
  { id: 'password-generator', name: 'Password Generator', icon: Zap, keywords: ['password', 'generate', 'secure', 'random'] },
  { id: 'json-formatter', name: 'JSON Formatter', icon: Cpu, keywords: ['json', 'format', 'validate', 'pretty'] },
  { id: 'unit-converter', name: 'Unit Converter', icon: Compass, keywords: ['unit', 'convert', 'measurement', 'metric'] },
];

const categories = {
  main: 'Main',
  editors: 'Editors',
  tools: 'Essential Tools',
};

export function Sidebar({ currentTool, onToolChange, searchQuery, isOpen, onClose, categoryFilter = 'all' }: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    main: true,
    editors: true,
    tools: true,
  });
  const [utilitiesOpen, setUtilitiesOpen] = React.useState<boolean>(false);

  const baseTools = tools.filter(t => (categoryFilter === 'all' ? true : t.category === categoryFilter));

  const filteredTools = baseTools.filter(tool => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.keywords.some(keyword => keyword.includes(query))
    );
  });

  // Utilities filtered by search
  const filteredUtilities = utilities.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.keywords.some(k => k.includes(q));
  });

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [] as typeof tools;
    }
    (acc[tool.category] as any).push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const handleToolClick = (toolId: string) => {
    onToolChange(toolId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const toggleCategory = (cat: keyof typeof categories) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-transparent text-slate-800 sidebar-responsive`}>
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur">
          <h2 className="text-responsive-lg font-semibold text-slate-900">Tools</h2>
          <button
            onClick={onClose}
            className="touch-target hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-responsive">
          {/* Card container to match reference style */}
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-200 p-3 space-y-3">
            {Object.entries(categories).map(([catKey, catLabel]) => {
              const catTools = (groupedTools[catKey] as any) || [];
              if (categoryFilter !== 'all' && catKey !== categoryFilter) return null;
              if (catTools.length === 0) return null;
              const isOpenSection = expanded[catKey];
              return (
                <div key={catKey}>
                  <button
                    onClick={() => toggleCategory(catKey as keyof typeof categories)}
                    className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-500 hover:text-slate-700 text-left"
                    aria-expanded={isOpenSection}
                  >
                    <span>{catLabel}</span>
                    {isOpenSection ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isOpenSection && (
                    <div className="space-y-2">
                      {catTools.map((tool: any) => {
                        const Icon = tool.icon;
                        const isActive = currentTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group touch-target border ${
                              isActive
                                ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-900 shadow ring-1 ring-violet-200 border-violet-200'
                                : 'bg-white hover:bg-slate-50 text-slate-700 hover:shadow-sm border-slate-200'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? 'text-violet-600' : 'text-violet-500 group-hover:text-violet-600'
                            }`} />
                            <span className="text-responsive-sm font-medium truncate">{tool.name}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full animate-pulse flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Utilities dropdown */}
            <div>
              <button
                onClick={() => setUtilitiesOpen(v => !v)}
                className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-wider mt-1 mb-1 text-slate-500 hover:text-slate-700 text-left"
                aria-expanded={utilitiesOpen}
              >
                <span>Utilities</span>
                {utilitiesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {utilitiesOpen && (
                <div className="space-y-2">
                  {filteredUtilities.map(u => {
                    const Icon = u.icon;
                    const isActive = currentTool === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleToolClick(u.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group touch-target border ${
                          isActive ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-slate-900 shadow ring-1 ring-violet-200 border-violet-200' : 'bg-white hover:bg-slate-50 text-slate-700 hover:shadow-sm border-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-violet-500 group-hover:text-violet-600'}`} />
                        <span className="text-responsive-sm font-medium truncate">{u.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full animate-pulse flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {searchQuery && filteredTools.length === 0 && filteredUtilities.length === 0 && (
              <div className="text-left py-6">
                <Search className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-responsive-sm text-slate-500">No tools found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}