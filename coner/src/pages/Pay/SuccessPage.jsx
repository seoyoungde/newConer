import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import styled, { keyframes } from "styled-components";
import { db } from "../../lib/firebase";

const API_BASE_URL = "https://api.coner.kr/payment";

// 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// 스타일드 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0f9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  max-width: 28rem;
  width: 100%;
  overflow: hidden;
  border: 1px solid #dbeafe;
  animation: ${scaleIn} 0.5s ease-out;
`;

const LoadingCard = styled(Card)`
  padding: 1rem;
  text-align: center;
  max-width: 20rem;
`;

const Header = styled.div`
  background: ${(props) =>
    props.$error
      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"};
  padding: 2rem;
  text-align: center;
  color: white;
`;

const IconContainer = styled.div`
  width: 5rem;
  height: 5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingIconContainer = styled.div`
  width: 4rem;
  height: 4rem;
  background: #2563eb;
  border-radius: 16px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.$loading ? "#1f2937" : "inherit")};
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  color: ${(props) => (props.$loading ? "#6b7280" : "inherit")};
`;

const Content = styled.div`
  padding: 1rem;
`;

const AmountSection = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
`;

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.55rem;
`;

const AmountLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const AmountValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const InfoLabel = styled.span`
  color: #6b7280;
`;

const InfoValue = styled.span`
  font-weight: 500;
  font-family: ${(props) => (props.$mono ? "monospace" : "inherit")};
  font-size: ${(props) => (props.$small ? "0.75rem" : "inherit")};
`;

const NoticeBox = styled.div`
  background: ${(props) => (props.$error ? "#fef2f2" : "#eff6ff")};
  border: 1px solid ${(props) => (props.$error ? "#fecaca" : "#dbeafe")};
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const NoticeIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: ${(props) => (props.$error ? "#ef4444" : "#2563eb")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const NoticeContent = styled.div`
  flex: 1;
`;

const NoticeTitle = styled.h3`
  font-weight: 600;
  color: ${(props) => (props.$error ? "#7f1d1d" : "#1e3a8a")};
  margin-bottom: 0.25rem;
`;

const NoticeText = styled.p`
  color: ${(props) => (props.$error ? "#b91c1c" : "#1d4ed8")};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PrimaryButton = styled.button`
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 1rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  background: ${(props) => (props.$accent ? "#eff6ff" : "#f9fafb")};
  color: ${(props) => (props.$accent ? "#1d4ed8" : "#374151")};
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$accent ? "#dbeafe" : "#f3f4f6")};
  }
`;

const LoadingSpinner = styled.div`
  position: relative;
  margin: 0 auto 1.5rem;
`;

const MainSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid #dbeafe;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SecondarySpinner = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 2rem;
  height: 2rem;
  border: 2px solid #bfdbfe;
  border-top: 2px solid #60a5fa;
  border-radius: 50%;
  animation: ${spin} 1.5s linear infinite reverse;
`;

const LoadingDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 1.5rem;
`;

const LoadingDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background: #2563eb;
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${(props) => props.$delay}s;
`;

const CheckIcon = () => (
  <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

export default function SuccessPage() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState({
    loading: true,
    success: false,
    error: "",
    payment: null,
    amount: 0,
    receiptUrl: "",
  });

  const hasProcessed = useRef(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      const processingKey = `processing_${paymentKey}_${orderId}`;

      if (hasProcessed.current || isProcessing.current) {
        return;
      }

      if (sessionStorage.getItem(processingKey)) {
        return;
      }

      isProcessing.current = true;
      sessionStorage.setItem(processingKey, "true");

      try {
        if (!paymentKey || !orderId || !requestId) {
          throw new Error("필수 파라미터가 누락되었습니다.");
        }

        const paymentDocRef = doc(db, "Payment", requestId);
        const paymentDocSnap = await getDoc(paymentDocRef);

        if (!paymentDocSnap.exists()) {
          throw new Error("결제 정보를 찾을 수 없습니다.");
        }

        const paymentData = paymentDocSnap.data();
        const rawAmount = paymentData.amount || paymentData.payment_amount || 0;
        const amount = rawAmount
          ? Number(String(rawAmount).replace(/[^\d]/g, ""))
          : 0;

        if (!amount || amount <= 0) {
          throw new Error("결제 금액 정보가 올바르지 않습니다.");
        }

        const requestData = {
          paymentKey,
          orderId,
          amount: amount,
        };

        const response = await fetch(`${API_BASE_URL}/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage =
            responseData.message ||
            responseData.error ||
            `API 오류 (${response.status})`;
          throw new Error(errorMessage);
        }

        hasProcessed.current = true;
        sessionStorage.removeItem(processingKey);
        setState({
          loading: false,
          success: true,
          error: "",
          payment: responseData.data ||
            responseData.payment || { method: "CARD" },
          amount: amount,
          receiptUrl:
            responseData.data?.receipt?.url || responseData.receipt?.url || "", // ✅ 영수증 URL 저장
        });
      } catch (error) {
        if (
          error.message.includes("[S008]") ||
          error.message.includes("기존 요청을 처리중")
        ) {
          hasProcessed.current = true;
          sessionStorage.removeItem(processingKey);
          setState({
            loading: false,
            success: true,
            error: "",
            payment: { method: "CARD" },
            amount: amount || 0,
            receiptUrl: "", // 실패 케이스에서는 영수증 없음
          });
        } else {
          sessionStorage.removeItem(processingKey);
          setState({
            loading: false,
            success: false,
            error: error.message,
            payment: null,
            amount: 0,
            receiptUrl: "",
          });
        }
      } finally {
        isProcessing.current = false;
      }
    };

    confirmPayment();
  }, []);

  if (state.loading) {
    return (
      <Container>
        <LoadingCard>
          <LoadingIconContainer>
            <span
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "1.25rem",
              }}
            >
              C
            </span>
          </LoadingIconContainer>

          <LoadingSpinner>
            <MainSpinner />
            <SecondarySpinner />
          </LoadingSpinner>

          <Title $loading={true}>결제 승인 처리중</Title>
          <Subtitle $loading={true}>안전한 결제를 위해 확인 중입니다</Subtitle>

          <LoadingDots>
            <LoadingDot $delay={0} />
            <LoadingDot $delay={0.1} />
            <LoadingDot $delay={0.2} />
          </LoadingDots>
        </LoadingCard>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        {state.success ? (
          <>
            <Header>
              <IconContainer>
                <CheckIcon />
              </IconContainer>
              <Title>결제 완료!</Title>
              <Subtitle>에어컨 청소 서비스 예약이 완료되었습니다</Subtitle>
            </Header>

            <Content>
              <AmountSection>
                <AmountRow>
                  <AmountLabel>결제금액</AmountLabel>
                  <AmountValue>{state.amount.toLocaleString()}원</AmountValue>
                </AmountRow>
                <InfoGrid>
                  <InfoRow>
                    <InfoLabel>결제수단</InfoLabel>
                    <InfoValue>{state.payment?.method || "카드결제"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>주문번호</InfoLabel>
                    <InfoValue $mono $small>
                      {orderId?.slice(-8)}
                    </InfoValue>
                  </InfoRow>
                </InfoGrid>
              </AmountSection>

              <ButtonGroup>
                <PrimaryButton onClick={() => (window.location.href = "/")}>
                  홈으로 돌아가기
                </PrimaryButton>

                <ButtonRow>
                  <SecondaryButton
                    onClick={() =>
                      alert("고객센터 연결: 070-8648-3327 ,070-8648-3326")
                    }
                  >
                    고객센터
                  </SecondaryButton>

                  <SecondaryButton
                    $accent
                    onClick={() =>
                      window.open(
                        state.receiptUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    영수증 보기
                  </SecondaryButton>
                </ButtonRow>
              </ButtonGroup>
            </Content>
          </>
        ) : (
          <>
            <Header $error>
              <IconContainer>
                <ErrorIcon />
              </IconContainer>
              <Title>결제 실패</Title>
              <Subtitle>죄송합니다. 결제에 실패했습니다</Subtitle>
            </Header>

            <Content>
              <NoticeBox $error>
                <NoticeIcon $error>
                  <MessageIcon />
                </NoticeIcon>
                <NoticeContent>
                  <NoticeTitle $error>실패 사유</NoticeTitle>
                  <NoticeText $error>{state.error}</NoticeText>
                </NoticeContent>
              </NoticeBox>

              <ButtonGroup>
                <PrimaryButton onClick={() => (window.location.href = "/")}>
                  다시 시도하기
                </PrimaryButton>

                <ButtonRow>
                  <SecondaryButton
                    onClick={() =>
                      alert("고객센터 연결: 070-8648-3327 ,070-8648-3326")
                    }
                  >
                    고객센터
                  </SecondaryButton>
                </ButtonRow>
              </ButtonGroup>
            </Content>
          </>
        )}
      </Card>
    </Container>
  );
}
