import React, { useState } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";

const Step0 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  const [hasAircon, setHasAircon] = useState("");

  const options = [
    { id: "중고", text: "중고에어컨으로 구매원해요." },
    { id: "신규", text: "신규에어컨으로 구매원해요." },
  ];

  const handleOptionSelect = (optionId) => {
    setHasAircon(optionId);

    const purchaseInfo = `${optionId}에어컨으로 원해요`;

    const existingDetail = requestData.detailInfo || "";
    const lines = existingDetail.split("\n");
    const nonPurchaseLines = lines.filter(
      (line) =>
        !line.includes("중고에어컨으로 원해요") &&
        !line.includes("신규에어컨으로 원해요")
    );

    const newDetail =
      nonPurchaseLines.length > 0
        ? `${purchaseInfo}\n${nonPurchaseLines.join("\n")}`
        : purchaseInfo;

    updateRequestData("detailInfo", newDetail);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat");
  };

  const handleNext = () => {
    if (!hasAircon) {
      alert("구매 유형을 선택해주세요.");
      return;
    }

    navigate("/request/step1");
  };

  const currentStep = hasAircon ? 0 : 0;

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader to="/" currentStep={currentStep} totalSteps={9} />
        <ContentSection>
          <PageTitle>구매할 에어컨을 선택해주세요</PageTitle>

          <OptionList>
            {options.map((option) => (
              <OptionItem
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
              >
                <OptionText>{option.text}</OptionText>
                <CheckIcon $isSelected={hasAircon === option.id}>
                  {hasAircon === option.id && (
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
                  )}
                </CheckIcon>
              </OptionItem>
            ))}
          </OptionList>
        </ContentSection>
      </ScrollableContent>

      {hasAircon && (
        <FixedButtonArea>
          <Button fullWidth size="stepsize" onClick={handleNext}>
            확인
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
  min-height: 0; /* flexbox overflow 버그 방지 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* 스크롤 성능 최적화 */
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
  background: ${({ theme }) => theme.colors.bg};
  padding: 16px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 15px;
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
  gap: 0;
`;

const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  cursor: pointer;
`;

const OptionText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#007BFF" : "#D6D6D6")};
  background-color: ${({ $isSelected }) => ($isSelected ? "#007BFF" : "white")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
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
