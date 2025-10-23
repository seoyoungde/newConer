import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/formControls/TextField";
import InputGroup from "../../components/ui/formControls/InputGroup";
import SegmentedToggle from "../../components/ui/SegmentedToggle";
import { db, auth } from "../../lib/firebase";
import axios from "axios";
import { signInWithCustomToken } from "firebase/auth";
import {
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import AddressModal, {
  SERVICE_AREAS,
} from "../../components/common/Modal/AddressModal";
import Modal from "../../components/common/Modal/Modal";
import RequestHeader from "../../components/common/Header/RequestHeader";

const SignupPage = () => {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("");
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birth_date, setBirth_date] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [passPhone, setPassPhone] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [address_detail, setAddress_detail] = useState("");
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [step, setStep] = useState(1);

  const policyLinks = {
    customer: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",

    privacy: "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
  };
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    customer: false,
    privacy: false,
  });

  const handleCheck = (key) => {
    if (key === "all") {
      const next = !agreements.all;
      setAgreements({
        all: next,
        age: next,
        customer: next,
        privacy: next,
      });
    } else {
      const next = { ...agreements, [key]: !agreements[key] };
      next.all = next.age && next.customer && next.privacy;
      setAgreements(next);
    }
  };

  useEffect(() => {
    const state = location.state;
    if (state?.selectedAddress) {
      setAddress(state.selectedAddress);

      if (state.name) setName(state.name);
      if (state.email) setEmail(state.email);
      if (state.customerType) setCustomerType(state.customerType);
      if (state.birth_date) setBirth_date(state.birth_date);
      if (state.detailAddress) setAddress_detail(state.address_detail);
      if (state.phone) setPhone(state.phone);
      if (state.passPhone) setPassPhone(state.passPhone);
    }
  }, [location.state]);

  // 자동으로 다음 단계로 진행 (이메일 제외)
  useEffect(() => {
    if (step === 1 && name.trim()) {
      setStep(2);
    }
  }, [name, step]);

  useEffect(() => {
    if (step === 2 && birth_date.length >= 11) {
      setStep(3);
    }
  }, [birth_date, step]);

  // step 3은 인증완료 버튼으로 수동 진행

  useEffect(() => {
    if (step === 4 && address && address_detail) {
      setStep(5);
    }
  }, [address, address_detail, step]);

  useEffect(() => {
    if (step === 5 && customerType) {
      setStep(6);
    }
  }, [customerType, step]);

  const generateRandomCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendVerificationCode = async () => {
    if (!phone) return alert("전화번호를 입력해주세요.");

    const code = generateRandomCode();
    setSentCode(code);

    setCodeSentTo(phone.replace(/-/g, ""));

    setTimer(180);

    // 인증 상태 초기화
    setIsPhoneVerified(false);
    setPassPhone("");

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
      await axios.post("https://api.coner.kr/sms/send", {
        to: phone.replace(/-/g, ""),
        text: `인증번호는 ${code}입니다.`,
      });
      alert("인증번호가 전송되었습니다.");
    } catch (error) {
      console.error(error);
      alert("인증번호 전송 실패: " + error.message);
    }
  };

  const handleCreataccount = async () => {
    try {
      setIsSubmitting(true);

      if (!(agreements.age && agreements.customer && agreements.privacy)) {
        return alert(
          "필수 약관(만 14세 이상, 고객 이용약관, 개인정보 수집 및 이용)에 모두 동의해야 가입할 수 있습니다."
        );
      }

      if (
        !name ||
        !customerType ||
        !birth_date ||
        !address ||
        !address_detail
      ) {
        return alert("모든 정보를 입력해주세요.");
      }
      if (!phone || !passPhone) {
        return alert("전화번호와 인증번호를 입력해주세요.");
      }
      if (!isPhoneVerified) {
        return alert("휴대폰 인증을 완료해주세요.");
      }
      // 인증이 완료된 경우에는 sentCode와 passPhone 검증을 건너뜀
      // 이미 인증이 완료되었으면 타이머가 만료되어도 문제없음
      if (phone.replace(/-/g, "") !== codeSentTo) {
        return alert("인증번호를 받은 전화번호와 일치하지 않습니다.");
      }
      const isValidBirth = (str) => {
        const matches = str.match(/^(\d{4})년 (\d{2})월 (\d{2})일$/);
        if (!matches) return false;
        const [_, y, m, d] = matches;
        return (
          +y > 1900 && +y < 2100 && +m >= 1 && +m <= 12 && +d >= 1 && +d <= 31
        );
      };
      if (!isValidBirth(birth_date)) {
        return alert("올바른 생년월일 형식이 아닙니다. 예: 1990-01-01");
      }

      const formattedPhone = phone.replace(/-/g, "");

      const q = query(
        collection(db, "Customer"),
        where("phone", "==", formattedPhone)
      );
      const snapshot = await getDocs(q);
      if (snapshot.docs.find((doc) => !doc.data().isDeleted)) {
        return alert("이미 가입된 전화번호입니다.");
      }

      const res = await axios.post("https://api.coner.kr/auth/login", {
        phoneNumber: "+82" + formattedPhone.slice(1),
      });
      const token = res.data.customToken;

      const userCredential = await signInWithCustomToken(auth, token);
      const uid = userCredential.user.uid;

      const newUser = {
        member_id: uid,
        email: email,
        name: name,
        job: customerType,
        birth_date: birth_date,
        address: address,
        address_detail: address_detail,
        phone: formattedPhone,
        state: 1,
        isDeleted: false,
      };

      await setDoc(doc(db, "Customer", uid), newUser);

      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      alert(
        "회원가입 실패: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBirthChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 4) value = value.slice(0, 4) + "년 " + value.slice(4);
    if (value.length >= 8) value = value.slice(0, 8) + "월 " + value.slice(8);
    if (value.length >= 12) value = value.slice(0, 12) + "일";
    if (value.length > 13) value = value.slice(0, 13);
    setBirth_date(value);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (value.length >= 4) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length >= 9) value = value.slice(0, 8) + "-" + value.slice(8);
    setPhone(value);
    // 전화번호가 변경되면 인증 상태 초기화
    setIsPhoneVerified(false);
  };

  const allRequiredAgreed =
    agreements.age && agreements.customer && agreements.privacy;

  const getTitleByStep = () => {
    switch (step) {
      case 1:
        return "성함을 입력해주세요.";
      case 2:
        return "생년월일을 입력해주세요.";
      case 3:
        return "휴대폰 번호를 입력해주세요.";
      case 4:
        return "주소를 입력해주세요.";
      case 5:
        return "개인이신가요, 사업자이신가요?";
      case 6:
        return "이메일을 입력해주세요.";
      case 7:
        return "이용약관을 확인해주세요.";
      default:
        return "회원가입";
    }
  };

  const handleNext = () => {
    // 이메일 단계(step 6)에서 다음으로 진행
    if (step === 6) {
      setStep(7);
    }
  };

  const handleVerifyCode = () => {
    if (!phone || !passPhone) {
      return alert("전화번호와 인증번호를 입력해주세요.");
    }
    if (!sentCode) {
      return alert("인증번호가 만료되었습니다. 다시 요청해주세요.");
    }
    if (passPhone !== sentCode) {
      return alert("인증번호가 일치하지 않습니다.");
    }
    if (phone.replace(/-/g, "") !== codeSentTo) {
      return alert("인증번호를 받은 전화번호와 일치하지 않습니다.");
    }
    // 인증 성공 - 다음 단계로
    setIsPhoneVerified(true);
    alert("인증이 완료되었습니다.");
    setStep(4);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Container>
      <RequestHeader showPrevButton={false} userName="회원가입" to="/login" />
      <ContentSection>
        <FormBox>
          <Title>{getTitleByStep()}</Title>
          {step >= 7 && (
            <CheckboxGroup>
              <CheckboxItem onClick={() => handleCheck("all")}>
                <CheckboxText>이용약관 전체 동의</CheckboxText>
                <CheckIcon checked={agreements.all}>✓</CheckIcon>
              </CheckboxItem>
              <div
                style={{ height: "1.2px", backgroundColor: "#A2AFB7" }}
              ></div>

              <CheckboxItem onClick={() => handleCheck("age")}>
                <Required>필수</Required>
                <CheckboxText>만 19세 이상입니다.</CheckboxText>
                <CheckIcon checked={agreements.age}>✓</CheckIcon>
              </CheckboxItem>

              <CheckboxItem onClick={() => handleCheck("customer")}>
                <Required>필수</Required>
                <CheckboxText>
                  <PolicyLink
                    href={policyLinks.customer}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    고객 이용약관
                  </PolicyLink>
                  에 동의합니다.
                </CheckboxText>
                <CheckIcon checked={agreements.customer}>✓</CheckIcon>
              </CheckboxItem>

              <CheckboxItem onClick={() => handleCheck("privacy")}>
                <Required>필수</Required>
                <CheckboxText>
                  <PolicyLink
                    href={policyLinks.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    개인정보의 수집 및 이용
                  </PolicyLink>
                  에 동의합니다.
                </CheckboxText>
                <CheckIcon checked={agreements.privacy}>✓</CheckIcon>
              </CheckboxItem>
            </CheckboxGroup>
          )}
          {step >= 6 && (
            <FormGroup>
              <TextField
                label="이메일 주소 (선택 사항입니다)"
                size="stepsize"
                placeholder="이메일을 입력해주세요."
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
          )}
          {step >= 5 && (
            <FormGroup>
              <Label>의뢰인 유형</Label>
              <SegmentedToggle
                value={customerType}
                onChange={setCustomerType}
                options={[
                  { label: "사업장(기업/매장)", value: "사업장(기업/매장)" },
                  { label: "개인(가정)", value: "개인(가정)" },
                ]}
              />
            </FormGroup>
          )}
          {step >= 4 && (
            <>
              <FormGroup>
                <TextField
                  label="거주지"
                  size="stepsize"
                  name="clientAddress"
                  placeholder="클릭하여 주소 검색"
                  readOnly
                  value={address}
                  onClick={() => setIsAddressOpen(true)}
                />
                <div style={{ height: "5px" }}></div>
                <TextField
                  name="clientDetailAddress"
                  size="stepsize"
                  placeholder="상세주소입력"
                  value={address_detail}
                  onChange={(e) => setAddress_detail(e.target.value)}
                />
              </FormGroup>
            </>
          )}
          {step >= 3 && (
            <>
              <FormGroup>
                <LabelRow>
                  <span
                    style={{
                      fontWeight: "500",
                      fontSize: "12px",
                      color: "#8f8f8f",
                    }}
                  >
                    휴대폰 번호
                  </span>
                </LabelRow>

                <InputGroup
                  size="stepsize"
                  inputProps={{
                    placeholder: "전화번호입력",
                    inputMode: "numeric",
                    autoComplete: "tel",
                    value: phone,
                    onChange: handlePhoneChange,
                    maxLength: 13,
                  }}
                  buttonText={timer > 0 ? "재전송 대기" : "인증번호받기"}
                  buttonDisabled={!phone || timer > 0 || isLoading}
                  onButtonClick={handleSendVerificationCode}
                />
                <div style={{ height: "5px" }}></div>
                <InputGroup
                  size="stepsize"
                  inputProps={{
                    placeholder: "6자리 인증번호 입력",
                    maxLength: 6,
                    inputMode: "numeric",
                    value: passPhone,
                    onChange: (e) => setPassPhone(e.target.value),
                    disabled: isPhoneVerified,
                  }}
                  buttonText={
                    isPhoneVerified ? "인증 번호 확인 완료" : "인증완료"
                  }
                  buttonDisabled={
                    isPhoneVerified ||
                    !passPhone ||
                    passPhone.length !== 6 ||
                    !sentCode
                  }
                  buttonVariant={isPhoneVerified ? "secondary" : "primary"}
                  onButtonClick={handleVerifyCode}
                />

                {timer > 0 && (
                  <p
                    style={{
                      color: "#999",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    인증번호 유효 시간: {Math.floor(timer / 60)}:
                    {String(timer % 60).padStart(2, "0")}
                  </p>
                )}
              </FormGroup>
            </>
          )}
          {step >= 2 && (
            <FormGroup>
              <TextField
                label="생년월일"
                size="stepsize"
                placeholder="예) 19991231"
                inputMode="numeric"
                maxLength={12}
                value={birth_date}
                onChange={handleBirthChange}
              />
            </FormGroup>
          )}
          {step >= 1 && (
            <FormGroup>
              <TextField
                label="이름"
                size="stepsize"
                placeholder="이름을 입력해주세요."
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
          )}
        </FormBox>

        {isAddressOpen && (
          <Modal
            open={isAddressOpen}
            onClose={() => setIsAddressOpen(false)}
            title="주소 검색"
            width={420}
            containerId="rightbox-modal-root"
          >
            <div style={{ width: "100%", height: "70vh" }}>
              <AddressModal
                onSelect={(addr) => setAddress(addr)}
                onClose={() => setIsAddressOpen(false)}
                serviceAreas={SERVICE_AREAS}
              />
            </div>
          </Modal>
        )}
      </ContentSection>
      {step === 6 && (
        <FixedButtonArea>
          <Button fullWidth size="stepsize" onClick={handleNext}>
            다음
          </Button>
        </FixedButtonArea>
      )}

      {step === 7 && (
        <FixedButtonArea>
          <Button
            fullWidth
            size="stepsize"
            onClick={handleCreataccount}
            disabled={isSubmitting || !allRequiredAgreed}
          >
            {isSubmitting ? "가입 중..." : "회원가입 완료"}
          </Button>
        </FixedButtonArea>
      )}
    </Container>
  );
};
export default SignupPage;

const Container = styled.div``;
const ContentSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const FormBox = styled.div``;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const FormGroup = styled.div`
  margin-top: 24px;
`;

const Label = styled.p`
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  span {
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    font-weight: ${({ theme }) => theme.font.weight.bold};
  }
`;

const CheckboxGroup = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
`;

const CheckboxText = styled.span`
  flex: 1;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
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
  background-color: ${({ checked }) => (checked ? "#004FFF" : "#A2AFB7")};
  color: white;
  transition: all 0.2s ease;
`;

const Required = styled.div`
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
`;

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`;

const FixedButtonArea = styled.div`
  position: sticky;
  bottom: 0;
  width: 100%;
  flex-shrink: 0;
  background: #f2f3f6;
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 50px;
  padding-top: 20px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding-left: 15px;
    padding-right: 15px;
  }
`;
