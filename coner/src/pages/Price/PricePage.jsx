import React, { useState } from "react";
import styled from "styled-components";
import RequestHeader from "../../components/common/Header/RequestHeader";
import PricingTable from "./PriceTable";

const PricingPage = () => {
  const [showExtraImage, setShowExtraImage] = useState(false);

  const handleShowExtra = () => {
    if (!showExtraImage) setShowExtraImage(true);
  };

  return (
    <Container>
      <RequestHeader showPrevButton={false} userName="" to="/" />

      {/* 
      <ImageWrapper>
        <img src={pricingchartIcon} alt="서비스 비용 도표" />
      </ImageWrapper> */}
      <PricingTable />
      {/* <ExtraButton onClick={handleShowExtra}>추가비용안내</ExtraButton>

       {showExtraImage && (
        <ImageWrapper>
          <img src={pricingchartoptionsIcon} alt="추가 비용 도표" />
        </ImageWrapper>
      )}  */}
    </Container>
  );
};

export default PricingPage;

const Container = styled.div``;
