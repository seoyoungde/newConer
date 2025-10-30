import React, { useState } from "react";
import styled from "styled-components";
import RequestHeader from "../../components/common/Header/RequestHeader";

const QnaPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqList = [
    {
      question: "Q. 다른 데보다 가격이 높은가요?",
      answer: `코너는 고객님 주변의 가까운 업체를 배정하여 이동에 드는 인건비를 절감함으로써
더 나은 서비스 대비 더 합리적인 가격으로 서비스를 제공해드리기 위해 노력하고 있습니다.
또한, 서비스 완료까지 품질을 철저히 관리하며, 업체 책임으로 인한 문제가 발생할 경우
서비스 완료 후 6개월간 무상 A/S를 보장합니다.`,
    },
    {
      question: "Q. 원하는 시간에 서비스를 받을 수 있나요?",
      answer: `서비스 예약 시, 원하는 날짜와 시간을 선택하실 수 있습니다.
단, 서비스 예약 후 영업시간 3시간 이내에 배정이 이루어지며,
배정된 시간에 맞춰 서비스가 진행됩니다.
코너는 현재까지 90% 정도의 정확도로 예약한 시간에 서비스를 제공하고 있습니다.
고객님의 희망 일정에 업체가 부족하여 제공을 못할 경우,
고객께서 다음으로 가능한 일정을 물어보기 위해서 배정된 업체가 연락을 해드려요.`,
    },
    {
      question: "Q. 어떤 기사님이 오는지 미리 알 수 있나요?",
      answer: `모든 협력업체는 저희가 직접 인터뷰하고, 실적, 후기, 고객 응대 품질 등
다양한 항목을 기준으로 자체 검증 절차를 거쳐 선발된 우수한 업체들입니다.
고객님께 배송되는 기사 정보는 미리 안내드리며,
선택된 협력 업체들은 20년 이상의 전문가로 안심하고 맡기셔도 됩니다.`,
    },
  ];

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <QnaCards>
      <RequestHeader showPrevButton={false} userName="자주 묻는 질문" to="/" />

      <QnaSection>
        {faqList.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <QnaItem key={idx} onClick={() => toggleItem(idx)}>
              <QuestionWrapper>
                <Q>{item.question}</Q>
                <ArrowIcon $isOpen={isOpen}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="8"
                    viewBox="0 0 14 8"
                    fill="none"
                  >
                    <path d="M1 0.999999L7 7L13 0.999998" stroke="#8D989F" />
                  </svg>
                </ArrowIcon>
              </QuestionWrapper>
              <AnswerWrapper $isOpen={isOpen}>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#A2AFB7",
                    marginTop: "24px",
                  }}
                ></div>
                <A>{item.answer}</A>
              </AnswerWrapper>
            </QnaItem>
          );
        })}
      </QnaSection>
    </QnaCards>
  );
};
export default QnaPage;

const QnaCards = styled.section`
  cursor: default;
`;
const QnaSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const QnaItem = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 23px 26px;
  margin-bottom: 12px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 23px 15px;
  }
`;
const Q = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 100%;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 16px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const A = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  white-space: pre-line;
  margin-top: 16px;
`;
const QuestionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  flex-shrink: 0;
`;
const AnswerWrapper = styled.div`
  max-height: ${({ $isOpen }) => ($isOpen ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;
