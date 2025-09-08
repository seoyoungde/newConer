import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import NavHeader from "../../components/common/Header/NavHeader";
import PricingTable from "./PriceTable";

const PartnerPricePage = () => {
  // const [showExtraImage, setShowExtraImage] = useState(false);
  const { partnerId } = useParams();
  // const handleShowExtra = () => {
  //   if (!showExtraImage) setShowExtraImage(true);
  // };

  return (
    <Container>
      <NavHeader to={`/partner/step2/${partnerId}`} />
      <PricingTable />

      {/* <ImageWrapper>
        <img src={pricingchartIcon} alt="서비스 비용 도표" />
      </ImageWrapper>

      <ExtraButton onClick={handleShowExtra}>추가비용안내</ExtraButton>

      {showExtraImage && (
        <ImageWrapper>
          <img src={pricingchartoptionsIcon} alt="추가 비용 도표" />
        </ImageWrapper>
      )} */}
    </Container>
  );
};

export default PartnerPricePage;

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
