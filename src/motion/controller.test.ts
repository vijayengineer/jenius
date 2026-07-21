import { describe, expect, it, vi } from "vitest";
import { MotionController } from "./controller";

describe("motion controller", () => {
  it("interrupts an active clip when a newer timeline cue arrives", async () => {
    const controller = new MotionController();
    const first = controller.play("curiosity");
    const second = controller.play("misunderstanding");

    await expect(first.finished).resolves.toBe("interrupted");
    expect(controller.getSnapshot().request?.assetId).toBe("misunderstanding");
    controller.complete(second.requestId);
    await expect(second.finished).resolves.toBe("completed");
  });

  it("handles rapid next and previous concept changes without stale completion", async () => {
    const controller = new MotionController();
    const dna = controller.play("concept-dna");
    const volcano = controller.play("concept-volcano");
    const seasons = controller.play("concept-seasons");

    controller.complete(dna.requestId);
    controller.complete(volcano.requestId);
    expect(controller.getSnapshot().request?.assetId).toBe("concept-seasons");
    await expect(dna.finished).resolves.toBe("interrupted");
    await expect(volcano.finished).resolves.toBe("interrupted");
    seasons.cancel();
    await expect(seasons.finished).resolves.toBe("interrupted");
  });

  it("does not stack rapid repeated answer feedback", async () => {
    const controller = new MotionController();
    const first = controller.play("success");
    const second = controller.play("success");
    const third = controller.play("success");

    await expect(first.finished).resolves.toBe("interrupted");
    await expect(second.finished).resolves.toBe("interrupted");
    expect(controller.getSnapshot().request?.requestId).toBe(third.requestId);
    third.cancel();
  });

  it("skips videos under reduced motion and interrupts a running clip", async () => {
    const controller = new MotionController();
    const running = controller.play("transition");
    controller.setReducedMotion(true);
    const skipped = controller.play("completion");

    await expect(running.finished).resolves.toBe("interrupted");
    await expect(skipped.finished).resolves.toBe("skipped");
    expect(controller.getSnapshot()).toMatchObject({ request: null, reducedMotion: true });
  });

  it("publishes reduced motion when no clip is active", () => {
    const controller = new MotionController();
    const listener = vi.fn();
    controller.subscribe(listener);
    controller.setReducedMotion(true);

    expect(listener).toHaveBeenCalledWith({
      request: null,
      reducedMotion: true,
      documentHidden: false,
    });
  });

  it("pauses while hidden and skips stale transition playback on foreground", async () => {
    const controller = new MotionController();
    const listener = vi.fn();
    controller.subscribe(listener);
    const active = controller.play("success");

    controller.setDocumentHidden(true);
    expect(controller.getSnapshot().request?.paused).toBe(true);
    controller.setDocumentHidden(false);
    expect(controller.getSnapshot().request).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);
    await expect(active.finished).resolves.toBe("skipped");
  });
});
