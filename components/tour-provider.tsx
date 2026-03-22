"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CallBackProps, Step } from "react-joyride";
import { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useTourStore, TOUR_SEQUENCE, type TourId } from "@/lib/tour-store";
import { resolveSteps } from "@/lib/tour-steps";
import { usePathname, useRouter } from "next/navigation";
import { TourTooltip } from "./tour-tooltip";

const Joyride = dynamic(() => import("react-joyride").then((mod) => mod.default), { ssr: false });

const tourIdToPath: Record<TourId, string> = {
  admin: "/",
  urunler: "/urunler",
  desenler: "/desenler",
  kategoriler: "/kategoriler",
  gorsel: "/gorsel-olustur",
};

export function TourProvider() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeTour,
    markCompleted,
    chainMode,
    getNextTourInChain,
    startTour,
    stopTour,
  } = useTourStore();
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [resolvedSteps, setResolvedSteps] = useState<Step[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve steps when tour starts (navigate if needed)
  useEffect(() => {
    if (!mounted || !activeTour) {
      setResolvedSteps([]);
      return;
    }

    const expectedPath = tourIdToPath[activeTour];
    if (pathname !== expectedPath) {
      router.push(expectedPath);
      return;
    }

    const timer = setTimeout(() => {
      const steps = resolveSteps(activeTour);
      setResolvedSteps(steps);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTour, mounted, pathname, router]);

  // Reset step index when tour changes
  useEffect(() => {
    setStepIndex(0);
    if (activeTour) setRun(true);
  }, [activeTour]);

  // Cleanup highlights when tour ends
  useEffect(() => {
    if (activeTour !== null) return;
    const cleanup = () => {
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
      document.body.classList.remove("tour-backdrop-active");
    };
    cleanup();
    const timer = setTimeout(cleanup, 100);
    return () => clearTimeout(timer);
  }, [activeTour]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
      document.body.classList.remove("tour-backdrop-active");
    };
  }, []);

  // Highlight current target
  useEffect(() => {
    if (!activeTour || !mounted || resolvedSteps.length === 0) return;

    const step = resolvedSteps[stepIndex];
    if (!step) return;

    const target = step.target;
    if (typeof target !== "string") return;

    const el = document.querySelector(target);
    if (el) {
      el.classList.add("tour-highlight");
      document.body.classList.add("tour-backdrop-active");
      return () => {
        el.classList.remove("tour-highlight");
        if (!document.querySelector(".tour-highlight")) {
          document.body.classList.remove("tour-backdrop-active");
        }
      };
    }
  }, [activeTour, stepIndex, mounted, resolvedSteps]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type } = data;

      if (type === EVENTS.STEP_AFTER) {
        if (action === ACTIONS.NEXT) {
          setStepIndex(index + 1);
        } else if (action === ACTIONS.PREV) {
          setStepIndex(index - 1);
        }
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);

        if (activeTour) {
          markCompleted(activeTour);

          if (chainMode && status === STATUS.FINISHED) {
            setTimeout(() => {
              const next = getNextTourInChain();
              if (next) {
                startTour(next);
              } else {
                stopTour();
              }
            }, 500);
          } else if (chainMode && status === STATUS.SKIPPED) {
            stopTour();
          }
        }
      }
    },
    [activeTour, markCompleted, chainMode, getNextTourInChain, startTour, stopTour]
  );

  if (!mounted || !activeTour || resolvedSteps.length === 0) return null;

  return (
    <Joyride
      steps={resolvedSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlay
      disableOverlayClose
      spotlightClicks
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      spotlightPadding={0}
      styles={{
        options: {
          zIndex: 10000,
        },
        beacon: {
          display: "none",
        },
        buttonNext: { display: "none" },
        buttonBack: { display: "none" },
        buttonSkip: { display: "none" },
        buttonClose: { display: "none" },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: "none",
          },
        },
        hideArrow: true,
      }}
    />
  );
}
