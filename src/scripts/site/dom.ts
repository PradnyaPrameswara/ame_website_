import type { Cleanup } from "./types";

export const selectAll = <ElementType extends Element>(
  selector: string,
  root: ParentNode = document,
): ElementType[] => Array.from(root.querySelectorAll<ElementType>(selector));

export const composeCleanups = (...cleanups: Cleanup[]): Cleanup => () => {
  cleanups.reverse().forEach((cleanup) => cleanup());
};
