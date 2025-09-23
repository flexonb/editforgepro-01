import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, Volume2 } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        const recording: Recording = {
          id: crypto.randomUUID(),
          name: `Recording ${recordings.length + 1}`,
          blob,
          url,
          duration: recordingTime,
          timestamp: new Date(),
        };

        setRecordings(prev => [...prev, recording]);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (audioRef.current) {
      audioRef.current.src = recording.url;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setCurrentRecording(recording);
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumePlayback = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter(r => r.id !== id);
    });

    if (currentRecording?.id === id) {
      setCurrentRecording(null);
      setIsPlaying(false);
    }
  };

  const downloadRecording = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.webm`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Voice Recorder</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Recording Controls */}
        <div className="text-center mb-8">
          <div className="mb-6">
            {isRecording ? (
              <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Mic className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform cursor-pointer">
                <Mic className="w-16 h-16 text-white" />
              </div>
            )}
            
            <div className="text-2xl font-mono text-slate-900 dark:text-white mb-4">
              {formatTime(recordingTime)}
            </div>
            
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
        </div>

        {/* Recordings List */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recordings ({recordings.length})
          </h3>
          
          {recordings.length > 0 ? (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {recording.name}
                      </h4>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-x-4">
                        <span>Duration: {formatTime(recording.duration)}</span>
                        <span>Recorded: {formatDate(recording.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {currentRecording?.id === recording.id && isPlaying ? (
                        <button
                          onClick={pausePlayback}
                          className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : currentRecording?.id === recording.id && !isPlaying ? (
                        <button
                          onClick={resumePlayback}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => playRecording(recording)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet. Start recording to create your first audio note!</p>
            </div>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setPlaybackTime(Math.floor(audioRef.current.currentTime));
          }
        }}
        className="hidden"
      />
    </div>
  );
}