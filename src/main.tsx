import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { MemoriesProvider } from './hooks/useMemories';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoriesProvider>
      <App />
    </MemoriesProvider>
  </StrictMode>
);