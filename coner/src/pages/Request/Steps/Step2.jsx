import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

import Type1Icon from "../../../assets/servicetype/servicesType_1.png";
import Type3Icon from "../../../assets/servicetype/servicesType_3.png";
import Type4Icon from "../../../assets/servicetype/servicesType_4.png";
import Type5Icon from "../../../assets/servicetype/servicesType_5.png";

const Step2 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  // 퍼널: 2단계
  const { onAdvance } = useFunnelStep({ step: 2 });

  const [selectedType, setSelectedType] = useState(
    requestData.aircon_type || ""
  );

  const airconTypes = [
    { id: "스탠드형", name: "스탠드형", icon: Type4Icon },
    { id: "벽걸이형", name: "벽걸이형", icon: Type1Icon },
    { id: "천장형", name: "천장형", icon: Type3Icon },
    { id: "항온항습기", name: "항온항습기", icon: Type5Icon },
  ];

  useEffect(() => {
    if (requestData.aircon_type && requestData.aircon_type !== selectedType) {
      setSelectedType(requestData.aircon_type);
    }
  }, [requestData.aircon_type, selectedType]);

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    updateRequestData("aircon_type", typeId);

    // 선택 즉시 다음 페이지로 이동
    onAdvance(3);
    navigate("/request/step3");
  };

  const title = "에어컨 종류를 선택해주세요.";

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader to="/request/step1" currentStep={2} totalSteps={9} />
        <ContentSection>
          <PageTitle>{title}</PageTitle>

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
        </ContentSection>
      </ScrollableContent>
    </PageContainer>
  );
};

export default Step2;

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
    width: 180px;
    height: 180px;
    gap: 6px;
    font-size: ${({ theme }) => theme.font.size.body};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 140px;
    height: 140px;
    gap: 4px;
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
