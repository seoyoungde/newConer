import React, { useState } from "react";
import styled from "styled-components";
import {
  MdOutlineHeadsetMic,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { SiNaver, SiInstagram } from "react-icons/si";
import FooterLogo from "../../assets/images/footerlogo.png";

const Footer = () => {
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);

  const toggleBusinessInfo = () => {
    setIsBusinessInfoOpen(!isBusinessInfoOpen);
  };

  return (
    <Section>
      <Logo src={FooterLogo} alt="코너로고" />
      <Divider />
      <LinksRow>
        <Footerhref
          href="https://www.notion.so/harvies/v-20250806-2475c6005f1280128afbca706f57af23"
          target="_blank"
          rel="noopener noreferrer"
        >
          이용약관
        </Footerhref>
        <Dot />
        <Footerhref
          href="https://www.notion.so/harvies/V-20250806-2485c6005f128057ad18edfcc91a7d20"
          target="_blank"
          rel="noopener noreferrer"
        >
          개인정보처리방침
        </Footerhref>
      </LinksRow>
      <Divider />
      <ButtonRow>
        <CustomerCenterPill
          href="https://talk.naver.com/ct/w7a8bh2#nafullscreen"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconWrapper>
            <MdOutlineHeadsetMic size={17} />
          </IconWrapper>
          <span>고객센터</span>
        </CustomerCenterPill>
        <Pillhref>파트너 모집</Pillhref>
        <TimeBox>
          <TimeText>8:30~22:00</TimeText>
          <TimeText>* 연중 무휴</TimeText>
        </TimeBox>
      </ButtonRow>
      <Desc>
        코너는 서비스 중개 플랫폼이에요.
        <br />
        서비스 문의는 전문가에게 직접 문의해 주세요.
      </Desc>
      <Divider />

      {/* 자주묻는 질문과 소셜 미디어 링크 섹션 */}
      <FAQSocialRow>
        <FAQLink href="/qna">자주묻는 질문</FAQLink>
        <SocialLinksWrapper>
          <SocialLink
            href="https://blog.naver.com/story_coner"
            target="_blank"
            rel="noopener noreferrer"
            title="네이버 블로그"
          >
            <SiNaver size={16} />
          </SocialLink>
          <SocialLink
            href="https://www.instagram.com/coner_aircon?igsh=cDNnM25uZHVieDZ5&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            title="인스타그램"
          >
            <SiInstagram size={18} />
          </SocialLink>
        </SocialLinksWrapper>
      </FAQSocialRow>

      <Divider />
      {/* 사업자 정보 토글 버튼 */}
      <BusinessInfoToggle onClick={toggleBusinessInfo}>
        <span>(주)코너플랫폼 사업자정보</span>
        {isBusinessInfoOpen ? (
          <MdExpandLess size={16} />
        ) : (
          <MdExpandMore size={16} />
        )}
      </BusinessInfoToggle>
      {/* 사업자 정보 내용 */}
      {isBusinessInfoOpen && (
        <BusinessInfoContent>
          <BusinessInfoRow>
            <BusinessInfoLabel>상호</BusinessInfoLabel>
            <BusinessInfoValue>(주)코너플랫폼</BusinessInfoValue>
          </BusinessInfoRow>
          <BusinessInfoRow>
            <BusinessInfoLabel>대표자</BusinessInfoLabel>
            <BusinessInfoValue>서진형</BusinessInfoValue>
          </BusinessInfoRow>
          <BusinessInfoRow>
            <BusinessInfoLabel>전화번호</BusinessInfoLabel>
            <BusinessInfoValue>010-5543-0636</BusinessInfoValue>
          </BusinessInfoRow>
          <BusinessInfoRow>
            <BusinessInfoLabel>사업자등록번호</BusinessInfoLabel>
            <BusinessInfoValue>527-86-03637</BusinessInfoValue>
          </BusinessInfoRow>
          {/* <BusinessInfoRow>
            <BusinessInfoLabel>통신판매업신고</BusinessInfoLabel>
            <BusinessInfoValue>제2025-서울강남-0001호</BusinessInfoValue>
          </BusinessInfoRow> */}
          <BusinessInfoRow>
            <BusinessInfoLabel>주소</BusinessInfoLabel>
            <BusinessInfoValue>
              서울시 중랑구 겸재로 10가길 28 , 1층
            </BusinessInfoValue>
          </BusinessInfoRow>
        </BusinessInfoContent>
      )}
    </Section>
  );
};

export default Footer;

const Section = styled.section`
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
`;

const Logo = styled.img`
  height: 15px;
  display: block;
`;
const ButtonRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  justify-content: start;
  margin-bottom: 14px;
  align-items: start;
`;

const CustomerCenterPill = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 7px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding: 10px 8px;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Pillhref = styled.a`
  padding: 10px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 7px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding: 10px 8px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e9e9e9;
  margin: 12px 0 12px;
`;

const TimeBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  justify-self: start;
  margin-top: 8px;
`;

const TimeText = styled.p`
  margin: 0 0 0px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 1.3;
`;

const Desc = styled.p`
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  white-space: pre-line;
`;

const LinksRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #8b8b8b;
  font-size: ${({ theme }) => theme.font.size.small};
`;

const Footerhref = styled.a`
  color: ${({ theme }) => theme.colors.subtext};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: #8b8b8b;
    font-weight: ${({ theme }) => theme.font.weight.semibold};
  }
  &:focus-visible {
    outline: 2px solid #9ecbff;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: #cfcfcf;
  border-radius: 50%;
  display: inline-block;
`;

const FAQSocialRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const FAQLink = styled.a`
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  border: 1px solid #d9d9d9;
  padding: 2px 10px;
  border-radius: 20px;
`;

const SocialLinksWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s ease;

  /* 네이버 블로그 색상 */
  &:first-child:hover {
    background: #03c75a;
    color: white;
  }

  /* 인스타그램 색상 */
  &:last-child:hover {
    background: linear-gradient(
      45deg,
      #f09433 0%,
      #e6683c 25%,
      #dc2743 50%,
      #cc2366 75%,
      #bc1888 100%
    );
    color: white;
  }
`;

const BusinessInfoToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const BusinessInfoContent = styled.div`
  padding: 16px 0;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      padding: 0;
    }
    to {
      opacity: 1;
      max-height: 300px;
      padding: 16px 0;
    }
  }
`;

const BusinessInfoRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BusinessInfoLabel = styled.span`
  min-width: 120px;
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.subtext};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    min-width: 100px;
    font-size: 12px;
  }
`;

const BusinessInfoValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.small};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;
