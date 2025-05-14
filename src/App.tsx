import React, { useState } from 'react';
import GlobeView from './components/GlobeView';
import Sidebar from './components/Sidebar';
import MemoryGallery from './components/MemoryGallery';
import MemoryDetail from './components/MemoryDetail';
import { Memory } from './types';
import { GlobeIcon, Image } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<'globe' | 'gallery'>('globe');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showMemoryDetail, setShowMemoryDetail] = useState(false);

  const handleCloseMemoryDetail = () => {
    setShowMemoryDetail(false);
    setSelectedMemory(null);
  };

  const handleMemorySelect = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowMemoryDetail(true);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-dark-900 border-b border-dark-800 z-10">
        <h1 className="text-xl font-bold text-primary-400">Memory Globe</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('globe')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeView === 'globe' ? 'bg-primary-900 text-primary-400' : 'hover:bg-dark-800'
            }`}
          >
            <GlobeIcon size={18} />
            <span className="hidden sm:inline">Globe</span>
          </button>
          <button
            onClick={() => setActiveView('gallery')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeView === 'gallery' ? 'bg-primary-900 text-primary-400' : 'hover:bg-dark-800'
            }`}
          >
            <Image size={18} />
            <span className="hidden sm:inline">Gallery</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'globe' ? (
          <>
            <div className="flex-1 relative">
              <GlobeView onMemorySelect={handleMemorySelect} />
            </div>
            <Sidebar />
          </>
        ) : (
          <MemoryGallery onMemorySelect={handleMemorySelect} />
        )}
      </div>

      {/* Memory Detail Modal */}
      {showMemoryDetail && selectedMemory && (
        <MemoryDetail memory={selectedMemory} onClose={handleCloseMemoryDetail} />
      )}
    </div>
  );
}

export default App;