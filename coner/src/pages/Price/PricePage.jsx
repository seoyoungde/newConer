import React, { useState } from "react";
import styled from "styled-components";
import pricingchartIcon from "../../assets/price/pricing-chart.png";
import pricingchartoptionsIcon from "../../assets/price/pricing-chart-options.png";
import TitleHeader from "../../components/common/Header/NavHeader";

const PricingPage = () => {
  const [showExtraImage, setShowExtraImage] = useState(false);

  const handleShowExtra = () => {
    if (!showExtraImage) setShowExtraImage(true);
  };

  return (
    <Container>
      <TitleHeader title="서비스 가격" />

      <ImageWrapper>
        <img src={pricingchartIcon} alt="서비스 비용 도표" />
      </ImageWrapper>

      <ExtraButton onClick={handleShowExtra}>추가비용안내</ExtraButton>

      {showExtraImage && (
        <ImageWrapper>
          <img src={pricingchartoptionsIcon} alt="추가 비용 도표" />
        </ImageWrapper>
      )}
    </Container>
  );
};

export default PricingPage;

const Container = styled.div`
  width: 100%;
`;

const ImageWrapper = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
`;

const ExtraButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  margin-top: 30px;
  margin-bottom: 10px;
  cursor: pointer;
  text-decoration: underline;
`;
