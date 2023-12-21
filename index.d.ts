declare module '*.jpg';
declare module '*.png';
declare module '*.svg';
declare module '*.gif';
declare module '*.mp3';

interface ImportMeta {
	env: Record<string, string>;
}