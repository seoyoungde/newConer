import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Modify from "../../components/modify/Modify";
import RequestHeader from "../../components/common/Header/RequestHeader";

const RequestModifyPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <RequestHeader
        showPrevButton={false}
        userName="내 정보 수정"
        to="/request/step4"
      />

      <Modify />
    </Container>
  );
};

export default RequestModifyPage;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
