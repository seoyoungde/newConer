import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";

const AgreementForm = ({
  onConfirm,
  // 추가: 필수 동의 여부 변경 콜백
  onRequiredChange,
  policyLinks = {
    customer: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
    privacy: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
    privacy2: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
  },
}) => {
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    customer: false,
    privacy: false,
    privacy2: false,
  });

  const handleCheck = useCallback(
    (name) => {
      if (name === "all") {
        const v = !agreements.all;
        setAgreements({
          all: v,
          age: v,
          customer: v,
          privacy: v,
          privacy2: v,
        });
      } else {
        setAgreements((prev) => {
          const updated = { ...prev, [name]: !prev[name] };
          updated.all =
            updated.age &&
            updated.customer &&
            updated.privacy &&
            updated.privacy2;
          return updated;
        });
      }
    },
    [agreements.all]
  );

  const isRequiredChecked =
    agreements.age &&
    agreements.customer &&
    agreements.privacy &&
    agreements.privacy2;

  // 추가: 필수 동의 여부 변경 시 부모에게 알림
  useEffect(() => {
    if (typeof onRequiredChange === "function") {
      onRequiredChange(isRequiredChecked);
    }
  }, [isRequiredChecked, onRequiredChange]);

  const handleConfirm = () => {
    if (!isRequiredChecked) {
      alert("필수 항목에 모두 동의해주세요.");
      return;
    }
    onConfirm && onConfirm({ agreements });
  };

  return (
    <Container>
      <Title>정보 동의</Title>

      <CheckboxGroup>
        <CheckboxItem onClick={() => handleCheck("all")}>
          <CheckboxText>이용약관 전체 동의</CheckboxText>
          <CheckIcon checked={agreements.all}>✓</CheckIcon>
        </CheckboxItem>
        <div style={{ height: "1.2px", backgroundColor: "#A2AFB7" }}></div>
        {/* 나머지 항목들 - 들여쓰기 적용 */}
        <CheckboxItem onClick={() => handleCheck("age")}>
          <Required>필수</Required>
          <CheckboxText>만 19세 이상입니다.</CheckboxText>
          <CheckIcon checked={agreements.age}>✓</CheckIcon>
        </CheckboxItem>

        <CheckboxItem onClick={() => handleCheck("customer")}>
          <Required>필수</Required>
          <CheckboxText>
            <PolicyLink
              href={policyLinks.customer}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              고객 이용약관
            </PolicyLink>
            에 동의합니다.
          </CheckboxText>
          <CheckIcon checked={agreements.customer}>✓</CheckIcon>
        </CheckboxItem>

        <CheckboxItem onClick={() => handleCheck("privacy")}>
          <Required>필수</Required>
          <CheckboxText>
            <PolicyLink
              href={policyLinks.privacy}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              개인정보의 수집 및 이용
            </PolicyLink>
            에 동의합니다.
          </CheckboxText>
          <CheckIcon checked={agreements.privacy}>✓</CheckIcon>
        </CheckboxItem>

        <CheckboxItem onClick={() => handleCheck("privacy2")}>
          <Required>필수</Required>
          <CheckboxText>
            <PolicyLink
              href={policyLinks.privacy2}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              개인정보 제3자 제공 안내
            </PolicyLink>
            에 동의합니다.
          </CheckboxText>
          <CheckIcon checked={agreements.privacy2}>✓</CheckIcon>
        </CheckboxItem>
      </CheckboxGroup>
    </Container>
  );
};

export default AgreementForm;

const Container = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 4px;
`;

const CheckboxGroup = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;
const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
`;

const CheckboxText = styled.span`
  flex: 1;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`;

const CheckIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  flex-shrink: 0;
  background-color: ${({ checked }) => (checked ? "#004FFF" : "#A2AFB7")};
  color: white;
  transition: all 0.2s ease;
`;
const Required = styled.div`
  width: 31px;
  height: 20px;
  border-radius: 4px;
  background: #a2afb7;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors?.primary || "#007bff"};
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;
