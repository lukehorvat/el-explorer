import { useCallback, useEffect, useRef } from 'react';
import { useForceUpdate } from './useForceUpdate';

/**
 * Hook that forcibly triggers a re-render on every available animation frame
 * while `shouldAnimate` is true.
 */
export function useAnimationFrames(shouldAnimate = true): void {
  const forceUpdate = useForceUpdate();
  const frame = useRef(0);
  const onFrame = useCallback(() => {
    forceUpdate();
    frame.current = window.requestAnimationFrame(onFrame);
  }, []);

  useEffect(() => {
    if (shouldAnimate) {
      frame.current = window.requestAnimationFrame(onFrame);
    } else {
      window.cancelAnimationFrame(frame.current);
    }

    return () => window.cancelAnimationFrame(frame.current);
  }, [onFrame, shouldAnimate]);
}
