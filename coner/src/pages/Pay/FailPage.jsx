import React, { useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function FailPage() {
  const { requestId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const code = params.get("code") || ""; // ex) USER_CANCEL, TIMEOUT 등
  const message = params.get("message") || "";
  const orderId = params.get("orderId") || "";

  // 실패코드 → 사용자 안내 문구 매핑
  const friendly = useMemo(() => mapFailCodeToHelp(code), [code]);

  const [copied, setCopied] = useState(false);
  const copyDebug = async () => {
    try {
      await navigator.clipboard?.writeText(
        JSON.stringify({ requestId, orderId, code, message }, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // 클립보드 권한이 없을 수 있음
      alert("복사에 실패했습니다. 수동으로 캡처해 주세요.");
    }
  };

  return (
    <Shell>
      <Card role="alert" aria-live="polite">
        <Title>결제가 완료되지 않았습니다</Title>
        <SubTitle>아래 안내를 확인한 뒤 다시 시도해 주세요</SubTitle>

        <InfoBox>
          {/* <Row>
            <span>의뢰서 ID</span>
            <b>{requestId || "-"}</b>
          </Row> */}
          {orderId && (
            <Row>
              {/* <span>주문번호</span> */}
              {/* <b>{orderId}</b> */}
            </Row>
          )}
          {code && (
            <Row>
              <span>오류 코드</span>
              <Code>{code}</Code>
            </Row>
          )}
          {message && (
            <Row>
              <span>사유</span>
              <Msg>{message}</Msg>
            </Row>
          )}
        </InfoBox>

        {/* 사용자 친화 가이드 */}
        <Guide>
          <strong>해결 방법</strong>
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

function mapFailCodeToHelp(code) {
  const fallback = {
    title: "결제가 중단되었습니다",
    suggestions: [
      "잠시 후 다시 시도해 주세요.",
      "다른 결제수단(카드/계좌이체/간편결제)으로 시도해 보세요.",
      "네트워크가 안정적인 환경에서 다시 시도해 주세요.",
    ],
    note: "애플페이는 iOS/Safari, 삼성페이는 삼성 기기/브라우저에서만 이용 가능합니다.",
  };

  const map = {
    USER_CANCEL: {
      title: "결제가 취소되었습니다",
      suggestions: [
        "결제 창에서 ‘취소’를 누르면 발생합니다. 다시 결제를 진행해 주세요.",
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
        "결제 페이지에서 상태가 ‘결제 완료’인지 확인해 주세요.",
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
`;

const Card = styled.div`
  width: 100%;
  border: 1px solid #e5eaf0;
  border-radius: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 14px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 22px;
  color: #0f172a;
  font-weight: 800;
`;

const SubTitle = styled.p`
  margin: 6px 0 20px;
  color: #64748b;
  font-size: 14px;
`;

const InfoBox = styled.div`
  text-align: left;
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #334155;
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  & + & {
    margin-top: 8px;
  }
  span {
    color: #64748b;
    font-size: 13px;
  }
`;

const Code = styled.b`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  color: #0f172a;
  word-break: break-all;
`;

const Msg = styled.span`
  color: #0f172a;
  word-break: break-word;
`;

const Guide = styled.div`
  text-align: left;
  background: #f8fbff;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
  padding: 12px 14px;
  margin: 4px 0 16px;
  ul {
    margin: 8px 0 0 4px;
    font-size: 14px;
    padding: 0;
  }
  li {
    margin: 2px 0;
  }
`;

const SmallNote = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #64748b;
`;

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
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
  background: linear-gradient(90deg, #2f80ed, #56ccf2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(47, 128, 237, 0.25);

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const GhostBtn = styled.button`
  height: 50px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid #e5eaf0;
  background: #fff;
  color: #0f172a;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #f8fafc;
  }
`;
