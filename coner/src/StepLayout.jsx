// StepLayout.js - 단순한 컨테이너만 제공
import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import LeftbannerIcon from "../src/assets/images/leftbanner.jpg";

const StepLayout = () => {
  return (
    <Container>
      <LeftImage>
        <img src={LeftbannerIcon} alt="코너 배너" loading="lazy" />
      </LeftImage>
      <RightBox>
        {/* 각 Step 컴포넌트에서 전체 레이아웃 관리 */}
        <Outlet />
        <div id="rightbox-modal-root" />
      </RightBox>
    </Container>
  );
};

export default StepLayout;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100dvh;
  align-items: center;
  justify-content: center;

  gap: 20px;
`;

const LeftImage = styled.aside`
  width: 380px;
  img {
    width: 100%;
    display: block;
  }
  @media (max-width: 1050px) {
    display: none;
  }
`;

const RightBox = styled.main`
  position: relative;
  width: 605px;
  height: 100%;
  border: 1px solid #d4d4d4;
  box-sizing: border-box;
  background-color: #f2f3f6;

  /* Outlet이 전체 높이를 사용할 수 있도록 */
  display: flex;
  flex-direction: column;
`;
