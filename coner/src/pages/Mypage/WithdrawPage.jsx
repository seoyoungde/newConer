import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { deleteUser } from "firebase/auth";
import { useAuth } from "../../context/AuthProvider";
import NavHeader from "../../components/common/Header/NavHeader";

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [details, setDetails] = useState("");
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
        phone: newPhone,
      });

      await deleteUser(currentUser);
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container>
      <NavHeader to="/mypage/modify" title="회원탈퇴하기" />
      <ContentBox>
        <Notice>
          회원탈퇴 신청에 앞서 아래 내용을 반드시 확인해주시기 바랍니다
        </Notice>
        <SubBox>
          <strong>회원탈퇴 시 처리내용</strong>
          <ul>
            <li>회원탈퇴 시 회원이 등록한 게시물은 삭제되지 않는다</li>
            <li>
              의뢰서 삭제를 원할 경우 먼저 고객센터에 의뢰 후 탈퇴를 신청하시기
              바랍니다
            </li>
          </ul>
        </SubBox>

        <ConfirmRow>
          <Checkbox
            type="checkbox"
            checked={confirmChecked}
            onChange={() => setConfirmChecked((prev) => !prev)}
          />
          <ConfirmText>
            위 내용을 모두 확인하였습니다 <Required>필수</Required>
          </ConfirmText>
        </ConfirmRow>

        <Label>＊CONER 어떤 이유로 탈퇴하시려는 걸까요? (복수 선택 가능)</Label>
        <CheckboxList>
          {[
            "이용빈도 낮음",
            "재가입",
            "콘텐츠 등 정보 부족",
            "고객대응 불친절",
            "제휴서비스 불만",
            "기타",
          ].map((text) => (
            <CheckboxRow key={text}>
              <Checkbox
                type="checkbox"
                checked={reasons.includes(text)}
                onChange={() => handleReasonToggle(text)}
              />
              <span>{text}</span>
            </CheckboxRow>
          ))}
        </CheckboxList>

        <Label>
          코너 서비스 중 어떤 점이 불편하셨을까요?
          <SubText>
            선택하신 항목에 대한 자세한 이유를 남겨주시면 서비스 개선에 큰
            도움이 됩니다
          </SubText>
        </Label>
        <Textarea
          placeholder="선택하신 항목에 대한 자세한 이유를 남겨주세요"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </ContentBox>

      <ButtonRow>
        <WithdrawBtn onClick={handleWithdraw}>탈퇴신청</WithdrawBtn>
        <CancelBtn onClick={() => navigate(-1)}>취소하기</CancelBtn>
      </ButtonRow>
    </Container>
  );
};

export default WithdrawPage;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const ContentBox = styled.div`
  margin-top: 20px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;

const Notice = styled.p`
  margin-bottom: 10px;
`;

const SubBox = styled.div`
  background: #f8f8f8;
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 20px;
  ul {
    padding-left: 20px;
    margin-top: 8px;
  }
`;

const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  -webkit-appearance: none;
  margin-right: 8px;
  width: 13px;
  height: 13px;
  border: 1.5px solid #cfcfcf;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bg};
  display: inline-grid;
  place-content: center;
  cursor: pointer;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-right: 1.5px solid #111;
    border-bottom: 1px solid #111;
    transform: scale(0) rotate(45deg);
    transition: transform 120ms ease-in-out;
  }

  &:checked::before {
    transform: scale(1) rotate(45deg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;

const Required = styled.span`
  color: red;
  font-size: ${({ theme }) => theme.font.size.small};
  margin-left: 6px;
`;

const Label = styled.div`
  margin-top: 24px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const SubText = styled.div`
  color: gray;
  font-size: ${({ theme }) => theme.font.size.small};
  margin-top: 4px;
`;

const CheckboxList = styled.div`
  margin-top: 8px;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  margin: 6px 0;
  input {
    margin-right: 8px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-top: 8px;
  padding: 10px;
  border: 1px solid #ccc;
  resize: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const WithdrawBtn = styled.button`
  flex: 1;
  height: 46px;
  margin-right: 6px;
  background-color: ${(props) => (props.disabled ? "#ddd" : "#555")};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;
`;

const CancelBtn = styled.button`
  flex: 1;
  height: 46px;
  background: linear-gradient(to right, #0080ff, #0080ff);
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;
`;
