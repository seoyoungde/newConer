import React from "react";
import styled from "styled-components";
import PartnerAddressContactForm from "../../components/request/PartnerAddressContactForm";
import NavHeader from "../../components/common/Header/NavHeader";
import StepProgressBar from "../../components/request/StepProgressBar";

const PartnerStep1Page = () => {
  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={1} totalSteps={4} />
      <PartnerAddressContactForm
        title={`서비스 신청`}
        description="기사님께 제공할 주소와 연락처를 입력해주세요."
        buttonText="의뢰 시작하기"
      />
    </Container>
  );
};

const Container = styled.div``;
export default PartnerStep1Page;
