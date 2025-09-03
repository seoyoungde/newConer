import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import NavHeader from "../../components/common/Header/NavHeader";
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

  const generateRandomCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendVerificationCode = async () => {
    if (!phone) return alert("전화번호를 입력해주세요.");

    const code = generateRandomCode();
    setSentCode(code);

    setCodeSentTo(phone.replace(/-/g, ""));

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
      if (!sentCode) {
        return alert("인증번호가 만료되었습니다. 다시 요청해주세요.");
      }
      if (passPhone !== sentCode) {
        return alert("인증번호가 일치하지 않습니다.");
      }
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

        // agreements: {
        //   age: true,
        //   customer: true,
        //   privacy: true,
        //   all: true,
        // },
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
  };

  const allRequiredAgreed =
    agreements.age && agreements.customer && agreements.privacy;

  return (
    <Container>
      <NavHeader to="/login" title="회원정보입력" />

      <FormBox>
        <FormGroup>
          <TextField
            label="이름"
            size="sm"
            placeholder="이름입력."
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <LabelRow>
            <span>휴대전화번호</span>
          </LabelRow>

          <InputGroup
            size="sm"
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
        </FormGroup>
        <FormGroup>
          <TextField
            label="인증번호 입력"
            size="sm"
            placeholder="6자리 인증번호 입력"
            maxLength={6}
            value={passPhone}
            onChange={(e) => setPassPhone(e.target.value)}
          />

          {timer > 0 && (
            <p style={{ color: "#999", fontSize: "13px", marginTop: "4px" }}>
              인증번호 유효 시간: {Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, "0")}
            </p>
          )}
        </FormGroup>
        <FormGroup>
          <TextField
            label="거주지"
            size="sm"
            name="clientAddress"
            placeholder="클릭하여 주소 검색"
            readOnly
            value={address}
            onClick={() => setIsAddressOpen(true)}
          />
          <div style={{ height: "5px" }}></div>
          <TextField
            name="clientDetailAddress"
            size="sm"
            placeholder="상세주소입력"
            value={address_detail}
            onChange={(e) => setAddress_detail(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="생년월일 8자리"
            size="sm"
            placeholder="예) 19991231"
            inputMode="numeric"
            maxLength={12}
            value={birth_date}
            onChange={handleBirthChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>고객유형</Label>
          <SegmentedToggle
            value={customerType}
            onChange={setCustomerType}
            options={[
              { label: "사업장(기업/매장)", value: "사업장(기업/매장)" },
              { label: "개인(가정)", value: "개인(가정)" },
            ]}
          />
        </FormGroup>

        <FormGroup>
          <TextField
            label="이메일 (선택)"
            size="sm"
            placeholder="이메일입력은 선택사항입니다"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormGroup>

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
            만 19세 이상입니다. <span style={{ color: "#0080FF" }}>(필수)</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={agreements.customer}
              onChange={() => handleCheck("customer")}
            />
            <PolicyLink
              href={policyLinks.customer}
              target="_blank"
              rel="noopener noreferrer"
            >
              고객 이용약관
            </PolicyLink>
            에 동의합니다. <span style={{ color: "#0080FF" }}>(필수)</span>
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
            에 동의합니다. <span style={{ color: "#0080FF" }}>(필수)</span>
          </label>
        </CheckboxGroup>
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

      <Button
        fullWidth
        size="md"
        style={{ marginTop: 20, marginBottom: 24 }}
        onClick={handleCreataccount}
        disabled={isSubmitting || !allRequiredAgreed}
      >
        {isSubmitting ? "가입 중..." : "가입하기"}
      </Button>
    </Container>
  );
};
export default SignupPage;

const Container = styled.div``;

const FormBox = styled.div`
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px 12px;
  background: #fff;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    border: none;
    padding: 0px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.p`
  margin-bottom: 6px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
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
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: ${({ theme }) => theme.font.size.bodySmall};
  }

  label:first-child {
    padding-left: 0;
    font-weight: ${({ theme }) => theme.font.weight.bold};
  }

  label:not(:first-child) {
    padding-left: 10px;
    @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
      padding-left: 6px;
    }
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }
`;

const PolicyLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`;
