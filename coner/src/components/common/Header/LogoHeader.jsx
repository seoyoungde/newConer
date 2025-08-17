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
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  border-bottom: 1px solid #d4d4d4;
`;
const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
`;
const Logo = styled.img`
  height: 28px;
  display: block;
`;
