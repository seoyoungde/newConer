import React from "react";
import styled from "styled-components";

const RequestDetails = ({ additionalInfo, setAdditionalInfo }) => {
  return (
    <Container>
      <Label>요청사항</Label>
      <Textarea
        placeholder="고장 증상, 실외기 위치 등 추가적인 정보를 입력해주세요."
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
      />
    </Container>
  );
};

export default RequestDetails;

const Container = styled.section`
  width: 100%;
  margin-bottom: 20px;
`;

const Label = styled.p`
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 8px;
  text-align: left;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 15px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  border: 1px solid #ccc;
  border-radius: 10px;
  resize: none;
  height: 120px;
  outline: none;
  background: ${({ theme }) => theme.colors.bg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  &::placeholder {
    color: ${({ theme }) => theme.colors.subtext};
  }
`;
