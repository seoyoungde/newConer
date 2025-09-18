import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";

const CANCEL_COLOR = "#C2E1FF";

const CANCEL_OPTIONS = [
  "가격이 합리적이지 않아요",
  "코너 웹서비스 이용이 불편해요",
  "기사님이 불친절해요",
  "일정이 맞지 않아요",
  "기타",
];

const CancelReviewPage = () => {
  const [selectedCancel, setSelectedCancel] = useState(new Set());
  const [complaints, setComplaints] = useState("");
  const [selectedElse, setSelectedElse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [popupMessage, setPopupMessage] = useState("");

  //날짜 형식변환
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  const handleSubmitCancelReview = async (e) => {
    e.preventDefault();

    if (!requestId) {
      setPopupMessage("의뢰서가 없습니다");
      return;
    }
    if (selectedCancel.has("기타")) {
      if (!selectedElse) {
        setPopupMessage("기타사유를 입력해주세요");
        return;
      }
    }
    if (selectedCancel.size === 0 || !complaints) {
      setPopupMessage("의견을 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const cancelreviewData = {
        cancel: Array.from(selectedCancel),
        complaints: complaints,
        cancelelse: selectedElse,
        createdAt: formatDate(new Date()),
      };
      await setDoc(doc(db, "CancelReview", requestId), cancelreviewData);

      setPopupMessage("감사합니다. 소중한 후기가 등록되었습니다");
    } catch (error) {
      alert("의견 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (popupMessage.includes("감사합니다")) {
      navigate("/");
    } else {
      setPopupMessage("");
    }
  };

  //체크박스 토글
  const toggleCancel = (cancel) => {
    setSelectedCancel((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cancel)) {
        newSet.delete(cancel);
      } else {
        newSet.add(cancel);
      }
      return newSet;
    });
  };

  //체크박스 컴포넌트
  const CheckboxItem = ({ label, checked, onChange }) => (
    <CheckboxWrapper>
      <Checkbox
        checked={checked}
        onClick={() => onChange(label)}
        aria-label={label}
      />
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxWrapper>
  );

  return (
    <Section>
      <Header>의견을 보내주세요</Header>
      <Divider />
      <Form onSubmit={handleSubmitCancelReview}>
        <CancelSection>
          <SectionLabel>취소 사유를 선택해주세요</SectionLabel>
          <CheckboxGrid>
            {CANCEL_OPTIONS.map((cancel) => (
              <CheckboxItem
                key={cancel}
                label={cancel}
                checked={selectedCancel.has(cancel)}
                onChange={toggleCancel}
              />
            ))}
          </CheckboxGrid>
          <TextAreaWrapper>
            <TextAreaLabel>기타 선택시 사유를 입력해주세요</TextAreaLabel>
            <StyledTextAreaElse
              placeholder=""
              rows={1}
              value={selectedElse}
              onChange={(e) => setSelectedElse(e.target.value)}
            />
          </TextAreaWrapper>
        </CancelSection>

        <TextAreaWrapper>
          <TextAreaLabel>그 외 개선할점이 있으면 적어주세요</TextAreaLabel>
          <StyledTextArea
            placeholder="소중한 의견은 코너 운영팀에게 전달됩니다"
            rows={4}
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
          />
        </TextAreaWrapper>

        <Button
          fullWidth
          size="md"
          type="submit"
          // disabled={isSubmitting || selectedCancel.size === 0 || !complaints}
        >
          {isSubmitting ? " 저장 중..." : "의견 보내기 완료"}
        </Button>
      </Form>
      <Modal
        open={!!popupMessage}
        onClose={handleModalClose}
        width={320}
        containerId="rightbox-modal-root"
      >
        {popupMessage}
      </Modal>
    </Section>
  );
};

export default CancelReviewPage;

const Section = styled.section``;

const Header = styled.header`
  text-align: center;
  margin: 20px;
  font-weight: bold;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: #e0e0e0;
`;

const Form = styled.form`
  width: 100%;
  padding: 20px 0px;
`;
const CancelSection = styled.div`
  margin: 30px 0;
`;
const SectionLabel = styled.p`
  font-size: ${({ theme }) => theme.font?.size?.bodySmall || "14px"};
  font-weight: 600;
  margin-bottom: 15px;
`;
const CheckboxGrid = styled.div`
  display: grid;

  gap: 15px;
`;
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${(props) => (props.checked ? CANCEL_COLOR : "#ccc")};
  background-color: ${(props) =>
    props.checked ? CANCEL_COLOR : "transparent"};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${CANCEL_OPTIONS};
  }

  ${(props) =>
    props.checked &&
    `
  &::after {
  content:'✓';
  position:absolute;
  top:-6px;
  left:1.5px;
  color:white;
  font-size:12px;
  font-weight:bold;
  }
  `}
`;
const CheckboxLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
  user-select: none;
`;
const TextAreaWrapper = styled.div`
  margin: 20px 0;
`;
const TextAreaLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;
const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  border-radisu: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:focus {
    outline: none;
    border-color: ${CANCEL_COLOR};
    box-shadow: 0 0 0 2px ${CANCEL_COLOR}20;
  }

  &::placeholder {
    color: #999;
  }
`;
const StyledTextAreaElse = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 30px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:focus {
    outline: none;
    border-color: ${CANCEL_COLOR};
    box-shadow: 0 0 0 2px ${CANCEL_COLOR}20;
  }

  &:placeholder {
    color: #999;
  }
`;
