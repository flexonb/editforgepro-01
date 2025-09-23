import React, { useState } from 'react';
import { Quote, RefreshCw, Download, Copy, Heart } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  category: string;
}

const quotes: QuoteData[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "innovation"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "life"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "inspiration"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "action"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "mindfulness"
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown",
    category: "failure"
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs",
    category: "passion"
  }
];

export function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(quotes[0]);
  const [favoriteQuotes, setFavoriteQuotes] = useState<QuoteData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(quotes.map(q => q.category)))];

  const generateRandomQuote = () => {
    const filteredQuotes = selectedCategory === 'all' 
      ? quotes 
      : quotes.filter(q => q.category === selectedCategory);
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    setCurrentQuote(filteredQuotes[randomIndex]);
  };

  const copyToClipboard = () => {
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(text);
  };

  const addToFavorites = () => {
    if (!favoriteQuotes.find(q => q.text === currentQuote.text)) {
      setFavoriteQuotes(prev => [...prev, currentQuote]);
    }
  };

  const removeFromFavorites = (quote: QuoteData) => {
    setFavoriteQuotes(prev => prev.filter(q => q.text !== quote.text));
  };

  const downloadAsImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#14B8A6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quote text
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    
    // Word wrap
    const words = currentQuote.text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > canvas.width - 100 && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw lines
    const lineHeight = 40;
    const startY = (canvas.height - lines.length * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    // Author
    ctx.font = '24px Arial';
    ctx.fillText(`- ${currentQuote.author}`, canvas.width / 2, startY + lines.length * lineHeight + 60);

    // Download
    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Quote className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quote Generator</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <button
            onClick={generateRandomQuote}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Quote</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Quote Display */}
          <div className="lg:col-span-2">
            <div className="h-full bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl p-8 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
              <div className="relative z-10 text-center space-y-6">
                <Quote className="w-12 h-12 mx-auto opacity-50" />
                <blockquote className="text-2xl md:text-3xl font-light leading-relaxed">
                  "{currentQuote.text}"
                </blockquote>
                <cite className="text-lg font-medium opacity-90">
                  — {currentQuote.author}
                </cite>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {currentQuote.category}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              
              <button
                onClick={addToFavorites}
                className="flex items-center space-x-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Favorite</span>
              </button>
              
              <button
                onClick={downloadAsImage}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Favorites Panel */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Favorites ({favoriteQuotes.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {favoriteQuotes.length > 0 ? (
                favoriteQuotes.map((quote, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-600 group"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                      "{quote.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        — {quote.author}
                      </span>
                      <button
                        onClick={() => removeFromFavorites(quote)}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-all"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No favorites yet</p>
                  <p className="text-xs">Add quotes you love!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}