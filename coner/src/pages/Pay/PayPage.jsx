// PayPage.js - NicePay tid 오류 수정 버전
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

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

  const nicepayClientId = "S2_defdb5cbf69b4adc81e4b09e90c23bdb";
  const hasClientId = !!nicepayClientId?.trim();

  // Firebase에서 결제 정보 실시간 구독
  useEffect(() => {
    if (!requestId) {
      setDocLoading(false);
      setFirebaseError("결제 ID가 없습니다.");
      addDebugLog("❌ Error: 결제 ID가 없습니다");
      return;
    }

    addDebugLog("🔄 Firebase 데이터 로딩 시작", { requestId });
    setDocLoading(true);
    setFirebaseError("");

    const unsubscribe = onSnapshot(
      doc(db, "Payment", requestId),
      (docSnapshot) => {
        setDocLoading(false);

        if (!docSnapshot.exists()) {
          setPaymentDoc(null);
          setFirebaseError("결제 정보를 찾을 수 없습니다.");
          addDebugLog("❌ Firebase Error: 결제 정보 없음");
          return;
        }

        const data = docSnapshot.data();
        setPaymentDoc(data);
        setFirebaseError("");

        addDebugLog("✅ Firebase 데이터 로드 성공", data);
        addDebugLog("💰 결제 금액 파싱", {
          원본: data.amount,
          파싱결과: parseAmountToNumber(data.amount),
        });
      },
      (error) => {
        setDocLoading(false);
        setFirebaseError(
          "결제 정보 로딩 중 오류가 발생했습니다: " + error.message
        );
        addDebugLog("❌ Firebase 구독 오류", error);
      }
    );

    return () => unsubscribe();
  }, [requestId]);

  // NicePay SDK 로드 - 강화된 버전
  useEffect(() => {
    const loadNicePayScript = () => {
      return new Promise((resolve, reject) => {
        // 1. 이미 로드된 경우 체크
        if (
          window.AUTHNICE &&
          typeof window.AUTHNICE.requestPay === "function"
        ) {
          addDebugLog("✅ NicePay SDK 이미 로드됨");
          setSdkLoaded(true);
          resolve();
          return;
        }

        // 2. 기존 스크립트들을 모두 제거
        const existingScripts = document.querySelectorAll(
          'script[src*="nicepay"], script[src*="pay.nicepay"]'
        );
        existingScripts.forEach((script) => {
          addDebugLog("🗑️ 기존 스크립트 제거", { src: script.src });
          script.remove();
        });

        // 3. AUTHNICE 객체도 초기화
        if (window.AUTHNICE) {
          addDebugLog("🗑️ 기존 AUTHNICE 객체 제거");
          delete window.AUTHNICE;
        }

        addDebugLog("🔄 NicePay SDK 새로 로딩 시작");

        // 4. 메인 SDK URL (공식 문서 기준)
        const mainSdkUrl = "https://pay.nicepay.co.kr/v1/js/";

        const script = document.createElement("script");
        script.src = mainSdkUrl;
        script.type = "text/javascript";
        script.charset = "utf-8";
        script.async = false; // 동기 로딩
        script.defer = false;

        let timeoutId;
        let retryCount = 0;
        const maxRetries = 3;

        const checkAuthNice = (attempts = 0) => {
          addDebugLog(`🔍 AUTHNICE 확인 시도 ${attempts + 1}/30`);

          // 여러 가능한 객체명 확인
          const possibleNames = [
            "AUTHNICE",
            "authnice",
            "NicePay",
            "nicePay",
            "NICEPAY",
          ];
          let foundObject = null;

          for (const name of possibleNames) {
            if (window[name] && typeof window[name] === "object") {
              foundObject = window[name];
              addDebugLog(`✅ ${name} 객체 발견`, {
                타입: typeof foundObject,
                메소드들: Object.keys(foundObject),
                requestPay존재: typeof foundObject.requestPay === "function",
              });

              // AUTHNICE로 통일
              if (name !== "AUTHNICE") {
                window.AUTHNICE = foundObject;
              }
              break;
            }
          }

          if (foundObject && typeof foundObject.requestPay === "function") {
            addDebugLog("✅ requestPay 메소드 확인됨");
            setSdkLoaded(true);
            clearTimeout(timeoutId);
            resolve();
          } else if (attempts < 30) {
            setTimeout(() => checkAuthNice(attempts + 1), 200);
          } else {
            addDebugLog("❌ AUTHNICE 객체 타임아웃");
            clearTimeout(timeoutId);

            // 재시도 로직
            if (retryCount < maxRetries) {
              retryCount++;
              addDebugLog(`🔄 SDK 로딩 재시도 ${retryCount}/${maxRetries}`);
              setTimeout(() => {
                script.remove();
                loadNicePayScript().then(resolve).catch(reject);
              }, 1000 * retryCount);
            } else {
              reject(new Error("AUTHNICE 객체 로딩 최종 실패"));
            }
          }
        };

        script.onload = () => {
          addDebugLog("✅ 스크립트 로드 완료", { src: mainSdkUrl });

          // 로드 후 잠시 대기 후 체크 시작
          setTimeout(() => checkAuthNice(), 100);
        };

        script.onerror = (error) => {
          addDebugLog("❌ 스크립트 로드 실패", {
            src: mainSdkUrl,
            error: error,
            retryCount,
          });

          clearTimeout(timeoutId);

          // 재시도 로직
          if (retryCount < maxRetries) {
            retryCount++;
            addDebugLog(`🔄 SDK 로딩 재시도 ${retryCount}/${maxRetries}`);
            setTimeout(() => {
              script.remove();
              loadNicePayScript().then(resolve).catch(reject);
            }, 2000 * retryCount);
          } else {
            reject(new Error("스크립트 로딩 최종 실패"));
          }
        };

        // 전체 타임아웃 (10초)
        timeoutId = setTimeout(() => {
          addDebugLog("❌ 전체 로딩 타임아웃");
          script.remove();
          reject(new Error("SDK 로딩 타임아웃"));
        }, 10000);

        document.head.appendChild(script);
      });
    };

    if (hasClientId) {
      loadNicePayScript()
        .then(() => {
          addDebugLog("🎉 SDK 로드 최종 성공");
          setUiNote("");
        })
        .catch((error) => {
          addDebugLog("❌ SDK 로드 최종 실패", error);
          setUiNote(`결제 모듈 로드 실패: ${error.message}`);
          setSdkLoaded(false);
        });
    } else {
      setUiNote("NicePay 클라이언트 ID가 설정되지 않았습니다.");
    }
  }, [hasClientId]);

  // 페이지를 떠날 때 cleanup
  useEffect(() => {
    return () => {
      const scripts = document.querySelectorAll(
        'script[src*="nicepay"], script[src*="pay.nicepay"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  // NicePay 결제 요청
  const requestNicePayment = async () => {
    if (!window.AUTHNICE) {
      alert("결제 모듈이 로드되지 않았습니다.");
      addDebugLog("❌ AUTHNICE 객체 없음");
      return;
    }

    if (!window.AUTHNICE.requestPay) {
      alert("결제 기능을 사용할 수 없습니다.");
      addDebugLog("❌ requestPay 메소드 없음", {
        AUTHNICE: window.AUTHNICE,
        메소드들: Object.keys(window.AUTHNICE),
      });
      return;
    }

    addDebugLog("🔍 AUTHNICE 객체 확인", {
      AUTHNICE존재: !!window.AUTHNICE,
      타입: typeof window.AUTHNICE,
      메소드들: Object.keys(window.AUTHNICE || {}),
      requestPay타입: typeof window.AUTHNICE.requestPay,
    });

    const orderName =
      paymentDoc.method || paymentDoc.service_type || paymentDoc.aircon_type
        ? `${
            paymentDoc.method ||
            paymentDoc.service_type ||
            paymentDoc.aircon_type
          } / ${requestId}`
        : `주문 ${requestId}`;

    // 나이스페이 결제 수단 매핑
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

    // 결제 요청 데이터 구성 - 수정된 부분
    const paymentRequestData = {
      clientId: "S2_defdb5cbf69b4adc81e4b09e90c23bdb",
      method: getNicePayMethod(paymentMethod),
      orderId: requestId,
      amount: amountObj.value,
      goodsName: orderName,
      buyerName: paymentDoc.customer_name || "구매자",
      buyerTel: paymentDoc.customer_phone || "010-0000-0000",
      buyerEmail: paymentDoc.customer_email || "test@test.com",
      returnUrl: "https://api.coner.kr/payment/serverAuth",
      // mallReserved를 간단하게 변경 (혹시 파싱 문제일 수 있음)
      mallReserved: requestId, // 일단 간단하게 requestId만
    };

    addDebugLog("🚀 결제 요청 시작", {
      paymentRequestData,
      paymentDoc,
      현재상태: statusNum,
      상태메시지: STATUS_MESSAGES[statusNum],
    });

    try {
      setPayBusy(true);
      setUiNote("결제창을 준비하고 있습니다...");

      addDebugLog("🎯 AUTHNICE.requestPay 호출 직전", {
        함수존재: typeof window.AUTHNICE.requestPay === "function",
        파라미터: paymentRequestData,
      });

      // NicePay에 전송되는 실제 파라미터 상세 로깅
      const actualRequestParams = {
        clientId: paymentRequestData.clientId,
        method: paymentRequestData.method,
        orderId: paymentRequestData.orderId,
        amount: paymentRequestData.amount,
        goodsName: paymentRequestData.goodsName,
        buyerName: paymentRequestData.buyerName,
        buyerTel: paymentRequestData.buyerTel,
        buyerEmail: paymentRequestData.buyerEmail,
        returnUrl: paymentRequestData.returnUrl,
        mallReserved: paymentRequestData.mallReserved,
      };

      console.log("======= NICEPAY로 전송되는 모든 파라미터 =======");
      console.log("전송 시간:", new Date().toISOString());
      console.log("파라미터 개수:", Object.keys(actualRequestParams).length);
      console.log("");

      // 각 파라미터별 상세 정보
      Object.entries(actualRequestParams).forEach(([key, value]) => {
        console.log(`${key}:`, {
          값: value,
          타입: typeof value,
          길이: typeof value === "string" ? value.length : "N/A",
          비어있음: !value,
        });
      });

      console.log("");
      console.log("전체 파라미터 JSON:");
      console.log(JSON.stringify(actualRequestParams, null, 2));
      console.log("==============================================");

      addDebugLog("📤 NicePay로 전송하는 전체 파라미터", actualRequestParams);

      // NicePay 결제창 호출
      const requestResult = window.AUTHNICE.requestPay({
        clientId: paymentRequestData.clientId,
        method: paymentRequestData.method,
        orderId: paymentRequestData.orderId,
        amount: paymentRequestData.amount,
        goodsName: paymentRequestData.goodsName,
        buyerName: paymentRequestData.buyerName,
        buyerTel: paymentRequestData.buyerTel,
        buyerEmail: paymentRequestData.buyerEmail,
        returnUrl: paymentRequestData.returnUrl,
        mallReserved: paymentRequestData.mallReserved,

        // 성공 콜백 - 결제창에서 승인 완료 시 수정된 부분
        fnSuccess: function (result) {
          addDebugLog("🎉 fnSuccess 콜백 호출됨", result);

          // tid 정보 확인 및 로깅
          const tid = result.tid || result.TID || result.transactionId;
          addDebugLog("🔍 tid 정보 확인", {
            result: result,
            tid: tid,
            resultKeys: Object.keys(result),
          });

          if (tid) {
            addDebugLog("✅ tid 발견됨", { tid });
            // tid를 로컬 스토리지나 세션에 저장 (선택사항)
            try {
              sessionStorage.setItem(`payment_tid_${requestId}`, tid);
              addDebugLog("💾 tid 세션 저장 완료", { requestId, tid });
            } catch (e) {
              addDebugLog("⚠️ tid 저장 실패", e);
            }
          } else {
            addDebugLog("⚠️ tid를 찾을 수 없음", result);
          }

          addDebugLog("✅ 결제창 완료 - 중간 페이지에서 승인 처리됨");
          setUiNote("결제 완료! 승인 처리 중입니다...");

          // 결제 완료 후 추가 처리가 필요한 경우
          // 예: 서버에 추가 정보 전송
          if (tid) {
            // 서버에 tid 정보를 별도로 전송할 수도 있음
            addDebugLog("🌐 서버에 tid 정보 전송 고려", { tid, requestId });
          }
        },

        // 에러 콜백 - 수정된 부분
        fnError: function (result) {
          addDebugLog("❌ fnError 콜백 호출됨", result);
          setPayBusy(false);
          setUiNote("");

          const errorMsg =
            result.ErrorMsg ||
            result.errorMsg ||
            result.message ||
            "알 수 없는 오류가 발생했습니다";

          const errorCode = result.ErrorCode || result.errorCode || result.code;

          alert(
            `결제 오류: ${errorMsg}${errorCode ? ` (코드: ${errorCode})` : ""}`
          );

          // 에러 상세 정보 로깅 - 더 자세히
          addDebugLog("❌ 결제 에러 상세", {
            전체결과: result,
            에러메시지: errorMsg,
            에러코드: errorCode,
            resultKeys: Object.keys(result),
            tid: result.tid || result.TID,
          });
        },

        // 결제창 닫힘 콜백 - 수정된 부분
        fnClose: function (result) {
          addDebugLog("🚪 fnClose 콜백 호출됨", result);
          setPayBusy(false);
          setUiNote("");

          // tid 확인
          const tid = result?.tid || result?.TID;
          if (tid) {
            addDebugLog("ℹ️ 결제창 닫힘 - tid 포함", { tid, result });
          } else {
            addDebugLog("ℹ️ 결제창 닫힘 - tid 없음", result);
          }

          // 결제창이 닫혔지만 에러가 아닐 수 있음
          if (result && (result.ErrorCode || result.errorCode)) {
            addDebugLog("❌ 결제창 닫힘 - 에러 포함", result);
          } else {
            addDebugLog("ℹ️ 결제창 닫힘 - 사용자 취소");
          }
        },

        // 결제 취소 콜백
        fnCancel: function (result) {
          addDebugLog("❌ fnCancel 콜백 호출됨", result);
          setPayBusy(false);
          setUiNote("");

          addDebugLog("ℹ️ 사용자가 결제를 취소했습니다", result);
        },
      });

      addDebugLog("✅ AUTHNICE.requestPay 호출 완료", {
        반환값: requestResult,
        반환타입: typeof requestResult,
      });

      // 결제창 호출 후 UI 메시지 설정
      setUiNote("결제창이 열렸습니다. 결제를 진행해주세요.");
    } catch (error) {
      addDebugLog("❌ 결제 요청 예외 발생", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      console.error("결제 요청 오류:", error);
      alert("결제 요청 중 오류가 발생했습니다: " + error.message);
      setPayBusy(false);
      setUiNote("");
    }
  };

  // 결제 요청
  const onPay = async () => {
    addDebugLog("🎯 결제 버튼 클릭", {
      payBusy,
      hasClientId,
      statusNum,
      amount: amountObj.value,
      paymentMethod,
      sdkLoaded,
    });

    if (payBusy) return;

    if (!hasClientId) {
      alert("NicePay 설정이 올바르지 않습니다.");
      addDebugLog("❌ NicePay 클라이언트 ID 없음");
      return;
    }

    if (statusNum !== STATUS.REQUESTED) {
      alert(
        `현재 상태에서는 결제를 진행할 수 없습니다. (${STATUS_MESSAGES[statusNum]})`
      );
      addDebugLog("❌ 결제 상태 불일치", {
        현재상태: statusNum,
        필요상태: STATUS.REQUESTED,
      });
      return;
    }

    if (!amountObj.value || amountObj.value <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      addDebugLog("❌ 결제 금액 오류", { amount: amountObj.value });
      return;
    }

    if (!sdkLoaded) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      addDebugLog("❌ SDK 미로드 상태");
      return;
    }

    await requestNicePayment();
  };

  // 수동 SDK 재로드 버튼
  const reloadSDK = () => {
    addDebugLog("🔄 수동 SDK 재로드 시작");
    setSdkLoaded(false);
    setUiNote("SDK 재로드 중...");

    // 컴포넌트 재마운트를 통한 SDK 재로드
    window.location.reload();
  };

  // 결제 수단별 이름 매핑
  const getPaymentMethodName = (method) => {
    const methodNames = {
      card: "신용카드",
      kakaopay: "카카오페이",
      naverpayCard: "네이버페이",
      samsungpayCard: "삼성페이",
      payco: "페이코",
    };
    return methodNames[method] || method;
  };

  // 결제 수단 변경
  const handlePaymentMethodChange = (method) => {
    addDebugLog("💳 결제 수단 변경", { 이전: paymentMethod, 변경후: method });
    setPaymentMethod(method);
  };

  // 버튼 상태 계산
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

          {/* SDK 상태 표시 */}
          <div
            style={{
              ...styles.statusBox,
              ...(sdkLoaded ? styles.statusActive : styles.statusInactive),
            }}
          >
            SDK 상태: {sdkLoaded ? "✅ 로드 완료" : "❌ 로드 중/실패"}
            {!sdkLoaded && (
              <button style={styles.reloadButton} onClick={reloadSDK}>
                재로드
              </button>
            )}
          </div>

          {/* 디버깅 로그 표시 */}
          <div style={styles.debugBox}>
            <details>
              <summary style={styles.debugSummary}>
                🔍 디버깅 로그 ({debugLogs.length}개)
              </summary>
              <div style={styles.debugContent}>
                {debugLogs.slice(-15).map((log, index) => (
                  <div key={index} style={styles.debugLog}>
                    <div>{log.message}</div>
                    {log.data && (
                      <pre style={styles.debugData}>
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>

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
                <strong>결제 안내 (테스트 모드)</strong>
                <br />
                · 현재 나이스페이 테스트 키를 사용 중입니다.
                <br />
                · 카카오페이, 네이버페이, 삼성페이, 페이코 등 간편결제 지원
                <br />
                · 테스트 결제는 23:30에 자동 취소됩니다.
                <br />· 안전한 결제를 위해 NicePay 결제창이 새창으로 열립니다.
              </div>

              <div style={styles.serviceNotice}>
                <strong>⚠️ 결제 보안 안내</strong>
                <br />
                코너에서 제공하는 본 결제페이지와 정해진 계좌번호로 이체하는 것
                외에는 결제하지 마시기 바랍니다.
                <br />
                기사님이나 제3자가 요청하는 다른 결제수단으로는 절대 결제하지
                마세요.
                <br />
                <span style={{ fontWeight: "700", color: "#dc2626" }}>
                  안전한 결제를 위해 공식 결제창만 이용해 주시기 바랍니다.
                </span>
              </div>

              {/* NicePay 결제 수단 선택 */}
              <div style={styles.paymentMethodBox}>
                <h3 style={styles.paymentMethodTitle}>결제 수단 선택</h3>

                {/* 기본 결제 수단 */}
                <div style={styles.paymentMethodSection}>
                  <h4 style={styles.paymentMethodSectionTitle}>💳 일반 결제</h4>
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

                {/* 간편 결제 */}
                <div style={styles.paymentMethodSection}>
                  <h4 style={styles.paymentMethodSectionTitle}>📱 간편 결제</h4>
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
                : `${getPaymentMethodName(paymentMethod)}로 결제하기`
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
          {payEnabled
            ? payBusy
              ? "처리 중..."
              : `${getPaymentMethodName(paymentMethod).split(" ")[1]}로 결제`
            : "결제 불가"}
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
  debugContent: {
    padding: "8px 12px",
    maxHeight: "200px",
    overflowY: "auto",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  reloadButton: {
    padding: "4px 8px",
    fontSize: "12px",
    border: "1px solid #dc2626",
    borderRadius: "4px",
    background: "#fff",
    color: "#dc2626",
    cursor: "pointer",
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
  paymentMethodSection: {
    marginBottom: "16px",
  },
  paymentMethodSectionTitle: {
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 0 8px 0",
    color: "#64748b",
  },
  paymentMethods: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
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
