import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { FaPhoneAlt, FaSadCry } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import Modal from "../Modal/Modal";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const Navigation = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { partnerId } = useParams();

  const handlePhoneClick = (e) => {
    e.preventDefault();
    if (isMobileDevice()) {
      window.location.href = "tel:010-9039-5572";
    } else {
      setShowPopup(true);
    }
  };
  return (
    <NavBar>
      <PromoBar>수수료 없이 가장 빠른 에어컨 서비스 받기</PromoBar>
      <Actions>
        <Hrefs>
          <Actionhref href="tel:010-9039-5572" onClick={handlePhoneClick}>
            <FaPhoneAlt size={23} />
            전화 상담
          </Actionhref>
          <Actionhref
            href="https://talk.naver.com/ct/w7a8bh2#nafullscreen"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BsChatDotsFill size={23} />
            톡톡 상담
          </Actionhref>
        </Hrefs>
        <PrimaryLink to={`/partner/step1/${partnerId}`}>
          온라인으로 서비스 신청하기
        </PrimaryLink>
      </Actions>
      <Modal
        open={showPopup}
        onClose={() => setShowPopup(false)}
        title="전화 상담 안내"
        width={320}
        containerId="rightbox-modal-root"
      >
        <strong style={{ color: "#007bff", fontSize: "1rem" }}>
          010-9039-5572
        </strong>
      </Modal>
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
    font-size: ${({ theme }) => theme.font.size.body};
  }
`;
