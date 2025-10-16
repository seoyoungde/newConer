import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

import Type1Icon from "../../../assets/servicetype/servicesType_1.png";
import Type3Icon from "../../../assets/servicetype/servicesType_3.png";
import Type4Icon from "../../../assets/servicetype/servicesType_4.png";
import Type5Icon from "../../../assets/servicetype/servicesType_5.png";

const PartnerStep2 = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { requestData, updateRequestData } = useRequest();

  // 퍼널: 2단계
  const { onAdvance } = useFunnelStep({ step: 2 });

  const [selectedType, setSelectedType] = useState(
    requestData.aircon_type || ""
  );

  const [selectedServiceType, setSelectedServiceType] = useState(
    requestData.service_type || ""
  );

  const airconTypes = [
    { id: "스탠드형", name: "스탠드형", icon: Type4Icon },
    { id: "벽걸이형", name: "벽걸이형", icon: Type1Icon },
    { id: "천장형", name: "천장형", icon: Type3Icon },
    { id: "항온항습기", name: "항온항습기", icon: Type5Icon },
  ];

  const serviceTypes = [
    { id: "설치", name: "설치" },
    { id: "냉매충전", name: "냉매충전" },
    { id: "수리", name: "수리" },
    { id: "설치 및 구매", name: "설치 및 구매" },
    { id: "이전설치", name: "이전설치" },
    { id: "청소", name: "청소" },
  ];

  useEffect(() => {
    if (requestData.aircon_type && requestData.aircon_type !== selectedType) {
      setSelectedType(requestData.aircon_type);
    }
  }, [requestData.aircon_type, selectedType]);

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    updateRequestData("aircon_type", typeId);
    updateRequestData("service_type", selectedServiceType);

    // 에어컨 종류 선택 즉시 다음 페이지로 이동
    onAdvance(3);
    navigate(`/partner/step3/${partnerId}`);
  };

  const handleServiceTypeSelect = (typeId) => {
    setSelectedServiceType(typeId);
    updateRequestData("service_type", typeId);
  };

  // 서비스 유형 선택하면 6, 아니면 5
  const currentStep = selectedServiceType ? 3 : 2;

  // 선택 단계에 따라 타이틀 변경
  let title = "서비스 유형을 선택해주세요.";
  if (selectedServiceType) {
    title = "에어컨 종류를 선택해주세요.";
  }

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader
          to={`/partner/step1/${partnerId}`}
          currentStep={currentStep}
          totalSteps={10}
        />
        <ContentSection>
          <PageTitle>{title}</PageTitle>

          <FormGroup>
            <Label>서비스 유형</Label>
            <ServiceTypeContainer>
              {serviceTypes.map((type) => (
                <ServiceType
                  key={type.id}
                  $isSelected={selectedServiceType === type.id}
                  onClick={() => handleServiceTypeSelect(type.id)}
                >
                  {type.name}
                </ServiceType>
              ))}
            </ServiceTypeContainer>
          </FormGroup>

          {/* 서비스 유형 선택 후에만 에어컨 종류 표시 */}
          {selectedServiceType && (
            <FormGroup>
              <Label>에어컨 종류</Label>
              <TypeContainer>
                {airconTypes.map((type) => (
                  <Type
                    key={type.id}
                    $isSelected={selectedType === type.id}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <TypeImg
                      src={type.icon}
                      alt={type.name}
                      $isSelected={selectedType === type.id}
                    />
                    {type.name}
                  </Type>
                ))}
              </TypeContainer>
            </FormGroup>
          )}
        </ContentSection>
      </ScrollableContent>
    </PageContainer>
  );
};

export default PartnerStep2;

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

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.p`
  margin-bottom: 6px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.subtext};
`;

const TypeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    justify-items: center;
  }
`;

const Type = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 133px;
  height: 133px;
  border-radius: 10px;
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary || "#007BFF" : "#a0a0a0"};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary || "#007BFF" : "#fff"};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ $isSelected }) => ($isSelected ? "800" : "600")};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary || "#007BFF"};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 165px;
    height: 165px;
    gap: 6px;
    font-size: ${({ theme }) => theme.font.size.body};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 135px;
    height: 135px;
    gap: 4px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
  }
`;

const ServiceTypeContainer = styled.div`
  display: flex;
  justify-content: space-between;

  flex-wrap: wrap;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: center;
  }
`;

const ServiceType = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 87px;
  height: 60px;
  border-radius: 10px;
  margin-bottom: 8px;

  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary || "#007BFF" : "#a0a0a0"};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary || "#007BFF" : "#fff"};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ $isSelected }) => ($isSelected ? "700" : "500")};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary || "#007BFF"};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 108px;
    height: 50px;
    font-size: ${({ theme }) => theme.font.size.body};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 89px;
    height: 40px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
  }
`;

const TypeImg = styled.img`
  width: 88px;
  height: 88px;
  transition: filter 0.2s ease;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 104px;
    height: 104px;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 78px;
    height: 78px;
  }
`;
