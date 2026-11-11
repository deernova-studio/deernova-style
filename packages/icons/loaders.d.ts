export type LoaderName = 'thinking' | 'working' | 'spinner';
export declare const LOADERS: Record<LoaderName, { shape: string; duration: number; trail: number; taper: boolean; rest: 'curve' | 'none'; reducedDuration?: number }>;
export declare function curvePath(name: LoaderName, count?: number): string;
export declare function strokeAt(name: LoaderName, head: number, trail?: number, taper?: number): { d: string; width: number }[];
export interface Loader { svg: SVGSVGElement; stop(options?: { settle?: boolean }): void; destroy(): void }
export declare function createLoader(target: Element, name?: LoaderName, options?: { className?: string; onRest?: () => void }): Loader;
export declare function defineLoaderElement(tag?: string): void;
