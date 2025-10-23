import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";
import AgreementForm from "../../../components/request/AgreementForm";
import Modal from "../../../components/common/Modal/Modal";
import { useAuth } from "../../../context/AuthProvider";
import { auth } from "../../../lib/firebase";
import axios from "axios";

const Step6 = () => {
  const navigate = useNavigate();
  const { requestData, submitRequest, resetRequestData, updateRequestData } =
    useRequest();
  const { currentUser } = useAuth();

  // 퍼널: 6단계 (마지막)
  const { onComplete } = useFunnelStep({ step: 6 });

  const [agreementsOK, setAgreementsOK] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";
    const numbers = phone.replace(/[^\d]/g, "");
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7
      )}`;
    }
    return phone;
  };

  const confirmationData = useMemo(() => {
    return {
      serviceType: requestData.service_type || "",
      phone: formatPhoneForDisplay(requestData.customer_phone),
      address: `${requestData.customer_address || ""} ${
        requestData.customer_address_detail || ""
      }`.trim(),
      customerType: requestData.customer_type || "",
      date: requestData.service_date || "",
      datetime: requestData.service_time || "",
      airconType: requestData.aircon_type || "",
      brand: requestData.brand || "",

      additionalRequest: requestData.detailInfo || "없음",
    };
  }, [requestData]);

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat");
  };

  const handleSubmit = async () => {
    if (!agreementsOK) {
      setPopupMessage("약관(필수)에 모두 동의해주세요.");
      return;
    }

    const requiredFields = [
      ["service_type", "서비스 타입을 선택해주세요."],
      ["customer_phone", "휴대폰 번호를 입력해주세요."],
      ["customer_address", "주소를 입력해주세요."],
      ["customer_address_detail", "상세주소를 입력해주세요."],
      ["customer_type", "고객 유형을 선택해주세요."],
      ["service_date", "서비스 날짜를 선택해주세요."],
      ["service_time", "서비스 시간을 선택해주세요."],
      ["aircon_type", "에어컨 종류를 선택해주세요."],
      ["brand", "브랜드를 선택해주세요."],
    ];

    for (const [key, message] of requiredFields) {
      if (!requestData[key]) {
        console.error(`필수 데이터 누락: ${key} = ${requestData[key]}`);
        setPopupMessage(message);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const user = auth.currentUser;
      const clientId = user?.uid || "";

      const digitsPhone = requestData.customer_phone.replace(/[^\d]/g, "");

      const n_keyword = sessionStorage.getItem("n_keyword") || "";
      const n_ad = sessionStorage.getItem("n_ad") || "";
      const n_rank = sessionStorage.getItem("n_rank") || "";
      const trackingInfo = [
        `n_keyword=${n_keyword}`,
        `n_ad=${n_ad}`,
        `n_rank=${n_rank}`,
      ];
      const updatedSprint = [
        ...(requestData.sprint || []),
        JSON.stringify(trackingInfo),
      ];

      const payload = {
        ...requestData,
        customer_uid: clientId,
        sprint: updatedSprint,
        customer_phone: digitsPhone,

        service_type: requestData.service_type,
      };

      const requestId = await submitRequest(payload);

      // SMS 알림 전송 시도
      try {
        await axios.post("https://api.coner.kr/sms/notify", {
          service_date: requestData.service_date,
          service_time: requestData.service_time,
          brand: requestData.brand,
          aircon_type: requestData.aircon_type,
          service_type: payload.service_type,
          customer_address: requestData.customer_address,
          customer_phone: digitsPhone,
        });
      } catch (err) {
        console.error("❌ 알림 전송 실패:", err.response?.data || err.message);
      }

      // 퍼널 완료 처리
      onComplete();

      resetRequestData();

      navigate("/request/submitsuccess", {
        state: { customer_phone: digitsPhone, requestId },
      });
    } catch (error) {
      console.error("제출 오류:", error);
      setPopupMessage("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = 9;

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader
          to="/request/step5"
          currentStep={currentStep}
          totalSteps={9}
        />
        <ContentSection>
          <PageTitle>아래 정보가 맞는지 확인해주세요.</PageTitle>

          <InfoList>
            <SectionTitle>방문 희망일</SectionTitle>
            <TwoColumnGrid>
              <Section>
                <ValueBox style={{ color: "#004FFF", fontWeight: "600" }}>
                  {confirmationData.date || "없음"}
                </ValueBox>
              </Section>
              <Section>
                <ValueBox style={{ color: "#004FFF", fontWeight: "600" }}>
                  {confirmationData.datetime || "없음"}
                </ValueBox>
              </Section>
            </TwoColumnGrid>

            {/* 서비스 세부 내역 */}

            <SectionTitle>서비스 세부내역</SectionTitle>
            <ThreeColumnGrid>
              <Section>
                <ValueBox>{confirmationData.brand || "없음"}</ValueBox>
              </Section>
              <Section>
                <ValueBox>{confirmationData.airconType || "없음"}</ValueBox>
              </Section>
              <Section>
                <ValueBox>{confirmationData.serviceType || "없음"}</ValueBox>
              </Section>
            </ThreeColumnGrid>

            <SectionTitle>주소</SectionTitle>
            <Section>
              <ValueBox>{confirmationData.address || "없음"}</ValueBox>
            </Section>
            {/* 연락처와 의뢰인 유형 */}
            <TwoColumnGrid>
              <div>
                <SectionTitle>연락처</SectionTitle>
                <Section>
                  <ValueBox>{confirmationData.phone}</ValueBox>
                </Section>
              </div>

              <div>
                <SectionTitle>의뢰인 유형</SectionTitle>
                <Section>
                  <ValueBox>{confirmationData.customerType}</ValueBox>
                </Section>
              </div>
            </TwoColumnGrid>

            <SectionTitle>추가 요청사항</SectionTitle>
            <Section style={{ whiteSpace: "pre-line" }}>
              <ValueBox style={{ whiteSpace: "pre-line" }}>
                {confirmationData.additionalRequest}
              </ValueBox>
            </Section>
          </InfoList>

          {/* 약관 동의 */}
          <AgreementSection>
            <AgreementForm onRequiredChange={setAgreementsOK} />
          </AgreementSection>
        </ContentSection>
      </ScrollableContent>

      {/* 하단 고정 버튼 영역 */}
      <FixedButtonArea>
        <Button
          fullWidth
          size="stepsize"
          onClick={handleSubmit}
          disabled={!agreementsOK || isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "의뢰하기"}
        </Button>
        <HelpButton onClick={handleHelpClick}>
          <HelpText>도움이 필요해요</HelpText>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
          >
            <path
              d="M1 1L5 5L1 9"
              stroke="#A0A0A0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </HelpButton>
      </FixedButtonArea>

      {/* 팝업 모달 */}
      <Modal
        open={!!popupMessage}
        onClose={() => setPopupMessage("")}
        width={320}
        containerId="rightbox-modal-root"
      >
        {popupMessage}
      </Modal>
    </PageContainer>
  );
};

export default Step6;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const ScrollableContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  transform: translateZ(0);

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const ContentSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const FixedButtonArea = styled.div`
  flex-shrink: 0;
  margin-bottom: 87px;
  padding: 16px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 15px;
    margin-bottom: 10px;
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 41px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;

  margin-bottom: 32px;
`;

const SectionTitle = styled.span`
  font-size: 18px;
  font-weight: 700;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const AgreementSection = styled.div`
  margin-bottom: 24px;
`;

const HelpButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  margin: 20px auto 0 auto;
  padding: 8px;

  &:hover {
    background-color: #f8f9fa;
    border-radius: 4px;
  }
`;

const HelpText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;
const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1fr;
  gap: 8px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  margin-top: 12px;
`;
const ValueBox = styled.div`
  font-weight: 500;
  background: #ffffff;
  padding: 14px 0px 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
    padding: 12px 0px 12px 12px;
  }
`;

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  }
`;
