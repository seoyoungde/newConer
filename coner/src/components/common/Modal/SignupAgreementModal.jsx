import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import Button from "../../ui/Button";
import axios from "axios";

function ensureContainer(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
  } else if (el.parentNode !== document.body) {
    document.body.appendChild(el);
  }
  return el;
}

const SignupAgreementModal = ({
  open,
  onClose,
  onConfirm,
  containerId = "rightbox-modal-root",

  policyLinks = {
    customer: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
    privacy: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
    privacy2: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
  },
}) => {
  const [agreements, setAgreements] = useState({
    all: false,
    age: false, // 필수
    customer: false, // 필수 (고객 이용약관)
    privacy: false, // 필수 (개인정보 제3자 제공 안내)
    privacy2: false, // 필수 (개인정보의 수집 및 이용)
  });

  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // ===== 접근성: 포커스 이동 + 배경 inert/aria-hidden 토글 =====
  useEffect(() => {
    if (!open) return;
    const container = ensureContainer(containerId);

    // 배경 비활성화(모달 컨테이너 제외)
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== container
    );
    siblings.forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("inert", "");
    });

    // 포커스 트랩
    previouslyFocusedRef.current = document.activeElement;
    const node = dialogRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const items = node.querySelectorAll(focusableSelector);
    (items[0] || node).focus();

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const list = node.querySelectorAll(focusableSelector);
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onEsc = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onEsc);

      siblings.forEach((el) => {
        el.removeAttribute("aria-hidden");
        el.removeAttribute("inert");
      });

      if (previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [open, onClose, containerId]);

  // ===== 체크박스 핸들러 =====
  const handleCheck = useCallback(
    (name) => {
      if (name === "all") {
        const v = !agreements.all;
        setAgreements({
          all: v,
          age: v,
          customer: v,
          privacy: v,
          privacy2: v,
        });
      } else {
        setAgreements((prev) => {
          const updated = { ...prev, [name]: !prev[name] };
          // 전체동의 체크 상태는 "모든 항목"이 체크되어야 true
          updated.all =
            updated.age &&
            updated.customer &&
            updated.privacy &&
            updated.privacy2;

          return updated;
        });
      }
    },
    [agreements.all]
  );

  const isRequiredChecked =
    agreements.age &&
    agreements.customer &&
    agreements.privacy &&
    agreements.privacy2;

  const handleConfirm = () => {
    if (!isRequiredChecked) {
      alert("필수 항목에 모두 동의해주세요.");
      return;
    }

    onConfirm && onConfirm({ agreements });
    onClose && onClose();
  };

  if (!open) return null;

  const container = ensureContainer(containerId);

  const modalContent = (
    <Overlay role="presentation" onMouseDown={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <TopBar>
          <Title>정보 동의 및 휴대폰 인증</Title>
          <CloseIconButton
            type="button"
            aria-label="닫기"
            onClick={onClose}
            title="닫기"
          >
            ×
          </CloseIconButton>
        </TopBar>

        <PopupContainer>
          <CheckboxGroup>
            <label>
              <input
                type="checkbox"
                checked={agreements.all}
                onChange={() => handleCheck("all")}
              />
              이용약관 전체 동의
            </label>

            <label>
              <input
                type="checkbox"
                checked={agreements.age}
                onChange={() => handleCheck("age")}
              />
              만 14세 이상입니다. (필수)
            </label>

            <label>
              <input
                type="checkbox"
                checked={agreements.privacy}
                onChange={() => handleCheck("privacy")}
              />
              <PolicyLink
                href={policyLinks.privacy}
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보의 수집 및 이용
              </PolicyLink>
              에 동의합니다. (필수)
            </label>
            <label>
              <input
                type="checkbox"
                checked={agreements.privacy2}
                onChange={() => handleCheck("privacy2")}
              />
              <PolicyLink
                href={policyLinks.privacy2}
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보 제3자 제공 안내
              </PolicyLink>
              에 동의합니다. (필수)
            </label>
          </CheckboxGroup>

          <ButtonRow>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!isRequiredChecked}
            >
              확인
            </Button>
          </ButtonRow>
        </PopupContainer>
      </Dialog>
    </Overlay>
  );

  return ReactDOM.createPortal(modalContent, container);
};

export default SignupAgreementModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
`;

const Dialog = styled.div`
  width: min(90vw, 420px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  outline: none;
  position: relative;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 40px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
`;

const CloseIconButton = styled.button`
  position: absolute;
  right: 8px;
  top: 6px;
  width: 32px;
  height: 32px;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
  color: black;
  background: transparent;
  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
`;

const PopupContainer = styled.div`
  padding: 16px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  text-align: left;
  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors?.primary || "#007bff"};
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;
