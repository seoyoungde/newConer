import styled, { css } from "styled-components";

/** 인풋 내부 패딩/폰트 사이즈 */
export const inputSizes = {
  sm: css`
    padding: 10px 12px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
      font-size: ${({ theme }) => theme.font.size.body};
    }
  `,
  md: css`
    padding: 14px 14px;
    font-size: ${({ theme }) => theme.font.size.body};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
      font-size: ${({ theme }) => theme.font.size.h1};
      font-weight: ${({ theme }) => theme.font.weight.medium};
    }
  `,
  lg: css`
    padding: 16px 16px;
    font-size: ${({ theme }) => theme.font.size.body};
  `,
  reviewsize: css`
    padding: 0px 12px;
    height: 100px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
      font-size: ${({ theme }) => theme.font.size.body};
    }
  `,
  stepsize: css`
    padding: 18px 18px;
    font-size: 16px;
  `,
};

/** 컨트롤(테두리 박스) 높이/밀도 */
export const controlSizes = {
  sm: css`
    min-height: 40px;
  `, // compact
  md: css`
    min-height: 44px;
  `, // 모바일 권장 최소 터치 타겟
  lg: css`
    min-height: 52px;
  `,
  reviewsize: css`
    min-height: 80px;
  `,
};

/** 라벨 사이즈 */
export const labelSizes = {
  sm: css`
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    line-height: ${({ theme }) => theme.font.lineHeight.small};
  `,
  md: css`
    font-size: ${({ theme }) => theme.font.size.body};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    line-height: ${({ theme }) => theme.font.lineHeight.bodySmall};
  `,
  lg: css`
    font-size: ${({ theme }) => theme.font.size.body};
    line-height: ${({ theme }) => theme.font.lineHeight.body};
  `,
  reviewsize: css`
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    line-height: ${({ theme }) => theme.font.lineHeight.small};
  `,
  stepsize: css`
    font-weight: 500;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.subtext};
  `,
};

/** 헬프/에러 메시지 사이즈 */
export const messageSizes = labelSizes;

/** 인풋 엘리먼트(input/textarea/select 공용) */
export const inputElementCss = css`
  width: 100%;
  border: none;
  outline: none;

  color: ${({ theme }) => theme.colors.text};
  ${({ $size }) => inputSizes[$size || "md"]}

  &::placeholder {
    color: ${({ theme }) => theme.colors.subtext};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/** 바깥 래퍼(테두리/포커스/에러 처리) */
export const controlCss = css`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 10px;
  background: #fff;

  &:focus {
    border: none;
  }

  &:focus-within {
    border: none;
    outline: none;
  }
`;

/** 라벨/메시지 공통 래퍼 */
export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  ${({ $size = "md" }) => labelSizes[$size]}
`;

export const RequiredMark = styled.span`
  margin-left: 2px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const HelpMsg = styled.p`
  margin: 0;
  color: #8f8f8f;
  ${({ $size = "md" }) => messageSizes[$size]}
`;

export const ErrorMsg = styled(HelpMsg)`
  color: #ff6b6b;
`;
