"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SceneProps } from "@/src/components/three/Scene";
import { Panel } from "@/src/ui/Panels";
import { Hud } from "@/src/ui/Hud";
import { ListView } from "@/src/ui/ListView";
import { SkipLinks } from "@/src/components/ui/SkipLinks";
import { AccessibilityPanel } from "@/src/components/ui/AccessibilityPanel";
import { FocusIndicator } from "@/src/components/ui/FocusIndicator";
import { PerformanceHUD } from "@/src/components/ui/PerformanceHUD";
import { CMSStatus } from "@/src/components/ui/CMSStatus";
import { ErrorBoundary } from "@/src/components/ui/ErrorBoundary";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { usePortfolioStore } from "@/src/store/portfolio";
import { loadResumeData } from "@/src/content/loader";
import { mapContentToPanels } from "@/src/content/map";
import {
  getReducedMotionPreference,
  announceToScreenReader,
  useKeyboardNavigation,
} from "@/src/lib/accessibility";
import { useGestures } from "@/src/hooks/useGestures";

const Scene = dynamic<SceneProps>(() => import("@/src/components/three/Scene"), {
  ssr: false,
});

export default function OrbitalPortfolio() {
  const noop = () => {};
  const [isLoading, setIsLoading] = useState(true);

  const {
    resumeData,
    setResumeData,
    focusedIndex,
    isPanelOpen,
    hoveredIndex,
    useListView,
    setUseListView,
    reducedMotion,
    setReducedMotion,
    focusNode,
    closePanel,
    setHoveredIndex,
    navigateToNode,
  } = usePortfolioStore();

  /* Lock/unlock page scroll per view */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    if (useListView) {
      html.style.overflow = "auto";
      body.style.overflow = "auto";
    } else {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [useListView]);

  /* Hard-block wheel/trackpad in Orbital view */
  useEffect(() => {
    if (!useListView) {
      const preventWheel = (e: WheelEvent) => e.preventDefault();
      window.addEventListener("wheel", preventWheel, { passive: false });
      return () => window.removeEventListener("wheel", preventWheel as any);
    }
  }, [useListView]);

  useEffect(() => {
    const prefersReducedMotion = getReducedMotionPreference();
    const hasWebGLSupport = (() => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
      } catch {
        return false;
      }
    })();

    setReducedMotion(prefersReducedMotion);
    if (prefersReducedMotion || !hasWebGLSupport) setUseListView(true);

    const loadData = async () => {
      try {
        const data = await loadResumeData();
        setResumeData(data);
        setIsLoading(false);
      } catch {
        const { getDemoData } = await import("@/src/content/loader");
        setResumeData(getDemoData());
        setIsLoading(false);
      }
    };
    loadData();

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        import("@/src/content/loader")
          .then(({ getDemoData }) => {
            setResumeData(getDemoData());
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      }
    }, 3000);

    const handleSwitchToListView = () => {
      setUseListView(true);
      announceToScreenReader(
        "Switched to accessible list view due to 3D scene error",
        "assertive"
      );
    };
    window.addEventListener("switchToListView", handleSwitchToListView);
    return () => {
      window.removeEventListener("switchToListView", handleSwitchToListView);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setReducedMotion, setUseListView, setResumeData]);

  const handleNodeClick = (index: number) => {
    const sections = ["Introduction", "Experience", "Projects", "Skills", "Contact"];
    announceToScreenReader(`Focused on ${sections[index]}`, "assertive");
    focusNode(index);
  };

  const handleNodeHover = (index: number | null) => {
    setHoveredIndex(index);
    if (index !== null) {
      const sections = ["Introduction", "Experience", "Projects", "Skills", "Contact"];
      announceToScreenReader(`Hovering over ${sections[index]}`);
    }
  };

  /* Keyboard nav (disabled in List View) */
  useKeyboardNavigation(
    useListView
      ? {
          onArrowLeft: noop,
          onArrowRight: noop,
          onArrowUp: noop,
          onArrowDown: noop,
          onEnter: noop,
          onEscape: noop,
          onSpace: noop,
          onHome: noop,
          onEnd: noop,
        }
      : {
          onArrowLeft: () => navigateToNode("prev"),
          onArrowRight: () => navigateToNode("next"),
          onArrowUp: () => navigateToNode("prev"),
          onArrowDown: () => navigateToNode("next"),
          onEnter: () => {
            if (hoveredIndex !== null) handleNodeClick(hoveredIndex);
          },
          onEscape: () => closePanel(),
          onSpace: () => {
            if (hoveredIndex !== null) handleNodeClick(hoveredIndex);
          },
          onHome: () => focusNode(0),
          onEnd: () => focusNode(4),
        }
  );

  /* Gestures: keep swipe in Orbital, ignore in List; no onScroll at all */
  useGestures({
    onSwipeLeft: () => {
      if (!useListView) navigateToNode("next");
    },
    onSwipeRight: () => {
      if (!useListView) navigateToNode("prev");
    },
    onSwipeUp: () => {
      if (!useListView && focusedIndex >= 0) closePanel();
    },
    onSwipeDown: () => {
      if (!useListView && focusedIndex === -1 && hoveredIndex !== null) {
        handleNodeClick(hoveredIndex);
      }
    },
    // intentionally NO onScroll — wheel is blocked in Orbital, free in List
  });

  const panelData = resumeData ? mapContentToPanels(resumeData) : null;
  const currentPanelData =
    focusedIndex >= 0 && panelData ? Object.values(panelData)[focusedIndex] : null;

  if (isLoading || !resumeData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="text-blue-400" />
          <p className="text-white/70">Loading portfolio...</p>
          <p className="text-white/50 text-sm">This should only take a moment</p>
        </div>
      </div>
    );
  }

  /* LIST VIEW */
  if (useListView) {
    return (
      <div className="relative bg-[#0b1220] text-white touch-auto overscroll-auto min-h-screen">
        <SkipLinks />
        <FocusIndicator />
        <AccessibilityPanel />

        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setUseListView(false)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-describedby="orbital-view-desc"
          >
            Switch to Orbital View
          </button>
          <div id="orbital-view-desc" className="sr-only">
            Switch to 3D orbital navigation view. Not recommended for users with motion
            sensitivity.
          </div>
        </div>

        <main id="main-content" className="touch-auto overscroll-auto">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <ListView data={resumeData} />
          </div>
        </main>
      </div>
    );
  }

  /* ORBITAL VIEW */
  return (
    <main className="relative h-screen w-screen bg-[#0b1220] overflow-hidden">
      <div
        id="main-content"
        className="absolute inset-0 z-0"
        role="application"
        aria-label="Interactive orbital portfolio navigation"
      >
        <ErrorBoundary
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-white/70">
                  3D view unavailable. Switching to accessible view...
                </p>
                <button
                  onClick={() => setUseListView(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Portfolio
                </button>
              </div>
            </div>
          }
          onError={() => {
            setTimeout(() => setUseListView(true), 2000);
          }}
        >
          <Scene
            focusedIndex={focusedIndex}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
          />
        </ErrorBoundary>
      </div>

      <SkipLinks />
      <FocusIndicator />
      <AccessibilityPanel />
      <CMSStatus />
      <PerformanceHUD />

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseListView(true)}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-describedby="list-view-desc"
        >
          List View
        </button>
        <div id="list-view-desc" className="sr-only">
          Switch to accessible list view with all content in a traditional format
        </div>
      </div>

      <nav id="navigation" aria-label="Portfolio sections">
        <Hud
          focusedIndex={focusedIndex}
          hoveredIndex={hoveredIndex}
          onNodeClick={handleNodeClick}
        />
      </nav>

      <div
        id="instructions"
        className="fixed bottom-4 left-4 text-white/60 text-sm"
        role="region"
        aria-label="Navigation instructions"
      >
        <p>
          Click nodes • Arrow keys • Enter to select • Esc to close • Home/End for
          first/last
        </p>
      </div>

      {currentPanelData && (
        <Panel data={currentPanelData} isOpen={isPanelOpen} onClose={closePanel} />
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only" id="status-announcements" />
    </main>
  );
}
