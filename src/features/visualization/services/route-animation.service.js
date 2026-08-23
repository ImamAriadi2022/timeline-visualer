/**
 * Helper to manage requestAnimationFrame animation timeline
 */
export function createAnimationController({
  durationSeconds = 10,
  onProgress,
  onComplete,
}) {
  let animationFrameId = null;
  let startTime = null;
  let isPlaying = false;
  let pausedProgress = 0;

  function loop(timestamp) {
    if (!isPlaying) return;

    if (!startTime) {
      startTime = timestamp - pausedProgress * durationSeconds * 1000;
    }

    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / (durationSeconds * 1000));

    onProgress?.(progress);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      isPlaying = false;
      pausedProgress = 1;
      onComplete?.();
    }
  }

  return {
    play(fromProgress = null) {
      if (isPlaying) return;
      if (fromProgress !== null) {
        pausedProgress = fromProgress >= 1 ? 0 : fromProgress;
      }
      isPlaying = true;
      startTime = null;
      animationFrameId = requestAnimationFrame(loop);
    },

    pause() {
      if (!isPlaying) return;
      isPlaying = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    seek(progress) {
      pausedProgress = Math.max(0, Math.min(1, progress));
      startTime = null;
      onProgress?.(pausedProgress);
    },

    destroy() {
      isPlaying = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    isPlaying: () => isPlaying,
  };
}
