// src/types/vite-custom-env.d.ts

/// <reference types="vite/client" />

// Extend the existing ImportMetaEnv with more specific types if necessary
interface ImportMetaEnv extends Readonly<{
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  // Add other environment variables as needed
}> {}

// Re-declare ImportMeta to avoid conflicts and reinforce the type link
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
