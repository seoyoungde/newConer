// src/components/common/Modal/Modal.jsx
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

function Modal({
  open,
  onClose,
  title,
  children,
  width = 320,
  withinParent = false,
  containerId,
}) {
  const dialogRef = useRef(null);
  const isContained = withinParent || !!containerId;

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 바디 스크롤 락: 전체 화면 포털일 때만
  useEffect(() => {
    if (!open || isContained) return; // ✅ RightBox 내부 모달이면 바디 스크롤 락 안 걸기
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isContained]);

  if (!open) return null;

  const content = (
    <Overlay onClick={onClose} aria-hidden $contained={isContained}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        style={{
          width: `min(90vw, ${
            typeof width === "number" ? `${width}px` : width
          })`,
        }}
      >
        {title ? <Title>{title}</Title> : null}
        <Content>{children}</Content>
        <Actions>
          <CloseBtn type="button" onClick={onClose}>
            닫기
          </CloseBtn>
        </Actions>
      </Dialog>
    </Overlay>
  );

  //  특정 컨테이너가 있으면 거기로 포털
  if (containerId) {
    const mountNode = document.getElementById(containerId);
    return mountNode ? ReactDOM.createPortal(content, mountNode) : null;
  }

  // withinParent면 부모 안에 그대로 렌더 (absolute 기준)
  if (withinParent) return content;

  // 그 외에는 전체 화면 포털
  const mountNode = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(content, mountNode);
}

export default Modal;

const Overlay = styled.div`
  position: ${({ $contained }) => ($contained ? "absolute" : "fixed")};
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: ${({ $contained }) => ($contained ? 10 : 1000)};
  will-change: transform, opacity;
`;

const Dialog = styled.div`
  background: #fff;
  border: 1px solid #d6d6d6;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  padding: 20px 24px;
  text-align: center;
`;

const Title = styled.h3`
  margin: 0 0 12px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.font.size.body};
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.font.size.body};
  margin-bottom: 16px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
`;

const CloseBtn = styled.button`
  padding: 6px 16px;
  background: #007bff;
  color: #fff;
  font-weight: 600;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.font.size.small};
  &:hover {
    filter: brightness(0.96);
  }
`;
