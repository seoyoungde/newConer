import React, { useState } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
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

    // 0.5초 후 자동으로 다음 페이지로 이동
    setTimeout(() => {
      onAdvance(1);
      navigate("/request/step1");
    }, 400);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  return (
    <PageContainer>
      <StepHeader to="/" currentStep={0} totalSteps={9} />

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

export default Step0;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-top: 40px;
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
