import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Modal from "../../components/common/Modal/Modal";

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
  const navigate = useNavigate();

  const [docLoading, setDocLoading] = useState(true);
  const [paymentDoc, setPaymentDoc] = useState(null);
  const [firebaseError, setFirebaseError] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [uiNote, setUiNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [debugLogs, setDebugLogs] = useState([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [paymentTimeout, setPaymentTimeout] = useState(null);

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data);
    setDebugLogs((prev) => [...prev, { message: logEntry, data }]);
  };

  const amountObj = useMemo(
    () => ({ currency: "KRW", value: parseAmountToNumber(paymentDoc?.amount) }),
    [paymentDoc?.amount]
  );

  const statusNum = useMemo(
    () => (paymentDoc?.status == null ? undefined : Number(paymentDoc.status)),
    [paymentDoc?.status]
  );

  // 환경별 설정
  const NICEPAY_CONFIG = {
    clientId: "R2_7e78b8ceb1c04a68bb1b3f991a153f99",
    returnUrl: "https://api.coner.kr/payment/serverAuth",
    sdkUrl: "https://pay.nicepay.co.kr/v1/js/",
  };

  const hasClientId = !!NICEPAY_CONFIG.clientId?.trim();

  // 서버 리다이렉트로 돌아온 경우 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authResultCode = urlParams.get("authResultCode");
    const authResultMsg = urlParams.get("authResultMsg");
    const tid = urlParams.get("tid");
    const serverStatus = urlParams.get("status");

    // 서버에서 리다이렉트로 돌아온 경우
    if (authResultCode || serverStatus) {
      addDebugLog("서버 리다이렉트 감지", {
        authResultCode,
        authResultMsg,
        tid,
        serverStatus,
      });

      // 성공 케이스
      if (authResultCode === "0000" || serverStatus === "success") {
        addDebugLog("서버 승인 성공 - 성공 페이지로 이동");
        navigate(
          `/pay/success/${requestId}?status=success&tid=${
            tid || ""
          }&authResultMsg=${encodeURIComponent(
            authResultMsg || "결제가 완료되었습니다"
          )}`
        );
      }
      // 실패 케이스
      else if (serverStatus === "fail" || authResultCode) {
        addDebugLog("서버 승인 실패 - 실패 페이지로 이동");
        navigate(
          `/pay/fail/${requestId}?message=${encodeURIComponent(
            authResultMsg || "결제 처리 중 오류가 발생했습니다"
          )}&code=${authResultCode || ""}`
        );
      }
    }
  }, [requestId, navigate]);

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
        const newStatus = Number(data.status);

        setPaymentDoc(data);
        setFirebaseError("");

        const isPaymentCompleted =
          newStatus === STATUS.FEE_PENDING ||
          newStatus === STATUS.PAID ||
          newStatus === STATUS.FEE_DONE;

        const isPaymentCanceled = newStatus === STATUS.CANCELED;

        if (isPaymentCompleted) {
          navigate(
            `/pay/success/${requestId}?status=success&tid=${data.tid || ""}`
          );
        } else if (isPaymentCanceled && payBusy) {
          navigate(
            `/pay/fail/${requestId}?message=${encodeURIComponent(
              data.error_message || "결제가 취소되었습니다"
            )}`
          );
        }
      },
      (error) => {
        setDocLoading(false);
        setFirebaseError(
          "결제 정보 로딩 중 오류가 발생했습니다: " + error.message
        );
      }
    );

    return () => unsubscribe();
  }, [requestId, payBusy, navigate]);

  useEffect(() => {
    return () => {
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
      }
    };
  }, [paymentTimeout]);

  useEffect(() => {
    const loadNicePayScript = () => {
      return new Promise((resolve, reject) => {
        if (
          window.AUTHNICE &&
          typeof window.AUTHNICE.requestPay === "function"
        ) {
          setSdkLoaded(true);
          resolve();
          return;
        }

        const existingScripts = document.querySelectorAll(
          'script[src*="nicepay"], script[src*="pay.nicepay"]'
        );
        existingScripts.forEach((script) => {
          script.remove();
        });

        if (window.AUTHNICE) {
          delete window.AUTHNICE;
        }

        const script = document.createElement("script");
        script.src = NICEPAY_CONFIG.sdkUrl;
        script.type = "text/javascript";
        script.charset = "utf-8";
        script.async = false;

        const checkAuthNice = (attempts = 0) => {
          if (
            window.AUTHNICE &&
            typeof window.AUTHNICE.requestPay === "function"
          ) {
            setSdkLoaded(true);
            resolve();
          } else if (attempts < 30) {
            setTimeout(() => checkAuthNice(attempts + 1), 200);
          } else {
            reject(new Error("AUTHNICE 객체 로딩 실패"));
          }
        };

        script.onload = () => {
          setTimeout(() => checkAuthNice(), 100);
        };

        script.onerror = (error) => {
          reject(new Error("스크립트 로딩 실패"));
        };

        document.head.appendChild(script);
      });
    };

    if (hasClientId) {
      loadNicePayScript()
        .then(() => {
          setUiNote("");
        })
        .catch((error) => {
          setUiNote(`결제 모듈 로드 실패: ${error.message}`);
          setSdkLoaded(false);
        });
    } else {
      setUiNote("NicePay 클라이언트 ID가 설정되지 않았습니다.");
    }
  }, [hasClientId]);

  // NicePay 결제 요청
  const requestNicePayment = async () => {
    if (!window.AUTHNICE?.requestPay) {
      alert("결제 모듈이 로드되지 않았습니다.");

      return;
    }

    const orderName =
      paymentDoc.method || paymentDoc.service_type || paymentDoc.aircon_type
        ? `${
            paymentDoc.method ||
            paymentDoc.service_type ||
            paymentDoc.aircon_type
          } / ${requestId}`
        : `주문 ${requestId}`;

    const getNicePayMethod = (method) => {
      const methodMap = {
        card: "card",
        kakaopay: "kakaopay",
        naverpayCard: "naverpayCard",
        samsungpayCard: "samsungpayCard",
        payco: "payco",
      };
      return methodMap[method] || "card";
    };

    const mallReservedData = {
      frontendOrigin: window.location.origin,
      requestId: requestId,
      paymentMethod: paymentMethod,
    };

    const paymentRequestData = {
      clientId: "R2_7e78b8ceb1c04a68bb1b3f991a153f99",
      method: getNicePayMethod(paymentMethod),
      orderId: requestId,
      amount: amountObj.value,
      goodsName: orderName,
      buyerName: paymentDoc.customer_name || "구매자",
      buyerTel: paymentDoc.customer_phone || "010-0000-0000",
      buyerEmail: paymentDoc.customer_email || `${requestId}@coner.kr`,
      returnUrl: NICEPAY_CONFIG.returnUrl,
      mallReserved: JSON.stringify(mallReservedData),
      useCheckout: true,
    };

    addDebugLog("결제 요청 데이터", paymentRequestData);

    try {
      setPayBusy(true);
      setUiNote("결제창을 준비하고 있습니다...");

      const timeout = setTimeout(() => {
        setPayBusy(false);
        setUiNote("");
        alert("결제 처리 시간이 초과되었습니다. 다시 시도해주세요.");
      }, 30000);
      setPaymentTimeout(timeout);

      window.AUTHNICE.requestPay({
        ...paymentRequestData,
        fnSuccess: function (result) {
          clearTimeout(timeout);

          setPayBusy(true);
          setUiNote("결제 승인 처리 중입니다. 잠시만 기다려주세요...");
        },

        fnError: function (result) {
          clearTimeout(timeout);
          setPayBusy(false);
          setUiNote("");

          const errorMsg =
            result.ErrorMsg ||
            result.errorMsg ||
            result.message ||
            "알 수 없는 오류";
          const errorCode = result.ErrorCode || result.errorCode || result.code;
          if (errorMsg.includes("취소") || errorMsg.includes("cancel")) {
            return;
          }

          alert(`결제 오류: ${errorMsg}`);
        },

        fnClose: function (result) {
          clearTimeout(timeout);
          setPayBusy(false);
          setUiNote("");
        },
      });

      setUiNote("결제창이 열렸습니다. 결제를 진행해주세요.");
    } catch (error) {
      console.error("결제 요청 오류:", error);
      alert(`결제 요청 중 오류가 발생했습니다: ${error.message}`);
      setPayBusy(false);
      setUiNote("");
    }
  };

  const onPay = async () => {
    addDebugLog("결제 버튼 클릭", {
      payBusy,
      hasClientId,
      statusNum,
      amount: amountObj.value,
      paymentMethod,
      sdkLoaded,
    });

    if (payBusy) return;

    if (paymentMethod === "bank_transfer") {
      setShowAccountModal(true);
      addDebugLog("계좌이체 선택 - 모달 열기");
      return;
    }

    if (!hasClientId) {
      alert("NicePay 설정이 올바르지 않습니다.");
      return;
    }

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

    if (!sdkLoaded || !window.AUTHNICE) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    await requestNicePayment();
  };

  const getPaymentMethodName = (method) => {
    const methodNames = {
      card: "신용카드",
      kakaopay: "카카오페이",
      naverpayCard: "네이버페이",
      samsungpayCard: "삼성페이",
      payco: "페이코",
      bank_transfer: "계좌이체",
    };
    return methodNames[method] || method;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);

    if (method === "bank_transfer") {
      setShowAccountModal(true);
    }
  };

  const copyAccountNumber = async () => {
    const accountInfo = "신한은행 100-038-137730 서진형";
    try {
      await navigator.clipboard.writeText(accountInfo);
      alert("계좌번호가 복사되었습니다!");
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = accountInfo;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert("계좌번호가 복사되었습니다!");
      } catch (fallbackErr) {
        alert(`계좌번호: ${accountInfo}`);
      }
      document.body.removeChild(textArea);
    }
  };

  const closeAccountModal = () => setShowAccountModal(false);

  const payEnabled =
    hasClientId &&
    statusNum === STATUS.REQUESTED &&
    !payBusy &&
    sdkLoaded &&
    window.AUTHNICE;

  const disabledReason = !hasClientId
    ? "키 미설정"
    : statusNum !== STATUS.REQUESTED
    ? STATUS_MESSAGES[statusNum] || "결제 불가"
    : !sdkLoaded
    ? "모듈 로딩 중"
    : !window.AUTHNICE
    ? "SDK 오류"
    : payBusy
    ? "결제 진행 중"
    : "";

  if (!requestId || docLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
        <p>결제 정보를 불러오는 중...</p>
      </div>
    );
  }

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

          <div style={styles.amountBox}>
            <span>결제금액</span>
            <strong>{amountObj.value.toLocaleString()}원</strong>
          </div>

          {/* 결제 정보 */}
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
              <div style={styles.serviceNotice}>
                <strong>⚠️ 결제 보안 안내</strong>
                <br />
                코너에서 제공하는 본 결제페이지와 정해진 계좌번호로 이체하는 것
                외에는 결제하지 마시기 바랍니다.
                <br />
                <span style={{ fontWeight: "700", color: "#dc2626" }}>
                  안전한 결제를 위해 공식 결제창만 이용해 주시기 바랍니다.
                </span>
              </div>

              {/* 결제 수단 선택 */}
              <div style={styles.paymentMethodBox}>
                <h3 style={styles.paymentMethodTitle}>결제 수단 선택</h3>

                <div style={styles.paymentMethodSection}>
                  <div style={styles.paymentMethods}>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "card"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() => handlePaymentMethodChange("card")}
                    >
                      신용카드
                    </button>
                  </div>
                </div>

                <div style={styles.paymentMethodSection}>
                  <div style={styles.paymentMethods}>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "bank_transfer"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() => handlePaymentMethodChange("bank_transfer")}
                    >
                      계좌이체
                    </button>
                  </div>
                </div>

                <div style={styles.paymentMethodSection}>
                  <div style={styles.paymentMethods}>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "kakaopay"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() => handlePaymentMethodChange("kakaopay")}
                    >
                      카카오페이
                    </button>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "naverpayCard"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() => handlePaymentMethodChange("naverpayCard")}
                    >
                      네이버페이
                    </button>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "samsungpayCard"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() =>
                        handlePaymentMethodChange("samsungpayCard")
                      }
                    >
                      삼성페이
                    </button>
                    <button
                      style={{
                        ...styles.paymentMethodBtn,
                        ...(paymentMethod === "payco"
                          ? styles.paymentMethodActive
                          : {}),
                      }}
                      onClick={() => handlePaymentMethodChange("payco")}
                    >
                      페이코
                    </button>
                  </div>
                </div>
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
                : paymentMethod === "bank_transfer"
                ? "계좌번호 확인하기"
                : `${getPaymentMethodName(paymentMethod)}로 결제하기`
              : `결제불가 (${disabledReason})`}
          </button>
        </div>
      </div>

      {/* 계좌번호 모달 */}
      <Modal
        open={showAccountModal}
        onClose={closeAccountModal}
        title="계좌이체 안내"
        width={480}
        containerId="rightbox-modal-root"
        footer={
          <button
            onClick={closeAccountModal}
            style={{
              width: "100%",
              height: "48px",
              background: "#004FFF",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            확인했습니다
          </button>
        }
      >
        <div style={styles.accountInfo}>
          <div style={styles.accountLabel}>입금 계좌번호</div>
          <div style={styles.accountDetails}>
            <div style={styles.bankName}>신한은행</div>
            <div style={styles.accountNumber}>100-038-137730</div>
            <div style={styles.accountHolder}>서진형</div>
          </div>
          <button style={styles.copyBtn} onClick={copyAccountNumber}>
            계좌번호 복사
          </button>
        </div>

        <div style={styles.transferNotice}>
          <h4 style={styles.noticeTitle}>⚠️ 이체 시 주의사항</h4>
          <ul style={styles.noticeList}>
            <li>입금자명에 전화번호뒷자리를 포함해주세요</li>
          </ul>
        </div>
      </Modal>

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
          {payEnabled
            ? payBusy
              ? "처리 중..."
              : paymentMethod === "bank_transfer"
              ? "계좌번호"
              : `${getPaymentMethodName(paymentMethod).split(" ")[0]}결제`
            : "결제 불가"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#fafcff" },
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
  debugBox: {
    background: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "12px",
  },
  debugSummary: {
    padding: "8px 12px",
    cursor: "pointer",
    background: "#e9ecef",
    margin: "0",
    fontWeight: "500",
    color: "#495057",
  },
  debugContent: { padding: "8px 12px", maxHeight: "300px", overflowY: "auto" },
  debugSection: {
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #eee",
  },
  debugLog: {
    marginBottom: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #eee",
  },
  debugData: {
    background: "#f1f3f4",
    padding: "4px 8px",
    borderRadius: "4px",
    marginTop: "4px",
    fontSize: "10px",
    overflow: "auto",
  },
  title: { margin: "0", fontSize: "22px", color: "#0f172a", fontWeight: "800" },
  subTitle: { margin: "4px 0 16px", color: "#64748b", fontSize: "14px" },
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
  serviceNotice: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "14px",
    fontSize: "14px",
    textAlign: "left",
  },
  paymentMethodBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  paymentMethodTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#0f172a",
  },
  paymentMethodSection: { marginBottom: "16px" },
  paymentMethods: { display: "flex", gap: "8px", flexWrap: "wrap" },
  paymentMethodBtn: {
    flex: "1",
    minWidth: "100px",
    padding: "10px 6px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
    color: "#333",
  },
  paymentMethodActive: {
    border: "2px solid #3b82f6",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  notAvailableBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    color: "#991b1b",
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
    background: "#004FFF",
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
  errorIcon: { fontSize: "48px", marginBottom: "16px" },
  errorText: { color: "#dc2626", marginBottom: "20px" },
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
  stickyInfo: { display: "flex", flexDirection: "column" },
  stickyLabel: { fontSize: "12px", color: "#64748b" },
  stickyAmount: { fontSize: "18px" },
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
    background: "#004FFF",
    boxShadow: "0 6px 14px rgba(47, 128, 237, 0.25)",
  },
  stickyBtnDisabled: {
    color: "#475569",
    background: "linear-gradient(180deg, #bfd8ff, #a7c9ff)",
    cursor: "not-allowed",
  },
  accountInfo: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    textAlign: "center",
  },
  accountLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "12px",
    fontWeight: "500",
  },
  accountDetails: { marginBottom: "16px" },
  bankName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "4px",
  },
  accountNumber: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#004FFF",
    marginBottom: "4px",
    letterSpacing: "1px",
  },
  accountHolder: { fontSize: "16px", color: "#475569", fontWeight: "500" },
  copyBtn: {
    background: "#004FFF",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  transferNotice: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  noticeTitle: {
    margin: "0 0 12px 0",
    fontSize: "15px",
    fontWeight: "600",
    color: "#9a3412",
  },
  noticeList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "14px",
    color: "#9a3412",
    lineHeight: "1.6",
  },
};
