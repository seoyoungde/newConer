import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Firebase 설정 경로에 맞게 수정하세요

const STATUS = {
  CANCELED: 0,
  REQUESTED: 1,
  PAID: 2,
  FEE_PENDING: 3,
  FEE_DONE: 4,
};

const STATUS_MESSAGES = {
  [STATUS.CANCELED]: "취소된 결제",
  [STATUS.REQUESTED]: "결제 요청됨",
  [STATUS.PAID]: "결제 완료",
  [STATUS.FEE_PENDING]: "수수료 처리 중",
  [STATUS.FEE_DONE]: "처리 완료",
};

function parseAmountToNumber(str) {
  if (str == null) return 0;
  const onlyDigits = String(str).replace(/[^\d]/g, "");
  const n = Number(onlyDigits);
  return Number.isFinite(n) ? n : 0;
}

export default function PayPage() {
  const { requestId } = useParams();

  const [docLoading, setDocLoading] = useState(true);
  const [paymentDoc, setPaymentDoc] = useState(null);
  const [firebaseError, setFirebaseError] = useState("");

  const amountObj = useMemo(
    () => ({ currency: "KRW", value: parseAmountToNumber(paymentDoc?.amount) }),
    [paymentDoc?.amount]
  );

  const statusNum = useMemo(
    () => (paymentDoc?.status == null ? undefined : Number(paymentDoc.status)),
    [paymentDoc?.status]
  );

  const widgetsRef = useRef(null);
  const pmRef = useRef(null);
  const agRef = useRef(null);
  const lastKeyRef = useRef(null);

  const [widgetReady, setWidgetReady] = useState(false);
  const [uiNote, setUiNote] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  // 환경변수에서 Toss 클라이언트 키 가져오기
  const envKey = import.meta.env?.VITE_TOSS_CLIENT_KEY;
  const hasClientKey = !!envKey.trim();

  // Firebase에서 결제 정보 실시간 구독
  useEffect(() => {
    if (!requestId) {
      setDocLoading(false);
      setFirebaseError("결제 ID가 없습니다.");
      return;
    }

    setDocLoading(true);
    setFirebaseError("");

    const unsubscribe = onSnapshot(
      doc(db, "Payment", requestId),
      (docSnapshot) => {
        setDocLoading(false);

        if (!docSnapshot.exists()) {
          setPaymentDoc(null);
          setFirebaseError("결제 정보를 찾을 수 없습니다.");
          return;
        }

        const data = docSnapshot.data();
        setPaymentDoc(data);
        setFirebaseError("");

        console.log("Payment data loaded:", data);
      },
      (error) => {
        setDocLoading(false);
        setFirebaseError(
          "결제 정보 로딩 중 오류가 발생했습니다: " + error.message
        );
        console.error("Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, [requestId]);

  // Toss Payments SDK 초기화
  useEffect(() => {
    let cancelled = false;

    const initializeTossPayments = async () => {
      setWidgetReady(false);

      if (!requestId) return;

      if (!hasClientKey) {
        setUiNote("Toss 클라이언트 키가 설정되지 않았습니다.");
        return;
      }

      if (widgetsRef.current && lastKeyRef.current === envKey) {
        setUiNote("");
        return;
      }

      // 기존 위젯 정리
      try {
        await pmRef.current?.destroy();
        await agRef.current?.destroy();
      } catch (e) {
        console.log("Widget cleanup:", e.message);
      }

      pmRef.current = null;
      agRef.current = null;
      widgetsRef.current = null;

      try {
        const tossPayments = await loadTossPayments(envKey);
        if (cancelled) return;

        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;
        lastKeyRef.current = envKey;
        setUiNote("");
      } catch (err) {
        console.error("[loadTossPayments error]", err);
        setUiNote("결제 모듈 초기화 실패: " + err.message);
      }
    };

    initializeTossPayments();

    return () => {
      cancelled = true;
      const cleanup = async () => {
        try {
          await pmRef.current?.destroy();
          await agRef.current?.destroy();
        } catch (e) {
          console.log("Cleanup error:", e);
        }
        pmRef.current = null;
        agRef.current = null;
        widgetsRef.current = null;
        setWidgetReady(false);
      };
      cleanup();
    };
  }, [requestId, hasClientKey, envKey]);

  // 결제 위젯 렌더링
  useEffect(() => {
    const widgets = widgetsRef.current;
    if (!widgets || !requestId || !paymentDoc) return;

    // 결제 가능한 상태가 아닌 경우 위젯 정리
    if (statusNum !== STATUS.REQUESTED) {
      const cleanupWidgets = async () => {
        try {
          await pmRef.current?.destroy();
          await agRef.current?.destroy();
        } catch (e) {
          console.log("Widget cleanup:", e);
        }
        pmRef.current = null;
        agRef.current = null;
        setWidgetReady(false);
      };
      cleanupWidgets();
      return;
    }

    if (!amountObj.value || amountObj.value <= 0) {
      setUiNote("결제 금액이 잘못되었습니다.");
      return;
    }

    let cancelled = false;

    const renderWidgets = async () => {
      try {
        // 금액 설정
        await widgets.setAmount(amountObj);

        // 기존 위젯 정리
        if (pmRef.current) {
          await pmRef.current.destroy();
          pmRef.current = null;
        }
        if (agRef.current) {
          await agRef.current.destroy();
          agRef.current = null;
        }

        // 새 위젯 렌더링
        pmRef.current = await widgets.renderPaymentMethods({
          selector: "#payment-method",
        });

        agRef.current = await widgets.renderAgreement({
          selector: "#agreement",
        });

        if (!cancelled) {
          setWidgetReady(true);
          setUiNote("");
        }
      } catch (err) {
        console.error("[Toss render error]", err);
        if (!cancelled) {
          setWidgetReady(false);
          setUiNote("결제 위젯 렌더링 실패: " + err.message);
        }
      }
    };

    renderWidgets();

    return () => {
      cancelled = true;
      setWidgetReady(false);
    };
  }, [requestId, paymentDoc, amountObj.value, statusNum]);

  // 결제 요청 - 수정된 부분
  const onPay = async () => {
    if (payBusy) return;
    const widgets = widgetsRef.current;
    if (!widgets || !paymentDoc || !requestId) return;

    if (statusNum !== STATUS.REQUESTED) {
      alert(
        `현재 상태에서는 결제를 진행할 수 없습니다. (${STATUS_MESSAGES[statusNum]})`
      );
      return;
    }

    if (!amountObj.value || amountObj.value <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    // orderId를 명시적으로 requestId로 설정 (수정된 부분)
    const orderId = requestId;
    const orderName =
      paymentDoc.method || paymentDoc.service_type || paymentDoc.aircon_type
        ? `${
            paymentDoc.method ||
            paymentDoc.service_type ||
            paymentDoc.aircon_type
          } / ${requestId}`
        : `주문 ${requestId}`;

    console.log("결제 요청 정보:", {
      orderId,
      orderName,
      amount: amountObj.value,
      requestId,
    });

    try {
      setPayBusy(true);
      await widgets.requestPayment({
        orderId, // 이제 requestId와 동일
        orderName,
        successUrl: `${window.location.origin}/pay/success/${requestId}`,
        failUrl: `${window.location.origin}/pay/fail/${requestId}`,
      });
    } catch (e) {
      console.error("[Toss requestPayment error]", e);
      alert("결제 요청 중 오류가 발생했습니다: " + e.message);
    } finally {
      setPayBusy(false);
    }
  };

  // 버튼 상태 계산
  const payEnabled =
    hasClientKey && statusNum === STATUS.REQUESTED && widgetReady && !payBusy;
  const disabledReason = !hasClientKey
    ? "키 미설정"
    : statusNum !== STATUS.REQUESTED
    ? STATUS_MESSAGES[statusNum] || "결제 불가"
    : !widgetReady
    ? "모듈 준비 중"
    : payBusy
    ? "결제 진행 중"
    : "";

  // 로딩 상태
  if (!requestId || docLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
        <p>결제 정보를 불러오는 중...</p>
      </div>
    );
  }

  // Firebase 에러 또는 결제 정보 없음
  if (firebaseError || !paymentDoc) {
    return (
      <div style={styles.loading}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2>결제 정보 오류</h2>
        <p style={styles.errorText}>
          {firebaseError || "결제 정보를 찾을 수 없습니다."}
        </p>
        <button
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <h1 style={styles.title}>Coner 결제</h1>
          <p style={styles.subTitle}>주문 ID: {requestId}</p>

          {/* 결제 상태 표시 */}
          <div
            style={{
              ...styles.statusBox,
              ...(statusNum === STATUS.REQUESTED
                ? styles.statusActive
                : styles.statusInactive),
            }}
          >
            상태: {STATUS_MESSAGES[statusNum] || "알 수 없음"}
          </div>

          <div style={styles.amountBox}>
            <span>결제금액</span>
            <strong>{amountObj.value.toLocaleString()}원</strong>
          </div>

          {/* 결제 정보 표시 */}
          <div style={styles.infoBox}>
            {paymentDoc.customer_name && (
              <p>
                <strong>고객명:</strong> {paymentDoc.customer_name}
              </p>
            )}
            {paymentDoc.service_date && (
              <p>
                <strong>서비스 날짜:</strong> {paymentDoc.service_date}
              </p>
            )}
            {paymentDoc.service_time && (
              <p>
                <strong>서비스 시간:</strong> {paymentDoc.service_time}
              </p>
            )}
            {paymentDoc.brand && (
              <p>
                <strong>브랜드:</strong> {paymentDoc.brand}
              </p>
            )}
            {paymentDoc.aircon_type && (
              <p>
                <strong>에어컨 유형:</strong> {paymentDoc.aircon_type}
              </p>
            )}
            {paymentDoc.service_type && (
              <p>
                <strong>서비스 유형:</strong> {paymentDoc.service_type}
              </p>
            )}
            {paymentDoc.customer_address && (
              <p>
                <strong>주소:</strong> {paymentDoc.customer_address}
              </p>
            )}
          </div>

          {uiNote && (
            <div style={{ ...styles.note, ...styles.errorNote }}>{uiNote}</div>
          )}

          {statusNum === STATUS.REQUESTED ? (
            <>
              <div style={styles.infoNote}>
                <strong>결제 안내</strong>
                <br />
                · 애플페이는 iOS/Safari 및 등록 카드가 있을 때 노출됩니다.
                <br />
                · 삼성페이는 삼성 기기/브라우저에서만 노출됩니다.
                <br />· 가상계좌는 결제 후 입금 완료 시 자동 반영됩니다.
              </div>

              <div style={styles.widgetBox} id="payment-method">
                {!hasClientKey && <em>승인 후 결제수단이 표시됩니다.</em>}
              </div>

              <div style={styles.widgetBox} id="agreement">
                {!hasClientKey && <em>승인 후 약관 영역이 표시됩니다.</em>}
              </div>
            </>
          ) : (
            <div style={styles.notAvailableBox}>
              <h3>결제 불가능</h3>
              <p>
                현재 결제 상태: <strong>{STATUS_MESSAGES[statusNum]}</strong>
              </p>
              <p>이미 처리된 결제이거나 취소된 결제입니다.</p>
            </div>
          )}

          <button
            style={{
              ...styles.button,
              ...(payEnabled ? styles.buttonEnabled : styles.buttonDisabled),
            }}
            disabled={!payEnabled}
            onClick={onPay}
            title={disabledReason}
          >
            {payEnabled
              ? payBusy
                ? "처리 중..."
                : "결제하기"
              : `결제불가 (${disabledReason})`}
          </button>
        </div>
      </div>

      {/* 모바일 하단 고정 결제바 */}
      <div style={styles.stickyBar}>
        <div style={styles.stickyInfo}>
          <span style={styles.stickyLabel}>결제금액</span>
          <strong style={styles.stickyAmount}>
            {amountObj.value.toLocaleString()}원
          </strong>
        </div>
        <button
          style={{
            ...styles.stickyBtn,
            ...(payEnabled
              ? styles.stickyBtnEnabled
              : styles.stickyBtnDisabled),
          }}
          disabled={!payEnabled}
          onClick={payEnabled ? onPay : undefined}
        >
          {payEnabled ? (payBusy ? "처리 중..." : "결제하기") : "결제 불가"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fafcff",
  },
  shell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#fff",
    border: "1px solid #e5eaf0",
    borderRadius: "24px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
    padding: "24px",
    textAlign: "center",
    marginBottom: "100px",
  },
  title: {
    margin: "0",
    fontSize: "22px",
    color: "#0f172a",
    fontWeight: "800",
  },
  subTitle: {
    margin: "4px 0 16px",
    color: "#64748b",
    fontSize: "14px",
  },
  statusBox: {
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  statusActive: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #86efac",
  },
  statusInactive: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  amountBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f0f7ff",
    border: "1px solid #e0ebff",
    borderRadius: "16px",
    padding: "14px 16px",
    marginBottom: "16px",
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "16px",
    textAlign: "left",
    fontSize: "14px",
    color: "#475569",
  },
  note: {
    padding: "10px",
    borderRadius: "12px",
    marginBottom: "14px",
    fontSize: "14px",
  },
  errorNote: {
    background: "#fff4f4",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  infoNote: {
    background: "#f8fbff",
    color: "#0f172a",
    border: "1px solid #e5eaf0",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "14px",
    fontSize: "14px",
    textAlign: "left",
  },
  notAvailableBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    color: "#991b1b",
  },
  widgetBox: {
    minHeight: "100px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    marginBottom: "12px",
    color: "#94a3b8",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    height: "50px",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonEnabled: {
    background: "linear-gradient(90deg,#2F80ED,#56CCF2)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(47,128,237,0.3)",
  },
  buttonDisabled: {
    background: "#E2E8F0",
    color: "#94A3B8",
    cursor: "not-allowed",
  },
  loading: {
    textAlign: "center",
    color: "#64748b",
    padding: "40px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5eaf0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: "20px",
  },
  retryButton: {
    padding: "12px 24px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  stickyBar: {
    position: "fixed",
    left: "0",
    right: "0",
    bottom: "0",
    display: "none",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    background: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "saturate(180%) blur(8px)",
    borderTop: "1px solid #e5eaf0",
    boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.06)",
    zIndex: "50",
  },
  stickyInfo: {
    display: "flex",
    flexDirection: "column",
  },
  stickyLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  stickyAmount: {
    fontSize: "18px",
  },
  stickyBtn: {
    marginLeft: "auto",
    height: "46px",
    padding: "0 18px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "800",
  },
  stickyBtnEnabled: {
    color: "#fff",
    background: "linear-gradient(180deg, #2f80ed 0%, #4fa1ff 100%)",
    boxShadow: "0 6px 14px rgba(47, 128, 237, 0.25)",
  },
  stickyBtnDisabled: {
    color: "#475569",
    background: "linear-gradient(180deg, #bfd8ff, #a7c9ff)",
    cursor: "not-allowed",
  },
};
