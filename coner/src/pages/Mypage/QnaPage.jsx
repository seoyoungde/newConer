import React from "react";
import styled from "styled-components";
import NavHeader from "../../components/common/Header/NavHeader";

const QnaPage = () => {
  const faqList = [
    {
      question: "Q. 다른 데보다 비싼가요?",
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
      question: "Q. 누가 오는지 모르니까 불안해요",
      answer: `모든 협력업체는 저희가 직접 인터뷰하고, 실적, 후기, 고객 응대 품질 등
다양한 항목을 기준으로 자체 검증 절차를 거쳐 선발된 우수한 업체들입니다.
고객님께 배송되는 기사 정보는 미리 안내드리며,
선택된 협력 업체들은 20년 이상의 전문가로 안심하고 맡기셔도 됩니다.`,
    },
  ];

  return (
    <QnaCards>
      <NavHeader to="/" title="자주 묻는 질문" />
      {faqList.map((item, idx) => {
        return (
          <QnaItem key={idx}>
            <Q>{item.question}</Q>
            <A>{item.answer}</A>
          </QnaItem>
        );
      })}
    </QnaCards>
  );
};
export default QnaPage;

const QnaCards = styled.section`
  cursor: default;
`;
const QnaItem = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 15px;
`;
const Q = styled.h1`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 12px;
`;

const A = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};

  white-space: pre-line;
`;
