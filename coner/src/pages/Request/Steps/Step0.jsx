import React, { useState } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const Step0 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();
  const { onAdvance } = useFunnelStep({ step: 0 });

  const [hasAircon, setHasAircon] = useState("");

  const options = [
    { id: "신규", text: "새 에어컨" },
    { id: "중고", text: "중고 에어컨" },
  ];

  const handleOptionSelect = (optionId) => {
    setHasAircon(optionId);

    const purchaseInfo = `${optionId}`;

    const existingDetail = requestData.detailInfo || "";
    const lines = existingDetail.split("\n");
    const nonPurchaseLines = lines.filter(
      (line) => !line.includes("중고") && !line.includes("신규")
    );

    const newDetail =
      nonPurchaseLines.length > 0
        ? `${purchaseInfo}\n${nonPurchaseLines.join("\n")}`
        : purchaseInfo;

    updateRequestData("detailInfo", newDetail);
  };

  const handleNext = () => {
    if (!hasAircon) {
      alert("에어컨 유형을 선택해주세요.");
      return;
    }

    onAdvance(1);
    navigate("/request/step1");
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  const currentStep = hasAircon ? 0 : 0;

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader to="/" currentStep={currentStep} totalSteps={9} />
        <ContentSection>
          <PageTitle>구매할 에어컨 유형을 선택해주세요.</PageTitle>

          <OptionList>
            {options.map((option) => (
              <OptionItem
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
              >
                <OptionText>{option.text}</OptionText>
                <CheckIcon $isSelected={hasAircon === option.id}>
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
              </OptionItem>
            ))}
          </OptionList>
        </ContentSection>
      </ScrollableContent>

      {/* 하단 고정 버튼 영역 - 조건부 렌더링 */}
      {hasAircon && (
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

export default Step0;

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
  margin-bottom: 36px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px 18px 26px;
  cursor: pointer;
  background: white;
  border-radius: 10px;
`;

const OptionText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 16%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#007BFF" : "#A2AFB7")};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#007BFF" : "#A2AFB7"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
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
