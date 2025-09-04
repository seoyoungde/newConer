// src/components/common/Modal/TermsAgreementModal.jsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "./Modal";
import Button from "../../ui/Button";

const TermsAgreementModal = ({
  open,
  title,
  content,
  onAgree,
  onClose,
  width = 520,
  containerId = "rightbox-modal-root",
}) => {
  const scrollRef = useRef(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  useEffect(() => {
    if (open) setScrolledToEnd(false);
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const reached = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    if (reached) setScrolledToEnd(true);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={width}
      containerId={containerId}
    >
      <Wrapper>
        <ScrollBox ref={scrollRef} onScroll={handleScroll}>
          {typeof content === "string" ? <pre>{content}</pre> : content}
        </ScrollBox>

        <Info>
          약관을 끝까지 읽으면 <b>동의하기</b> 버튼이 활성화됩니다.
        </Info>

        <ButtonRow>
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
          <Button
            size="sm"
            disabled={!scrolledToEnd}
            onClick={() => {
              if (scrolledToEnd) onAgree?.();
            }}
          >
            동의하기
          </Button>
        </ButtonRow>
      </Wrapper>
    </Modal>
  );
};

export default TermsAgreementModal;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const ScrollBox = styled.div`
  height: 52vh;
  padding: 12px;
  border: 1px solid #e6e8ef;
  border-radius: 8px;
  background: #fff;

  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  min-width: 0; /* 긴 컨텐츠로 인한 가로 밀림 방지 */

  line-height: 1.6;
  font-size: 14px;

  word-break: break-word;
  overflow-wrap: anywhere;

  pre {
    margin: 0;
    white-space: pre-wrap; /* 개행 보존 + 자동 줄바꿈 */
    word-break: break-word;
    overflow-wrap: anywhere;
  }
`;

const Info = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.caption};
  color: #666;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
