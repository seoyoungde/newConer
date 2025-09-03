import React, { useState } from "react";
import styled from "styled-components";
import conerlogo from "../../assets/images/conerlogo.png";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/formControls/Input";
import InputGroup from "../../components/ui/formControls/InputGroup";
import NavHeader from "../../components/common/Header/NavHeader";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import * as firebaseAuth from "firebase/auth";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [codeSentTo, setCodeSentTo] = useState("");

  const API = "https://api.coner.kr";

  const generateRandomCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 4) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length >= 9) value = value.slice(0, 8) + "-" + value.slice(8);
    if (value.length > 13) value = value.slice(0, 13);
    setPhoneNumber(value);
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) return alert("전화번호를 입력해주세요.");

    const code = generateRandomCode();

    setSentCode(code);
    setCodeSentTo(phoneNumber.replace(/\D/g, ""));

    setTimer(180);

    if (timerId) clearInterval(timerId);

    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setSentCode("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerId(id);

    try {
      await axios.post(`${API}/sms/send`, {
        to: phoneNumber.replace(/\D/g, ""),
        text: `인증번호는 ${code}입니다.`,
      });
      alert("인증번호가 전송되었습니다.");
    } catch (error) {
      console.error(error);
      alert("인증번호 전송 실패: " + error.message);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (!phoneNumber || phoneNumber.length < 10)
        return alert("전화번호를 정확히 입력해주세요");
      if (!code) return alert("인증번호를 입력해주세요");
      if (code !== sentCode) return alert("인증번호가 일치하지 않습니다");

      const formattedPhone = phoneNumber.replace(/\D/g, "");
      const intlPhone = "+82" + formattedPhone.slice(1);

      if (formattedPhone !== codeSentTo) {
        return alert("인증번호를 받은 전화번호와 일치하지 않습니다.");
      }

      const q = query(
        collection(db, "Customer"),
        where("phone", "==", formattedPhone)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("해당 전화번호로 가입된 회원이 없습니다.");
        return;
      }

      const response = await axios.post("https://api.coner.kr/auth/login", {
        phoneNumber: intlPhone,
      });

      const token = response.data.customToken;
      await firebaseAuth.signInWithCustomToken(auth, token);

      navigate("/");
      setSentCode("");
    } catch (error) {
      alert("로그인 실패: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavHeader to="/" />
      <LoginContainer>
        <LogoImage src={conerlogo} alt="코너 로고" width={170} />
        <InputBox>
          <Input
            size="lg"
            type="tel"
            inputMode="numeric"
            placeholder="휴대폰 번호"
            value={phoneNumber}
            onChange={handlePhoneChange}
          />
          <PasswordField>
            <InputGroup
              size="lg"
              inputProps={{
                placeholder: "인증번호입력",
                inputMode: "numeric",
                autoComplete: "one-time-code",
                value: code,
                onChange: (e) => setCode(e.target.value),
                maxLength: 6,
              }}
              buttonText={timer > 0 ? "재전송하기" : "인증번호받기"}
              buttonDisabled={isLoading || !phoneNumber || timer > 0}
              onButtonClick={handleSendVerificationCode}
            />
            {timer > 0 && (
              <p style={{ color: "#999", fontSize: 13, marginTop: 4 }}>
                인증번호 유효 시간: {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, "0")}
              </p>
            )}
          </PasswordField>
        </InputBox>
        <Button
          fullWidth
          size="lg"
          style={{ marginTop: 20, marginBottom: 24 }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "로딩중..." : "로그인"}
        </Button>
        <SearchSection>
          <SignupLink to="/signup">회원가입하기</SignupLink>
        </SearchSection>
      </LoginContainer>
    </>
  );
};
export default LoginPage;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 80%;
  text-align: center;
`;
const LogoImage = styled.img``;
const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 40px;
  box-sizing: border-box;
`;
const PasswordField = styled.div``;

const SearchSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;
const SignupLink = styled(Link)``;
