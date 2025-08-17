import React, { forwardRef } from "react";
import styled from "styled-components";
import { controlCss, controlSizes, inputElementCss } from "./inputStyles";

const Control = styled.div`
  ${controlCss}
  ${({ $size = "md" }) => controlSizes[$size]}
`;
const InputEl = styled.input`
  ${inputElementCss}
`;

const Input = forwardRef(
  ({ size = "md", as = "input", invalid, ...props }, ref) => {
    return (
      <Control $invalid={!!invalid} $size={size}>
        <InputEl as={as} ref={ref} $size={size} {...props} />
      </Control>
    );
  }
);

export default Input;
