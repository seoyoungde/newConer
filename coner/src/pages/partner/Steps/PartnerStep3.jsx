import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";

const PartnerStep3 = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { requestData, updateRequestData } = useRequest();

  // 퍼널: 3단계
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

    // 선택 즉시 다음 페이지로 이동
    onAdvance(4);
    navigate(`/partner/step4/${partnerId}`);
  };

  return (
    <PageContainer>
      <ScrollableContent>
        <StepHeader
          to={`/partner/step2/${partnerId}`}
          currentStep={4}
          totalSteps={10}
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
    </PageContainer>
  );
};

export default PartnerStep3;

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
