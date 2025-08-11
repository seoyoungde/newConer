import React from "react";
import { Link } from "react-router-dom";
import Headerlogo from "../../../assets/images/headerlogo.png";
import styled from "styled-components";

const Header = () => {
  return (
    <HeaderBar>
      <LogoLink to="/" aria-label="홈으로 이동">
        <Logo src={Headerlogo} alt="코너 로고" width={57} height={28} />
      </LogoLink>

      <Actions>
        <LoginLink to="/login">로그인</LoginLink>
      </Actions>
    </HeaderBar>
  );
};
const HeaderBar = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 0px 34px;
`;
const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
`;
const Logo = styled.img`
  height: 28px;
  display: block;
`;
const Actions = styled.div`
  display: inline-flex;
  align-items: center;
`;
const LoginLink = styled(Link)`
  color: #8f8f8f;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: #6e6e6e;
  }
  &:focus-visible {
    outline: 2px solid #000;
    outline-offset: 2px;
  }
`;
export default Header;
