import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import LeftbannerIcon from "../src/assets/images/leftbanner.jpg";
import Header from "./components/common/Header/Header";
import Navigation from "./components/common/Navigation/Navigation";

const Layout = () => {
  return (
    <Container>
      <LeftImage>
        <img src={LeftbannerIcon} alt="코너 배너" loading="lazy" />
      </LeftImage>
      <RightBox>
        <HeaderArea>
          <Header />
        </HeaderArea>
        <ScrollArea>
          <ContentBox>
            <Outlet />
          </ContentBox>
        </ScrollArea>

        <NavArea>
          <Navigation />
        </NavArea>

        <div id="rightbox-modal-root" />
      </RightBox>
    </Container>
  );
};
export default Layout;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
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
`;

const HeaderArea = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

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
  max-width: 605px;
  height: 100%;
`;

const NavArea = styled.nav`
  position: sticky;
  bottom: 0;
  z-index: 10;
`;
