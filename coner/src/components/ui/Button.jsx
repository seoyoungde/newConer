import React, { forwardRef } from "react";
import styled, { css } from "styled-components";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary", // 'primary' | 'secondary' | 'outline' | 'ghost'
      size = "md", // 'sm' | 'md' | 'lg'
      fullWidth = false,
      disabled = false,
      ...rest
    },
    ref
  ) => {
    return (
      <BaseButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        disabled={disabled}
        {...rest}
      >
        <span className="label">{children}</span>
      </BaseButton>
    );
  }
);

export default Button;

const sizes = {
  sm: css`
    height: 36px;
    padding: 0 12px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    border-radius: 8px;
  `,
  md: css`
    height: 44px;
    padding: 0 16px;
    font-size: ${({ theme }) => theme.font.size.body};
    border-radius: 8px;
  `,
  lg: css`
    height: 52px;
    padding: 0 6px;
    font-size: ${({ theme }) => theme.font.size.body};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    border-radius: 8px;
  `,
  stepsize: css`
    height: 52px;
    font-size: ${({ theme }) => theme.font.size.bodyLarge};
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    border-radius: 8px;
  `,
};

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover {
      filter: brightness(0.96);
    }
    &:active {
      transform: translateY(0.5px);
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover {
      background: #f7f7f7;
    }
    &:active {
      transform: translateY(0.5px);
    }
  `,
  outline: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.bg};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover {
      background: rgba(0, 79, 255, 0.06);
    }
    &:active {
      transform: translateY(0.5px);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid transparent;
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    &:active {
      transform: translateY(0.5px);
    }
  `,
};

const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  line-height: 1;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, border-color 0.15s ease,
    transform 0.05s ease;
  ${({ $size }) => sizes[$size]}
  ${({ $variant }) => variants[$variant]}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 글로벌 reset에서 outline을 껐기 때문에, 키보드 탐색용 포커스 링 복원 */
  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.primary};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  .label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
