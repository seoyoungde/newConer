// src/analytics/clients.jsx
// GA4 + (옵션) custom 수집을 프론트에서만 안전하게 다루는 경량 클라이언트

let transport = "ga4"; // 'ga4' | 'custom'
let gaMeasurementId = "";
let customEndpoint = "";

let isInitialized = false; // gtag 초기화 완료 여부
let isLoaderInjected = false; // 스크립트 주입 여부
const eventQueue = []; // gtag 준비 전 이벤트 큐

// ---- 유틸: 로컬 스토리지 기반 익명 ID / 플로우 ID ----
function uid(key) {
  const k = `coner:${key}`;
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    localStorage.setItem(k, v);
  }
  return v;
}

export const getAnonUserId = () => uid("anonUserId");
export const getFlowId = () => uid("funnelFlowId");
export const resetFlowId = () => localStorage.removeItem("coner:funnelFlowId");

// ---- 내부: gtag 준비 보장 ----
function whenGtagReady() {
  return new Promise((resolve) => {
    // 이미 window.gtag가 함수면 준비 완료
    if (typeof window.gtag === "function") return resolve();

    // 아직이면 polling (아주 짧게)
    const start = Date.now();
    const t = setInterval(() => {
      if (typeof window.gtag === "function") {
        clearInterval(t);
        resolve();
      } else if (Date.now() - start > 5000) {
        // 5초 넘으면 포기하고 resolve (콘솔 로깅)
        clearInterval(t);
        console.warn("[analytics] gtag not ready after 5s");
        resolve();
      }
    }, 30);
  });
}

// ---- 내부: 스크립트 주입 (index.html 스니펫이 없다면 이 경로로 로드) ----
function injectGtagLoader(id) {
  if (isLoaderInjected) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    id
  )}`;
  document.head.appendChild(s);
  isLoaderInjected = true;

  // dataLayer / gtag 셋업 (중복 무해)
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
}

// ---- 공개: 초기화 ----
export function configureAnalytics(opts = {}) {
  if (opts.transport) transport = opts.transport;
  if (opts.gaMeasurementId) gaMeasurementId = opts.gaMeasurementId;
  if (opts.customEndpoint) customEndpoint = opts.customEndpoint;

  if (transport !== "ga4") {
    isInitialized = true; // custom 모드에선 초기화 개념 없음
    return;
  }

  if (!gaMeasurementId) {
    console.warn("[analytics] GA4 measurement ID missing");
    return;
  }

  // 1) index.html에 이미 스니펫이 있으면 그대로 사용
  // 2) 없으면 우리가 주입
  if (typeof window.gtag !== "function") {
    injectGtagLoader(gaMeasurementId);
  } else {
    // 이미 스니펫 있음
    window.dataLayer = window.dataLayer || [];
  }

  // 초기 config (debug_mode: localhost에서만 true)
  window.gtag("js", new Date());
  window.gtag("config", gaMeasurementId, {
    debug_mode: location.hostname === "localhost",
  });

  // gtag 준비되면 큐 플러시
  whenGtagReady().then(() => {
    isInitialized = true;
    if (eventQueue.length) {
      eventQueue.splice(0).forEach(({ name, params }) => {
        window.gtag("event", name, params);
      });
    }
  });
}

// ---- 공개: 이벤트 전송 ----
export function sendEvent(name, params = {}) {
  const base = {
    anonUserId: getAnonUserId(),
    flowId: getFlowId(),
    ts: Date.now(),
    ...params,
  };

  // 로컬에서 DebugView 보기 쉽게
  const payload =
    location.hostname === "localhost" ? { ...base, debug_mode: true } : base;

  // GA4
  if (transport === "ga4" && gaMeasurementId) {
    // gtag 아직 준비 전이면 큐잉
    if (typeof window.gtag !== "function" || !isInitialized) {
      eventQueue.push({ name, params: payload });
      return false;
    }
    window.gtag("event", name, payload);
    return true;
  }

  // Custom 수집 (옵션)
  if (transport === "custom" && customEndpoint) {
    try {
      const blob = new Blob([JSON.stringify({ name, ...base })], {
        type: "application/json",
      });
      navigator.sendBeacon(customEndpoint, blob);
      return true;
    } catch (e) {
      console.warn("[analytics] beacon failed, falling back to fetch", e);
      fetch(customEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ name, ...base }),
      }).catch(() => {});
      return true;
    }
  }

  // 아무 것도 설정 안 된 경우 콘솔로
  console.debug("[analytics]", name, base);
  return false;
}
