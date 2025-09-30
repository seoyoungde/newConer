import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const Step4 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  // 퍼널: 4단계
  const { onAdvance } = useFunnelStep({ step: 4 });

  const [selectedBrand, setSelectedBrand] = useState(requestData.brand || "");

  const brands = [
    { id: "삼성전자", name: "삼성전자" },
    { id: "LG전자", name: "LG전자" },
    { id: "캐리어", name: "캐리어" },
    { id: "센추리", name: "센추리 에어컨" },
    { id: "기타", name: "기타" },
  ];

  useEffect(() => {
    if (requestData.brand && requestData.brand !== selectedBrand) {
      setSelectedBrand(requestData.brand);
    }
  }, [requestData.brand, selectedBrand]);

  const handleBrandSelect = (brandId) => {
    setSelectedBrand(brandId);
    updateRequestData("brand", brandId);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat");
  };

  const handleNext = () => {
    if (!selectedBrand) {
      alert("에어컨 브랜드를 선택해주세요.");
      return;
    }

    updateRequestData("brand", selectedBrand);

    onAdvance(5);
    navigate("/request/step5");
  };

  const currentStep = selectedBrand ? 7 : 6;

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader
          to="/request/step3"
          currentStep={currentStep}
          totalSteps={9}
        />
        <ContentSection>
          <PageTitle>에어컨 브랜드를 선택해주세요.</PageTitle>

          <BrandList>
            {brands.map((brand) => (
              <BrandItem
                key={brand.id}
                onClick={() => handleBrandSelect(brand.id)}
              >
                <BrandName>{brand.name}</BrandName>
                <CheckIcon $isSelected={selectedBrand === brand.id}>
                  {selectedBrand === brand.id && (
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
              </BrandItem>
            ))}
          </BrandList>
        </ContentSection>
      </ScrollableContent>

      {/* 하단 고정 버튼 영역 - 조건부 렌더링 */}
      {selectedBrand && (
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

export default Step4;

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

const BrandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const BrandItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

const BrandName = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#004FFF" : "#D6D6D6")};
  background-color: ${({ $isSelected }) => ($isSelected ? "#004FFF" : "white")};
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
