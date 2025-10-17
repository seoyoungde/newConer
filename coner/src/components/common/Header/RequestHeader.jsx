import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";

const RequestHeader = memo(function RequestHeader({
  userName = "서진아",
  to = -1, // 뒤로가기 경로
  replace = false,
  onBack,
  prevRequestTo, // 이전 의뢰서 경로
  prevRequestState, // 추가: 이전 의뢰서로 전달할 state
  prevRequestReplace = false,
  onPrevRequest,
  showPrevButton = true,
  className,
  style,
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

  const handlePrevRequest = useCallback(() => {
    onPrevRequest?.();
    if (prevRequestTo) {
      if (typeof prevRequestTo === "number") {
        navigate(prevRequestTo);
      } else if (typeof prevRequestTo === "string") {
        navigate(prevRequestTo, {
          replace: prevRequestReplace,
          state: prevRequestState, // state 전달
        });
      }
    }
  }, [
    prevRequestTo,
    prevRequestReplace,
    prevRequestState,
    onPrevRequest,
    navigate,
  ]);

  return (
    <HeaderBar className={className} style={style} role="banner">
      <BackButton type="button" onClick={handleBack} aria-label="뒤로가기">
        <IoIosArrowBack size={28} />
      </BackButton>

      <TitleArea>{userName}의뢰서</TitleArea>

      {showPrevButton && (
        <RightArea>
          <PrevButton type="button" onClick={handlePrevRequest}>
            <IoDocumentTextOutline size={20} />
            <span>이전 의뢰서</span>
          </PrevButton>
        </RightArea>
      )}
    </HeaderBar>
  );
});

export default RequestHeader;

const HeaderBar = styled.header`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  width: 100%;
  height: 72px;
  background: ${({ theme }) => theme.colors.bg || "#fff"};
  background: #fff;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  padding: 8px;
  margin-left: -8px;

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const TitleArea = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h3};
  line-height: ${({ theme }) => theme.font.lineHeight.h3};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin: 0;
`;

const RightArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const PrevButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary || "#666"};
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover || "#f5f5f5"};
  }

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary || "#004fff"};
    outline-offset: 2px;
  }

  span {
    line-height: 1;
  }
`;
