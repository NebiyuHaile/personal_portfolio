"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
import { useViewPreferences } from "@/src/hooks/useViewPreferences";
import {
  announceToScreenReader,
  useKeyboardNavigation,
} from "@/src/lib/accessibility";
import { useGestures } from "@/src/hooks/useGestures";

const Scene = dynamic(() => import("@/src/components/three/Scene"), {
  ssr: false,
});

export default function OrbitalPortfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const preferencesReady = useViewPreferences();

  const {
    resumeData,
    setResumeData,
    focusedIndex,
    hoveredIndex,
    useListView,
    setUseListView,
    viewMode,
    activeNode,
    focusNode,
    closePanel,
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadResumeData();
        if (!disposed) { settled = true; setResumeData(data); setIsLoading(false); }
      } catch {
        const { getBundledData } = await import("@/src/content/loader");
        if (!disposed) { settled = true; setResumeData(getBundledData()); setIsLoading(false); }
      }
    };
    let disposed = false;
    let settled = false;
    loadData();

    const timeoutId = setTimeout(() => {
      if (!disposed && !settled) {
        import("@/src/content/loader")
          .then(({ getBundledData }) => {
            if (!disposed && !settled) { settled = true; setResumeData(getBundledData()); setIsLoading(false); }
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
      disposed = true;
      window.removeEventListener("switchToListView", handleSwitchToListView);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUseListView, setResumeData]);

  const handleNodeClick = (index: number) => {
    const sections = ["Introduction", "Experience", "Projects", "Skills", "Contact"];
    announceToScreenReader(`Focused on ${sections[index]}`, "assertive");
    focusNode(index);
  };

  /* Keyboard nav (disabled in List View) */
  useKeyboardNavigation(
    useListView
      ? {}
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
    // Keep gestures off content panels and Scroll view.
  }, viewMode === "orbital" && !activeNode);

  if (isLoading || !resumeData || !preferencesReady) {
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
  if (viewMode === "scroll") {
    return (
      <div className="relative bg-[#0b1220] text-white touch-auto overscroll-auto min-h-screen">
        <SkipLinks />
        <FocusIndicator />
        {process.env.NODE_ENV === "development" && <AccessibilityPanel />}

        <Hud />

        <main id="main-content" className="touch-auto overscroll-auto">
          <ListView data={resumeData} />
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
          <Scene />
        </ErrorBoundary>
      </div>

      <SkipLinks />
      <FocusIndicator />
      {process.env.NODE_ENV === "development" && <AccessibilityPanel />}
      {process.env.NODE_ENV === "development" && <><CMSStatus /><PerformanceHUD /></>}

      <Hud />

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

      <Panel />

      <div aria-live="polite" aria-atomic="true" className="sr-only" id="status-announcements" />
    </main>
  );
}
