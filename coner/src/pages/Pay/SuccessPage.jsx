import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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

export default function SuccessPage() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 기본 정보만 추출 (보안상 민감한 정보는 제외)
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const errorCode = searchParams.get("errorCode");

  const [state, setState] = useState({
    loading: true,
    success: false,
    error: "",
    paymentData: null,
  });

  // 디버깅용 (개발 환경에서만)
  const [debugLogs, setDebugLogs] = useState([]);

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, data, timestamp };
    console.log(`[${timestamp}] ${message}`, data);
    setDebugLogs((prev) => [...prev, logEntry]);
  };

  useEffect(() => {
    const loadPaymentResult = async () => {
      addDebugLog("결제 결과 페이지 로드 시작", {
        requestId,
        status,
        message,
        errorCode,
      });

      // URL에서 받은 상태 검증
      if (!requestId) {
        addDebugLog("requestId 누락");
        setState({
          loading: false,
          success: false,
          error: "주문 정보를 찾을 수 없습니다.",
          paymentData: null,
        });
        return;
      }

      // 에러 상태 처리
      if (status === "error") {
        addDebugLog("결제 실패 상태 확인됨", { message, errorCode });
        setState({
          loading: false,
          success: false,
          error: message || "결제 처리 중 오류가 발생했습니다.",
          paymentData: null,
        });
        return;
      }

      // 성공 상태가 아닌 경우
      if (status !== "success") {
        addDebugLog("알 수 없는 상태", { status });
        setState({
          loading: false,
          success: false,
          error: "결제 상태를 확인할 수 없습니다.",
          paymentData: null,
        });
        return;
      }

      // Firebase에서 결제 정보 조회
      try {
        addDebugLog("Firebase 결제 정보 조회 시작", { requestId });

        const paymentDocRef = doc(db, "Payment", requestId);

        // 실시간 구독으로 최신 데이터 가져오기
        const unsubscribe = onSnapshot(
          paymentDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const paymentData = docSnapshot.data();
              addDebugLog("Firebase 결제 정보 조회 성공", paymentData);

              // 결제 상태 확인
              const paymentStatus = Number(paymentData.status);
              const isPaymentComplete = paymentStatus >= 2; // PAID(2) 이상

              if (isPaymentComplete) {
                setState({
                  loading: false,
                  success: true,
                  error: "",
                  paymentData,
                });
              } else {
                // 아직 결제가 완료되지 않은 상태 - 잠시 더 기다림
                addDebugLog("결제 처리 중 상태", {
                  currentStatus: paymentStatus,
                  statusName: getStatusName(paymentStatus),
                });
                // 로딩 상태 유지하고 계속 구독
              }
            } else {
              addDebugLog("Firebase에서 결제 정보를 찾을 수 없음");
              setState({
                loading: false,
                success: false,
                error: "결제 정보를 찾을 수 없습니다.",
                paymentData: null,
              });
            }
          },
          (error) => {
            addDebugLog("Firebase 조회 오류", { error: error.message });
            setState({
              loading: false,
              success: false,
              error: "결제 정보 조회 중 오류가 발생했습니다.",
              paymentData: null,
            });
          }
        );

        // 10초 후 타임아웃
        const timeout = setTimeout(() => {
          addDebugLog("결제 상태 확인 타임아웃");
          unsubscribe();
          setState((prevState) => {
            if (prevState.loading) {
              return {
                loading: false,
                success: false,
                error:
                  "결제 처리 시간이 초과되었습니다. 고객센터로 문의해주세요.",
                paymentData: null,
              };
            }
            return prevState;
          });
        }, 10000);

        // cleanup function
        return () => {
          clearTimeout(timeout);
          unsubscribe();
        };
      } catch (error) {
        addDebugLog("예외 발생", { error: error.message });
        setState({
          loading: false,
          success: false,
          error: "예기치 않은 오류가 발생했습니다.",
          paymentData: null,
        });
      }
    };

    loadPaymentResult();
  }, [requestId, status, message]);

  // 결제 상태 이름 변환
  const getStatusName = (statusNum) => {
    const statusNames = {
      0: "취소됨",
      1: "요청됨",
      2: "결제완료",
      3: "수수료 처리중",
      4: "처리완료",
    };
    return statusNames[statusNum] || `알 수 없음(${statusNum})`;
  };

  // 결제 수단 이름 변환
  const getPaymentMethodName = (method) => {
    const methodNames = {
      card: "신용카드",
      CARD: "신용카드",
      kakaopay: "카카오페이",
      KAKAOPAY: "카카오페이",
      naverpay: "네이버페이",
      NAVERPAY: "네이버페이",
      naverpayCard: "네이버페이",
      samsungpay: "삼성페이",
      SAMSUNGPAY: "삼성페이",
      samsungpayCard: "삼성페이",
      payco: "페이코",
      PAYCO: "페이코",
    };
    return methodNames[method] || method || "신용카드";
  };

  // 금액 파싱
  const parseAmount = (amountStr) => {
    if (!amountStr) return 0;
    const onlyDigits = String(amountStr).replace(/[^\d]/g, "");
    const amount = Number(onlyDigits);
    return Number.isFinite(amount) ? amount : 0;
  };

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

          <Title $loading={true}>결제 처리 중</Title>
          <Subtitle $loading={true}>
            결제가 정상적으로 처리되고 있는지 확인 중입니다
          </Subtitle>

          <LoadingDots>
            <LoadingDot $delay={0} />
            <LoadingDot $delay={0.1} />
            <LoadingDot $delay={0.2} />
          </LoadingDots>

          {/* 개발 환경에서만 디버깅 로그 표시 */}
          {process.env.NODE_ENV === "development" && debugLogs.length > 0 && (
            <DebugBox style={{ marginTop: "1rem", textAlign: "left" }}>
              <details>
                <DebugSummary>디버깅 로그 ({debugLogs.length}개)</DebugSummary>
                <DebugContent>
                  {debugLogs.slice(-3).map((log, index) => (
                    <div key={index} style={{ marginBottom: "8px" }}>
                      <div>
                        [{log.timestamp}] {log.message}
                      </div>
                      {log.data && (
                        <DebugData>
                          {JSON.stringify(log.data, null, 2)}
                        </DebugData>
                      )}
                    </div>
                  ))}
                </DebugContent>
              </details>
            </DebugBox>
          )}
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
              <Subtitle>
                {state.paymentData?.service_type || "서비스"} 예약이
                완료되었습니다
              </Subtitle>
            </Header>

            <Content>
              <AmountSection>
                <AmountValue>
                  {parseAmount(state.paymentData?.amount).toLocaleString()}원
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

                <InfoRow>
                  <InfoLabel>고객명</InfoLabel>
                  <InfoValue>
                    {state.paymentData?.customer_name || "구매자"}
                  </InfoValue>
                </InfoRow>

                {state.paymentData?.service_date && (
                  <InfoRow>
                    <InfoLabel>서비스 날짜</InfoLabel>
                    <InfoValue>{state.paymentData.service_date}</InfoValue>
                  </InfoRow>
                )}

                {state.paymentData?.service_time && (
                  <InfoRow>
                    <InfoLabel>서비스 시간</InfoLabel>
                    <InfoValue>{state.paymentData.service_time}</InfoValue>
                  </InfoRow>
                )}

                {state.paymentData?.customer_address && (
                  <InfoRow>
                    <InfoLabel>서비스 주소</InfoLabel>
                    <InfoValue>{state.paymentData.customer_address}</InfoValue>
                  </InfoRow>
                )}

                <InfoRow>
                  <InfoLabel>결제 상태</InfoLabel>
                  <InfoValue>
                    {getStatusName(Number(state.paymentData?.status))}
                  </InfoValue>
                </InfoRow>
              </InfoGrid>

              <NoticeBox>
                <NoticeIcon>
                  <CheckIcon />
                </NoticeIcon>
                <NoticeContent>
                  <NoticeTitle>예약 완료</NoticeTitle>
                  <NoticeText>
                    서비스 예약이 정상적으로 완료되었습니다. 서비스 날짜에
                    기사님이 방문할 예정입니다.
                    {state.paymentData?.customer_phone && (
                      <> 연락처: {state.paymentData.customer_phone}</>
                    )}
                  </NoticeText>
                </NoticeContent>
              </NoticeBox>

              <ButtonGroup>
                <PrimaryButton onClick={() => (window.location.href = "/")}>
                  홈으로 돌아가기
                </PrimaryButton>

                <ButtonRow>
                  <SecondaryButton
                    onClick={() =>
                      alert("고객센터: 070-8648-3327, 070-8648-3326")
                    }
                  >
                    고객센터
                  </SecondaryButton>
                  <SecondaryButton
                    $accent
                    onClick={() =>
                      alert("예약 내역은 홈페이지에서 확인하실 수 있습니다.")
                    }
                  >
                    예약 확인
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
              <Subtitle>죄송합니다. 결제 처리에 실패했습니다</Subtitle>
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
                      alert("고객센터: 070-8648-3327, 070-8648-3326")
                    }
                  >
                    고객센터 문의
                  </SecondaryButton>
                </ButtonRow>
              </ButtonGroup>
            </Content>
          </>
        )}

        {/* 개발 환경에서만 디버깅 정보 표시 */}
        {process.env.NODE_ENV === "development" && debugLogs.length > 0 && (
          <Content>
            <DebugBox>
              <details>
                <DebugSummary>
                  개발자 디버깅 로그 ({debugLogs.length}개)
                </DebugSummary>
                <DebugContent>
                  {debugLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: "8px" }}>
                      <div>
                        [{log.timestamp}] {log.message}
                      </div>
                      {log.data && (
                        <DebugData>
                          {JSON.stringify(log.data, null, 2)}
                        </DebugData>
                      )}
                    </div>
                  ))}
                </DebugContent>
              </details>
            </DebugBox>
          </Content>
        )}
      </Card>
    </Container>
  );
}
