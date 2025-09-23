import React, { useRef, useState, useEffect } from 'react';
import { Upload, Music, AudioWaveform as Waveform, BarChart3, Activity } from 'lucide-react';

export function AudioVisualizer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerType, setVisualizerType] = useState<'bars' | 'wave' | 'circle'>('bars');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [animationId, setAnimationId] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      if (audioRef.current) {
        audioRef.current.src = url;
      }
    }
  };

  const setupAudioContext = () => {
    if (!audioRef.current || audioContext) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;

    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    setAudioContext(ctx);
    setAnalyser(analyserNode);
  };

  const drawBars = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#14B8A6');
    gradient.addColorStop(1, '#F59E0B');

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * height;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawWave = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8B5CF6';
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawCircle = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    const barCount = dataArray.length;
    const angleStep = (Math.PI * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255) * radius;
      const angle = i * angleStep;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      const hue = (i / barCount) * 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const animate = () => {
    if (!analyser || !canvasRef.current) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    switch (visualizerType) {
      case 'bars':
        drawBars(dataArray);
        break;
      case 'wave':
        drawWave(dataArray);
        break;
      case 'circle':
        drawCircle(dataArray);
        break;
    }

    const id = requestAnimationFrame(animate);
    setAnimationId(id);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationId) {
        cancelAnimationFrame(animationId);
        setAnimationId(null);
      }
    } else {
      if (!audioContext) {
        setupAudioContext();
      }
      audioRef.current.play();
      animate();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Waveform className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Audio Visualizer</h2>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Audio</span>
        </button>
      </div>

      <div className="flex-1 p-6">
        {audioFile ? (
          <div className="space-y-6">
            {/* Visualizer Type Selection */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setVisualizerType('bars')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  visualizerType === 'bars'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Bars</span>
              </button>
              
              <button
                onClick={() => setVisualizerType('wave')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  visualizerType === 'wave'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Wave</span>
              </button>
              
              <button
                onClick={() => setVisualizerType('circle')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  visualizerType === 'circle'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <div className="w-4 h-4 border-2 border-current rounded-full" />
                <span>Circle</span>
              </button>
            </div>

            {/* Visualizer Canvas */}
            <div className="bg-black rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-64 md:h-96"
              />
            </div>

            {/* Audio Controls */}
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {audioFile.name}
                </h3>
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  ) : (
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                <Waveform className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Audio Visualizer
                </h3>
                <p className="text-slate-600 mb-4">
                  Upload an audio file to see beautiful real-time visualizations.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all"
                >
                  Choose Audio File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          if (animationId) {
            cancelAnimationFrame(animationId);
            setAnimationId(null);
          }
        }}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}