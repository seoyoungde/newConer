import React from "react";
import styled from "styled-components";

const StepProgressBar = ({ currentStep = 0, totalSteps = 4 }) => {
  const progressPercentage = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <Wrapper>
      <ProgressWrapper>
        <ProgressBar>
          <ProgressFill style={{ width: `${progressPercentage}%` }} />
        </ProgressBar>
        <StepText>
          {currentStep}/{totalSteps} step
        </StepText>
      </ProgressWrapper>
    </Wrapper>
  );
};

export default StepProgressBar;

const Wrapper = styled.div`
  width: 100%;
  margin: auto;
  margin-bottom: 49px;
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: #e5e5e5;
  border-radius: 20px;
  margin-right: 10px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.3s ease;
`;

const StepText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.subtext};
  white-space: nowrap;
`;
