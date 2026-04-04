export type MediaType = 'image' | 'video' | 'audio';

export interface Track {
  id: string;
  type: MediaType;
  file: File;
  url: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  zIndex: number;
  name: string;
  isBgRemoved?: boolean;
}

export type FilterType = 
  | 'none' 
  | 'sacred-wolf' 
  | 'holy-light' 
  | 'anime-local' 
  | '3d-avatar-local' 
  | 'cinematic-local' 
  | 'vibrant' 
  | 'cinematic-black' 
  | 'gold-glow' 
  | 'sharp-detail' 
  | 'soft-blur'
  | 'wolf-forest'
  | 'gold-palace';

export type StyleType = 
  | 'original' 
  | 'anime' 
  | '3d-avatar' 
  | 'cinematic-model' 
  | 'wolf-forest' 
  | 'gold-palace';
