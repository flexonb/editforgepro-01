import React, { useState } from 'react';
import { Sticker, Search, Download, Heart, Smile } from 'lucide-react';

const emojiCategories = {
  smileys: {
    name: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐']
  },
  animals: {
    name: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']
  },
  food: {
    name: 'Food & Drink',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯']
  },
  activities: {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥁', '🪘', '🎹', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟', '🎯', '🎳', '🎮', '🎰', '🧩']
  },
  objects: {
    name: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖', '🪜', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🪓', '🪚', '🔩', '⚙', '🪤', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔', '🛡', '🚬', '⚰', '🪦', '⚱', '🏺', '🔮', '📿', '🧿', '💈', '⚗', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪣', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎀', '🎊', '🎉', '🎈', '🎄', '🎃', '🎆', '🧨', '✨', '🎇', '🎐', '🎑', '🧧', '🎎', '🎏', '🎋', '🎍', '📮', '📭', '📬', '📫', '📪', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂', '🖊', '🖋', '✒', '🖌', '🖍', '📝', '✏', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
  },
  symbols: {
    name: 'Symbols',
    emojis: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '✅', '🈯', '💹', '❇', '✳', '❎', '🌐', '💠', 'Ⓜ', '🌀', '💤', '🏧', '🚾', '♿', '🅿', '🛗', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  }
};

const stickerPacks = [
  {
    name: 'Cute Animals',
    stickers: ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐨', '🐸']
  },
  {
    name: 'Happy Faces',
    stickers: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂']
  },
  {
    name: 'Love & Hearts',
    stickers: ['❤️', '💕', '💖', '💗', '💝', '💞', '💓', '💘']
  },
  {
    name: 'Food Fun',
    stickers: ['🍕', '🍔', '🍟', '🌭', '🍩', '🍪', '🎂', '🍰']
  }
];

export function Stickers() {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const currentEmojis = emojiCategories[selectedCategory as keyof typeof emojiCategories]?.emojis || [];
  
  const filteredEmojis = searchTerm 
    ? currentEmojis.filter(emoji => 
        emoji.includes(searchTerm) || 
        emojiCategories[selectedCategory as keyof typeof emojiCategories].name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentEmojis;

  const toggleFavorite = (emoji: string) => {
    setFavorites(prev => 
      prev.includes(emoji) 
        ? prev.filter(e => e !== emoji)
        : [...prev, emoji]
    );
  };

  const toggleSelection = (emoji: string) => {
    setSelectedStickers(prev => 
      prev.includes(emoji)
        ? prev.filter(e => e !== emoji)
        : [...prev, emoji]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadStickerPack = () => {
    if (selectedStickers.length === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = Math.ceil(selectedStickers.length / 4) * 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    selectedStickers.forEach((sticker, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const x = col * 100 + 50;
      const y = row * 100 + 50;
      ctx.fillText(sticker, x, y);
    });

    const link = document.createElement('a');
    link.download = 'sticker-pack.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Sticker className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Stickers & Emojis</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedStickers.length > 0 && (
            <button
              onClick={downloadStickerPack}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export ({selectedStickers.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 p-4 border-r border-slate-200 dark:border-slate-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search emojis..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categories</h3>
            <div className="space-y-1">
              {Object.entries(emojiCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === key
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Favorites</h3>
              <div className="grid grid-cols-6 gap-1">
                {favorites.slice(0, 12).map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => copyToClipboard(emoji)}
                    className="w-8 h-8 text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sticker Packs */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sticker Packs</h3>
            <div className="space-y-2">
              {stickerPacks.map((pack, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {pack.name}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {pack.stickers.map((sticker, stickerIndex) => (
                      <button
                        key={stickerIndex}
                        onClick={() => copyToClipboard(sticker)}
                        className="w-6 h-6 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {emojiCategories[selectedCategory as keyof typeof emojiCategories]?.name || 'Emojis'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click to copy • Double-click to add to selection • Heart to favorite
            </p>
          </div>

          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-96 overflow-y-auto">
            {filteredEmojis.map((emoji, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => copyToClipboard(emoji)}
                  onDoubleClick={() => toggleSelection(emoji)}
                  className={`w-12 h-12 text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all transform hover:scale-110 ${
                    selectedStickers.includes(emoji) ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500' : ''
                  }`}
                >
                  {emoji}
                </button>
                
                <button
                  onClick={() => toggleFavorite(emoji)}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    favorites.includes(emoji) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Heart className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>

          {filteredEmojis.length === 0 && (
            <div className="text-center py-12">
              <Smile className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                No emojis found for "{searchTerm}"
              </p>
            </div>
          )}

          {/* Selected Stickers */}
          {selectedStickers.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Selected Stickers ({selectedStickers.length})
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedStickers.map((sticker, index) => (
                  <button
                    key={index}
                    onClick={() => toggleSelection(sticker)}
                    className="w-8 h-8 text-lg bg-white dark:bg-slate-700 rounded border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-colors"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(selectedStickers.join(''))}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                >
                  Copy All
                </button>
                <button
                  onClick={() => setSelectedStickers([])}
                  className="px-3 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}