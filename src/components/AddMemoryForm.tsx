import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { useMemories } from '../hooks/useMemories';
import { Memory } from '../types';
import { Camera, X } from 'lucide-react';

interface AddMemoryFormProps {
  position: { latitude: number; longitude: number };
  onClose: () => void;
}

const AddMemoryForm: React.FC<AddMemoryFormProps> = ({ position, onClose }) => {
  const { addMemory } = useMemories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newMemory: Memory = {
      id: nanoid(),
      title,
      description,
      latitude: position.latitude,
      longitude: position.longitude,
      date,
      imageUrl: imagePreview || '',
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    addMemory(newMemory);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button 
        type="button" 
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        <X size={20} />
      </button>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. vacation, beach, family"
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
          Photo
        </label>
        <div className="flex items-center justify-center border-2 border-dashed border-dark-700 py-4 rounded-md">
          {imagePreview ? (
            <div className="relative w-full px-4">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-48 mx-auto rounded-md" 
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 bg-dark-900 bg-opacity-70 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
              <Camera size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Upload photo</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-dark-700 rounded-md hover:bg-dark-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title}
          className="px-4 py-2 bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Memory'}
        </button>
      </div>
    </form>
  );
};

export default AddMemoryForm;