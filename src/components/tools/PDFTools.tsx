import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Scissors, Plus, Layers, RotateCw, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

interface PDFFile {
  id: string;
  name: string;
  file: File;
  pages: number;
}

export function PDFTools() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<'merge' | 'split' | 'extract'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPageCount = async (file: File) => {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    return doc.getPageCount();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        const count = await getPageCount(file);
        const pdfFile: PDFFile = {
          id: crypto.randomUUID(),
          name: file.name,
          file,
          pages: count,
        };
        setPdfs(prev => [...prev, pdfFile]);
      }
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const mergePDFs = async () => {
    if (pdfs.length < 2) {
      return;
    }

    const mergedPdf = await PDFDocument.create();

    for (const p of pdfs) {
      const buf = await p.file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((pg) => mergedPdf.addPage(pg));
    }

    const mergedBytes = await mergedPdf.save();
    downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), `merged-${Date.now()}.pdf`);
  };

  const splitPDF = async (pdf: PDFFile) => {
    const buf = await pdf.file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const total = doc.getPageCount();

    // Create individual files per page
    for (let i = 0; i < total; i++) {
      const out = await PDFDocument.create();
      const [copied] = await out.copyPages(doc, [i]);
      out.addPage(copied);
      const bytes = await out.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${pdf.name.replace(/\.pdf$/i, '')}-page-${i + 1}.pdf`);
    }
  };

  const extractPages = async (pdf: PDFFile, startPage: number, endPage: number) => {
    const buf = await pdf.file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const total = doc.getPageCount();

    const s = Math.max(1, Math.min(startPage, total));
    const e = Math.max(s, Math.min(endPage, total));

    const out = await PDFDocument.create();
    const indices = Array.from({ length: e - s + 1 }, (_, k) => k + (s - 1));
    const copied = await out.copyPages(doc, indices);
    copied.forEach((pg) => out.addPage(pg));
    const bytes = await out.save();
    downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${pdf.name.replace(/\.pdf$/i, '')}-pages-${s}-${e}.pdf`);
  };

  const rotatePDF = async (pdf: PDFFile, angle: number = 90) => {
    const buf = await pdf.file.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    doc.getPages().forEach((page) => page.setRotation(degrees(angle)));
    const bytes = await doc.save();
    downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${pdf.name.replace(/\.pdf$/i, '')}-rotated-${angle}.pdf`);
  };

  const movePDF = (id: string, direction: 'up' | 'down') => {
    setPdfs((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1);
      if (newIdx === idx) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  };

  const removePDF = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">PDF Tools</h2>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDFs</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Operation Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Operation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedOperation('merge')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOperation === 'merge'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Layers className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-slate-900">Merge PDFs</h4>
              <p className="text-sm text-slate-600">Combine multiple PDFs into one</p>
            </button>
            
            <button
              onClick={() => setSelectedOperation('split')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOperation === 'split'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Scissors className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-slate-900">Split PDF</h4>
              <p className="text-sm text-slate-600">Split PDF into individual pages</p>
            </button>
            
            <button
              onClick={() => setSelectedOperation('extract')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOperation === 'extract'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-slate-900">Extract Pages</h4>
              <p className="text-sm text-slate-600">Extract specific page ranges</p>
            </button>
          </div>
        </div>

        {/* PDF List */}
        {pdfs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Uploaded PDFs ({pdfs.length})
              </h3>
              
              {selectedOperation === 'merge' && (
                <button
                  onClick={mergePDFs}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Merge All PDFs</span>
                </button>
              )}
            </div>
            
            {pdfs.map((pdf, idx) => (
              <div key={pdf.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-red-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">{pdf.name}</h4>
                      <p className="text-sm text-slate-600">{pdf.pages} pages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => movePDF(pdf.id, 'up')}
                      disabled={idx === 0}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => movePDF(pdf.id, 'down')}
                      disabled={idx === pdfs.length - 1}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rotatePDF(pdf, 90)}
                      className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Rotate 90°</span>
                    </button>
                    
                    {selectedOperation === 'split' && (
                      <button
                        onClick={() => splitPDF(pdf)}
                        className="flex items-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Split</span>
                      </button>
                    )}
                    
                    {selectedOperation === 'extract' && (
                      <button
                        onClick={() => extractPages(pdf, 1, Math.min(5, pdf.pages))}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Extract 1-5</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => removePDF(pdf.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              PDF Tools
            </h3>
            <p className="text-slate-600 mb-4">
              Merge, split, and extract pages from PDF documents.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all"
            >
              Upload PDF Files
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}