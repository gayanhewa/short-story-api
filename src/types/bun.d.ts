declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function expect(value: any): {
    toBe: (expected: any) => void;
    toEqual: (expected: any) => void;
    toHaveProperty: (property: string) => void;
  };
} 