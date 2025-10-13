import React from "react";
import { Link } from "react-router-dom";
import Headerlogo from "../../../assets/images/headerlogo.png";
import styled from "styled-components";
import { useAuth } from "../../../context/AuthProvider";

const Header = () => {
  const { currentUser } = useAuth();

  const avatarSrc = currentUser?.photoURL || "/default-profile.jpg";

  return (
    <HeaderBar>
      <LogoLink to="/" aria-label="홈으로 이동">
        <Logo src={Headerlogo} alt="코너 로고" width={57} height={28} />
      </LogoLink>

      <Actions>
        {currentUser ? (
          <ProfileLink to="/mypage" aria-label="마이페이지로 이동">
            마이페이지
          </ProfileLink>
        ) : (
          <LoginLink to="/login">로그인</LoginLink>
        )}
      </Actions>
    </HeaderBar>
  );
};

export default Header;

const HeaderBar = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 55px;
  padding: 0px 34px;

  background: white;
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
const Actions = styled.div`
  display: inline-flex;
  align-items: center;
`;

const LoginLink = styled(Link)`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.font.size.body};
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

const ProfileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #000;
    outline-offset: 2px;
  }
`;
