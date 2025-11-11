import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const Step3 = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  const { onAdvance } = useFunnelStep({ step: 3 });

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

    // 0.5초 후 자동으로 다음 페이지로 이동
    setTimeout(() => {
      onAdvance(4);
      navigate("/request/step4");
    }, 400);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  return (
    <PageContainer>
      <StepHeader to="/request/step2" currentStep={3} totalSteps={9} />
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
            </BrandItem>
          ))}
        </BrandList>

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

export default Step3;

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

const BrandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BrandItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px 18px 26px;
  cursor: pointer;
  background: white;
  border-radius: 10px;
`;

const BrandName = styled.span`
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
