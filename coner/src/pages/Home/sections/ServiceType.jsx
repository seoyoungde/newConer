import React from "react";
import styled from "styled-components";
import Type1Icon from "../../../assets/servicetype/servicesType_1.png";
import Type2Icon from "../../../assets/servicetype/servicesType_2.png";
import Type3Icon from "../../../assets/servicetype/servicesType_3.png";
import Type4Icon from "../../../assets/servicetype/servicesType_4.png";
import Type5Icon from "../../../assets/servicetype/servicesType_5.png";

const types = [
  {
    id: 1,
    title: "벽걸이형",
    image: Type1Icon,
  },
  {
    id: 2,
    title: "스탠드형",
    image: Type2Icon,
  },
  {
    id: 3,
    title: "천장형",
    image: Type3Icon,
  },
  {
    id: 4,
    title: "창문형",
    image: Type4Icon,
  },
  {
    id: 5,
    title: "항온항습기",
    image: Type5Icon,
  },
];

const ServicesType = () => {
  return (
    <TypeCards>
      <h1>서비스 가능 기기</h1>
      <p>창문형은 설치 서비스를 제공하지 않아요</p>
      <TypeList>
        {types.map((type) => (
          <TypeCard key={type.id}>
            <img src={type.image} alt={type.title} />
            <p>{type.title}</p>
          </TypeCard>
        ))}
      </TypeList>
    </TypeCards>
  );
};

const TypeCards = styled.section`
  cursor: default;
  margin-bottom: 60px;
  p {
    font-size: ${({ theme }) => theme.font.size.body};
    margin-bottom: 24px;
  }
`;

const TypeList = styled.ul`
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  list-style: none;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding: 0 0px;
  }
`;

const TypeCard = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  img {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  p {
    font-size: ${({ theme }) => theme.font.size.body};
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
      font-size: 15px;
    }
    @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
      font-size: 13px;
    }
  }
`;

export default ServicesType;
