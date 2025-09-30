import React, { useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function FailPage() {
  const { requestId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // 나이스페이 실패 파라미터들
  const authResultCode = params.get("AuthResultCode") || ""; // 나이스페이 결과 코드
  const authResultMsg = params.get("AuthResultMsg") || ""; // 나이스페이 결과 메시지
  const moid = params.get("Moid") || ""; // 주문번호
  const payMethod = params.get("PayMethod") || ""; // 결제수단
  const mid = params.get("MID") || ""; // 가맹점 ID

  const legacyCode = params.get("code") || "";
  const legacyMessage = params.get("message") || "";
  const legacyOrderId = params.get("orderId") || "";

  const finalCode = authResultCode || legacyCode;
  const finalMessage = authResultMsg || legacyMessage;
  const finalOrderId = moid || legacyOrderId;

  const friendly = useMemo(
    () => mapNicePayFailCodeToHelp(finalCode),
    [finalCode]
  );

  const [copied, setCopied] = useState(false);
  const copyDebug = async () => {
    try {
      const debugInfo = {
        requestId,
        authResultCode,
        authResultMsg,
        moid,
        payMethod,
        mid,

        legacyCode,
        legacyMessage,
        legacyOrderId,
      };

      await navigator.clipboard?.writeText(JSON.stringify(debugInfo, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      alert("복사에 실패했습니다. 수동으로 캡처해 주세요.");
    }
  };

  return (
    <Shell>
      <Card role="alert" aria-live="polite">
        <Title>결제가 완료되지 않았습니다</Title>
        <SubTitle>아래 안내를 확인한 뒤 다시 시도해 주세요</SubTitle>

        <InfoBox>
          {finalOrderId && (
            <Row>
              <span>주문번호</span>
              <Code>{finalOrderId}</Code>
            </Row>
          )}
          {finalCode && (
            <Row>
              <span>오류 코드</span>
              <Code>{finalCode}</Code>
            </Row>
          )}
          {finalMessage && (
            <Row>
              <span>사유</span>
              <Msg>{finalMessage}</Msg>
            </Row>
          )}
          {payMethod && (
            <Row>
              <span>시도한 결제수단</span>
              <span>{getPaymentMethodName(payMethod)}</span>
            </Row>
          )}
        </InfoBox>

        <Guide>
          <strong>{friendly.title}</strong>
          <ul>
            {friendly.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {friendly.note && <SmallNote>{friendly.note}</SmallNote>}
        </Guide>

        <BtnRow>
          <RetryBtn onClick={() => navigate(`/pay/${requestId}`)}>
            다시 결제하기
          </RetryBtn>
          <GhostBtn onClick={copyDebug}>
            {copied ? "복사됨" : "버그 리포트용 복사"}
          </GhostBtn>
        </BtnRow>
      </Card>
    </Shell>
  );
}

function getPaymentMethodName(method) {
  const methodNames = {
    CARD: "신용카드",
    BANK: "계좌이체",
    VBANK: "가상계좌",
    CELLPHONE: "휴대폰결제",
    KAKAOPAY: "카카오페이",
    NAVERPAY: "네이버페이",
    SAMSUNGPAY: "삼성페이",
    PAYCO: "페이코",
    SSGPAY: "SSGPAY",
  };
  return methodNames[method] || method;
}

function mapNicePayFailCodeToHelp(code) {
  const fallback = {
    title: "결제가 중단되었습니다",
    suggestions: [
      "잠시 후 다시 시도해 주세요.",
      "다른 결제수단(카드/계좌이체/간편결제)으로 시도해 보세요.",
      "네트워크가 안정적인 환경에서 다시 시도해 주세요.",
    ],
    note: "간편결제는 해당 서비스가 설치된 기기에서만 이용 가능합니다.",
  };

  const map = {
    // 나이스페이 주요 오류 코드들
    2001: {
      title: "결제가 취소되었습니다",
      suggestions: ["사용자가 결제를 취소했습니다. 다시 결제를 진행해 주세요."],
      note: "",
    },
    2211: {
      title: "결제 시간이 초과되었습니다",
      suggestions: [
        "일시적인 네트워크 문제일 수 있어요. 다시 시도해 주세요.",
        "Wi-Fi/데이터 연결 상태를 확인한 뒤 재시도해 주세요.",
      ],
      note: "",
    },
    2400: {
      title: "카드 정보가 유효하지 않습니다",
      suggestions: [
        "카드번호/유효기간/CVC를 다시 확인해 주세요.",
        "카드사에서 온라인 결제를 차단했을 수 있습니다.",
      ],
      note: "",
    },
    2420: {
      title: "한도를 초과했습니다",
      suggestions: [
        "카드 한도를 확인하거나 다른 카드로 결제해 주세요.",
        "일시불 한도 또는 할부 한도를 확인해 주세요.",
      ],
      note: "",
    },
    2430: {
      title: "카드가 정지되었습니다",
      suggestions: [
        "카드사에 연락하여 카드 상태를 확인해 주세요.",
        "다른 카드로 결제를 시도해 주세요.",
      ],
      note: "",
    },
    2450: {
      title: "잔액이 부족합니다",
      suggestions: [
        "계좌 잔액을 확인하고 충전 후 다시 시도해 주세요.",
        "다른 계좌나 카드로 결제를 시도해 주세요.",
      ],
      note: "",
    },
    2500: {
      title: "시스템 오류가 발생했습니다",
      suggestions: [
        "일시적인 시스템 문제입니다. 잠시 후 다시 시도해 주세요.",
        "계속 문제가 발생하면 고객센터로 연락해 주세요.",
      ],
      note: "",
    },
    3001: {
      title: "이미 처리된 거래입니다",
      suggestions: [
        "같은 주문을 중복 시도한 것일 수 있습니다.",
        "결제 페이지에서 상태가 '결제 완료'인지 확인해 주세요.",
      ],
      note: "",
    },

    USER_CANCEL: {
      title: "결제가 취소되었습니다",
      suggestions: [
        "결제 창에서 '취소'를 누르면 발생합니다. 다시 결제를 진행해 주세요.",
      ],
      note: "",
    },
    TIMEOUT: {
      title: "시간이 초과되었습니다",
      suggestions: [
        "일시적인 네트워크 문제일 수 있어요. 다시 시도해 주세요.",
        "Wi-Fi/데이터 연결 상태를 확인한 뒤 재시도해 주세요.",
      ],
      note: "",
    },
    DUPLICATED_ORDER_ID: {
      title: "주문번호가 중복되었습니다",
      suggestions: [
        "결제 페이지를 새로 고침 후 다시 시도해 주세요.",
        "여전히 발생하면 관리자에게 주문번호를 전달해 주세요.",
      ],
      note: "",
    },
    ALREADY_PROCESSED: {
      title: "이미 처리된 결제입니다",
      suggestions: [
        "같은 주문을 중복 시도한 것일 수 있습니다.",
        "결제 페이지에서 상태가 '결제 완료'인지 확인해 주세요.",
      ],
      note: "",
    },
    INVALID_CARD: {
      title: "카드 정보가 유효하지 않습니다",
      suggestions: [
        "카드번호/유효기간/CVC를 다시 확인해 주세요.",
        "한도 초과/해외결제 차단 여부를 확인해 주세요.",
      ],
      note: "",
    },
    EXCEED_LIMIT: {
      title: "한도를 초과했습니다",
      suggestions: ["카드 한도를 확인하거나 다른 카드/수단으로 결제해 주세요."],
      note: "",
    },
    PAY_PROCESS_CANCELED: {
      title: "결제가 중단되었습니다",
      suggestions: [
        "일시적인 문제일 수 있습니다. 다시 시도해 주세요.",
        "다른 결제수단으로도 시도해 보세요.",
      ],
      note: "",
    },
  };

  return map[code] || fallback;
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  border: 1px solid #fecaca;
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.1);
  padding: 24px;
  text-align: center;
  background: white;
`;

const Title = styled.h1`
  font-size: 22px;
  color: #dc2626;
  font-weight: 800;
  margin: 0 0 8px 0;
`;

const SubTitle = styled.p`
  margin: 0 0 20px 0;
  color: #64748b;
  font-size: 14px;
`;

const InfoBox = styled.div`
  text-align: left;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #334155;
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  span:first-child {
    color: #991b1b;
    font-size: 13px;
    font-weight: 500;
    min-width: fit-content;
  }
`;

const Code = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  color: #dc2626;
  font-weight: 600;
  word-break: break-all;
`;

const Msg = styled.span`
  color: #7f1d1d;
  word-break: break-word;
  font-weight: 500;
`;

const Guide = styled.div`
  text-align: left;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;

  strong {
    color: #1e40af;
    font-size: 15px;
    display: block;
    margin-bottom: 8px;
  }

  ul {
    margin: 0;
    font-size: 14px;
    padding-left: 16px;
    color: #1e3a8a;
  }

  li {
    margin: 4px 0;
    line-height: 1.4;
  }
`;

const SmallNote = styled.p`
  margin: 12px 0 0;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
`;

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
`;

const RetryBtn = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(90deg, #dc2626, #ef4444);
  color: #fff;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
`;

const GhostBtn = styled.button`
  height: 50px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #e5eaf0;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f8fafc;
  }
`;
