import React from 'react';
import { Crown, Sparkles, Download, FileText, ImageIcon, QrCode, Files, ArrowRight, Video, Music } from 'lucide-react';

interface DashboardProps {
  onToolChange?: (tool: string) => void;
}

function Dashboard({ onToolChange }: DashboardProps) {
  const quickActions = [
    { name: 'Edit Media', icon: ImageIcon, action: 'image-editor', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Convert Files', icon: Download, action: 'converter', gradient: 'from-blue-500 to-blue-600' },
    { name: 'PDF Tools', icon: FileText, action: 'pdf-tools', gradient: 'from-green-500 to-emerald-600' },
    { name: 'Generate QR', icon: QrCode, action: 'qr-generator', gradient: 'from-orange-500 to-amber-600' },
    { name: 'Edit Audio', icon: Music, action: 'audio-editor', gradient: 'from-teal-500 to-cyan-600' },
    { name: 'Edit Video', icon: Video, action: 'video-editor', gradient: 'from-pink-500 to-rose-600' }
  ];

  const handleToolClick = (toolId: string) => {
    if (onToolChange) {
      onToolChange(toolId);
    }
  };

  // Dropzone state and helpers
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pickToolByFile = (file: File): string => {
    const type = file.type;
    const name = file.name.toLowerCase();
    if (type.startsWith('image/')) return 'image-editor';
    if (type.startsWith('audio/')) return 'audio-editor';
    if (type.startsWith('video/')) return 'video-editor';
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf-tools';
    if (name.endsWith('.json')) return 'json-formatter';
    if (name.endsWith('.txt') || name.endsWith('.md')) return 'text-editor';
    return 'converter';
  };
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const tool = pickToolByFile(files[0]);
    if (onToolChange) onToolChange(tool);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragActive) setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30">
      <div className="container-responsive space-y-2 md:space-y-3">
        {/* Hero Section - Responsive */}
        <div className="relative">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse gpu-accelerated"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse gpu-accelerated"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse gpu-accelerated"></div>
          </div>
          
          <div className="relative card-responsive">
            <div className="text-center space-y-3">
              
              <div className="space-y-2 md:space-y-3">
                <h1 className="heading-responsive-1 font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight md:max-w-4xl mx-auto text-balance">
                  Your Complete File & Media Toolkit — Fast. Private. Free.
                </h1>
              </div>
              
              {/* Quick Actions - Responsive Grid */}
              <div className="grid-responsive-sm pt-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleToolClick(action.action)}
                      className={`btn-primary group flex items-center gap-2 ${action.gradient} hover:shadow-xl px-3 py-2 text-sm`}
                    >
                      <Icon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span className="font-medium">{action.name}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>

              {/* Dropzone panel */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`mt-2 rounded-2xl border-2 border-dashed ${dragActive ? 'border-purple-400 bg-purple-50/50' : 'border-slate-200 bg-white/70'} p-3 md:p-4 text-slate-700 shadow-sm`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="touch-target rounded-2xl bg-gradient-to-r from-purple-500 to-teal-500 shadow-lg">
                    <Files className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-responsive-xl text-lg md:text-xl font-bold text-slate-900">Drop files or click to browse</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary bg-gradient-to-r from-purple-500 to-teal-500 px-3 py-2 text-sm"
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;