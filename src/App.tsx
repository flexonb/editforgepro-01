import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainWorkspace } from './components/MainWorkspace';
import { TopBar } from './components/TopBar';
import { EditorProvider } from './context/EditorContext';

function App() {
  const [currentTool, setCurrentTool] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'editors' | 'tools' | 'expert' | 'main'>('all');
  
  return (
    <EditorProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 transition-all duration-500 overflow-x-hidden">
        <TopBar 
          onSearch={setSearchQuery} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          selectedCategory={categoryFilter}
          onCategoryChange={(cat) => setCategoryFilter(cat as any)}
          onNavigateTool={(tool) => setCurrentTool(tool)}
          currentTool={currentTool}
          onBack={() => setCurrentTool('dashboard')}
        />
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
          <Sidebar 
            currentTool={currentTool} 
            onToolChange={setCurrentTool}
            searchQuery={searchQuery}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            categoryFilter={categoryFilter}
          />
          <MainWorkspace 
            currentTool={currentTool} 
            onToolChange={setCurrentTool}
          />
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;