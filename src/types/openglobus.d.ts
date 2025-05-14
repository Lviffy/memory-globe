// Type definitions for OpenGlobus
declare module '@openglobus/og' {
  // Common types
  export type Lonlat = {
    lon: number;
    lat: number;
  };

  export type EventsHandler = {
    on(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): void;
    fire(eventName: string, data?: any): void;
  };

  // Camera options
  export interface FlyToOptions {
    altitude?: number;
    duration?: number;
    finishCallback?: () => void;
    startCallback?: () => void;
  }

  // Core classes
  export class Globe {
    constructor(options: any);
    planet: Planet;
    renderer: Renderer;
    sun: Sun;
    destroy(): void;
    attachTo(target: HTMLElement | string): void;
    detach(): void;
  }

  export class Camera {
    set(lonlat: LonLat, altitude: number): void;
    setPosition(lonlat: LonLat): void;
    flyTo(lonlat: LonLat, options?: FlyToOptions): void;
    rotateGlobe(lonlat: LonLat): void;
    getHeight(): number;
    getPosition(): LonLat;
  }

  export class Planet {
    addLayer(layer: Layer): void;
    removeLayer(layer: Layer): void;
    getLayers(): Layer[];
    getLayerById(id: string): Layer | null;
    addControl(control: Control): void;
    removeControl(control: Control): void;
    getControls(): Control[];
    getViewExtent(): Extent;
    viewExtent(extent: Extent): void;
    getCartesianFromMouseTerrain(): Vec3 | null;
    events: EventsHandler;
    renderer: Renderer;
    camera: Camera;
  }

  export class Renderer {
    events: EventsHandler;
    div: HTMLElement;
    controls: Record<string, Control>;
    addNode(node: any): void;
    removeNode(node: any): void;
    resize(): void;
  }

  // Layers
  export class Layer {
    constructor(name: string, options?: any);
    isBaseLayer: boolean;
    visibility: boolean;
    getName(): string;
    setVisibility(visibility: boolean): void;
    events: EventsHandler;
  }

  export class XYZ extends Layer {
    constructor(name: string, options?: any);
  }

  export class Vector extends Layer {
    constructor(name: string, options?: any);
    add(entity: Entity): void;
    addEntities(entities: Entity[]): void;
    remove(entity: Entity): void;
    removeAll(): void;
    clear(): void;
    each(callback: (entity: Entity) => void): void;
    events: EventsHandler;
  }

  // Entity
  export class Entity {
    constructor(options: any);
    id: string;
    name: string;
    properties: Record<string, any>;
    lonlat: LonLat;
    setBillboard(billboard: any): void;
    setLabel(label: any): void;
    setPoint(point: any): void;
    setPolygon(polygon: any): void;
  }

  // Terrain
  export class EmptyTerrain {
    constructor(options?: any);
  }

  export class GlobusRgbTerrain extends EmptyTerrain {
    constructor(name?: string, options?: any);
  }

  // Controls
  export class Control {
    constructor(options?: any);
    activate(): void;
    deactivate(): void;
    isActive(): boolean;
  }

  export namespace control {
    export class MouseNavigation extends Control {
      constructor(options?: any);
    }
    export class KeyboardNavigation extends Control {}
    export class TouchNavigation extends Control {}
    export class ZoomControl extends Control {}
    export class ScaleControl extends Control {}
    export class EarthCoordinates extends Control {}
    export class Sun extends Control {}
    export class CompassButton extends Control {}
    export class LayerSwitcher extends Control {}
    export class TimelineControl extends Control {}
    export class ToggleWireframe extends Control {}
  }

  // Events and Utils
  export namespace events {
    export const KEY_ALT: number;
    export const KEY_SHIFT: number;
    export const KEY_CTRL: number;
  }

  // Geometry
  export class Vec3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): Vec3;
    copy(v: Vec3): Vec3;
    add(v: Vec3): Vec3;
    sub(v: Vec3): Vec3;
    scale(scale: number): Vec3;
    normalize(): Vec3;
    length(): number;
  }

  export class LonLat {
    constructor(lon: number, lat: number, height?: number);
    lon: number;
    lat: number;
    height: number;
  }

  export class Extent {
    constructor(sw: LonLat, ne: LonLat);
    southWest: LonLat;
    northEast: LonLat;
  }
  
  // Sun
  export class Sun {
    constructor();
    setDate(date: Date): void;
    getPosition(): Vec3;
  }
}
