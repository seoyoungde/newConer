import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import RequestHeader from "../../components/common/Header/RequestHeader";
import Modify from "../../components/modify/Modify";

const PartnerModifyPage = () => {
  const { partnerId } = useParams();

  return (
    <Container>
      <RequestHeader
        showPrevButton={false}
        userName="내 정보 수정"
        to={`/partner/step4/${partnerId}`}
      />

      <Modify />
    </Container>
  );
};

export default PartnerModifyPage;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
