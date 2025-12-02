import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import styled, { keyframes } from "styled-components";
import { db } from "../../lib/firebase";

// 애니메이션들
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
  padding: 2rem;
`;

// 디버깅용 스타일들 (간소화)
const DebugBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 12px;
`;

const DebugSummary = styled.summary`
  padding: 8px 12px;
  cursor: pointer;
  background: #e9ecef;
  margin: 0;
  font-weight: 500;
  color: #495057;
  border-radius: 8px 8px 0 0;
`;

const DebugContent = styled.div`
  padding: 8px 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const DebugData = styled.pre`
  background: #f1f3f4;
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
`;

const AmountSection = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const AmountValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 0.5rem;
`;

const AmountLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const InfoLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: #1f2937;
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
    <path d="M18 8.118l-8 4-8-4V14a2 2 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
      clipRule="evenodd"
    />
  </svg>
);

export default function SuccessPage() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState({
    loading: true,
    paymentData: null,
    tid: null,
  });

  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!requestId) {
        setState({ loading: false, paymentData: null, tid: null });
        return;
      }

      const urlTid = searchParams.get("tid");
      console.log("URL에서 가져온 TID", urlTid);

      try {
        const paymentDocRef = doc(db, "Payment", requestId);
        const docSnapshot = await getDoc(paymentDocRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          const finalTid = data.tid || urlTid;
          console.log("finalTid", finalTid);

          setState({
            loading: false,
            paymentData: data,
            tid: finalTid,
          });

          // status를 숫자로 명확하게 비교
          const currentStatus = Number(data.status);

          if (currentStatus === 1) {
            try {
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, "0");
              const day = String(now.getDate()).padStart(2, "0");
              const paidAtFormatted = `${year}년 ${month}월 ${day}일`;

              // Payment status를 2으로 변경
              await updateDoc(paymentDocRef, {
                status: 2,
                method: "온라인 결제",
                paid_at: paidAtFormatted,
                tid: finalTid,
                updated_at: new Date().toISOString(),
              });

              // Request status를 4로 변경
              const requestDocRef = doc(db, "Request", requestId);
              await updateDoc(requestDocRef, {
                status: 4,
                updated_at: new Date().toISOString(),
              });
            } catch (updateError) {}
          } else {
          }
        } else {
          setState({ loading: false, paymentData: null, tid: urlTid });
        }
      } catch (error) {
        setState({
          loading: false,
          paymentData: null,
          tid: searchParams.get("tid"),
        });
      }
    };

    loadPaymentInfo();
  }, [requestId]);

  // 금액 파싱
  const parseAmount = (amountStr) => {
    if (!amountStr) return 0;
    const onlyDigits = String(amountStr).replace(/[^\d]/g, "");
    const amount = Number(onlyDigits);
    return Number.isFinite(amount) ? amount : 0;
  };

  const getReceiptUrl = (tid) => {
    if (!tid) return null;
    return `https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&TID=${tid}`;
  };

  const handleOpenReceipt = () => {
    const receiptUrl = getReceiptUrl(state.tid);
    if (receiptUrl) {
      window.open(
        receiptUrl,
        "receipt",
        "width=420,height=700,scrollbars=yes,resizeable=yes"
      );
    } else {
      alert(
        "거래번호를 찾을 수 없습니다. 고객센터(02-433-3114)로 문의해주세요."
      );
    }
  };

  // 로딩 중
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

          <Title $loading={true}>결제 정보 확인 중</Title>
          <Subtitle $loading={true}>잠시만 기다려주세요</Subtitle>

          <LoadingDots>
            <LoadingDot $delay={0} />
            <LoadingDot $delay={0.1} />
            <LoadingDot $delay={0.2} />
          </LoadingDots>
        </LoadingCard>
      </Container>
    );
  }

  // 데이터가 없는 경우
  if (!state.paymentData) {
    return (
      <Container>
        <Card>
          <Header $error>
            <IconContainer>
              <ErrorIcon />
            </IconContainer>
            <Title>결제 정보를 찾을 수 없습니다</Title>
          </Header>
          <Content>
            <ButtonGroup>
              <PrimaryButton onClick={() => (window.location.href = "/")}>
                홈으로 돌아가기
              </PrimaryButton>
            </ButtonGroup>
          </Content>
        </Card>
      </Container>
    );
  }

  // 결제 완료 화면
  return (
    <Container>
      <Card>
        <Header>
          <IconContainer>
            <CheckIcon />
          </IconContainer>
          <Title>결제 완료!</Title>
          <Subtitle>
            {state.paymentData.service_type || "서비스"} 예약이 완료되었습니다
          </Subtitle>
        </Header>

        <Content>
          <AmountSection>
            <AmountValue>
              {parseAmount(state.paymentData.amount).toLocaleString()}원
            </AmountValue>
            <AmountLabel>결제 완료</AmountLabel>
          </AmountSection>

          <InfoGrid>
            <InfoRow>
              <InfoLabel>주문번호</InfoLabel>
              <InfoValue $mono $small>
                {requestId}
              </InfoValue>
            </InfoRow>

            {/* 영수증 추가 (tid가 있을때만 표시하기) */}
            {state.tid && (
              <InfoRow>
                <InfoLabel>거래번호</InfoLabel>
                <InfoValue $mono $small>
                  {state.paymentData.tid}
                </InfoValue>
              </InfoRow>
            )}

            {state.paymentData.service_date && (
              <InfoRow>
                <InfoLabel>서비스 날짜</InfoLabel>
                <InfoValue>{state.paymentData.service_date}</InfoValue>
              </InfoRow>
            )}

            {state.paymentData.service_time && (
              <InfoRow>
                <InfoLabel>서비스 시간</InfoLabel>
                <InfoValue>{state.paymentData.service_time}</InfoValue>
              </InfoRow>
            )}

            {state.paymentData.customer_address && (
              <InfoRow>
                <InfoLabel>서비스 주소</InfoLabel>
                <InfoValue>{state.paymentData.customer_address}</InfoValue>
              </InfoRow>
            )}
          </InfoGrid>

          <NoticeBox>
            <NoticeIcon>
              <CheckIcon />
            </NoticeIcon>
            <NoticeContent>
              <NoticeTitle>결제 완료</NoticeTitle>
              <NoticeText>서비스 결제가 정상적으로 완료되었습니다.</NoticeText>
            </NoticeContent>
          </NoticeBox>

          <ButtonGroup>
            <PrimaryButton onClick={() => (window.location.href = "/")}>
              홈으로 돌아가기
            </PrimaryButton>

            <ButtonRow>
              <SecondaryButton
                $accent
                onClick={handleOpenReceipt}
                disabled={!state.tid}
                style={{
                  opacity: state.tid ? 1 : 0.5,
                  cursor: state.tid ? "pointer" : "not-allowed",
                }}
              >
                영수증 보기
              </SecondaryButton>
            </ButtonRow>

            <ButtonRow>
              <SecondaryButton onClick={() => alert("고객센터:02-433-3114")}>
                고객센터
              </SecondaryButton>
            </ButtonRow>
          </ButtonGroup>
        </Content>
      </Card>
    </Container>
  );
}
