import { getMotionAsset } from "./manifest";
import type {
  MotionAssetId,
  MotionHandle,
  MotionPlaybackResult,
  MotionRequest,
  MotionSnapshot,
} from "./types";

type Listener = (snapshot: MotionSnapshot) => void;

interface ActivePlayback {
  request: MotionRequest;
  resolve: (result: MotionPlaybackResult) => void;
}

export class MotionController {
  private sequence = 0;
  private active: ActivePlayback | null = null;
  private reducedMotion = false;
  private documentHidden = false;
  private readonly listeners = new Set<Listener>();

  getSnapshot = (): MotionSnapshot => ({
    request: this.active?.request ?? null,
    reducedMotion: this.reducedMotion,
    documentHidden: this.documentHidden,
  });

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  play(assetId: MotionAssetId): MotionHandle {
    const asset = getMotionAsset(assetId);
    const requestId = ++this.sequence;
    if (this.reducedMotion) return this.settledHandle(requestId, assetId, "skipped");

    this.interrupt();
    let resolveResult: (result: MotionPlaybackResult) => void = () => undefined;
    const finished = new Promise<MotionPlaybackResult>((resolve) => {
      resolveResult = resolve;
    });
    const request = { requestId, assetId: asset.id, paused: this.documentHidden };
    this.active = { request, resolve: resolveResult };
    this.emit();
    return {
      requestId,
      assetId,
      finished,
      cancel: () => this.cancel(requestId),
    };
  }

  complete(requestId: number) {
    if (this.active?.request.requestId !== requestId) return;
    const active = this.active;
    this.active = null;
    active.resolve("completed");
    this.emit();
  }

  cancel(requestId: number) {
    if (this.active?.request.requestId !== requestId) return;
    this.interrupt();
  }

  stop() {
    this.interrupt();
  }

  setReducedMotion(reducedMotion: boolean) {
    if (this.reducedMotion === reducedMotion) return;
    this.reducedMotion = reducedMotion;
    if (reducedMotion && this.active) this.interrupt();
    else this.emit();
  }

  setDocumentHidden(documentHidden: boolean) {
    if (this.documentHidden === documentHidden) return;
    this.documentHidden = documentHidden;
    if (!documentHidden && this.active?.request.paused) {
      const stale = this.active;
      this.active = null;
      stale.resolve("skipped");
      this.emit();
      return;
    }
    if (this.active) {
      this.active = {
        ...this.active,
        request: { ...this.active.request, paused: documentHidden },
      };
    }
    this.emit();
  }

  dispose() {
    this.interrupt();
    this.listeners.clear();
  }

  private settledHandle(
    requestId: number,
    assetId: MotionAssetId,
    result: MotionPlaybackResult,
  ): MotionHandle {
    return {
      requestId,
      assetId,
      finished: Promise.resolve(result),
      cancel: () => undefined,
    };
  }

  private interrupt() {
    if (!this.active) return;
    const active = this.active;
    this.active = null;
    active.resolve("interrupted");
    this.emit();
  }

  private emit() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
