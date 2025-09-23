import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Square, Download, Video, Scissors, Type, Volume2, SkipBack, SkipForward, RotateCw, Layers, Filter, Maximize, Crop, Zap, Settings } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { transcodeWebMToMP4, transcodeAudioWebMToMP3 } from '../../lib/ffmpeg';

export function VideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeFile, addFile } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Enhanced video effects
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);
  
  // Text overlay
  const [textOverlay, setTextOverlay] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textSize, setTextSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textStroke, setTextStroke] = useState('#000000');
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);
  
  // Crop settings
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [showCropTool, setShowCropTool] = useState(false);
  
  // Zoom and pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Timeline markers
  const [markers, setMarkers] = useState<number[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await addFile(file);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekVideo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    seekVideo(newTime);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    const newTime = Math.min(duration, videoRef.current.currentTime + 10);
    seekVideo(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const applyFilters = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.style.filter = `
      brightness(${brightness}%) 
      contrast(${contrast}%) 
      saturate(${saturation}%) 
      hue-rotate(${hue}deg) 
      blur(${blur}px) 
      sepia(${sepia}%) 
      grayscale(${grayscale}%) 
      invert(${invert}%)
    `;
    video.style.transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
  };

  const addMarker = () => {
    if (!videoRef.current) return;
    setMarkers(prev => [...prev, videoRef.current!.currentTime].sort((a, b) => a - b));
  };

  const removeMarker = (time: number) => {
    setMarkers(prev => prev.filter(m => m !== time));
  };

  const setTrimPoints = () => {
    if (!videoRef.current) return;
    setTrimStart(videoRef.current.currentTime);
    setTrimEnd(Math.min(duration, videoRef.current.currentTime + 30));
  };

  const resetEffects = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Apply crop if enabled
    const cropX = (cropSettings.x / 100) * canvas.width;
    const cropY = (cropSettings.y / 100) * canvas.height;
    const cropW = (cropSettings.width / 100) * canvas.width;
    const cropH = (cropSettings.height / 100) * canvas.height;

    ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    // Apply text overlay
    if (textOverlay) {
      ctx.fillStyle = textColor;
      ctx.strokeStyle = textStroke;
      ctx.lineWidth = textStrokeWidth;
      ctx.font = `${textSize}px Arial`;
      ctx.textAlign = 'center';
      
      const x = (textPosition.x / 100) * canvas.width;
      const y = (textPosition.y / 100) * canvas.height;
      
      ctx.strokeText(textOverlay, x, y);
      ctx.fillText(textOverlay, x, y);
    }

    const link = document.createElement('a');
    link.download = `frame-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Helper: record processed video (WEBM) and return as Blob
  const recordProcessedWebM = async (): Promise<Blob | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const srcX = Math.round((cropSettings.x / 100) * vw);
    const srcY = Math.round((cropSettings.y / 100) * vh);
    const srcW = Math.round((cropSettings.width / 100) * vw);
    const srcH = Math.round((cropSettings.height / 100) * vh);

    const finalW = srcW > 0 ? srcW : vw;
    const finalH = srcH > 0 ? srcH : vh;

    canvas.width = finalW;
    canvas.height = finalH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;

    const canvasStream = canvas.captureStream(30);
    const vidStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream?.();
    let mixedStream: MediaStream;
    if (vidStream && vidStream.getAudioTracks().length > 0) {
      mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        vidStream.getAudioTracks()[0],
      ]);
    } else {
      mixedStream = canvasStream;
    }

    const mimeOptions = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let mimeType = '';
    for (const m of mimeOptions) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }

    const recorder = new MediaRecorder(
      mixedStream,
      mimeType ? { mimeType, videoBitsPerSecond: 6_000_000, audioBitsPerSecond: 192_000 } : undefined
    );
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    const prevMuted = video.muted;
    const prevPaused = video.paused;
    const prevRate = video.playbackRate;

    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onMeta = () => { video.removeEventListener('loadedmetadata', onMeta); resolve(); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
      });
    }

    video.muted = true;
    video.playbackRate = playbackRate || 1;

    const startAt = trimStart || 0;
    if (Math.abs(video.currentTime - startAt) > 0.01) {
      await new Promise<void>((resolve) => {
        const onSeek = () => { video.removeEventListener('seeked', onSeek); resolve(); };
        video.addEventListener('seeked', onSeek, { once: true });
        video.currentTime = startAt;
      });
    }

    recorder.start(100);
    await video.play().catch(() => {});

    const drawFrame = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, finalW, finalH);
      ctx.filter = filterStr;

      const sX = srcW > 0 ? srcX : 0;
      const sY = srcH > 0 ? srcY : 0;
      const sW = srcW > 0 ? srcW : vw;
      const sH = srcH > 0 ? srcH : vh;

      ctx.drawImage(video, sX, sY, sW, sH, 0, 0, finalW, finalH);

      if (textOverlay) {
        ctx.save();
        ctx.filter = 'none';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = textStroke;
        ctx.lineWidth = textStrokeWidth;
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        const tx = (textPosition.x / 100) * finalW;
        const ty = (textPosition.y / 100) * finalH;
        if (textStrokeWidth > 0) ctx.strokeText(textOverlay, tx, ty);
        ctx.fillText(textOverlay, tx, ty);
        ctx.restore();
      }

      const endTime = trimEnd > 0 ? trimEnd : duration;
      if (video.currentTime >= endTime || video.ended) {
        try { recorder.stop(); } catch {}
        video.pause();
        return;
      }
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);

    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.onerror = () => resolve(); });

    video.muted = prevMuted;
    video.playbackRate = prevRate;
    if (!prevPaused) { video.play().catch(() => {}); }

    return new Blob(chunks, { type: mimeType || 'video/webm' });
  };

  // Helper: record audio-only (WEBM/Opus) and return as Blob
  const recordAudioWebM = async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video) return null;
    const vStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream?.();
    if (!vStream || vStream.getAudioTracks().length === 0) return null;

    const audioStream = new MediaStream([vStream.getAudioTracks()[0]]);
    const mimeOptions = ['audio/webm;codecs=opus','audio/webm'];
    let mimeType = '';
    for (const m of mimeOptions) { if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; } }

    const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType, audioBitsPerSecond: 192_000 } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    const wasPaused = video.paused;
    const prevMuted = video.muted;

    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onMeta = () => { video.removeEventListener('loadedmetadata', onMeta); resolve(); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
      });
    }

    const startAt = trimStart || 0;
    if (Math.abs(video.currentTime - startAt) > 0.01) {
      await new Promise<void>((resolve) => {
        const onSeek = () => { video.removeEventListener('seeked', onSeek); resolve(); };
        video.addEventListener('seeked', onSeek, { once: true });
        video.currentTime = startAt;
      });
    }

    video.muted = true;
    recorder.start(100);
    await video.play().catch(() => {});

    const endTime = trimEnd > 0 ? trimEnd : duration;
    const tick = () => {
      if (video.currentTime >= endTime || video.ended) {
        try { recorder.stop(); } catch {}
        video.pause();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });

    video.muted = prevMuted;
    if (!wasPaused) video.play().catch(() => {});

    return new Blob(chunks, { type: mimeType || 'audio/webm' });
  };

  // New: Export processed video as MP4 using ffmpeg.wasm
  const exportProcessedVideoMP4 = async () => {
    const webm = await recordProcessedWebM();
    if (!webm) return;
    const mp4 = await transcodeWebMToMP4(webm);
    const url = URL.createObjectURL(mp4);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-${activeFile?.name?.replace(/\.[^/.]+$/, '') || 'video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // New: Export audio-only as MP3 using ffmpeg.wasm
  const exportAudioMP3 = async () => {
    const webm = await recordAudioWebM();
    if (!webm) return;
    const mp3 = await transcodeAudioWebMToMP3(webm);
    const url = URL.createObjectURL(mp3);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-${activeFile?.name?.replace(/\.[^/.]+$/, '') || 'track'}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // New: processed video export using MediaRecorder (applies filters, crop, text, trim)
  const exportProcessedVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Compute crop source rect in video coordinates
    const srcX = Math.round((cropSettings.x / 100) * vw);
    const srcY = Math.round((cropSettings.y / 100) * vh);
    const srcW = Math.round((cropSettings.width / 100) * vw);
    const srcH = Math.round((cropSettings.height / 100) * vh);

    // If width/height are 0 (no crop), default to full video
    const finalW = srcW > 0 ? srcW : vw;
    const finalH = srcH > 0 ? srcH : vh;

    canvas.width = finalW;
    canvas.height = finalH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;

    // Prepare streams
    const canvasStream = canvas.captureStream(30); // ensure FPS for recording
    // Try to grab audio from the video element
    const vidStream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream?.();
    let mixedStream: MediaStream;

    if (vidStream && vidStream.getAudioTracks().length > 0) {
      mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        vidStream.getAudioTracks()[0],
      ]);
    } else {
      mixedStream = canvasStream; // video-only if no audio
    }

    const mimeOptions = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let mimeType = '';
    for (const m of mimeOptions) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }

    const recorder = new MediaRecorder(
      mixedStream,
      mimeType ? { mimeType, videoBitsPerSecond: 6_000_000, audioBitsPerSecond: 192_000 } : undefined
    );
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const playRate = playbackRate || 1;

    // Save current state to restore later
    const prevMuted = video.muted;
    const prevPaused = video.paused;
    const prevRate = video.playbackRate;

    // Ensure metadata is loaded before seeking
    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onMeta = () => { video.removeEventListener('loadedmetadata', onMeta); resolve(); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
      });
    }

    video.muted = true; // prevent echo during export
    video.playbackRate = playRate;

    // Seek to start point and wait
    const startAt = trimStart || 0;
    if (Math.abs(video.currentTime - startAt) > 0.01) {
      await new Promise<void>((resolve) => {
        const onSeek = () => { video.removeEventListener('seeked', onSeek); resolve(); };
        video.addEventListener('seeked', onSeek, { once: true });
        video.currentTime = startAt;
      });
    }

    // Start recording, then play and draw
    recorder.start(100);

    await video.play().catch(() => {});

    const drawFrame = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, finalW, finalH);
      ctx.filter = filterStr;

      const sX = srcW > 0 ? srcX : 0;
      const sY = srcH > 0 ? srcY : 0;
      const sW = srcW > 0 ? srcW : vw;
      const sH = srcH > 0 ? srcH : vh;

      ctx.drawImage(video, sX, sY, sW, sH, 0, 0, finalW, finalH);

      if (textOverlay) {
        ctx.save();
        ctx.filter = 'none'; // text should not be filtered
        ctx.fillStyle = textColor;
        ctx.strokeStyle = textStroke;
        ctx.lineWidth = textStrokeWidth;
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        const tx = (textPosition.x / 100) * finalW;
        const ty = (textPosition.y / 100) * finalH;
        if (textStrokeWidth > 0) ctx.strokeText(textOverlay, tx, ty);
        ctx.fillText(textOverlay, tx, ty);
        ctx.restore();
      }

      const endTime = trimEnd > 0 ? trimEnd : duration;
      if (video.currentTime >= endTime || video.ended) {
        try { recorder.stop(); } catch {}
        video.pause();
        return;
      }
      requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () => resolve();
    });

    // Restore video element state
    video.muted = prevMuted;
    video.playbackRate = prevRate;
    if (!prevPaused) {
      video.play().catch(() => {});
    }

    const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-${activeFile?.name?.replace(/\.[^/.]+$/, '') || 'video'}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // New: audio-only export using MediaRecorder on audio track
  const exportAudioOnly = async () => {
    const video = videoRef.current;
    if (!video) return;

    const vStream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream?.();
    if (!vStream || vStream.getAudioTracks().length === 0) return;

    const audioStream = new MediaStream([vStream.getAudioTracks()[0]]);

    const mimeOptions = [
      'audio/webm;codecs=opus',
      'audio/webm',
    ];
    let mimeType = '';
    for (const m of mimeOptions) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }

    const recorder = new MediaRecorder(
      audioStream,
      mimeType ? { mimeType, audioBitsPerSecond: 192_000 } : undefined
    );
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    const wasPaused = video.paused;
    const prevMuted = video.muted;

    // Ensure metadata before seeking
    if (video.readyState < 1) {
      await new Promise<void>((resolve) => {
        const onMeta = () => { video.removeEventListener('loadedmetadata', onMeta); resolve(); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
      });
    }

    // Start from trimStart and wait for seek
    const startAt = trimStart || 0;
    if (Math.abs(video.currentTime - startAt) > 0.01) {
      await new Promise<void>((resolve) => {
        const onSeek = () => { video.removeEventListener('seeked', onSeek); resolve(); };
        video.addEventListener('seeked', onSeek, { once: true });
        video.currentTime = startAt;
      });
    }

    video.muted = true; // avoid echo

    recorder.start(100);
    await video.play().catch(() => {});

    const endTime = trimEnd > 0 ? trimEnd : duration;
    const tick = () => {
      if (video.currentTime >= endTime || video.ended) {
        try { recorder.stop(); } catch {}
        video.pause();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });

    // Restore
    video.muted = prevMuted;
    if (!wasPaused) video.play().catch(() => {});

    const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-${activeFile?.name?.replace(/\.[^/.]+$/, '') || 'track'}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportVideo = () => {
    if (!activeFile) return;
    
    // Create a new video element with the same source for export
    const link = document.createElement('a');
    link.href = activeFile.data as string;
    link.download = `edited-${activeFile.name}`;
    link.click();
  };

  const extractAudio = () => {
    if (!activeFile) return;
    
    // Create a new audio element with the same source
    const audio = new Audio(activeFile.data as string);
    const link = document.createElement('a');
    link.href = activeFile.data as string;
    link.download = `audio-${activeFile.name.split('.')[0]}.mp3`;
    link.click();
  };

  useEffect(() => {
    if (activeFile && activeFile.type.startsWith('video/') && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.src = activeFile.data as string;
      videoElement.load();
      
      // Ensure video is properly loaded and displayed
      videoElement.onloadeddata = () => {
        console.log('Video loaded successfully');
      };
      
      videoElement.onerror = (e) => {
        console.error('Video loading error:', e);
      };
    }
  }, [activeFile]);

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation, hue, blur, sepia, grayscale, invert, zoom, pan]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasVideoLoaded = activeFile && activeFile.type.startsWith('video/');

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/90 via-purple-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-teal-500/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              Professional Video Editor
            </h2>
            <p className="text-sm text-slate-600">Advanced video editing with real-time effects</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Video</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Enhanced Controls Sidebar */}
        <div className="w-80 p-6 border-r border-white/20 space-y-6 overflow-y-auto bg-gradient-to-b from-white/50 to-white/30">
          {/* Playback Controls */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Play className="w-4 h-4 mr-2 text-purple-600" />
              Playback Controls
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Volume: {Math.round(volume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Speed: {playbackRate}x</label>
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/80 border border-white/30 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Video Effects */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2 text-purple-600" />
              Visual Effects
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Brightness', value: brightness, setter: setBrightness, min: 0, max: 200 },
                { label: 'Contrast', value: contrast, setter: setContrast, min: 0, max: 200 },
                { label: 'Saturation', value: saturation, setter: setSaturation, min: 0, max: 200 },
                { label: 'Hue', value: hue, setter: setHue, min: 0, max: 360, unit: '°' },
                { label: 'Blur', value: blur, setter: setBlur, min: 0, max: 10, unit: 'px' },
                { label: 'Sepia', value: sepia, setter: setSepia, min: 0, max: 100 },
                { label: 'Grayscale', value: grayscale, setter: setGrayscale, min: 0, max: 100 },
                { label: 'Invert', value: invert, setter: setInvert, min: 0, max: 100 }
              ].map((effect) => (
                <div key={effect.label}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {effect.label}: {effect.value}{effect.unit || '%'}
                  </label>
                  <input 
                    type="range" 
                    min={effect.min} 
                    max={effect.max} 
                    value={effect.value} 
                    onChange={(e) => effect.setter(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" 
                  />
                </div>
              ))}
              <button
                onClick={resetEffects}
                className="w-full py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Reset All Effects
              </button>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Maximize className="w-4 h-4 mr-2 text-purple-600" />
              Transform
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Zoom: {zoom.toFixed(2)}x</label>
                <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pan X: {pan.x}px</label>
                <input type="range" min="-200" max="200" value={pan.x} onChange={(e) => setPan(prev => ({ ...prev, x: Number(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pan Y: {pan.y}px</label>
                <input type="range" min="-200" max="200" value={pan.y} onChange={(e) => setPan(prev => ({ ...prev, y: Number(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
              </div>
            </div>
          </div>

          {/* Enhanced Text Overlay */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Type className="w-4 h-4 mr-2 text-purple-600" />
              Text Overlay
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-3 py-2 bg-white/80 border border-white/30 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Size: {textSize}px</label>
                  <input type="range" min="12" max="72" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stroke: {textStrokeWidth}px</label>
                  <input type="range" min="0" max="10" value={textStrokeWidth} onChange={(e) => setTextStrokeWidth(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Text Color</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg border border-white/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stroke Color</label>
                  <input type="color" value={textStroke} onChange={(e) => setTextStroke(e.target.value)} className="w-full h-10 rounded-lg border border-white/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">X Position</label>
                  <input type="range" min="0" max="100" value={textPosition.x} onChange={(e) => setTextPosition(prev => ({ ...prev, x: Number(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Y Position</label>
                  <input type="range" min="0" max="100" value={textPosition.y} onChange={(e) => setTextPosition(prev => ({ ...prev, y: Number(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider" />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Markers */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/30">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Timeline Markers</h3>
            <div className="space-y-2">
              <button
                onClick={addMarker}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Add Marker
              </button>
              <div className="max-h-20 overflow-y-auto">
                {markers.map((marker, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white/60 p-2 rounded mb-1">
                    <span className="font-medium">{formatTime(marker)}</span>
                    <button
                      onClick={() => removeMarker(marker)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Section */}
          {hasVideoLoaded && (
            <div className="bg-white/70 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Download className="w-4 h-4 mr-2 text-purple-600" />
                Export
              </h3>
              <div className="space-y-2">
                <button
                  onClick={exportFrame}
                  className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Export Frame (PNG)
                </button>
                <button
                  onClick={exportProcessedVideo}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Export Video (WEBM)
                </button>
                <button
                  onClick={exportProcessedVideoMP4}
                  className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Export Video (MP4)
                </button>
                <button
                  onClick={exportAudioOnly}
                  className="w-full py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Export Audio (WEBM)
                </button>
                <button
                  onClick={exportAudioMP3}
                  className="w-full py-2 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Export Audio (MP3)
                </button>
                <p className="text-[10px] text-slate-500 mt-2">Note: Exports are processed in-browser using MediaRecorder.</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Video Player */}
        <div className="flex-1 p-6">
          {hasVideoLoaded ? (
            <div className="space-y-6">
              {/* Video Display with Enhanced Styling */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
                <video
                  ref={videoRef}
                  className="w-full h-64 md:h-96 object-contain"
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => {
                    const vid = videoRef.current;
                    if (vid) {
                      setDuration(vid.duration);
                      setTrimEnd(vid.duration);
                    }
                  }}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />
                
                {/* Text Overlay Preview */}
                {textOverlay && (
                  <div
                    className="absolute pointer-events-none font-bold"
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: textColor,
                      fontSize: `${textSize}px`,
                      textShadow: `${textStrokeWidth}px ${textStrokeWidth}px 0px ${textStroke}, -${textStrokeWidth}px -${textStrokeWidth}px 0px ${textStroke}, ${textStrokeWidth}px -${textStrokeWidth}px 0px ${textStroke}, -${textStrokeWidth}px ${textStrokeWidth}px 0px ${textStroke}`
                    }}
                  >
                    {textOverlay}
                  </div>
                )}
              </div>

              {/* Enhanced Video Controls */}
              <div className="bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-white/30 shadow-lg">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={skipBackward}
                    className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                  
                  <button
                    onClick={skipForward}
                    className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={stopVideo}
                    className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </div>

                {/* Enhanced Progress Bar with Markers */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-300 rounded-full h-4 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-teal-500 h-4 rounded-full transition-all shadow-lg"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      {/* Trim indicators */}
                      <div
                        className="absolute top-0 h-4 bg-yellow-400 opacity-60 rounded-full"
                        style={{ 
                          left: `${(trimStart / duration) * 100}%`,
                          width: `${((trimEnd - trimStart) / duration) * 100}%`
                        }}
                      />
                      {/* Markers */}
                      {markers.map((marker, index) => (
                        <div
                          key={index}
                          className="absolute top-0 w-1 h-4 bg-red-500 shadow-lg"
                          style={{ left: `${(marker / duration) * 100}%` }}
                        />
                      ))}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => seekVideo(Number(e.target.value))}
                      className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Professional Video Editor
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    Upload a video to start editing with advanced effects, text overlays, timeline markers, and professional controls.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl hover:from-purple-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl font-medium"
                  >
                    Choose Video File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}