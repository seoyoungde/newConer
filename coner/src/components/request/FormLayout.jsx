import React from "react";
import styled from "styled-components";
import Button from "../ui/Button";

const FormLayout = ({ title, subtitle, children, onNext }) => {
  return (
    <Container>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      <Content>{children}</Content>
      {onNext && (
        <Button
          type="submit"
          size="lg"
          onClick={onNext}
          fullWidth
          style={{ marginTop: 20, marginBottom: 24 }}
        >
          다음으로
        </Button>
      )}
    </Container>
  );
};

export default FormLayout;

const Container = styled.div`
  text-align: center;
  width: 100%;
`;

const Title = styled.h2``;

const Subtitle = styled.p`
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;
