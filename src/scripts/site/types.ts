export type Cleanup = () => void;

export const noop: Cleanup = () => undefined;

declare global {
  interface Window {
    __ameCleanup?: Cleanup;
  }
}
