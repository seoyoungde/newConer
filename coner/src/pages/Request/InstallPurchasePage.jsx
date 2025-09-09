import React from "react";
import styled from "styled-components";
import AirconditionerForm from "../../components/request/AirconditionerForm";
import { useNavigate } from "react-router-dom";
import StepProgressBar from "../../components/request/StepProgressBar";
import NavHeader from "../../components/common/Header/NavHeader";

const InstallpurchasePage = () => {
  const navigate = useNavigate();

  const handleFormSubmit = (selectedOption) => {
    navigate("/request/step1");
  };

  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={0} totalSteps={2} />
      <AirconditionerForm
        options={["중고에어컨으로 구매원해요", "신규에어컨으로 구매원해요"]}
        title="에어컨 선택"
        description="설치하실 에어컨의 종류를 선택해주세요"
        buttonText="다음으로"
        boxWidths={["200px", "200px"]}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
export default InstallpurchasePage;
