import React from "react";
import styled from "styled-components";

const Navigation = () => {
  return (
    <NavBar>
      <PromoBar>수수료 없이 가장 빠른 에어컨 서비스 받기</PromoBar>
      <p>456</p>
    </NavBar>
  );
};
const NavBar = styled.nav`
  width: 100%;
  height: 146px;
  text-align: center;
`;
const PromoBar = styled.div`
  height: 37px;
  background-color: black;
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 37px;
`;
export default Navigation;
