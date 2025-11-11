import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../components/ui/Button";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/common/Modal/Modal";
import RequestHeader from "../../components/common/Header/RequestHeader";

const MAX_TEXT_LENGTH = 100;

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
        created_at: formatDate(new Date()),
      };

      // CancelReview 컬렉션에 취소 리뷰 저장
      await setDoc(doc(db, "CancelReview", requestId), cancelreviewData);

      // Request 컬렉션의 status를 0으로 변경
      const requestRef = doc(db, "Request", requestId);
      await updateDoc(requestRef, { status: 0 });

      setPopupMessage("취소가 완료되었습니다.");
    } catch (error) {
      console.error("의견 저장 중 오류 발생:", error);
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

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  const handleKeyPress = (e, cancel) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCancel(cancel);
    }
  };

  const handleBackClick = () => {
    navigate("/search/inquiry", { state: { requestId } });
  };

  return (
    <Section>
      <RequestHeader
        showPrevButton={false}
        userName="취소 이유가 무엇인가요?"
        onPrevClick={handleBackClick}
      />

      <Form onSubmit={handleSubmitCancelReview}>
        <CancelSection>
          <PageTitle>
            {selectedCancel.size === 0
              ? "취소 사유를 선택해주세요"
              : "그 외 개선할점이 있다면 말씀해주세요"}
          </PageTitle>

          {selectedCancel.size > 0 && (
            <TextAreaWrapper>
              <TextAreaLabel>서비스에 대한 의견을 나눠주세요</TextAreaLabel>
              <Divider />
              <StyledTextArea
                placeholder="나눠주신 의견을 통해 더 나은 서비스를 제공하는 코너가 되겠습니다."
                rows={4}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
              />
              <CharacterCount>
                {complaints.length} | {MAX_TEXT_LENGTH}자 이내
              </CharacterCount>
            </TextAreaWrapper>
          )}
          <CancelList>
            {CANCEL_OPTIONS.map((cancel) => (
              <CancelItemWrapper key={cancel}>
                <CancelItem
                  onClick={() => toggleCancel(cancel)}
                  onKeyPress={(e) => handleKeyPress(e, cancel)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCancel.has(cancel)}
                >
                  <CancelName>{cancel}</CancelName>
                  <CheckIcon $isSelected={selectedCancel.has(cancel)}>
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L5 9L13 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </CheckIcon>
                </CancelItem>
                {cancel === "기타" && selectedCancel.has("기타") && (
                  <EtcTextAreaWrapper>
                    <Divider />
                    <StyledTextAreaElse
                      placeholder="입력해주신 사유를 토대로 더욱 발전하는 코너가 되겠습니다."
                      rows={3}
                      value={selectedElse}
                      onChange={(e) => setSelectedElse(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CharCount>{selectedElse.length} / 100자 이내</CharCount>
                  </EtcTextAreaWrapper>
                )}
              </CancelItemWrapper>
            ))}
          </CancelList>
        </CancelSection>

        {selectedCancel.size > 0 && (
          <ButtonArea>
            <Button
              fullWidth
              size="stepsize"
              type="submit"
              // disabled={isSubmitting || selectedCancel.size === 0 || !complaints}
            >
              {isSubmitting ? " 제출 중..." : "서비스 취소하기"}
            </Button>
            <CSButtonContainer>
              <CSButton onClick={handleHelpClick}>
                <CSButtonText>도움이 필요해요</CSButtonText>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="14"
                  viewBox="0 0 8 14"
                  fill="none"
                >
                  <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
                </svg>
              </CSButton>
            </CSButtonContainer>
          </ButtonArea>
        )}
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

const Form = styled.form`
  width: 100%;
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const CancelSection = styled.div``;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 1.2rem;
  }
`;

const CancelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CancelItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CancelItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px 18px 26px;
  cursor: pointer;
  background: white;
  border-radius: 10px;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 79, 255, 0.3);
  }
`;

const CancelName = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 16%;
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#004FFF" : "#A2AFB7")};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#004FFF" : "#A2AFB7"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
`;

const EtcTextAreaWrapper = styled.div`
  padding: 16px 26px;
  background: white;
  border-radius: 0 0 10px 10px;
  margin-top: -10px;
`;

const StyledTextAreaElse = styled.textarea`
  width: 100%;
  border: none;
  background: white;
  color: #333;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:focus {
    outline: none;
    border-color: #004fff;
    box-shadow: 0 0 0 2px rgba(0, 79, 255, 0.1);
  }

  &::placeholder {
    color: #8d989f;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 14px;
  color: #999;
  margin-top: 8px;
`;

const TextAreaWrapper = styled.div`
  background-color: white;
  padding: 23px 26px;
  border-radius: 10px;
  margin-bottom: 16px;
  margin-top: 0;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 19px;
  }
`;

const TextAreaLabel = styled.label`
  display: block;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
`;
const Divider = styled.div`
  height: 1px;
  background-color: #a2afb7;
  margin-bottom: 16px;
`;
const StyledTextArea = styled.textarea`
  width: 100%;
  border: none;
  background: white;
  color: #333;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  min-height: 100px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #8d989f;
  }
`;
const CharacterCount = styled.div`
  text-align: right;
  font-size: 14px;
  color: #8d989f;
  margin-top: 8px;
`;

const ButtonArea = styled.div`
  margin-top: 64px;
`;

const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const CSButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;

const CSButtonText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;
