import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Memory } from '../types';

interface MemoriesContextType {
  memories: Memory[];
  addMemory: (memory: Memory) => void;
  updateMemory: (memory: Memory) => void;
  deleteMemory: (id: string) => void;
}

const MemoriesContext = createContext<MemoriesContextType | undefined>(undefined);

export const MemoriesProvider = ({ children }: { children: ReactNode }) => {
  const [memories, setMemories] = useState<Memory[]>([]);

  // Load memories from localStorage on mount
  useEffect(() => {
    const savedMemories = localStorage.getItem('travelMemories');
    if (savedMemories) {
      try {
        setMemories(JSON.parse(savedMemories));
      } catch (error) {
        console.error('Failed to parse saved memories:', error);
      }
    }
  }, []);

  // Save memories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('travelMemories', JSON.stringify(memories));
  }, [memories]);

  const addMemory = (memory: Memory) => {
    setMemories(prevMemories => [...prevMemories, memory]);
  };

  const updateMemory = (updatedMemory: Memory) => {
    setMemories(prevMemories => 
      prevMemories.map(memory => 
        memory.id === updatedMemory.id ? updatedMemory : memory
      )
    );
  };

  const deleteMemory = (id: string) => {
    setMemories(prevMemories => 
      prevMemories.filter(memory => memory.id !== id)
    );
  };

  return (
    <MemoriesContext.Provider value={{ memories, addMemory, updateMemory, deleteMemory }}>
      {children}
    </MemoriesContext.Provider>
  );
};

export const useMemories = () => {
  const context = useContext(MemoriesContext);
  if (context === undefined) {
    throw new Error('useMemories must be used within a MemoriesProvider');
  }
  return context;
};