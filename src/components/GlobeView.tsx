import React, { useEffect, useRef, useState } from 'react';
import { Memory } from '../types';
import { useMemories } from '../hooks/useMemories';
import AddMemoryForm from './AddMemoryForm';

interface GlobeViewProps {
  onMemorySelect: (memory: Memory) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ onMemorySelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wwd = useRef<any>(null);
  const { memories } = useMemories();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Import WorldWind dynamically to avoid SSR issues
    const initializeGlobe = async () => {
      try {
        // @ts-ignore - WorldWind types are not available
        const WorldWind = await import('worldwindjs');
        
        if (canvasRef.current && !wwd.current) {
          // Create the WorldWindow
          wwd.current = new WorldWind.WorldWindow(canvasRef.current);

          // Add imagery layers
          wwd.current.addLayer(new WorldWind.BMNGOneImageLayer());
          wwd.current.addLayer(new WorldWind.BMNGLandsatLayer());
          wwd.current.addLayer(new WorldWind.AtmosphereLayer());
          wwd.current.addLayer(new WorldWind.StarFieldLayer());

          // Create a layer to hold our markers
          const markersLayer = new WorldWind.RenderableLayer("Markers");
          wwd.current.addLayer(markersLayer);

          // Initial position - view the whole Earth
          wwd.current.navigator.range = WorldWind.WorldWindow.EARTH_RADIUS * 1.5;

          // Add the click handler
          wwd.current.addEventListener("click", handleGlobeClick);
          
          // Add markers for existing memories
          updateMarkers();
        }
      } catch (error) {
        console.error("Failed to initialize WorldWind:", error);
      }
    };

    initializeGlobe();

    return () => {
      if (wwd.current) {
        // Remove event listeners to avoid memory leaks
        wwd.current.removeEventListener("click", handleGlobeClick);
      }
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [memories]);

  const updateMarkers = async () => {
    if (!wwd.current) return;
    
    try {
      // @ts-ignore - WorldWind types are not available
      const WorldWind = await import('worldwindjs');
      
      // Clear existing markers
      const markersLayer = wwd.current.layers.find((layer: any) => layer.displayName === "Markers");
      if (markersLayer) {
        markersLayer.removeAllRenderables();
      }

      // Add markers for each memory
      memories.forEach((memory) => {
        // Create placemarks for each memory
        const placemark = new WorldWind.Placemark(
          new WorldWind.Position(memory.latitude, memory.longitude, 0),
          true,
          null
        );

        // Define the placemark attributes
        placemark.attributes = new WorldWind.PlacemarkAttributes();
        placemark.attributes.imageSource = createMarkerImage(memory.title.charAt(0));
        placemark.attributes.imageScale = 0.5;
        placemark.attributes.imageOffset = new WorldWind.Offset(
          WorldWind.OFFSET_FRACTION, 0.5,
          WorldWind.OFFSET_FRACTION, 0.5
        );
        
        // Highlight attributes
        placemark.highlightAttributes = new WorldWind.PlacemarkAttributes(placemark.attributes);
        placemark.highlightAttributes.imageScale = 0.7;

        // Add user data for identification
        placemark.userProperties = { memoryId: memory.id };

        // Add the placemark to the layer
        markersLayer.addRenderable(placemark);

        // Add click handler for the placemark
        wwd.current.addEventListener("click", (event: any) => {
          const pickList = wwd.current.pick(wwd.current.canvasCoordinates(event.clientX, event.clientY));
          if (pickList.objects.length > 0) {
            for (let i = 0; i < pickList.objects.length; i++) {
              const pickedObject = pickList.objects[i].userObject;
              if (pickedObject && 
                  pickedObject.userProperties && 
                  pickedObject.userProperties.memoryId === memory.id) {
                onMemorySelect(memory);
              }
            }
          }
        });
      });

      // Redraw the globe
      wwd.current.redraw();
    } catch (error) {
      console.error("Failed to update markers:", error);
    }
  };

  const createMarkerImage = (letter: string): string => {
    // Create a canvas to draw the marker
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw a circular background
      ctx.beginPath();
      ctx.arc(32, 32, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9'; // Primary color
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7'; // Darker primary
      ctx.fill();
      
      // Draw the letter
      ctx.shadowBlur = 0;
      ctx.font = 'bold 24px Inter';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter.toUpperCase(), 32, 32);
    }
    
    return canvas.toDataURL();
  };

  const handleGlobeClick = (event: any) => {
    if (!wwd.current) return;
    
    // Get the position of the click
    const x = event.clientX;
    const y = event.clientY;
    
    // Convert the screen coordinates to a geographic position
    const pickList = wwd.current.pick(wwd.current.canvasCoordinates(x, y));
    
    // Check if we clicked on the globe
    if (pickList.terrain) {
      const position = pickList.terrain.position;
      setSelectedPosition({
        latitude: position.latitude,
        longitude: position.longitude
      });
      setShowAddForm(true);
    }
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedPosition(null);
  };

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full bg-black"
      />
      
      {showAddForm && selectedPosition && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Memory</h2>
            <AddMemoryForm 
              position={selectedPosition}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobeView;