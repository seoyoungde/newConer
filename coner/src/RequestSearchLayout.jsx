import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import LeftbannerIcon from "../src/assets/images/leftbanner.jpg";

const RequestSearchLayout = () => {
  return (
    <Container>
      <LeftImage>
        <img src={LeftbannerIcon} alt="코너 배너" loading="lazy" />
      </LeftImage>
      <RightBox>
        <ScrollArea>
          <ContentBox>
            <Outlet />
          </ContentBox>
        </ScrollArea>

        <div id="rightbox-modal-root" />
      </RightBox>
    </Container>
  );
};
export default RequestSearchLayout;

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
  display: flex;
  height: 100%;
  flex-direction: column;
  border: 1px solid #d4d4d4;
  box-sizing: border-box;
  background-color: #f2f3f6;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  // padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  scrollbar-width: none;

  -ms-overflow-style: none;
`;

const ContentBox = styled.div`
  width: 100%;
  max-width: 605px;
  height: 100%;
`;
