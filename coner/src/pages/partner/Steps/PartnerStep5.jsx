import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const PartnerStep5 = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { requestData, updateRequestData } = useRequest();

  const { onAdvance } = useFunnelStep({ step: 5 });

  const [additionalRequest, setAdditionalRequest] = useState("");

  const handleTextChange = (e) => {
    const value = e.target.value;
    setAdditionalRequest(value);
  };
  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat");
  };

  useEffect(() => {
    if (requestData.detailInfo) {
      const lines = requestData.detailInfo.split("\n");
      const additionalLines = lines.filter(
        (line) => !line.includes("중고") && !line.includes("신규")
      );
      setAdditionalRequest(additionalLines.join("\n"));
    }
  }, [requestData.detailInfo]);

  const handleNext = () => {
    const existingDetail = requestData.detailInfo || "";

    const purchaseTypeLines = existingDetail
      .split("\n")
      .filter((line) => line.includes("중고") || line.includes("신규"));

    const additionalText = additionalRequest.trim();
    const newDetail =
      purchaseTypeLines.length > 0
        ? additionalText
          ? `${purchaseTypeLines.join("\n")}\n${additionalText}`
          : purchaseTypeLines.join("\n")
        : additionalText;

    updateRequestData("detailInfo", newDetail);

    onAdvance(6);
    navigate(`/partner/step6/${partnerId}`);
  };

  const currentStep = additionalRequest.trim() ? 9 : 8;

  return (
    <PageContainer>
      <StepHeader
        to={`/partner/step4/${partnerId}`}
        currentStep={currentStep}
        totalSteps={10}
      />
      <ContentSection>
        <PageTitle>추가 요청사항이 있으신가요?</PageTitle>

        <FormGroup>
          <Label>추가 요청사항</Label>
          <TextArea
            value={additionalRequest}
            onChange={handleTextChange}
            placeholder="추가 요청사항을 입력해주세요 (선택사항)"
            rows={6}
          />
        </FormGroup>
      </ContentSection>

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
    </PageContainer>
  );
};

export default PartnerStep5;

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

const FormGroup = styled.div``;

const Label = styled.p`
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.subtext};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.bg};
  resize: vertical;
  line-height: 1.5;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    min-height: 100px;
  }

  &::placeholder {
    color: #999;
  }

  &:focus-within {
    outline: none;
    border: #f2f3f6;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
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
