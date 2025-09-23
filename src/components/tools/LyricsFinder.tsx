import React, { useState } from 'react';
import { Music, Search, Loader, ExternalLink } from 'lucide-react';

interface LyricsResult {
  lyrics: string;
  artist: string;
  title: string;
}

export function LyricsFinder() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState<LyricsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchLyrics = async () => {
    if (!artist.trim() || !title.trim()) {
      setError('Please enter both artist and song title.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const data = await response.json();

      if (response.ok && data.lyrics) {
        setResult({
          lyrics: data.lyrics,
          artist,
          title,
        });
      } else {
        setError('Lyrics not found. Try checking the spelling or try a different song.');
      }
    } catch (err) {
      setError('Failed to fetch lyrics. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLyrics();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lyrics Finder</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Search Form */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter artist name..."
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Song Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter song title..."
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={searchLyrics}
            disabled={loading || !artist.trim() || !title.trim()}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>{loading ? 'Searching...' : 'Find Lyrics'}</span>
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-slate-600 dark:text-slate-400">Searching for lyrics...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.title}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  by {result.artist}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {result.lyrics}
                </pre>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={() => navigator.clipboard.writeText(result.lyrics)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Copy Lyrics
                </button>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${result.artist} ${result.title} lyrics`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <span>More Sources</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Find Song Lyrics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Search for lyrics of your favorite songs instantly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Fast Search</h4>
                  <p className="text-slate-600 dark:text-slate-400">Get lyrics in seconds</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Free API</h4>
                  <p className="text-slate-600 dark:text-slate-400">No registration required</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Copy & Share</h4>
                  <p className="text-slate-600 dark:text-slate-400">Easy to copy and share</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}