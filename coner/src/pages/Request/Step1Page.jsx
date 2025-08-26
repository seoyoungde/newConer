import React from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import AddressContactForm from "../../components/request/AddressContactForm";
import NavHeader from "../../components/common/Header/NavHeader";
import StepProgressBar from "../../components/request/StepProgressBar";

const Step1Page = () => {
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service_type");

  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={1} totalSteps={4} />
      <AddressContactForm
        title={`연락받으실 정보 입력`}
        description="기사님께 제공할 주소와 연락처를 입력해주세요."
        buttonText="제출하기"
        service={service}
      />
    </Container>
  );
};

const Container = styled.div``;
export default Step1Page;
