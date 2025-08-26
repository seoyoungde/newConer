import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import Button from "../ui/Button";

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
        {/* 전체 동의 - 들여쓰기 없음 */}
        <label className="root">
          <input
            type="checkbox"
            checked={agreements.all}
            onChange={() => handleCheck("all")}
          />
          이용약관 전체 동의
        </label>

        {/* 나머지 항목들 - 들여쓰기 적용 */}
        <label className="child">
          <input
            type="checkbox"
            checked={agreements.age}
            onChange={() => handleCheck("age")}
          />
          만 19세 이상입니다. (필수)
        </label>

        <label className="child">
          <input
            type="checkbox"
            checked={agreements.customer}
            onChange={() => handleCheck("customer")}
          />
          <PolicyLink
            href={policyLinks.customer}
            target="_blank"
            rel="noopener noreferrer"
          >
            고객 이용약관
          </PolicyLink>
          에 동의합니다. (필수)
        </label>

        <label className="child">
          <input
            type="checkbox"
            checked={agreements.privacy}
            onChange={() => handleCheck("privacy")}
          />
          <PolicyLink
            href={policyLinks.privacy}
            target="_blank"
            rel="noopener noreferrer"
          >
            개인정보의 수집 및 이용
          </PolicyLink>
          에 동의합니다. (필수)
        </label>

        <label className="child">
          <input
            type="checkbox"
            checked={agreements.privacy2}
            onChange={() => handleCheck("privacy2")}
          />
          <PolicyLink
            href={policyLinks.privacy2}
            target="_blank"
            rel="noopener noreferrer"
          >
            개인정보 제3자 제공 안내
          </PolicyLink>
          에 동의합니다. (필수)
        </label>
      </CheckboxGroup>
    </Container>
  );
};

export default AgreementForm;

// ================= 스타일 =================
const Container = styled.div`
  width: 100%;
  margin-top: 35px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 4px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  text-align: left;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  label.root {
    margin-left: 0;
  }

  label.child {
    margin-left: 10px;
  }
`;

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors?.primary || "#007bff"};
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;
