import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";
import Button from "../../../components/ui/Button";

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
  };

  const handleNext = () => {
    // 에어컨 종류 선택 즉시 다음 페이지로 이동
    onAdvance(3);
    navigate(`/partner/step3/${partnerId}`);
  };
  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  const currentStep = selectedType ? 4 : 3;

  // 선택 단계에 따라 타이틀 변경
  let title = "에어컨 종류를 선택해주세요.";

  return (
    <PageContainer>
      <StepHeader
        to={`/partner/step1/${partnerId}`}
        currentStep={currentStep}
        totalSteps={10}
      />
      <ContentSection>
        <PageTitle>{title}</PageTitle>

        <FormGroup>
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

      {selectedType && (
        <FixedButtonArea>
          <Button fullWidth size="stepsize" onClick={handleNext}>
            확인
          </Button>
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
        </FixedButtonArea>
      )}
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

const FormGroup = styled.div``;

const TypeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
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
  gap: 22px;
  width: 274px;
  height: 200px;
  border-radius: 10px;
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary || "#007BFF" : "none"};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary || "#007BFF" : "#fff"};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#8D989F")};
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
    gap: 12px;
    font-size: ${({ theme }) => theme.font.size.body};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 140px;
    height: 140px;
    gap: 8px;
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
const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const CSButton = styled.button`
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
const FixedButtonArea = styled.div`
  flex-shrink: 0;
  margin-bottom: 87px;
  padding: 16px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 15px;
    margin-bottom: 10px;
  }
`;
