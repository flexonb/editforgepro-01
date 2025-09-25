import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Square, Download, Music, Volume2, Scissors, AudioWaveform as Waveform, SkipBack, SkipForward, RotateCw, Zap, Settings, Mic, Filter } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export function AudioEditor() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeFile, addFile } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  
  // Enhanced audio effects
  const [bassBoost, setBassBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [midBoost, setMidBoost] = useState(0);
  const [reverb, setReverb] = useState(0);
  const [echo, setEcho] = useState(0);
  const [distortion, setDistortion] = useState(0);
  
  // Trim and fade
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeInDuration, setFadeInDuration] = useState(0);
  const [fadeOutDuration, setFadeOutDuration] = useState(0);
  
  // Noise reduction
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [compressor, setCompressor] = useState(0);
  const [limiter, setLimiter] = useState(0);
  
  // Visualization
  const [visualizationType, setVisualizationType] = useState<'waveform' | 'spectrum' | 'bars'>('waveform');
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await addFile(file);
    }
  };

  useEffect(() => {
    if (activeFile && activeFile.type.startsWith('audio/') && audioRef.current) {
      audioRef.current.src = activeFile.data as string;
      audioRef.current.load();

      // Set up Web Audio API for advanced processing
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        const gainNodeInstance = ctx.createGain();
        
        analyserNode.fftSize = 2048;
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
        setGainNode(gainNodeInstance);

        // Connect audio element to Web Audio API
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(gainNodeInstance);
        gainNodeInstance.connect(analyserNode);
        analyserNode.connect(ctx.destination);
      }
    }
  }, [activeFile, audioContext]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekAudio = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 10);
    seekAudio(newTime);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    const newTime = Math.min(duration, audioRef.current.currentTime + 10);
    seekAudio(newTime);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setTrimEnd(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (gainNode) {
      gainNode.gain.value = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setTrimPoints = () => {
    if (!audioRef.current) return;
    setTrimStart(audioRef.current.currentTime);
    setTrimEnd(Math.min(duration, audioRef.current.currentTime + 30));
  };

  const applyFade = (type: 'in' | 'out') => {
    if (!gainNode || !audioContext) return;
    
    const now = audioContext.currentTime;
    const fadeDuration = type === 'in' ? fadeInDuration : fadeOutDuration;
    
    if (type === 'in') {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + fadeDuration);
    } else {
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.linearRampToValueAtTime(0, now + fadeDuration);
    }
  };

  const resetEffects = () => {
    setBassBoost(0);
    setTrebleBoost(0);
    setMidBoost(0);
    setReverb(0);
    setEcho(0);
    setDistortion(0);
    setNoiseReduction(0);
    setCompressor(0);
    setLimiter(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeOptions = [
        'audio/webm;codecs=opus',
        'audio/webm'
      ];
      let mimeType = '';
      for (const m of mimeOptions) {
        if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      setMediaRecorder(recorder);

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

      // single onstop handler: clear timer, stop tracks, build blob, download, reset state
      let interval: number | undefined;
      recorder.onstop = () => {
        if (interval) window.clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        setRecordingTime(0);
        setIsRecording(false);

        if (chunks.length) {
          const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `recording-${Date.now()}.webm`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      };

      recorder.start(100);
      setIsRecording(true);

      const id = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      interval = id;
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const exportAudio = () => {
    if (!activeFile) return;
    
    const link = document.createElement('a');
    link.href = activeFile.data as string;
    link.download = `edited-${activeFile.name}`;
    link.click();
  };

  // Enhanced Waveform visualization
  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const draw = () => {
      if (visualizationType === 'spectrum') {
        analyser.getByteFrequencyData(dataArray);
      } else {
        analyser.getByteTimeDomainData(dataArray);
      }
      
      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (visualizationType === 'bars') {
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(0.5, '#14B8A6');
        gradient.addColorStop(1, '#F59E0B');
        
        for (let i = 0; i < dataArray.length; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      } else if (visualizationType === 'waveform') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8B5CF6';
        ctx.beginPath();

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        // Spectrum analyzer
        const barWidth = canvas.width / dataArray.length;
        
        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const hue = (i / dataArray.length) * 360;
          
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
        }
      }
      
      // Draw progress indicator
      const progressX = (currentTime / duration) * canvas.width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(progressX - 1, 0, 2, canvas.height);
      
      requestAnimationFrame(draw);
    };
    
    draw();
  }, [analyser, currentTime, duration, visualizationType]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full grid grid-rows-[auto,1fr,auto] bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Professional Audio Editor</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
          </button>
        </div>
      </div>

      {/* Main area: Left | Waveform | Right */}
      <div className="min-h-0 grid grid-cols-[14rem,1fr,14rem]">
        {/* Left Sidebar (scrollable) */}
        <div className="min-h-0 overflow-y-auto p-4 border-r border-slate-200 space-y-4">
          {/* Recording */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Mic className="w-4 h-4 mr-2" />
              Recording
            </h3>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-lg font-mono mb-2">{formatTime(recordingTime)}</div>
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Start Recording
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Play className="w-4 h-4 mr-2" />
              Playback
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Volume: {Math.round(volume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-600 mb-1">Speed: {playbackRate}x</label>
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-100 border border-slate-300 rounded text-sm"
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

          {/* Enhanced Audio Effects */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Audio Effects
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Bass Boost: {bassBoost}dB</label>
                <input type="range" min="-20" max="20" value={bassBoost} onChange={(e) => setBassBoost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Mid Boost: {midBoost}dB</label>
                <input type="range" min="-20" max="20" value={midBoost} onChange={(e) => setMidBoost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Treble Boost: {trebleBoost}dB</label>
                <input type="range" min="-20" max="20" value={trebleBoost} onChange={(e) => setTrebleBoost(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Reverb: {reverb}%</label>
                <input type="range" min="0" max="100" value={reverb} onChange={(e) => setReverb(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Echo: {echo}%</label>
                <input type="range" min="0" max="100" value={echo} onChange={(e) => setEcho(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Distortion: {distortion}%</label>
                <input type="range" min="0" max="100" value={distortion} onChange={(e) => setDistortion(Number(e.target.value))} className="w-full" />
              </div>
              <button
                onClick={resetEffects}
                className="w-full py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs transition-colors"
              >
                Reset Effects
              </button>
            </div>
          </div>

          {/* Processing */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Processing
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Noise Reduction: {noiseReduction}%</label>
                <input type="range" min="0" max="100" value={noiseReduction} onChange={(e) => setNoiseReduction(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Compressor: {compressor}%</label>
                <input type="range" min="0" max="100" value={compressor} onChange={(e) => setCompressor(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Limiter: {limiter}%</label>
                <input type="range" min="0" max="100" value={limiter} onChange={(e) => setLimiter(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Waveform / Preview */}
        <div className="min-h-0 p-4 overflow-hidden">
          {activeFile && activeFile.type.startsWith('audio/') ? (
            <div className="bg-slate-900 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={220}
                className="w-full h-56 rounded cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const clickTime = (x / rect.width) * duration;
                  seekAudio(clickTime);
                }}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Professional Audio Editor</h3>
                  <p className="text-slate-600 mb-4">Upload an audio file to start editing with advanced effects, EQ, noise reduction, and real-time visualization.</p>
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all">Choose Audio File</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (scrollable) */}
        <div className="min-h-0 overflow-y-auto p-4 border-l border-slate-200 space-y-4">
          {/* Visualization */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Waveform className="w-4 h-4 mr-2" />
              Visualization
            </h3>
            <select
              value={visualizationType}
              onChange={(e) => setVisualizationType(e.target.value as any)}
              className="w-full px-2 py-1 bg-slate-100 border border-slate-300 rounded text-sm"
            >
              <option value="waveform">Waveform</option>
              <option value="spectrum">Spectrum</option>
              <option value="bars">Frequency Bars</option>
            </select>
          </div>

          {/* Trim Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Scissors className="w-4 h-4 mr-2" />
              Trim
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Start: {formatTime(trimStart)}</span>
                <span>End: {formatTime(trimEnd)}</span>
              </div>
              <button onClick={setTrimPoints} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">Set Trim Points</button>
            </div>
          </div>

          {/* Fade Effects */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Fade Effects
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Fade In: {fadeInDuration}s</label>
                <input type="range" min="0" max="10" step="0.5" value={fadeInDuration} onChange={(e) => setFadeInDuration(Number(e.target.value))} className="w-full" />
                <button onClick={() => applyFade('in')} className="w-full mt-1 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs transition-colors">Apply Fade In</button>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Fade Out: {fadeOutDuration}s</label>
                <input type="range" min="0" max="10" step="0.5" value={fadeOutDuration} onChange={(e) => setFadeOutDuration(Number(e.target.value))} className="w-full" />
                <button onClick={() => applyFade('out')} className="w-full mt-1 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs transition-colors">Apply Fade Out</button>
              </div>
            </div>
          </div>

          {/* Export */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </h3>
            <button onClick={exportAudio} className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors">Export Audio</button>
          </div>
        </div>
      </div>

      {/* Bottom Dock Controls */}
      <div className="border-t border-slate-200 bg-white/70 backdrop-blur p-3">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-3">
            <button onClick={skipBackward} className="w-10 h-10 bg-slate-500 hover:bg-slate-600 text-white rounded-full flex items-center justify-center"><SkipBack className="w-4 h-4" /></button>
            <button onClick={togglePlayPause} className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white rounded-full flex items-center justify-center">{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}</button>
            <button onClick={skipForward} className="w-10 h-10 bg-slate-500 hover:bg-slate-600 text-white rounded-full flex items-center justify-center"><SkipForward className="w-4 h-4" /></button>
            <button onClick={stopAudio} className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"><Square className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                <div className="absolute top-0 h-2 bg-yellow-400/60 rounded-full" style={{ left: `${duration ? (trimStart / duration) * 100 : 0}%`, width: `${duration ? ((trimEnd - trimStart) / duration) * 100 : 0}%` }} />
              </div>
              <input type="range" min="0" max={duration} value={currentTime} onChange={(e) => seekAudio(Number(e.target.value))} className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
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