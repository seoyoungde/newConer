import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

const SubmitSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { customer_phone, requestId } = location.state || {};

  const handleClose = () => {
    navigate("/");
  };

  const handleViewRequest = () => {
    navigate("/search/inquiry", {
      state: {
        customer_phone: customer_phone,
        requestId: requestId,
      },
    });
  };

  return (
    <PageContainer>
      <CloseButton onClick={handleClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 26 26"
          fill="none"
        >
          <path d="M25 1L1 25" stroke="#ADB5BD" strokeWidth="2" />
          <path d="M25 25L1 0.999999" stroke="#ADB5BD" strokeWidth="2" />
        </svg>
      </CloseButton>

      <SubmitSection>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="110"
          height="109"
          viewBox="0 0 110 109"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M55 109C62.2227 109 69.3747 107.59 76.0476 104.851C82.7205 102.113 88.7836 98.0981 93.8909 93.0373C98.9981 87.9765 103.049 81.9685 105.813 75.3562C108.577 68.744 110 61.657 110 54.5C110 47.343 108.577 40.256 105.813 33.6438C103.049 27.0315 98.9981 21.0235 93.8909 15.9627C88.7836 10.9019 82.7205 6.88745 76.0476 4.14856C69.3747 1.40968 62.2227 -1.06648e-07 55 0C40.4131 2.15386e-07 26.4236 5.74195 16.1091 15.9627C5.79463 26.1834 0 40.0457 0 54.5C0 68.9543 5.79463 82.8166 16.1091 93.0373C26.4236 103.258 40.4131 109 55 109ZM53.5822 76.5422L84.1378 40.2089L74.7511 32.4578L48.4733 63.6984L34.8761 50.2187L26.235 58.7813L44.5683 76.9479L49.2983 81.6349L53.5822 76.5422Z"
            fill="#004FFF"
          />
        </svg>
        <TextSection>
          <SuccessText>의뢰가 완료되었습니다!</SuccessText>
          <RequestButton onClick={handleViewRequest}>
            내 의뢰 보러가기
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
            >
              <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
            </svg>
          </RequestButton>
        </TextSection>
      </SubmitSection>
    </PageContainer>
  );
};

export default SubmitSuccess;

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    top: 15px;
    right: 15px;
  }
`;

const SubmitSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 225px;
  height: 223px;
`;

const RequestButton = styled.button`
  color: #a0a0a0;
  font-size: 18px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #808080;
  }
`;

const SuccessText = styled.p`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const TextSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;
