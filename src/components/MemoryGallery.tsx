import React, { useState } from 'react';
import { useMemories } from '../hooks/useMemories';
import { Memory } from '../types';
import { format } from 'date-fns';
import { Search, MapPin, Tag, Calendar } from 'lucide-react';

interface MemoryGalleryProps {
  onMemorySelect: (memory: Memory) => void;
}

const MemoryGallery: React.FC<MemoryGalleryProps> = ({ onMemorySelect }) => {
  const { memories } = useMemories();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = memories.reduce<string[]>((tags, memory) => {
    memory.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []);

  // Filter memories
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchTerm === '' || 
      memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTag = activeTag === null || memory.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Filters */}
      <div className="flex justify-between items-center p-4 bg-dark-900 border-b border-dark-800">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-dark-400" />
          </div>
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 rounded-md border border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 py-3 bg-dark-900 border-b border-dark-800 overflow-x-auto">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-1.5 rounded-full text-sm ${
              activeTag === null
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            } transition-colors`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeTag === tag
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
              } transition-colors`}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="flex-1 p-4 overflow-y-auto bg-dark-950">
        {filteredMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMemories.map(memory => (
              <div
                key={memory.id}
                className="bg-dark-900 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-102 hover:shadow-xl cursor-pointer"
                onClick={() => onMemorySelect(memory)}
              >
                <div className="h-48 overflow-hidden bg-dark-800">
                  {memory.imageUrl ? (
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-800">
                      <span className="text-dark-500">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-lg text-white mb-1">{memory.title}</h3>
                  
                  <div className="flex items-center text-sm text-dark-400 mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{format(new Date(memory.date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-dark-400 mb-3">
                    <MapPin size={14} className="mr-1" />
                    <span>{memory.latitude.toFixed(2)}, {memory.longitude.toFixed(2)}</span>
                  </div>

                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-dark-800 text-dark-300"
                        >
                          <Tag size={10} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                      {memory.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-dark-800 text-dark-300">
                          +{memory.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-dark-400">
            <p className="text-lg mb-2">No memories found</p>
            <p className="text-sm">Try adjusting your search or adding new memories</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGallery;