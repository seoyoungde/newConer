import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { deleteUser } from "firebase/auth";
import { useAuth } from "../../context/AuthProvider";
import RequestHeader from "../../components/common/Header/RequestHeader";

const MAX_TEXT_LENGTH = 100;

const WITHDRAW_OPTIONS = [
  "자주 이용하지 않아요.",
  "다시 가입하고 싶어요.",
  "관련 콘텐츠나 정보가 부족해요.",
  "고객 대응이 불친절해요",
  "제휴서비스에 불만족해요",
  "기타",
];

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [details, setDetails] = useState("");
  const [etcDetail, setEtcDetail] = useState("");
  const { userInfo } = useAuth();

  const handleReasonToggle = (reason) => {
    setReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleWithdraw = async () => {
    if (!confirmChecked) {
      alert("모든 항목을 입력해야 탈퇴 신청이 가능합니다.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("로그인된 사용자만 탈퇴할 수 있습니다.");
        return;
      }

      const userRef = doc(db, "Customer", currentUser.uid);
      const newPhone = userInfo.phone + "_deleted";
      await updateDoc(userRef, {
        isDeleted: true,
        state: 0,
        withdrawReasons: reasons,
        withdrawDetail: details,
        withdrawEtcDetail: etcDetail,
        phone: newPhone,
      });

      await deleteUser(currentUser);
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  // 단계 판단
  const showReasonSelection = confirmChecked;
  const showDetailInput = confirmChecked && reasons.length > 0;

  return (
    <Container>
      <RequestHeader
        showPrevButton={false}
        userName="회원을 탈퇴하시겠습니까?"
        to="/mypage/modify"
      />
      <ContentBox>
        {/* 3단계: 상세 설명 입력 및 버튼 (이유 선택 후 표시) */}
        {showDetailInput && (
          <>
            <LabelBox>
              <Label>탈퇴사유에 대해 더 자세히 설명해주세요</Label>
            </LabelBox>
            <TextAreaWrapper>
              <Notice>선택하신 이유에 대해 더 자세히 설명해주세요.</Notice>
              <Divider />
              <StyledTextArea
                placeholder="귀한 시간 내어 해주신 말씀을 바탕으로 더 나은 서비스를 제공하는 코너가 되겠습니다."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={MAX_TEXT_LENGTH}
              />
              <CharacterCount>
                {details.length} | {MAX_TEXT_LENGTH}자 이내
              </CharacterCount>
            </TextAreaWrapper>
          </>
        )}
        {/* 2단계: 탈퇴 이유 선택 (확인 체크 후 표시) */}
        {showReasonSelection && (
          <>
            <LabelBox>
              <Label>탈퇴하시는 이유를 선택해주세요</Label>
              <LabelSub>*복수 선택 가능</LabelSub>
            </LabelBox>
            <WithdrawList>
              {WITHDRAW_OPTIONS.map((item) => (
                <WithdrawItemWrapper key={item}>
                  <WithdrawItem onClick={() => handleReasonToggle(item)}>
                    <WithdrawName>{item}</WithdrawName>
                    <WithdrawCheckIcon checked={reasons.includes(item)}>
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
                    </WithdrawCheckIcon>
                  </WithdrawItem>
                  {item === "기타" && reasons.includes("기타") && (
                    <EtcTextAreaWrapper>
                      <Divider />
                      <StyledTextAreaElse
                        placeholder="입력해주신 사유를 토대로 더욱 발전하는 코너가 되겠습니다."
                        value={etcDetail}
                        onChange={(e) => setEtcDetail(e.target.value)}
                        maxLength={MAX_TEXT_LENGTH}
                      />
                      <CharCount>{etcDetail.length}/100자 이내</CharCount>
                    </EtcTextAreaWrapper>
                  )}
                </WithdrawItemWrapper>
              ))}
            </WithdrawList>
          </>
        )}
        {/* 1단계: 확인 사항 (항상 표시) */}
        <SubBox>
          <Notice>
            회원 탈퇴 신청에 앞서 아래 내용을 반드시 확인해주세요.
          </Notice>

          <ul>
            <li>회원 탈퇴 시 등록하신 게시물은 삭제되지 않아요.</li>
            <li>의뢰서 삭제를 원하실 경우 먼저 고객센터에 연락해주세요.</li>
            <li>다음 의뢰를 하실 때에는 개인 정보를 다시 작성해야 해요.</li>
            <li>탈퇴 이후에는 이전 서비스 기록이 연동되지 않아요.</li>
          </ul>
          <Divider />
          <ConfirmRow>
            <Required>필수</Required>
            <ConfirmText>위 내용을 모두 확인했어요.</ConfirmText>
            <CheckIcon
              checked={confirmChecked}
              onClick={() => setConfirmChecked((prev) => !prev)}
            >
              ✓
            </CheckIcon>
          </ConfirmRow>
        </SubBox>

        {/* 3단계: 상세 설명 입력 및 버튼 (이유 선택 후 표시) */}
        {showDetailInput && (
          <>
            <ButtonArea>
              <ButtonRow>
                <CancelBtn onClick={() => navigate(-1)}>
                  더 편리한 신청 계속하기
                </CancelBtn>
                <WithdrawBtn onClick={handleWithdraw}>탈퇴신청</WithdrawBtn>
              </ButtonRow>
              {/* <CSButtonContainer>
                <CSButton>
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
              </CSButtonContainer> */}
            </ButtonArea>
          </>
        )}
      </ContentBox>
    </Container>
  );
};

export default WithdrawPage;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const ContentBox = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodySmall};

  padding: 36px 24px 24px 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const Notice = styled.p`
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const SubBox = styled.div`
  background: white;
  border-radius: 10px;
  padding: 23px 26px;

  ul {
    padding-left: 20px;
    margin-top: 16px;
    font-size: 14px;
    margin-bottom: 20px;
    list-style-type: "∙ ";
    li {
      padding-left: 8px;
      line-height: 1.6;
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #a2afb7;
  margin-bottom: 16px;
`;

const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
`;

const ConfirmText = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const Required = styled.span`
  width: 31px;
  height: 20px;
  border-radius: 4px;
  background: #a2afb7;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
`;

const Label = styled.div`
  font-size: 20px;
  font-weight: bold;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const LabelBox = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const LabelSub = styled.p`
  color: #8d989f;
  font-size: 18px;
  margin: 0;
  display: flex;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 14px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const WithdrawBtn = styled.button`
  flex: 0.4;
  height: 56px;
  margin-left: 6px;
  background-color: ${(props) => (props.disabled ? "#ddd" : "#555")};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
`;

const CancelBtn = styled.button`
  flex: 1;
  height: 56px;
  background: linear-gradient(to right, #0080ff, #0080ff);
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
`;

const CheckIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  flex-shrink: 0;
  color: white;
  transition: all 0.2s ease;
  background-color: ${({ checked }) => (checked ? "#004FFF" : "#A2AFB7")};
  cursor: pointer;
`;

const TextAreaWrapper = styled.div`
  background-color: white;
  padding: 23px 26px;
  border-radius: 10px;
  margin-bottom: 36px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 19px;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 14px;
  color: #8d989f;
  margin-top: 8px;
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
  white-space: pre-wrap;
  line-height: 1.5;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #8d989f;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const EtcTextAreaWrapper = styled.div`
  padding: 16px 26px;
  background: white;
  border-radius: 0 0 10px 10px;
  margin-top: -10px;
`;

const WithdrawList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 36px;
`;

const WithdrawItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const WithdrawItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 26px 18px 26px;
  cursor: pointer;
  background: white;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 79, 255, 0.3);
  }
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
  white-space: pre-wrap;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #004fff;
    box-shadow: 0 0 0 2px rgba(0, 79, 255, 0.1);
  }

  &::placeholder {
    color: #8d989f;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 14px;
  color: #8d989f;
  margin-top: 8px;
`;

const WithdrawName = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const WithdrawCheckIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background-color: ${({ checked }) => (checked ? "#004FFF" : "#A2AFB7")};

  svg {
    opacity: ${({ checked }) => (checked ? "1" : "0")};
    transition: opacity 0.2s ease;
  }
`;

const ButtonArea = styled.div`
  margin-top: 32px;
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
