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
      window.location.href = "tel:010-5543-0636";
    } else {
      setShowPopup(true);
    }
  };
  return (
    <NavBar>
      <PromoBar>수수료 없이 가장 빠른 에어컨 서비스 받기</PromoBar>
      <Actions>
        <Actionhref href="tel:010-5543-0636" onClick={handlePhoneClick}>
          <FaPhoneAlt size={28} />
          전화 상담
        </Actionhref>
        <Actionhref
          href="https://talk.naver.com/ct/w7a8bh2#nafullscreen"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BsChatDotsFill size={28} />
          톡톡 상담
        </Actionhref>
        <PrimaryLink to={`/partner/address-contact/${partnerId}`}>
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
          010-5543-0636
        </strong>
      </Modal>
    </NavBar>
  );
};
export default Navigation;
const NavBar = styled.nav`
  width: 100%;
  height: 146px;
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
  height: 109px;
  padding: 0px 34px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;

const Actionhref = styled.a`
  flex: 1;
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
`;

const PrimaryLink = styled(Link)`
  flex: 4;
  margin: auto;
  background: #004fff;
  color: white;
  height: 82px;
  font-size: ${({ theme }) => theme.font.size.h3};
  line-height: 82px;
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
