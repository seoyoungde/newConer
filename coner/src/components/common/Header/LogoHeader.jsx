import React from "react";
import { Link } from "react-router-dom";
import Headerlogo from "../../../assets/images/headerlogo.png";
import styled from "styled-components";

const LogoHeader = () => {
  return (
    <HeaderBar>
      <LogoLink to="/" aria-label="홈으로 이동">
        <Logo src={Headerlogo} alt="코너 로고" width={57} height={28} />
      </LogoLink>
    </HeaderBar>
  );
};
export default LogoHeader;
const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  background: white;
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;
const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
`;
const Logo = styled.img`
  height: 28px;
  display: block;
`;
