import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Square, RotateCcw } from 'lucide-react';

export function TimerStopwatch() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const start = () => {
    if (mode === 'timer' && time === 0) {
      const totalSeconds = timerInput.hours * 3600 + timerInput.minutes * 60 + timerInput.seconds;
      if (totalSeconds === 0) return;
      setTime(totalSeconds);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'timer') {
            if (prevTime <= 1) {
              setIsRunning(false);
              // Timer finished - could add notification here
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Timer & Stopwatch</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMode('timer')}
            className={`px-3 py-1 rounded ${mode === 'timer' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            Timer
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`px-3 py-1 rounded ${mode === 'stopwatch' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto text-center space-y-8">
          {/* Time Display */}
          <div className="bg-slate-900 rounded-2xl p-8">
            <div className="text-4xl md:text-6xl font-mono text-white">
              {formatTime(time)}
            </div>
          </div>

          {/* Timer Input */}
          {mode === 'timer' && !isRunning && time === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Set Timer</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={timerInput.hours}
                    onChange={(e) => setTimerInput(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInput.minutes}
                    onChange={(e) => setTimerInput(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInput.seconds}
                    onChange={(e) => setTimerInput(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <button
                onClick={start}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={pause}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={reset}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Status */}
          {mode === 'timer' && time === 0 && !isRunning && (
            <div className="text-center">
              <div className="text-2xl">⏰</div>
              <p className="text-slate-600 mt-2">Timer finished!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}