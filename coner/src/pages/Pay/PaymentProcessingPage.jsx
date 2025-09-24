import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";

// 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 스타일드 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0f9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ProcessingCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  width: 100%;
  padding: 40px;
  text-align: center;
  border: 1px solid #dbeafe;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  ${css`
    animation: ${spin} 1s linear infinite;
  `}
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  margin-bottom: 32px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  border-radius: 4px;
  transition: width 0.5s ease;
  width: ${(props) => props.$progress}%;
`;

const StepList = styled.div`
  text-align: left;
  max-width: 320px;
  margin: 0 auto;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${(props) =>
    props.$active ? "#2563eb" : props.$completed ? "#10b981" : "#9ca3af"};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
`;

const StepIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  ${(props) => {
    if (props.$completed) {
      return css`
        background: #10b981;
        color: white;
      `;
    } else if (props.$active) {
      return css`
        background: #2563eb;
        color: white;
        animation: ${pulse} 1.5s ease-in-out infinite;
      `;
    } else {
      return css`
        background: #f3f4f6;
        color: #9ca3af;
      `;
    }
  }}
`;

const DebugBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  text-align: left;
  font-size: 12px;
`;

const DebugTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 14px;
`;

const DebugItem = styled.div`
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const DebugLabel = styled.span`
  font-weight: 600;
  color: #212529;
`;

const DebugValue = styled.span`
  color: #6c757d;
  font-family: monospace;
`;

export default function PaymentProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});
  const [logs, setLogs] = useState([]);

  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, data };
    console.log(`[${timestamp}] ${message}`, data);
    setLogs((prev) => [...prev, logEntry]);
  };

  const steps = ["결제 결과 수신", "데이터 검증", "승인 API 호출", "결과 처리"];

  // URL 파라미터 파싱 함수
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      authResultCode: params.get("authResultCode"),
      authResultMsg: params.get("authResultMsg"),
      tid: params.get("tid"),
      orderId: params.get("orderId") || params.get("Moid"),
      amount: params.get("amount") || params.get("Amt"),
      payMethod: params.get("payMethod") || params.get("PayMethod"),
      signature: params.get("signature"),
      authToken: params.get("authToken"),
      cardName: params.get("cardName"),
      cardNum: params.get("cardNum"),
      mallReserved: params.get("mallReserved"),
    };
  };

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Step 1: 결제 결과 수신
        setCurrentStep(0);
        setProgress(25);
        addLog("결제 결과 파라미터 수신 시작");

        // 나이스페이에서 전달받은 파라미터들 추출
        const paymentParams = getUrlParams();

        setDebugInfo(paymentParams);
        addLog("결제 파라미터 추출 완료", paymentParams);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 2: 데이터 검증
        setCurrentStep(1);
        setProgress(50);
        addLog("결제 데이터 검증 시작");

        if (!paymentParams.authResultCode) {
          throw new Error("결제 결과 코드가 없습니다");
        }

        if (paymentParams.authResultCode !== "0000") {
          throw new Error(
            `결제 인증 실패: ${
              paymentParams.authResultMsg || "알 수 없는 오류"
            }`
          );
        }

        if (
          !paymentParams.tid ||
          !paymentParams.orderId ||
          !paymentParams.amount
        ) {
          throw new Error("필수 결제 정보가 누락되었습니다");
        }

        addLog("데이터 검증 완료");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 3: 승인 API 호출
        setCurrentStep(2);
        setProgress(75);
        addLog("백엔드 승인 API 호출 시작");

        const approvalData = {
          tid: paymentParams.tid,
          orderId: paymentParams.orderId,
          amount: paymentParams.amount,
          authResultCode: paymentParams.authResultCode,
          authToken: paymentParams.authToken,
          signature: paymentParams.signature,
          payMethod: paymentParams.payMethod,
        };

        addLog("승인 API 요청 데이터", approvalData);

        const response = await fetch("https://api.coner.kr/serverAuth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalData),
        });

        addLog("승인 API 응답 수신", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          const errorData = await response.text();
          addLog("승인 API 오류 응답", errorData);
          throw new Error(`승인 API 오류 (${response.status}): ${errorData}`);
        }

        const approvalResult = await response.json();
        addLog("승인 API 성공", approvalResult);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 4: 결과 처리
        setCurrentStep(3);
        setProgress(100);
        addLog("결제 승인 완료, 성공 페이지로 이동");

        await new Promise((resolve) => setTimeout(resolve, 500));

        // 성공 페이지로 이동
        const successUrl =
          `/pay/success/${paymentParams.orderId}?` +
          `AuthResultCode=${paymentParams.authResultCode}&` +
          `Amt=${paymentParams.amount}&` +
          `TID=${paymentParams.tid}&` +
          `PayMethod=${paymentParams.payMethod || "CARD"}&` +
          `CardName=${encodeURIComponent(paymentParams.cardName || "")}&` +
          `CardNum=${paymentParams.cardNum || ""}`;

        addLog("성공 페이지로 리다이렉트", { successUrl });
        window.location.href = successUrl;
      } catch (error) {
        addLog("결제 처리 오류", {
          message: error.message,
          stack: error.stack,
        });

        console.error("결제 처리 오류:", error);

        // 3초 후 실패 페이지로 이동
        setTimeout(() => {
          const params = getUrlParams();
          const orderId = params.orderId || "unknown";
          const failUrl = `/pay/fail/${orderId}?error=${encodeURIComponent(
            error.message
          )}`;
          addLog("실패 페이지로 리다이렉트", { failUrl });
          window.location.href = failUrl;
        }, 3000);
      }
    };

    processPayment();
  }, []);

  return (
    <Container>
      <ProcessingCard>
        <IconContainer>
          <Spinner />
        </IconContainer>

        <Title>결제 승인 처리 중</Title>
        <Message>
          안전한 결제 완료를 위해 승인 처리를 진행하고 있습니다.
          <br />
          잠시만 기다려주세요.
        </Message>

        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>

          <StepList>
            {steps.map((step, index) => (
              <StepItem
                key={index}
                $active={index === currentStep}
                $completed={index < currentStep}
              >
                <StepIcon
                  $active={index === currentStep}
                  $completed={index < currentStep}
                >
                  {index < currentStep ? "✓" : index + 1}
                </StepIcon>
                {step}
              </StepItem>
            ))}
          </StepList>
        </ProgressContainer>

        <DebugBox>
          <DebugTitle>처리 정보</DebugTitle>

          {Object.keys(debugInfo).length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <DebugLabel>결제 파라미터:</DebugLabel>
              {Object.entries(debugInfo).map(
                ([key, value]) =>
                  value && (
                    <DebugItem key={key}>
                      <DebugLabel>{key}:</DebugLabel>{" "}
                      <DebugValue>{value}</DebugValue>
                    </DebugItem>
                  )
              )}
            </div>
          )}

          <div>
            <DebugLabel>처리 로그:</DebugLabel>
            {logs.slice(-5).map((log, index) => (
              <DebugItem key={index}>
                <DebugLabel>[{log.timestamp}]</DebugLabel>{" "}
                <DebugValue>{log.message}</DebugValue>
              </DebugItem>
            ))}
          </div>
        </DebugBox>
      </ProcessingCard>
    </Container>
  );
}
