import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const StepHeader = memo(function StepHeader({
  to = -1, // -1: history back, string: 경로
  replace = false, // 라우터 replace 여부
  onBack, // 클릭 훅(로그/추적 등)
  right, // 우측 슬롯 (스텝바가 아닌 다른 요소가 필요한 경우)
  iconSize = 28, // 아이콘 크기
  className,
  style,
  // 스텝 관련 props
  currentStep = 0,
  totalSteps = 4,
  showStep = true, // 스텝바 표시 여부
}) {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    onBack?.();
    if (typeof to === "number") {
      navigate(to);
    } else if (typeof to === "string") {
      navigate(to, { replace });
    } else {
      navigate(-1);
    }
  }, [to, replace, onBack, navigate]);

  const progressPercentage = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <HeaderBar className={className} style={style} role="banner">
      <HeaderBox>
        <BackButton type="button" onClick={handleBack} aria-label="뒤로가기">
          <IoIosArrowBack size={iconSize} />
        </BackButton>

        <RightArea>
          {showStep ? (
            <StepProgressWrapper>
              <ProgressBar>
                <ProgressFill style={{ width: `${progressPercentage}%` }} />
              </ProgressBar>
            </StepProgressWrapper>
          ) : (
            right || null
          )}
        </RightArea>
      </HeaderBox>
    </HeaderBar>
  );
});

export default StepHeader;

const HeaderBar = styled.header`
  width: 100%;
  height: 72px;
  background: ${({ theme }) => theme.colors.bg};
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;
const HeaderBox = styled.div`
  display: flex;
  height: 72px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const BackButton = styled.button`
  display: grid;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const RightArea = styled.div`
  display: flex;
`;

const StepProgressWrapper = styled.div`
  display: flex;
`;

const ProgressBar = styled.div`
  width: 140px;
  height: 6px;
  background: #e6e6e6;
  border-radius: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  transition: width 0.3s ease;
`;
