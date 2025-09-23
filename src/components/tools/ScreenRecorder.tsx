import React, { useState, useRef } from 'react';
import { Camera, Square, Download, Play, Pause, Monitor } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [includeAudio, setIncludeAudio] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: includeAudio
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const recording: Recording = {
          id: crypto.randomUUID(),
          name: `Screen Recording ${recordings.length + 1}`,
          blob,
          url,
          duration: recordingTime,
          timestamp: new Date(),
        };

        setRecordings(prev => [...prev, recording]);
        setRecordingTime(0);
      };

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting screen recording:', error);
      alert('Could not start screen recording. Please check permissions.');
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
    if (videoRef.current) {
      videoRef.current.src = recording.url;
      setSelectedRecording(recording);
    }
  };

  const downloadRecording = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.webm`;
    link.click();
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter(r => r.id !== id);
    });

    if (selectedRecording?.id === id) {
      setSelectedRecording(null);
    }
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
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Screen Recorder</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Recording Controls */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-6">
                {isRecording ? (
                  <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Monitor className="w-16 h-16 text-white" />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform cursor-pointer">
                    <Monitor className="w-16 h-16 text-white" />
                  </div>
                )}
                
                <div className="text-2xl font-mono text-slate-900 mb-4">
                  {formatTime(recordingTime)}
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      disabled={isRecording}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">Include system audio</span>
                  </label>
                  
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
                      <Camera className="w-5 h-5" />
                      <span>Start Recording</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recordings List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Recordings ({recordings.length})
              </h3>
              
              {recordings.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="bg-white/50 rounded-lg p-3 border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 text-sm">
                            {recording.name}
                          </h4>
                          <div className="text-xs text-slate-600 space-x-4">
                            <span>Duration: {formatTime(recording.duration)}</span>
                            <span>Recorded: {formatDate(recording.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => playRecording(recording)}
                            className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => downloadRecording(recording)}
                            className="p-1 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recordings yet. Start recording to capture your screen!</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="bg-black rounded-lg overflow-hidden">
            {selectedRecording ? (
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23fff'%3EScreen Recording%3C/text%3E%3C/svg%3E"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a recording to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Browser Support Notice */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> Screen recording requires a modern browser with Screen Capture API support. 
            Chrome, Firefox, and Edge are recommended for best compatibility.
          </p>
        </div>
      </div>
    </div>
  );
}