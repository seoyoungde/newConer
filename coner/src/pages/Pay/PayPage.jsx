import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import styled from "styled-components";

const STATUS = {
  CANCELED: 0,
  REQUESTED: 1,
  PAID: 2,
  FEE_PENDING: 3,
  FEE_DONE: 4,
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

  const amountObj = useMemo(
    () => ({ currency: "KRW", value: parseAmountToNumber(paymentDoc?.amount) }),
    [paymentDoc?.amount]
  );
  const statusNum = useMemo(
    () => (paymentDoc?.status == null ? undefined : Number(paymentDoc.status)),
    [paymentDoc?.status]
  );

  // Toss Widgets refs
  const widgetsRef = useRef(null);
  const pmRef = useRef(null);
  const agRef = useRef(null);
  const lastKeyRef = useRef(null);

  const [widgetReady, setWidgetReady] = useState(false);
  const [uiNote, setUiNote] = useState("");
  const [payBusy, setPayBusy] = useState(false); // 이중 클릭 방지

  const envKey = String(import.meta.env.VITE_TOSS_CLIENT_KEY || "");
  const hasClientKey = !!envKey.trim();

  // 결제 문서 구독
  useEffect(() => {
    if (!requestId) return;
    const unsub = onSnapshot(doc(db, "Payment", requestId), (snap) => {
      setDocLoading(false);
      if (!snap.exists()) {
        setPaymentDoc(null);
        return;
      }
      setPaymentDoc(snap.data());
    });
    return () => unsub();
  }, [requestId]);

  // TossPayments 초기화
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWidgetReady(false);
      if (!requestId) return;

      if (!hasClientKey) {
        setUiNote("승인 대기: 키가 없어 버튼이 비활성 상태입니다.");
        return;
      }

      // 동일 키로 이미 초기화된 경우 재초기화 불필요
      if (widgetsRef.current && lastKeyRef.current === envKey) {
        setUiNote("");
        return;
      }

      // 기존 인스턴스 정리
      try {
        await pmRef.current?.destroy();
      } catch {}
      try {
        await agRef.current?.destroy();
      } catch {}
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
        setUiNote("결제 모듈 초기화 실패. 클라이언트 키를 확인하세요.");
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try {
          await pmRef.current?.destroy();
        } catch {}
        try {
          await agRef.current?.destroy();
        } catch {}
        pmRef.current = null;
        agRef.current = null;
        widgetsRef.current = null;
        setWidgetReady(false);
      })();
    };
  }, [requestId, hasClientKey, envKey]);

  // 결제수단/약관 렌더
  useEffect(() => {
    const widgets = widgetsRef.current;
    if (!widgets) return;
    if (!requestId || !paymentDoc) return;

    if (statusNum !== STATUS.REQUESTED) {
      (async () => {
        try {
          await pmRef.current?.destroy();
        } catch {}
        try {
          await agRef.current?.destroy();
        } catch {}
        pmRef.current = null;
        agRef.current = null;
        setWidgetReady(false);
      })();
      return;
    }

    if (!amountObj.value || amountObj.value <= 0) {
      setUiNote("결제 금액이 잘못되었습니다.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // 금액 반영
        await widgets.setAmount(amountObj);

        // 기존 위젯 파기
        if (pmRef.current) {
          await pmRef.current.destroy();
          pmRef.current = null;
        }
        if (agRef.current) {
          await agRef.current.destroy();
          agRef.current = null;
        }

        // 최초 렌더 시 금액/스킨 명시 (간편결제/계좌이체/가상계좌 노출 안정화)
        pmRef.current = await widgets.renderPaymentMethods({
          selector: "#payment-method",
          // variantKey는 옵션이지만, 없애도 무방합니다. (남겨두고 싶으면 아래 주석 해제)
          // variantKey: "DEFAULT",
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
          setUiNote("결제 위젯 렌더링 실패");
        }
      }
    })();
    return () => {
      cancelled = true;
      setWidgetReady(false);
    };
  }, [requestId, paymentDoc, amountObj.value, statusNum]);

  // 결제 버튼
  const onPay = async () => {
    if (payBusy) return; // 이중 클릭 방지
    const widgets = widgetsRef.current;
    if (!widgets || !paymentDoc || !requestId) return;

    if (statusNum !== STATUS.REQUESTED) {
      alert("현재 상태에서는 결제를 진행할 수 없습니다.");
      return;
    }
    if (!amountObj.value || amountObj.value <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    const orderId = `order_${requestId}_${Date.now()}`;
    const orderName = paymentDoc.method
      ? `${paymentDoc.method} / ${requestId}`
      : `주문 ${requestId}`;

    try {
      setPayBusy(true);
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/pay/success/${requestId}`,
        failUrl: `${window.location.origin}/pay/fail/${requestId}`,
      });
    } catch (e) {
      console.error("[Toss requestPayment error]", e);
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setPayBusy(false);
    }
  };

  // 버튼 상태
  const payEnabled =
    hasClientKey && statusNum === STATUS.REQUESTED && widgetReady && !payBusy;

  const disabledReason = !hasClientKey
    ? "키 미설정"
    : statusNum !== STATUS.REQUESTED
    ? "결제 불가"
    : !widgetReady
    ? "모듈 준비 중"
    : payBusy
    ? "결제 진행 중"
    : "";

  if (!requestId || docLoading)
    return <Loading>결제 정보를 불러오는 중...</Loading>;
  if (!paymentDoc) return <Loading>결제 정보를 찾을 수 없습니다.</Loading>;

  return (
    <>
      <Shell>
        <Card>
          <Title>Coner 결제</Title>
          <SubTitle>주문 ID {requestId}</SubTitle>

          <AmountBox>
            <span>결제금액</span>
            <strong>{amountObj.value.toLocaleString()}원</strong>
          </AmountBox>

          {uiNote && <Note>{uiNote}</Note>}
          <Note
            style={{
              background: "#F8FBFF",
              color: "#0F172A",
              border: "1px solid #E5EAF0",
            }}
          >
            <strong>안내</strong>
            <br />
            · 애플페이는 iOS/Safari 및 등록 카드가 있을 때 노출됩니다.
            <br />
            · 삼성페이는 삼성 기기/브라우저에서만 노출됩니다.
            <br />· 가상계좌는 결제 후 <u>입금 완료 시 자동 반영</u>됩니다.
          </Note>

          <WidgetBox id="payment-method">
            {!hasClientKey && <em>승인 후 결제수단이 표시됩니다.</em>}
          </WidgetBox>
          <WidgetBox id="agreement">
            {!hasClientKey && <em>승인 후 약관 영역이 표시됩니다.</em>}
          </WidgetBox>

          <Button disabled={!payEnabled} onClick={onPay} title={disabledReason}>
            {payEnabled
              ? payBusy
                ? "처리 중..."
                : "결제하기"
              : `결제하기 (${disabledReason})`}
          </Button>
        </Card>
      </Shell>

      {/* 모바일 하단 고정 결제바 */}
      <StickyBar role="region" aria-label="바닥 고정 결제 바">
        <StickyInfo>
          <span className="label">결제금액</span>
          <strong className="amount">
            {amountObj.value.toLocaleString()}원
          </strong>
        </StickyInfo>
        <StickyBtn
          disabled={!payEnabled}
          onClick={payEnabled ? onPay : undefined}
          aria-label={
            payEnabled ? "결제하기" : `결제 비활성: ${disabledReason}`
          }
        >
          {payEnabled ? (payBusy ? "처리 중..." : "결제하기") : "결제 준비중"}
        </StickyBtn>
      </StickyBar>
    </>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafcff;
  padding: 10px 0px;
`;

const Card = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 10px;
  text-align: center;
  margin-bottom: 100px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  color: #0f172a;
  font-weight: 800;
`;

const SubTitle = styled.p`
  margin: 4px 0 16px;
  color: #64748b;
  font-size: 14px;
`;

const AmountBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f7ff;
  border: 1px solid #e0ebff;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  span {
    color: #475569;
    font-size: 14px;
  }
  strong {
    font-size: 20px;
    color: #1e40af;
  }
`;

const Note = styled.div`
  background: #fff4f4;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 14px;
  font-size: 14px;
`;

const WidgetBox = styled.div`
  min-height: 100px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  margin-bottom: 12px;
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) =>
    p.disabled ? "#E2E8F0" : "linear-gradient(90deg,#2F80ED,#56CCF2)"};
  color: ${(p) => (p.disabled ? "#94A3B8" : "#fff")};
  box-shadow: ${(p) =>
    p.disabled ? "none" : "0 4px 12px rgba(47,128,237,0.3)"};
`;

/* 로딩 상태 표시용 */
const Loading = styled.div`
  text-align: center;
  color: #64748b;
  padding: 40px;
`;

// Sticky bottom bar (mobile)
const StickyBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(8px);
  border-top: 1px solid #e5eaf0;
  box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.06);
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 50;
  @media (max-width: 520px) {
    display: flex;
  }
`;
const StickyInfo = styled.div`
  display: flex;
  flex-direction: column;
  .label {
    font-size: 12px;
    color: #64748b;
  }
  .amount {
    font-size: 18px;
  }
`;
const StickyBtn = styled.button`
  margin-left: auto;
  height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  border: none;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg, #2f80ed 0%, #4fa1ff 100%);
  box-shadow: 0 6px 14px rgba(47, 128, 237, 0.25);
  &:disabled {
    color: #475569;
    background: linear-gradient(180deg, #bfd8ff, #a7c9ff);
    cursor: not-allowed;
    box-shadow: none;
  }
`;
