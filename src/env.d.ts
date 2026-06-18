/// <reference types="astro/client" />

declare const process: {
  cwd(): string;
};

declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, encoding: string): string;
}

declare module "node:path" {
  const path: {
    join(...paths: string[]): string;
  };
  export default path;
}
