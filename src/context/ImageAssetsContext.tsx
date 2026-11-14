import { createContext, useContext } from 'react';
import type { ImageMetadata } from 'astro';

export type OptimizedImage = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
};

export type ImageAssets = Record<string, OptimizedImage>;
export const ImageAssetsContext = createContext<ImageAssets>({});

export function useOptimizedImage(image: ImageMetadata) {
  return useContext(ImageAssetsContext)[image.src] ?? image;
}
