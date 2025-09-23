import React from 'react';
import Dashboard from './tools/Dashboard';
import { ImageEditor } from './tools/ImageEditor';
import { AudioEditor } from './tools/AudioEditor';
import { VideoEditor } from './tools/VideoEditor';
import { TextEditor } from './tools/TextEditor';
import { CodeEditor } from './tools/CodeEditor';
import { PhotoGrid } from './tools/PhotoGrid';
import { FileConverter } from './tools/FileConverter';
import { QuoteGenerator } from './tools/QuoteGenerator';
import { WikiSearch } from './tools/WikiSearch';
import { LyricsFinder } from './tools/LyricsFinder';
import { ScriptRunner } from './tools/ScriptRunner';
import { VoiceRecorder } from './tools/VoiceRecorder';
import { Stickers } from './tools/Stickers';
import { Calculator } from './tools/Calculator';
import { QRGenerator } from './tools/QRGenerator';
import { ColorPicker } from './tools/ColorPicker';
import { HashGenerator } from './tools/HashGenerator';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { Base64Encoder } from './tools/Base64Encoder';
import { JSONFormatter } from './tools/JSONFormatter';
import { UnitConverter } from './tools/UnitConverter';
import { TimerStopwatch } from './tools/TimerStopwatch';
import { CalendarWidget } from './tools/CalendarWidget';
import { ImageCompressor } from './tools/ImageCompressor';
import { PDFTools } from './tools/PDFTools';
import { ScreenRecorder } from './tools/ScreenRecorder';
import { AudioVisualizer } from './tools/AudioVisualizer';
import { DatabaseManager } from './tools/DatabaseManager';
import { APITester } from './tools/APITester';

interface MainWorkspaceProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

export function MainWorkspace({ currentTool, onToolChange }: MainWorkspaceProps) {
  const renderTool = () => {
    switch (currentTool) {
      case 'dashboard':
        return <Dashboard onToolChange={onToolChange} />;
      case 'image-editor':
        return <ImageEditor />;
      case 'audio-editor':
        return <AudioEditor />;
      case 'video-editor':
        return <VideoEditor />;
      case 'text-editor':
        return <TextEditor />;
      case 'code-editor':
        return <CodeEditor />;
      case 'photo-grid':
        return <PhotoGrid />;
      case 'converter':
        return <FileConverter />;
      case 'quote-generator':
        return <QuoteGenerator />;
      case 'wiki-search':
        return <WikiSearch />;
      case 'lyrics-finder':
        return <LyricsFinder />;
      case 'script-runner':
        return <ScriptRunner />;
      case 'voice-recorder':
        return <VoiceRecorder />;
      case 'stickers':
        return <Stickers />;
      case 'calculator':
        return <Calculator />;
      case 'qr-generator':
        return <QRGenerator />;
      case 'color-picker':
        return <ColorPicker />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'base64-encoder':
        return <Base64Encoder />;
      case 'json-formatter':
        return <JSONFormatter />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'timer-stopwatch':
        return <TimerStopwatch />;
      case 'calendar-widget':
        return <CalendarWidget />;
      case 'image-compressor':
        return <ImageCompressor />;
      case 'pdf-tools':
        return <PDFTools />;
      case 'screen-recorder':
        return <ScreenRecorder />;
      case 'audio-visualizer':
        return <AudioVisualizer />;
      case 'database-manager':
        return <DatabaseManager />;
      case 'api-tester':
        return <APITester />;
      default:
        return <Dashboard onToolChange={onToolChange} />;
    }
  };

  return (
    <main className="main-responsive">
      <div className="h-full overflow-auto">
        {renderTool()}
      </div>
    </main>
  );
}