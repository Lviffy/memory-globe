import React, { useState } from 'react';
import { useMemories } from '../hooks/useMemories';
import { format } from 'date-fns';
import { Tag, MapPin, Search } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { memories } = useMemories();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'tags'>('recent');

  // Get recent memories
  const recentMemories = [...memories]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get all unique tags
  const allTags = memories.reduce<string[]>((tags, memory) => {
    memory.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []);

  // Filter memories by search term
  const filteredMemories = memories.filter(memory => 
    memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-80 bg-dark-900 border-l border-dark-800 overflow-y-auto">
      {/* Search */}
      <div className="p-4 border-b border-dark-800">
        <div className="relative">
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

      {/* Tab Navigation */}
      <div className="flex border-b border-dark-800">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'recent' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-dark-400'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'tags' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-dark-400'
          }`}
          onClick={() => setActiveTab('tags')}
        >
          Tags
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-4">
        {searchTerm ? (
          // Search Results
          <div>
            <h3 className="text-sm font-medium text-dark-400 mb-3">Search Results</h3>
            {filteredMemories.length > 0 ? (
              <div className="space-y-3">
                {filteredMemories.map(memory => (
                  <div key={memory.id} className="p-3 bg-dark-800 rounded-md">
                    <h4 className="font-medium text-white">{memory.title}</h4>
                    <div className="flex items-center text-sm text-dark-400 mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{memory.latitude.toFixed(2)}, {memory.longitude.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm">No memories found.</p>
            )}
          </div>
        ) : activeTab === 'recent' ? (
          // Recent Memories
          <div>
            <h3 className="text-sm font-medium text-dark-400 mb-3">Recent Memories</h3>
            {recentMemories.length > 0 ? (
              <div className="space-y-3">
                {recentMemories.map(memory => (
                  <div key={memory.id} className="p-3 bg-dark-800 rounded-md">
                    <h4 className="font-medium text-white">{memory.title}</h4>
                    <div className="flex items-center text-sm text-dark-400 mt-1">
                      <span className="mr-2">{format(new Date(memory.date), 'MMM d, yyyy')}</span>
                      {memory.tags.length > 0 && (
                        <div className="flex items-center">
                          <Tag size={14} className="mr-1" />
                          <span>{memory.tags[0]}</span>
                          {memory.tags.length > 1 && <span>+{memory.tags.length - 1}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm">No memories yet. Click on the globe to add your first memory!</p>
            )}
          </div>
        ) : (
          // Tags
          <div>
            <h3 className="text-sm font-medium text-dark-400 mb-3">Tags</h3>
            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <div 
                    key={tag} 
                    className="px-3 py-1 bg-dark-800 rounded-full text-sm cursor-pointer hover:bg-primary-900 hover:text-primary-400 transition-colors"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm">No tags yet. Add tags to your memories to organize them.</p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-auto p-4 border-t border-dark-800">
        <div className="flex justify-between text-sm">
          <span className="text-dark-400">Total Memories</span>
          <span className="font-medium">{memories.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-dark-400">Total Tags</span>
          <span className="font-medium">{allTags.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;