import React from 'react';
import { Memory } from '../types';
import { format } from 'date-fns';
import { MapPin, Calendar, Tag, X } from 'lucide-react';

interface MemoryDetailProps {
  memory: Memory;
  onClose: () => void;
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({ memory, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="relative h-12 flex items-center justify-between px-4 border-b border-dark-800">
          <h2 className="font-semibold text-lg text-white">{memory.title}</h2>
          <button 
            className="text-dark-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)]">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 h-64 md:h-auto bg-dark-800">
              {memory.imageUrl ? (
                <img
                  src={memory.imageUrl}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-64 flex items-center justify-center">
                  <span className="text-dark-500">No Image</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="md:w-1/2 p-6">
              <div className="flex items-center text-dark-400 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>{format(new Date(memory.date), 'MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center text-dark-400 mb-6">
                <MapPin size={16} className="mr-2" />
                <span>
                  {memory.latitude.toFixed(4)}, {memory.longitude.toFixed(4)}
                </span>
              </div>
              
              {memory.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Description</h3>
                  <p className="text-white">{memory.description}</p>
                </div>
              )}
              
              {memory.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-dark-800 text-dark-300"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;