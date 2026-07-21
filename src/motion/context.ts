import * as React from "react";
import type { MotionController } from "./controller";
import type { MotionEngine, MotionSnapshot } from "./types";

export interface MotionContextValue {
  engine: MotionEngine;
  controller: MotionController;
  snapshot: MotionSnapshot;
}

export const MotionContext = React.createContext<MotionContextValue | null>(null);

export function useMotion() {
  const value = React.useContext(MotionContext);
  if (!value) throw new Error("useMotion must be used inside MotionProvider");
  return value.engine;
}

export function useMotionEnvironment() {
  const value = React.useContext(MotionContext);
  if (!value) throw new Error("useMotionEnvironment must be used inside MotionProvider");
  return value.snapshot;
}
