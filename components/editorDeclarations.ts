import type { EnvironmentMode } from '../types';

// Console is normally declared in lib.dom.d.ts. Console-only playgrounds
// need this shim when the editor excludes browser globals.
export const CONSOLE_SHIM = `
declare var console: {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
  debug(...data: any[]): void;
  table(data: any, columns?: string[]): void;
  dir(item?: any): void;
  group(...data: any[]): void;
  groupEnd(): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  count(label?: string): void;
  assert(condition?: boolean, ...data: any[]): void;
  trace(...data: any[]): void;
  clear(): void;
};
`;

const declarations: Partial<Record<EnvironmentMode, { source: string; path: string }>> = {
  'react-ts': { source: `
                declare namespace React {
                    type ReactNode = any;
                    interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    interface Dispatch<A> {
                        (value: A): void;
                    }
                    type SetStateAction<S> = S | ((prevState: S) => S);
                }

                declare module 'react' {
                    export type ReactNode = any;
                    export interface FC<P = {}> {
                        (props: P): ReactNode;
                    }
                    export interface Dispatch<A> {
                        (value: A): void;
                    }
                    export type SetStateAction<S> = S | ((prevState: S) => S);
                    export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

                    const React: {
                        FC: FC<any>;
                        useState: typeof useState;
                    };
                    export default React;
                }

                declare module 'react-dom/client' {
                    export interface Root {
                        render(children: any): void;
                        unmount(): void;
                    }
                    export function createRoot(container: Element | DocumentFragment): Root;
                }
                `, path: 'react-shim.d.ts' },
  'express-ts': { source: `
                declare module 'express' {
                    export interface Request {
                        params: any;
                        query: any;
                        body: any;
                        method: string;
                        url: string;
                    }
                    export interface Response {
                        status(code: number): this;
                        json(data: any): void;
                        send(data: any): void;
                    }
                    export interface Application {
                        get(path: string, handler: (req: Request, res: Response) => void): void;
                        post(path: string, handler: (req: Request, res: Response) => void): void;
                        listen(port: number, cb?: () => void): void;
                    }
                    function express(): Application;
                    export default express;
                }
                `, path: 'express.d.ts' },
  'hono-ts': { source: `
                declare module 'hono' {
                    export interface Context {
                        text(content: string): any;
                        json(data: any): any;
                        req: {
                            param(name: string): string;
                            query(name: string): string;
                            query(): Record<string, string>;
                        };
                    }
                    export class Hono {
                        get(path: string, handler: (c: Context) => any): void;
                        post(path: string, handler: (c: Context) => any): void;
                        fire(): void;
                    }
                }
                declare class Hono {
                    get(path: string, handler: (c: any) => any): void;
                    post(path: string, handler: (c: any) => any): void;
                    fire(): void;
                }
                `, path: 'hono.d.ts' },
  'p5-ts': { source: `
                declare function createCanvas(w: number, h: number): any;
                declare function background(gray: number, alpha?: number): void;
                declare function background(r: number, g: number, b: number, a?: number): void;
                declare function background(color: string): void;
                declare function stroke(gray: number, alpha?: number): void;
                declare function stroke(r: number, g: number, b: number, a?: number): void;
                declare function noStroke(): void;
                declare function fill(gray: number, alpha?: number): void;
                declare function fill(r: number, g: number, b: number, a?: number): void;
                declare function fill(color: string): void;
                declare function noFill(): void;
                declare function circle(x: number, y: number, d: number): void;
                declare function line(x1: number, y1: number, x2: number, y2: number): void;
                declare function rect(x: number, y: number, w: number, h: number): void;
                declare function ellipse(x: number, y: number, w: number, h: number): void;
                declare function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
                declare function dist(x1: number, y1: number, x2: number, y2: number): number;
                declare function random(max?: number): number;
                declare function random(min: number, max: number): number;
                declare function colorMode(mode: string, max?: number): void;
                declare function angleMode(mode: string): void;
                declare function translate(x: number, y: number): void;
                declare function rotate(angle: number): void;
                declare function push(): void;
                declare function pop(): void;
                declare function frameRate(fps: number): void;
                declare function strokeWeight(weight: number): void;
                declare var width: number;
                declare var height: number;
                declare var frameCount: number;
                declare var mouseX: number;
                declare var mouseY: number;
                declare var mouseIsPressed: boolean;
                declare var keyIsPressed: boolean;
                declare const PI: number;
                declare const TWO_PI: number;
                declare const DEGREES: string;
                declare const RADIANS: string;
                declare const HSB: string;
                declare const RGB: string;

                // Allow defining setup and draw on window for global mode
                interface Window {
                    setup?: () => void;
                    draw?: () => void;
                }
                `, path: 'p5-shim.d.ts' },
};

export function getEditorDeclarations(mode: EnvironmentMode) {
  const key = ({ react: 'react-ts', 'react-app': 'react-ts', express: 'express-ts', hono: 'hono-ts', p5: 'p5-ts' } as Partial<Record<EnvironmentMode, EnvironmentMode>>)[mode] ?? mode;
  const declaration = declarations[key];
  return declaration ? [declaration] : [];
}
