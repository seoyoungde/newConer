import React from "react";
import styled from "styled-components";
import EnterpriseImage from "../../../assets/EnterpriseImage/enterprise.png";

const EnterpriseBanner = ({
  imageUrl = EnterpriseImage,
  consultUrl = "talk.naver.com/profile/c/coner",
  boldText = "대량 구매",
  lightText = "가 필요하신가요?",
  buttonText = "기업 구매 상담받기",
}) => {
  return (
    <BannerContainer>
      <IllustrationImage src={imageUrl} alt="비즈니스 일러스트" />
      <RightContent>
        <MainText>
          <BoldText>{boldText}</BoldText> <LightText>{lightText}</LightText>
        </MainText>
        <ConsultLink
          href={consultUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
          >
            <path
              d="M1 1L6 6L1 11"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ConsultLink>
      </RightContent>
    </BannerContainer>
  );
};

export default EnterpriseBanner;
const BannerContainer = styled.div`
  background: linear-gradient(
      274deg,
      rgba(255, 255, 255, 0) 8.6%,
      rgba(255, 255, 255, 0.2) 93.82%
    ),
    radial-gradient(123.7% 139.96% at -8.28% 25.43%, #004fff 0%, #003cc3 80.77%);
  width: 100%;
  height: 116px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 28px 0px 0px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0px 18px 0px 0px;
    gap: 16px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 6px;
  }
`;

const IllustrationImage = styled.img`
  width: 164px;
  height: auto;
  object-fit: contain;

  @media (width < 560px) {
    width: 110px;
    height: auto;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 130px;
    height: auto;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 100px;
    height: auto;
  }
`;

const MainText = styled.h2`
  color: #fff;
  font-family: Pretendard, sans-serif;
  font-size: 22px;
  font-style: normal;
  line-height: 150%;
  margin: 0;
  padding: 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex-wrap: wrap;
  }
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BoldText = styled.span`
  text-emphasis-style: filled dot;
  text-emphasis-position: over right;
  text-emphasis-color: #fff;
  -webkit-text-emphasis-style: filled dot;
  -webkit-text-emphasis-position: over right;
  -webkit-text-emphasis-color: #fff;
  color: #fff;
  font-family: Pretendard;
  font-size: 26px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;
  transform: translateY(-0.25em);

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 20px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 18px;
  }
`;

const LightText = styled.span`
  color: #fff;
  font-family: Pretendard;
  font-size: 26px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 20px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 18px;
  }
`;

const ConsultLink = styled.a`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  &:hover {
    color: #fff;
  }

  svg {
    width: 5px;
    height: 10px;
    flex-shrink: 0;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    display: flex;
  }
`;
