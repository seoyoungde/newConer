import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { FaPhoneAlt } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const Navigation = () => {
  const { partnerId } = useParams();

  const handlePhoneClick = (e) => {
    e.preventDefault();
    const phoneNumber = "02-4333-114";

    if (isMobileDevice()) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // 데스크톱에서는 전화번호를 클립보드에 복사
      navigator.clipboard.writeText(phoneNumber).then(() => {
        alert(`전화번호 ${phoneNumber}가 클립보드에 복사되었습니다.`);
      });
    }
  };

  return (
    <NavBar>
      <PromoBar>수수료 없이 가장 빠른 에어컨 서비스 받기</PromoBar>
      <Actions>
        <Hrefs>
          <Actionhref href="#" onClick={handlePhoneClick}>
            <FaPhoneAlt size={23} />
            전화 상담
          </Actionhref>
          <Actionhref
            href="https://talk.naver.com/profile/c/coner"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BsChatDotsFill size={23} />
            톡톡 상담
          </Actionhref>
        </Hrefs>
        <PrimaryLink to={`/partner/step0/${partnerId}`}>
          무료 견적 받아보기
        </PrimaryLink>
      </Actions>
    </NavBar>
  );
};

export default Navigation;

const NavBar = styled.nav`
  width: 100%;
  height: 126px;
  text-align: center;
  background: ${({ theme }) => theme.colors.bg};
`;

const PromoBar = styled.div`
  height: 37px;
  background-color: black;
  color: white;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  line-height: 37px;
`;

const Actions = styled.div`
  display: flex;
  height: 89px;
  padding: 0px 14px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 7px;
  }
`;

const Hrefs = styled.div`
  display: flex;
  flex: 1.5;
  justify-content: space-around;
  margin-right: 15px;
`;

const Actionhref = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: #8b8b8b;
  background: ${({ theme }) => theme.colors.bg};
  cursor: pointer;
  &:hover {
    color: #8b8b8b;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.small};
  }
`;

const PrimaryLink = styled(Link)`
  flex: 3;
  margin: auto;
  background: #004fff;
  color: white;
  height: 62px;
  font-size: ${({ theme }) => theme.font.size.h3};
  line-height: 62px;
  border-radius: 15px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
  &:hover {
    color: white;
  }
  &:focus-visible {
    outline: 2px solid #000;
    outline-offset: 2px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex: 3;
    font-size: 17px;
  }
`;
