import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import NavHeader from "../../components/common/Header/NavHeader";
import Modify from "../../components/modify/Modify";

const PartnerModifyPage = () => {
  const { partnerId } = useParams();

  return (
    <Container>
      <NavHeader to={`/partner/step4/${partnerId}`} title="내 정보 수정" />
      <Modify />
    </Container>
  );
};

export default PartnerModifyPage;

const Container = styled.div`
  width: 100%;
  margin-top: 20px;
  box-sizing: border-box;
`;
