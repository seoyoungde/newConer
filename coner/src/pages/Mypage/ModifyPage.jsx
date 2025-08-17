import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import NavHeader from "../../components/common/Header/NavHeader";
import Modify from "../../components/modify/Modify";

const ModifyPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <NavHeader to="/mypage" title="내 정보 수정" />
      <Modify />
    </Container>
  );
};

export default ModifyPage;

const Container = styled.div`
  width: 100%;
  margin-top: 20px;
  box-sizing: border-box;
`;
