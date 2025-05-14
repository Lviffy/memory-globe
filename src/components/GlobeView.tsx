import React, { useEffect, useRef, useState } from 'react';
import { Memory } from '../types';
import { useMemories } from '../hooks/useMemories';
import AddMemoryForm from './AddMemoryForm';
// Import OpenGlobus types
import type { Globe as OGGlobe, Vector, Planet } from '@openglobus/og';

interface GlobeViewProps {
  onMemorySelect: (memory: Memory) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ onMemorySelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<OGGlobe | null>(null);
  const markerLayerRef = useRef<Vector | null>(null);
  const { memories } = useMemories();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Import OpenGlobus dynamically to avoid SSR issues
    const initializeGlobe = async () => {
      try {
        // Import OpenGlobus dynamically
        const { Globe, XYZ, GlobusRgbTerrain, Vector, control, events, LonLat } = await import('@openglobus/og');
        
        if (containerRef.current && !globeRef.current) {
          // Create the OpenGlobus instance
          globeRef.current = new Globe({
            target: containerRef.current,
            name: "Memory Globe",
            terrain: new GlobusRgbTerrain(),
            layers: [
              new XYZ("OpenStreetMap", {
                isBaseLayer: true,
                url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                visibility: true,
                attribution: 'Data © OpenStreetMap contributors, ODbL'
              }),
              // Adding a satellite imagery layer for more realistic view
              new XYZ("Satellite", {
                isBaseLayer: true,
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                visibility: false,
                attribution: 'Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
              })
            ],
            atmosphereEnabled: true,
            // Add enhanced controls
            controls: [
              new control.MouseNavigation({
                panKey: events?.KEY_ALT || 18,  // Alt key
                zoomKey: events?.KEY_SHIFT || 16  // Shift key
              }),
              new control.KeyboardNavigation(),
              new control.TouchNavigation(),
              new control.ScaleControl(),
              new control.EarthCoordinates(),
              new control.CompassButton(),
              new control.ZoomControl(),
              new control.LayerSwitcher()
            ]
          });

          // Create a vector layer for the memory markers
          markerLayerRef.current = new Vector("Memories", {
            pickingEnabled: true,
            clampToGround: true,
            zIndex: 10 // Keep above other layers
          });
          globeRef.current.planet.addLayer(markerLayerRef.current);
          
          // Add click handler to the vector layer
          markerLayerRef.current.events.on("lclick", (e: any) => {
            if (e.pickingObject && e.pickingObject.properties) {
              const memoryId = e.pickingObject.properties.memoryId;
              const memory = memories.find(m => m.id === memoryId);
              if (memory) {
                onMemorySelect(memory);
                
                // Fly to the memory location
                if (globeRef.current && globeRef.current.planet) {
                  flyToLocation(globeRef.current.planet, memory.longitude, memory.latitude);
                }
              }
            }
          });

          // Set the initial view to a nice Earth perspective
          setTimeout(() => {
            if (globeRef.current && globeRef.current.planet) {
              // Start with a nice view of Earth
              globeRef.current.planet.camera.set(new LonLat(0, 20), 20000000);
              globeRef.current.planet.camera.rotateGlobe(new LonLat(0, 20));
            }
          }, 100);
          
          // Set up click handler on the planet
          globeRef.current.planet.events.on("lclick", handleGlobeClick);
          
          // Update markers with existing memories
          updateMarkers();
        }
      } catch (error) {
        console.error("Failed to initialize OpenGlobus:", error);
      }
    };

    initializeGlobe();

    return () => {
      if (globeRef.current) {
        // Clean up OpenGlobus instance
        if (globeRef.current.planet) {
          globeRef.current.planet.events.off("lclick", handleGlobeClick);
        }
        // Destroy the globe to prevent memory leaks
        globeRef.current.destroy();
        globeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [memories]);

  const flyToLocation = async (planet: Planet, lon: number, lat: number) => {
    try {
      const { LonLat } = await import('@openglobus/og');
      const lonlat = new LonLat(lon, lat);
      
      // Fly to the location with animation
      planet.camera.flyTo(lonlat, {
        altitude: 1000000, // Altitude in meters
        duration: 1.5,     // Animation duration in seconds
        finishCallback: () => {
          // Optional callback after animation completes
        }
      });
    } catch (error) {
      console.error("Failed to fly to location:", error);
    }
  };

  const updateMarkers = async () => {
    if (!globeRef.current || !markerLayerRef.current) return;
    
    try {
      // Import OpenGlobus components dynamically
      const { Entity, LonLat } = await import('@openglobus/og');
      
      // Clear existing markers
      markerLayerRef.current.clear();

      // Add markers for each memory
      memories.forEach((memory) => {
        // Create entities for each memory
        const entity = new Entity({
          name: memory.title,
          lonlat: new LonLat(memory.longitude, memory.latitude),
          billboard: {
            src: createMarkerImage(memory.title.charAt(0)),
            width: 32,
            height: 32,
            offset: [0, 0],
            scale: 1.0,
            rotation: 0
          },
          label: {
            text: memory.title,
            fontSize: 12,
            color: "white",
            outline: true,
            outlineColor: "black",
            outlineWidth: 2,
            offset: [0, 32] // Position the label below the marker
          }
        });

        // Store the memory data with the entity for identification
        entity.properties = {
          memoryId: memory.id,
          memory: memory
        };

        // Add the entity to the layer
        markerLayerRef.current?.add(entity);
      });

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

  const handleGlobeClick = (e: any) => {
    if (!globeRef.current) return;
    
    // Check if we clicked on an entity
    if (e.pickingObject) {
      // If we clicked on an entity that represents a memory, 
      // the memory selection will be handled by the entity's click event
      return;
    }
    
    // If we clicked on the terrain
    if (e.pickingObject === null && e.terrain) {
      // Get the geographical coordinates of the click
      const coords = e.terrain.lonlat;
      setSelectedPosition({
        latitude: coords.lat,
        longitude: coords.lon
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
      <div 
        ref={containerRef} 
        className="w-full h-full bg-black"
      ></div>
      
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