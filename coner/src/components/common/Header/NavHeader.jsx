import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const NavHeader = memo(function BackHeader({
  to = -1, // -1: history back, string: 경로
  replace = false, // 라우터 replace 여부
  onBack, // 클릭 훅(로그/추적 등)
  title, // 가운데 제목
  right, // 우측 슬롯(예: 도움말 버튼)
  iconSize = 28, // 아이콘 크기
  className,
  style,
}) {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    onBack?.();
    if (typeof to === "number") {
      navigate(to); // ex) -1
    } else if (typeof to === "string") {
      navigate(to, { replace }); // ex) "/"
    } else {
      navigate(-1);
    }
  }, [to, replace, onBack, navigate]);

  return (
    <HeaderBar className={className} style={style} role="banner">
      <BackButton type="button" onClick={handleBack} aria-label="뒤로가기">
        <IoIosArrowBack size={iconSize} />
      </BackButton>

      <TitleArea>{title || null}</TitleArea>

      <RightArea>{right || null}</RightArea>
    </HeaderBar>
  );
});

export default NavHeader;

const HeaderBar = styled.header`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  height: 72px;
  background: #f2f3f6;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  display: grid;
  place-items: center;
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

const TitleArea = styled.h1`
  text-align: center;
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
