import React, { useState } from 'react';
import { Search, ExternalLink, Loader, BookOpen, Globe } from 'lucide-react';

interface WikiResult {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
}

export function WikiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWikipedia = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      // Wikipedia API - search for pages
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (response.ok && data.extract) {
        const result: WikiResult = {
          title: data.title,
          extract: data.extract,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          thumbnail: data.thumbnail?.source,
        };
        setResults([result]);
      } else {
        // If direct search fails, try opensearch API
        const opensearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
        
        const opensearchResponse = await fetch(opensearchUrl);
        const opensearchData = await opensearchResponse.json();
        
        if (opensearchData[1] && opensearchData[1].length > 0) {
          const searchResults: WikiResult[] = opensearchData[1].map((title: string, index: number) => ({
            title,
            extract: opensearchData[2][index] || 'No description available.',
            url: opensearchData[3][index],
          }));
          setResults(searchResults);
        } else {
          setError('No results found. Try a different search term.');
        }
      }
    } catch (err) {
      setError('Failed to search Wikipedia. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWikipedia();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Wikipedia Search</h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search Wikipedia..."
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={searchWikipedia}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-md transition-colors text-sm"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-slate-600 dark:text-slate-400">Searching Wikipedia...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start space-x-4">
                    {result.thumbnail && (
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        {result.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {result.extract}
                      </p>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <span>Read More</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Search Wikipedia
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Enter a topic to search the world's largest encyclopedia.
              </p>
            </div>
          )}

          {!query && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Wikipedia at Your Fingertips
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Access millions of articles from Wikipedia directly in EditForge Pro.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Instant Search</h4>
                  <p className="text-slate-600 dark:text-slate-400">Get summaries and full articles instantly</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">No API Key</h4>
                  <p className="text-slate-600 dark:text-slate-400">Direct access to Wikipedia's public API</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Rich Content</h4>
                  <p className="text-slate-600 dark:text-slate-400">Images, summaries, and links included</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}