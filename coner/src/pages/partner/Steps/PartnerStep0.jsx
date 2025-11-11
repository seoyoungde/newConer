import React, { useState } from "react";
import StepHeader from "../../../components/common/Header/StepHeader";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const PartnerStep0 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();
  const { partnerId } = useParams();

  const { onAdvance } = useFunnelStep({ step: 0 });
  const [selectedServiceType, setSelectedServiceType] = useState(
    requestData.service_type || ""
  );
  const serviceTypes = [
    { id: "설치", name: "설치" },
    { id: "냉매충전", name: "냉매충전" },
    { id: "수리", name: "수리" },
    { id: "설치 및 구매", name: "설치 및 구매" },
    { id: "이전설치", name: "이전설치" },
    { id: "청소", name: "청소" },
  ];

  const handleServiceTypeSelect = (serviceTypeId) => {
    setSelectedServiceType(serviceTypeId);
    updateRequestData("service_type", serviceTypeId);

    // 0.5초 후 자동으로 다음 페이지로 이동
    setTimeout(() => {
      onAdvance(1);

      if (serviceTypeId === "설치 및 구매") {
        navigate(`/partner/step0/purchase/${partnerId}`);
      } else {
        navigate(`/partner/step1/${partnerId}`);
      }
    }, 400);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  const handleKeyPress = (e, serviceTypeId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleServiceTypeSelect(serviceTypeId);
    }
  };

  return (
    <PageContainer>
      <StepHeader to="/" currentStep={0} totalSteps={10} />

      <ContentSection>
        <PageTitle>받고 싶은 서비스 유형을 선택해주세요.</PageTitle>
        <ServiceTypeList>
          {serviceTypes.map((serviceType) => (
            <ServiceTypeItem
              key={serviceType.id}
              onClick={() => handleServiceTypeSelect(serviceType.id)}
              onKeyPress={(e) => handleKeyPress(e, serviceType.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedServiceType === serviceType.id}
            >
              <ServiceTypeName>{serviceType.name}</ServiceTypeName>
              <CheckIcon $isSelected={selectedServiceType === serviceType.id}>
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L5 9L13 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </CheckIcon>
            </ServiceTypeItem>
          ))}
        </ServiceTypeList>

        {/* 도움 버튼 */}
        <CSButtonContainer>
          <CSButton onClick={handleHelpClick}>
            <CSButtonText>도움이 필요해요</CSButtonText>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
            >
              <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
            </svg>
          </CSButton>
        </CSButtonContainer>
      </ContentSection>
    </PageContainer>
  );
};

export default PartnerStep0;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const ContentSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const ServiceTypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ServiceTypeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px 18px 26px;
  cursor: pointer;
  background: white;
  border-radius: 10px;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 79, 255, 0.3);
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const ServiceTypeName = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 16%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#004FFF" : "#A2AFB7")};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#004FFF" : "#A2AFB7"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
`;

const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const CSButton = styled.div`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;

const CSButtonText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;
