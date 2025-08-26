import React from "react";
import styled from "styled-components";
import AirconditionerForm from "../../components/request/AirconditionerForm";
import { useNavigate } from "react-router-dom";
import NavHeader from "../../components/common/Header/NavHeader";
import StepProgressBar from "../../components/request/StepProgressBar";

const InstallPage = () => {
  const navigate = useNavigate();

  const handleFormSubmit = (selectedOption) => {
    navigate("/request/step1");
  };

  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={0} totalSteps={4} />
      <AirconditionerForm
        options={[
          "에어컨 구매까지 원해요",
          "에어컨은 있어요. 설치 서비스만 원해요",
        ]}
        title="에어컨 보유 여부"
        description="현재 설치하실 에어컨을 가지고 있습니까?"
        buttonText="다음으로"
        boxWidths={["170px", "250px"]}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
export default InstallPage;
