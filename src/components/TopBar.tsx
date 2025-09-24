import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ArrowLeft, Image as ImageIcon, Music, Film, FileText as FileTextIcon, Code2, Repeat, QrCode, Camera, ImageDown, ScreenShare, Pipette, KeyRound, Braces, Ruler } from 'lucide-react';

interface TopBarProps {
  onSearch: (query: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedCategory?: 'all' | 'main' | 'editors' | 'tools' | 'expert';
  onCategoryChange?: (category: 'all' | 'main' | 'editors' | 'tools' | 'expert') => void;
  // optional quick navigate handler to open tools from the top menus
  onNavigateTool?: (tool: string) => void;
  // production back button support
  currentTool?: string;
  onBack?: () => void;
}

export function TopBar({ onSearch, onToggleSidebar, sidebarOpen, selectedCategory = 'all', onCategoryChange, onNavigateTool, currentTool, onBack }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  // EditForge Pro menus (FlexConvert-style)
  const menus: Array<{
    label: string;
    accent?: 'emerald' | 'sky' | 'teal';
    featureTitle: string;
    featureDesc: string;
    items: Array<{ name: string; id: string; desc: string; Icon: React.ComponentType<{ className?: string }>; }>
  }> = [
    {
      label: 'Editors',
      accent: 'emerald',
      featureTitle: 'Pro Editors',
      featureDesc: 'Pixel-precise editors for image, audio, video, text and code.',
      items: [
        { name: 'Image Editor', id: 'image-editor', desc: 'Crop, adjust, annotate', Icon: ImageIcon },
        { name: 'Audio Editor', id: 'audio-editor', desc: 'Trim, convert, clean', Icon: Music },
        { name: 'Video Editor', id: 'video-editor', desc: 'Cut, transcode, overlay', Icon: Film },
        { name: 'Text Editor', id: 'text-editor', desc: 'Quick notes & files', Icon: FileTextIcon },
        { name: 'Code Editor', id: 'code-editor', desc: 'Lightweight coding', Icon: Code2 },
      ],
    },
    {
      label: 'Essential Tools',
      accent: 'sky',
      featureTitle: 'Everyday Toolkit',
      featureDesc: 'Fast converters and utilities designed for daily workflows.',
      items: [
        { name: 'File Converter', id: 'converter', desc: 'Audio / video / image', Icon: Repeat },
        { name: 'QR Generator', id: 'qr-generator', desc: 'Create shareable codes', Icon: QrCode },
        { name: 'PDF Tools', id: 'pdf-tools', desc: 'Merge, split, compress', Icon: FileTextIcon },
        { name: 'Image Compressor', id: 'image-compressor', desc: 'Reduce file size', Icon: ImageDown },
        { name: 'Screen Recorder', id: 'screen-recorder', desc: 'Record and share', Icon: ScreenShare },
      ],
    },
    {
      label: 'Utilities',
      accent: 'teal',
      featureTitle: 'Quick Utilities',
      featureDesc: 'Compact helpers that stay out of the way until you need them.',
      items: [
        { name: 'Color Picker', id: 'color-picker', desc: 'Grab hex & palette', Icon: Pipette },
        { name: 'Password Generator', id: 'password-generator', desc: 'Secure strings', Icon: KeyRound },
        { name: 'JSON Formatter', id: 'json-formatter', desc: 'Pretty-print & validate', Icon: Braces },
        { name: 'Unit Converter', id: 'unit-converter', desc: 'Lengths, sizes, more', Icon: Ruler },
        { name: 'Screen Recorder', id: 'screen-recorder', desc: 'Record and share', Icon: Camera },
      ],
    },
  ];

  // Tailwind-safe accent classes matching light blue/green palette
  const accentClasses: Record<NonNullable<typeof menus[number]['accent']>, string> = {
    emerald: 'bg-emerald-50 border-emerald-100',
    sky: 'bg-sky-50 border-sky-100',
    teal: 'bg-teal-50 border-teal-100',
  };

  return (
    <header className="nav-responsive border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-50">
      <div className="flex items-center justify-start w-full px-2.5 md:px-4 py-0 relative">
        <div className="flex items-center gap-1">
          {/* Back button when not on dashboard */}
          {currentTool && currentTool !== 'dashboard' && (
            <button
              onClick={onBack || (() => onNavigateTool && onNavigateTool('dashboard'))}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-[11px] font-medium">Back</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden inline-flex items-center justify-center w-6 h-6 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1">
            <h1 className="text-left text-[13px] sm:text-sm font-semibold text-slate-900">
              EditForge Pro
            </h1>
          </div>
        </div>

        {/* Desktop menu tabs with click-to-open mega dropdowns (centered) */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => setOpenMenu((prev) => (prev === menu.label ? null : menu.label))}
                className={`px-3 py-1.5 text-center text-base leading-none font-semibold rounded-md transition ${openMenu === menu.label ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.label}
              >
                {menu.label}
              </button>
              {/* Mega panel */}
              {openMenu === menu.label && (
                <div className="absolute left-0 top-full mt-1 w-[760px] bg-white shadow-xl rounded-xl border border-slate-200">
                  <div className="grid grid-cols-3 gap-3 p-3">
                    {/* Feature card */}
                    <div className={`col-span-1 rounded-lg p-4 border text-slate-800 ${accentClasses[menu.accent || 'emerald']}`}>
                      <div className="text-sm font-semibold mb-2">{menu.featureTitle}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{menu.featureDesc}</p>
                    </div>
                    {/* Item cards */}
                    <div className="col-span-2 grid grid-cols-2 gap-2 content-start max-h-72 overflow-y-auto pr-1">
                      {menu.items.map(({ name, id, desc, Icon }) => (
                        <button
                          key={id}
                          onClick={() => { setOpenMenu(null); onNavigateTool && onNavigateTool(id); }}
                          className="group text-left rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition p-2"
                        >
                          <div className="flex items-start gap-2">
                            <div className="shrink-0 rounded-md p-1.5 bg-gradient-to-br from-sky-50 to-emerald-50 border border-slate-200">
                              <Icon className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800">{name}</div>
                              <div className="text-[12px] text-slate-600 leading-snug">{desc}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Category dropdown */}
          <div className="hidden sm:block">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange && onCategoryChange(e.target.value as any)}
              className="pr-5 pl-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              aria-label="Filter by category"
            >
              <option value="all">All</option>
              <option value="main">Main</option>
              <option value="editors">Editors</option>
              <option value="tools">Creative Tools</option>
              <option value="expert">Expert Tools</option>
            </select>
          </div>

          {/* Responsive search input */}
          <div className="relative">
            <Search className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tools..."
              className="pl-7 sm:pl-7 pr-2.5 sm:pr-3 py-0.5 w-20 xs:w-24 sm:w-32 md:w-40 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              aria-label="Search tools"
            />
          </div>
        </div>
      </div>
    </header>
  );
}