import React, { createContext, useContext, useState, useCallback } from 'react';

interface EditorFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string | ArrayBuffer;
  lastModified: number;
}

interface EditorContextType {
  files: EditorFile[];
  activeFile: EditorFile | null;
  addFile: (file: File) => Promise<void>;
  setActiveFile: (file: EditorFile | null) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<EditorFile>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [activeFile, setActiveFile] = useState<EditorFile | null>(null);

  const addFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    
    return new Promise<void>((resolve) => {
      reader.onload = (e) => {
        const editorFile: EditorFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target?.result || '',
          lastModified: file.lastModified,
        };
        
        setFiles(prev => [...prev, editorFile]);
        setActiveFile(editorFile);
        resolve();
      };
      
      if (file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setActiveFile(prev => prev?.id === id ? null : prev);
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<EditorFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    setActiveFile(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <EditorContext.Provider value={{
      files,
      activeFile,
      addFile,
      setActiveFile,
      removeFile,
      updateFile,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}