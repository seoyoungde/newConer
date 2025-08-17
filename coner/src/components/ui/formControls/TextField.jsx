import React, { forwardRef } from "react";
import styled from "styled-components";
import {
  Field,
  Label,
  RequiredMark,
  HelpMsg,
  ErrorMsg,
  controlCss,
  controlSizes,
  inputElementCss,
} from "./inputStyles";

const Control = styled.div`
  ${controlCss}
  ${({ $size = "md" }) => controlSizes[$size]}
`;
const InputEl = styled.input`
  ${inputElementCss}
`;

const TextField = forwardRef(
  (
    { label, hint, error, required, as = "input", size = "md", ...props },
    ref
  ) => {
    return (
      <Field>
        {label && (
          <Label $size={size}>
            {label}
            {required && <RequiredMark>*</RequiredMark>}
          </Label>
        )}
        <Control $invalid={!!error} $size={size}>
          <InputEl as={as} ref={ref} $size={size} {...props} />
        </Control>
        {error ? (
          <ErrorMsg role="alert" $size={size}>
            {error}
          </ErrorMsg>
        ) : hint ? (
          <HelpMsg $size={size}>{hint}</HelpMsg>
        ) : null}
      </Field>
    );
  }
);

export default TextField;
