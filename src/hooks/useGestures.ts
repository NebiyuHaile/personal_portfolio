// src/hooks/useGestures.ts
import { useEffect, useRef } from "react";

export type GestureCallbacks = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onScroll?: (dir: "up" | "down") => void;
};

/**
 * Attaches wheel + touch listeners when `enabled` is true.
 * Call at component top-level (never inside useEffect/conditions).
 */
export function useGestures(callbacks: GestureCallbacks, enabled: boolean = true) {
  const lastScrollTime = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onWheel = (e: WheelEvent) => {
      if (!callbacks.onScroll) return;
      const now = performance.now();
      if (now - lastScrollTime.current < 120) return;
      lastScrollTime.current = now;
      const dir = e.deltaY > 0 ? "down" : "up";
      callbacks.onScroll?.(dir);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (
        !callbacks.onSwipeLeft &&
        !callbacks.onSwipeRight &&
        !callbacks.onSwipeUp &&
        !callbacks.onSwipeDown
      ) {
        return;
      }
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const TH = 40;

      if (ax > ay && ax > TH) {
        if (dx < 0) callbacks.onSwipeLeft?.();
        else callbacks.onSwipeRight?.();
      } else if (ay >= ax && ay > TH) {
        if (dy < 0) callbacks.onSwipeUp?.();
        else callbacks.onSwipeDown?.();
      }
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, callbacks]);
}
