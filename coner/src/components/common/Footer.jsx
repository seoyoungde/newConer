import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <Section>
      <ButtonRow>
        <Pillhref
          href="https://talk.naver.com/ct/w7a8bh2#nafullscreen"
          target="_blank"
          rel="noopener noreferrer"
        >
          고객센터
        </Pillhref>
        {/* <Pillhref>파트너 모집</Pillhref> */}
      </ButtonRow>

      <Divider />

      <TimeText>8:30~22:00 ·연중 무휴</TimeText>

      <Desc>
        코너는 서비스 중개 플랫폼이에요.
        <br />
        서비스 문의는 전문가에게 직접 문의해 주세요.
      </Desc>

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
    </Section>
  );
};
export default Footer;
const Section = styled.section`
  width: 100%;
  color: ${({ theme }) => theme?.colors?.text || "#111"};
  font-family: inherit;
`;
const ButtonRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  justify-content: start;
  margin-bottom: 14px;
`;
const Pillhref = styled.a`
  padding: 10px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 7px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: 700;
  cursor: pointer;
  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e9e9e9;
  margin: 10px 0 14px;
`;
const TimeText = styled.p`
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const Desc = styled.p`
  margin: 0 0 26px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  white-space: pre-line;
`;

const LinksRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #8b8b8b;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
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
