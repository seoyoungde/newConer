import React from "react";
import styled from "styled-components";
import { controlCss, controlSizes, inputElementCss } from "./inputStyles";
import Button from "../Button";

const sizeGap = {
  sm: "8px",
  md: "8px",
  lg: "10px",
};

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ $size = "md" }) => sizeGap[$size]};
  align-items: stretch;
`;

const Control = styled.div`
  ${controlCss}
  ${({ $size = "md" }) => controlSizes[$size]}
`;

const InputEl = styled.input`
  ${inputElementCss}
`;

export default function InputGroup({
  inputProps,
  buttonText = "인증번호받기",
  onButtonClick,
  size = "md",
  buttonVariant = "outline",
  loading = false,
  disabled = false,
  buttonProps = {},
}) {
  const isDisabled = disabled || loading;

  return (
    <Group $size={size}>
      <Control $size={size}>
        <InputEl $size={size} {...inputProps} />
      </Control>

      <Button
        variant={buttonVariant}
        size={size}
        onClick={onButtonClick}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...buttonProps}
      >
        {buttonText}
      </Button>
    </Group>
  );
}
