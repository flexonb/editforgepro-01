import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, FileImage, FileText, Music } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { transcodeAudio } from '../../lib/ffmpeg';

interface ConversionJob {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalFile: File;
  convertedData?: string;
}

export function FileConverter() {
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedConversions = {
    'image/jpeg': ['image/png', 'image/webp', 'application/pdf'],
    'image/png': ['image/jpeg', 'image/webp', 'application/pdf'],
    'image/webp': ['image/jpeg', 'image/png', 'application/pdf'],
    'audio/mpeg': ['audio/wav'],
    'audio/wav': ['audio/mpeg'],
    'video/mp4': ['audio/webm'], // export audio-only using MediaRecorder (webm/opus)
  } as const;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      if (supportedConversions[file.type as keyof typeof supportedConversions]) {
        const job: ConversionJob = {
          id: crypto.randomUUID(),
          fileName: file.name,
          fromFormat: file.type,
          toFormat: supportedConversions[file.type as keyof typeof supportedConversions][0],
          status: 'pending',
          originalFile: file,
        };
        setJobs(prev => [...prev, job]);
      }
    });
  };

  const updateJobFormat = (jobId: string, newFormat: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, toFormat: newFormat } : job
    ));
  };

  const convertFile = async (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'processing' } : job
    ));

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    try {
      let convertedData = '';

      if (job.fromFormat.startsWith('image/') && job.toFormat === 'application/pdf') {
        // Convert image to real PDF using pdf-lib
        convertedData = await convertImageToPDF(job.originalFile);
      } else if (job.fromFormat.startsWith('image/') && job.toFormat.startsWith('image/')) {
        // Convert image to image
        convertedData = await convertImageToImage(job.originalFile, job.toFormat);
      } else if (job.fromFormat.startsWith('video/') && job.toFormat.startsWith('audio/')) {
        // Extract audio from video using MediaRecorder (audio/webm)
        convertedData = await extractAudioFromVideo(job.originalFile);
      } else if (job.fromFormat.startsWith('audio/') && (job.toFormat === 'audio/mpeg' || job.toFormat === 'audio/wav')) {
        // Transcode audio to MP3/WAV using ffmpeg.wasm
        const ext = job.toFormat === 'audio/mpeg' ? 'mp3' as const : 'wav' as const;
        const outBlob = await transcodeAudio(job.originalFile, ext);
        convertedData = URL.createObjectURL(outBlob);
      }

      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, status: 'completed', convertedData } 
          : j
      ));
    } catch (error) {
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'error' } : j
      ));
    }
  };

  const convertImageToPDF = async (file: File): Promise<string> => {
    // Load image as bytes
    const arrayBuf = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.create();

    // Try embed as PNG first; if fails, try JPEG
    let embeddedImage;
    try {
      embeddedImage = await pdfDoc.embedPng(arrayBuf);
    } catch {
      embeddedImage = await pdfDoc.embedJpg(arrayBuf as ArrayBuffer);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const convertImageToImage = async (file: File, targetFormat: string): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          const mimeType = targetFormat === 'image/jpeg' ? 'image/jpeg' : 
                          targetFormat === 'image/png' ? 'image/png' : 'image/webp';
          resolve(canvas.toDataURL(mimeType));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const extractAudioFromVideo = async (file: File): Promise<string> => {
    // Use a hidden video element, capture its audio track via captureStream, and record to webm/opus
    return new Promise(async (resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.controls = false;
        video.muted = true; // prevent audible playback; captureStream still carries audio in many browsers
        video.playsInline = true;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          video.remove();
        };

        const onLoaded = async () => {
          let vStream: MediaStream | null = null;
          try {
            // @ts-ignore
            vStream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream?.();
          } catch {}
          if (!vStream) {
            cleanup();
            reject(new Error('captureStream not supported'));
            return;
          }

          const audioTracks = vStream.getAudioTracks();
          if (!audioTracks.length) {
            cleanup();
            reject(new Error('No audio track in video'));
            return;
          }

          const audioStream = new MediaStream([audioTracks[0]]);
          const mimeOptions = ['audio/webm;codecs=opus', 'audio/webm'];
          let mimeType = '';
          for (const m of mimeOptions) {
            if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
          }

          const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
            const outUrl = URL.createObjectURL(blob);
            cleanup();
            resolve(outUrl);
          };

          recorder.start(100);
          await video.play();
          const tick = () => {
            if (video.ended || video.currentTime >= (video.duration || Infinity)) {
              recorder.stop();
            } else {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
        };

        video.addEventListener('loadedmetadata', onLoaded, { once: true });
        document.body.appendChild(video); // required for some browsers to process
      } catch (err) {
        reject(err);
      }
    });
  };

  const downloadFile = (job: ConversionJob) => {
    if (!job.convertedData) return;

    const link = document.createElement('a');
    link.href = job.convertedData;
    
    // Determine extension from target format
    let extension = job.toFormat.split('/')[1] || 'bin';
    if (job.toFormat === 'audio/mpeg') extension = 'mp3';
    if (job.toFormat === 'application/pdf') extension = 'pdf';
    if (job.toFormat === 'audio/webm') extension = 'webm';

    const baseName = job.fileName.split('.').slice(0, -1).join('.') || job.fileName;
    link.download = `${baseName}.${extension}`;
    link.click();
  };

  const getFormatIcon = (format: string) => {
    if (format.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (format.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">File Converter</h2>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Add Files</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(job.fromFormat)}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {job.fileName}
                    </span>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    job.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                    job.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {job.status}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">From:</span>
                    <span className="text-sm font-medium">
                      {job.fromFormat.split('/')[1]?.toUpperCase()}
                    </span>
                  </div>
                  
                  <span className="text-slate-400">→</span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">To:</span>
                    <select
                      value={job.toFormat}
                      onChange={(e) => updateJobFormat(job.id, e.target.value)}
                      disabled={job.status === 'processing'}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {supportedConversions[job.fromFormat as keyof typeof supportedConversions]?.map(format => (
                        <option key={format} value={format}>
                          {format.split('/')[1]?.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="flex items-center space-x-2">
                    {job.status === 'pending' && (
                      <button
                        onClick={() => convertFile(job.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      >
                        Convert
                      </button>
                    )}
                    
                    {job.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Converting...</span>
                      </div>
                    )}
                    
                    {job.status === 'completed' && (
                      <button
                        onClick={() => downloadFile(job)}
                        className="flex items-center space-x-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Universal File Converter
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Convert between image formats, extract audio from video, and more.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <div>
                    <div className="font-medium mb-2">Image Formats:</div>
                    <div>JPG ↔ PNG ↔ WEBP</div>
                    <div>Images → PDF</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Audio/Video:</div>
                    <div>MP4 → WEBM (Audio only)</div>
                    <div>MP3 ↔ WAV (Transcode)</div>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all"
                >
                  Select Files to Convert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}