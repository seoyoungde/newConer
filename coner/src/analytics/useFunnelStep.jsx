// src/analytics/useFunnelStep.jsx
import { useEffect, useRef } from "react";
import { sendEvent } from "./clients.jsx";

export function useFunnelStep({ step, extra } = { step: 1 }) {
  const startRef = useRef(0);
  const advancedRef = useRef(false);

  useEffect(() => {
    startRef.current = performance.now();
    sendEvent("funnel_step", { step, ...(extra || {}) });

    const finalizeAbandon = (reason) => {
      if (!advancedRef.current) {
        const elapsedMs = Math.round(performance.now() - startRef.current);
        sendEvent("funnel_abandon", { step, elapsedMs, reason });
      }
    };

    const onPageHide = () => finalizeAbandon("pagehide");
    const onBeforeUnload = () => finalizeAbandon("beforeunload");

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      finalizeAbandon("unmount");
    };
  }, [step, extra]);

  const onAdvance = (nextStep, detail) => {
    advancedRef.current = true;
    const elapsedMs = Math.round(performance.now() - startRef.current);
    sendEvent("funnel_advance", {
      from: step,
      to: nextStep,
      elapsedMs,
      ...(detail || {}),
    });
  };

  const onComplete = (detail) => {
    advancedRef.current = true;
    const elapsedMs = Math.round(performance.now() - startRef.current);
    sendEvent("funnel_complete", { step, elapsedMs, ...(detail || {}) });
  };

  return { onAdvance, onComplete };
}
