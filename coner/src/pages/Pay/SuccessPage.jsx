import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

/**
 * 🔐 서버 Confirm API 안내
 *
 * - 결제 성공 리다이렉트 시 Toss에서 쿼리로 paymentKey, orderId를 넘겨줍니다.
 * - 클라이언트는 절대 금액/상태를 확정하지 말고, 반드시 "서버"에 Confirm을 요청해야 합니다.
 *   (서버는 Firestore 금액/상태 검증 → Toss Confirm API 호출 → DB 상태를 PAID로 업데이트)
 *
 * ✅ 이 파일에서는 아래 fetch(`${API_BASE}/api/payments/confirm`, ...) 부분이 바로 그 위치입니다.
 *    서버가 아직 없다면, 해당 fetch 호출은 404가 날 수 있으니, 그 경우를 잡아 사용자에게
 *    "가상계좌이면 입금 완료 후 반영됩니다" 같은 안내를 보여주도록 했습니다.
 *
 * 서버 구현 참고:
 *  - 라우트: POST /api/payments/confirm
 *  - 바디: { paymentKey, orderId, requestId }
 *  - 응답 OK 예시: { ok: true, payment: { method: "CARD" | "VIRTUAL_ACCOUNT" | ... } }
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function SuccessPage() {
  const { requestId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");

  const [state, setState] = useState({
    loading: true,
    ok: false,
    error: "",
    payment: null,
    hint: "", // UX 안내 문구(가상계좌/서버미구현 등)
  });

  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        if (!paymentKey || !orderId || !requestId) {
          throw new Error("필수 파라미터 누락");
        }

        // 서버 환경이 아직 없거나 API_BASE 미설정이면 안내만 띄우고 종료
        if (!API_BASE) {
          setState({
            loading: false,
            ok: false,
            error: "서버 설정(API_BASE)이 없습니다.",
            payment: null,
            hint: "가상계좌 결제라면 입금 완료 후 자동 반영됩니다. 서버 Confirm API를 연결하면 이 화면에서 즉시 반영돼요.",
          });
          return;
        }

        /**
         * 👇 여기서 서버 Confirm API를 호출합니다.
         * 서버에서는 Firestore의 payments/{requestId} 문서를 읽어 금액/상태를 검증한 뒤,
         * Toss Confirm API를 (서버 시크릿키로) 호출하여 최종 승인합니다.
         * - 상태 대기(REQUESTED)만 승인, 이미 완료(PAID)는 멱등 성공, 그 외는 거절.
         */
        const resp = await fetch(`${API_BASE}/api/payments/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, requestId }),
        });

        const data = await resp.json().catch(() => ({}));

        // 서버에서 표준 형태로 { ok: true }를 주는 것을 기대합니다.
        if (!resp.ok || !data.ok) {
          // Toss/서버 에러 메시지 우선 표시
          const msg =
            data?.error ||
            data?.message ||
            (resp.status === 404
              ? "승인 API를 찾을 수 없습니다(서버 미구현)."
              : `승인 실패 (${resp.status})`);

          // 가상계좌라면 입금 대기/웹훅 반영을 힌트로 안내
          const hint =
            data?.details?.method === "VIRTUAL_ACCOUNT" ||
            /virtual/i.test(String(data?.method || ""))
              ? "가상계좌는 입금 완료 후 자동 반영됩니다. 잠시 후 결제 페이지에서 상태를 확인하세요."
              : "오류가 계속되면 결제 페이지에서 다시 시도해주세요.";

          throw new Error(`${msg}`);
        }

        if (!aborted) {
          setState({
            loading: false,
            ok: true,
            error: "",
            payment: data.payment || null,
            hint:
              (data.payment?.method === "VIRTUAL_ACCOUNT" &&
                "가상계좌는 입금 완료 후 자동 반영됩니다.") ||
              "",
          });
        }
      } catch (e) {
        if (!aborted) {
          setState((s) => ({
            ...s,
            loading: false,
            ok: false,
            error: e.message || String(e),
            payment: null,
          }));
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [paymentKey, orderId, requestId]);

  if (state.loading) {
    return (
      <Shell>
        <Card>
          <Title>결제가 완료되었습니다</Title>
          <Sub>승인 처리 중… 잠시만 기다려 주세요</Sub>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <Title>결제가 완료되었습니다</Title>

        {state.ok ? (
          <>
            <Badge className="ok">✔ 결제 성공</Badge>

            <InfoBox className="success">
              {/* <div>
                의뢰서 ID: <b>{requestId}</b>
              </div> */}
              <div>
                주문번호: <b>{orderId}</b>
              </div>
              {state.payment?.method && (
                <div>결제수단: {state.payment.method}</div>
              )}
            </InfoBox>

            {state.hint && <Hint>{state.hint}</Hint>}

            <PrimaryBtn onClick={() => navigate(`/pay/${requestId}`)}>
              결제 페이지로
            </PrimaryBtn>
          </>
        ) : (
          <>
            <Badge className="error">✖ 승인 오류</Badge>
            <Note>오류: {state.error}</Note>
            {state.hint && <Hint>{state.hint}</Hint>}

            <PrimaryBtn onClick={() => navigate(`/pay/${requestId}`)}>
              다시 시도
            </PrimaryBtn>
          </>
        )}
      </Card>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafcff;
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 22px;
  color: #0f172a;
  font-weight: 800;
`;

const Sub = styled.p`
  margin: 4px 0 16px;
  color: #64748b;
  font-size: 14px;
`;

const Badge = styled.span`
  display: inline-block;
  margin: 8px 0 12px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  border: 1px solid transparent;

  &.ok {
    color: #166534;
    background: #ecfdf5;
    border-color: #86efac;
  }
  &.error {
    color: #991b1b;
    background: #fef2f2;
    border-color: #fecaca;
  }
`;

const InfoBox = styled.div`
  line-height: 1.7;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #334155;
  background: #f9fafb;

  &.success {
    background: #f0fff7;
    border-color: #c7f9d4;
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

const Hint = styled.div`
  background: #f8fbff;
  color: #0f172a;
  border: 1px solid #e5eaf0;
  padding: 10px 12px;
  border-radius: 12px;
  margin: -4px 0 14px;
  font-size: 13px;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;

  color: #fff;
  background: linear-gradient(90deg, #2f80ed, #56ccf2);
  box-shadow: 0 4px 12px rgba(47, 128, 237, 0.3);

  &:hover {
    transform: translateY(-1px);
  }
  &:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const Loading = styled.div`
  text-align: center;
  color: #64748b;
  padding: 40px;
`;
