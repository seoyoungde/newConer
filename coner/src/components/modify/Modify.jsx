import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import TextField from "../ui/formControls/TextField";
import Button from "../ui/Button";
import Modal from "../common/Modal/Modal";
import AddressModal, { SERVICE_AREAS } from "../common/Modal/AddressModal";

const Modify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { partnerId } = useParams();
  const { setUserInfo, userInfo } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    job: "",
    birth_date: "",
    address: "",
    address_detail: "",
    phone: "",
  });
  const [clearedFields, setClearedFields] = useState({});
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        email: location.state?.email || userInfo.email || "",
        name: location.state?.name || userInfo.name || "",
        job: location.state?.job || userInfo.job || "",
        birth_date: location.state?.birth_date || userInfo.birth_date || "",
        address:
          location.state?.selectedAddress ||
          location.state?.address ||
          userInfo.address ||
          "",
        address_detail:
          location.state?.address_detail || userInfo.address_detail || "",
        phone: formatPhoneDisplay(
          location.state?.phone || userInfo.phone || ""
        ),
      });
    }
  }, [userInfo, location.state]);

  const handleAddressSelect = (selectedAddress) => {
    setFormData((prev) => ({
      ...prev,
      address: selectedAddress,
    }));
    setIsAddressModalOpen(false);
  };

  const handleFocusClear = (field) => {
    if (!clearedFields[field]) {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      setClearedFields((prev) => ({ ...prev, [field]: true }));
    }
  };

  const normalizePhone = (phone) => {
    return phone.replace(/\D/g, "");
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const formatBirthInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 5) value = value.slice(0, 4) + "-" + value.slice(4);
    if (value.length >= 8) value = value.slice(0, 7) + "-" + value.slice(7);
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, birth_date: value }));
  };

  const formatPhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 4) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length >= 9) value = value.slice(0, 8) + "-" + value.slice(8);
    if (value.length > 13) value = value.slice(0, 13);
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const newPhone = normalizePhone(formData.phone);

      const ref = doc(db, "Customer", auth.currentUser.uid);
      const updatedData = {
        ...formData,
        phone: newPhone,
      };
      await updateDoc(ref, updatedData);

      const q = query(
        collection(db, "Request"),
        where("customer_uid", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.update(doc(db, "Request", docSnap.id), {
          phone: newPhone,
        });
      });
      await batch.commit();

      const updatedSnap = await getDoc(ref);
      if (updatedSnap.exists()) {
        setUserInfo(updatedSnap.data());
      }

      alert("정보가 수정되었습니다");
      if (location.state?.from === "step4") {
        navigate("/request/step5", { replace: true });
      } else if (location.state?.from === "partnerstep4") {
        navigate(`/partner/step4/${partnerId}`);
      } else {
        navigate("/mypage", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert("수정 실패: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <FormBox>
        <FormGroup>
          <TextField
            label="이름"
            name="name"
            size="stepsize"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onFocus={() => handleFocusClear("name")}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="휴대폰 번호"
            size="stepsize"
            name="phone"
            value={formData.phone}
            readOnly
            onChange={formatPhoneInput}
          />
          <Subtext>
            * 전화번호 수정이 필요한경우 고객센터로 문의바랍니다
          </Subtext>
        </FormGroup>
        <FormGroup>
          <TextField
            label="거주지"
            size="stepsize"
            placeholder="클릭하여 주소검색"
            name="address"
            value={formData.address}
            readOnly
            onClick={() => setIsAddressModalOpen(true)}
          />

          {isAddressModalOpen && (
            <Modal
              open={isAddressModalOpen}
              onClose={() => setIsAddressModalOpen(false)}
              title="주소 검색"
              width={420}
              containerId="rightbox-modal-root"
            >
              <div style={{ width: "100%", height: "70vh" }}>
                <AddressModal
                  onSelect={handleAddressSelect}
                  onClose={() => setIsAddressModalOpen(false)}
                  serviceAreas={SERVICE_AREAS}
                />
              </div>
            </Modal>
          )}
          <div style={{ height: "5px" }}></div>
          <TextField
            size="stepsize"
            placeholder="상세주소입력"
            name="address_detail"
            value={formData.address_detail}
            onFocus={() => handleFocusClear("address_detail")}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="생년월일 8자리"
            size="stepsize"
            placeholder="예) 19991231"
            inputMode="numeric"
            maxLength={12}
            name="birth_date"
            value={formData.birth_date}
            onFocus={() => handleFocusClear("birth_date")}
            onChange={formatBirthInput}
          />
        </FormGroup>
        <FormGroup>
          <Label>고객유형</Label>

          <JobButtonBox>
            {["사업장(기업/매장)", "개인(가정)"].map((job) => (
              <JobButton
                key={job}
                $isSelected={formData.job === job}
                onClick={() => setFormData((prev) => ({ ...prev, job: job }))}
              >
                {job}
              </JobButton>
            ))}
          </JobButtonBox>
        </FormGroup>
        <FormGroup>
          <TextField
            label="이메일"
            name="email"
            size="stepsize"
            placeholder="이메일입력은 선택사항입니다"
            type="email"
            value={formData.email}
            onFocus={() => handleFocusClear("email")}
            onChange={handleChange}
          />
        </FormGroup>
      </FormBox>

      <Button
        fullWidth
        size="stepsize"
        onClick={handleSubmit}
        style={{ marginBottom: 28, marginTop: 30 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "수정 중..." : "수정완료"}
      </Button>

      <WidthdrawLink to="/mypage/withdraw">회원 탈퇴를 원해요</WidthdrawLink>
    </Container>
  );
};

export default Modify;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 4px 15px 24px 15px;
  }
`;

const FormBox = styled.div`
  border-radius: 8px;
  margin-bottom: 32px;
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
const Subtext = styled.p`
  margin-top: 5px;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;
const JobButtonBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const JobButton = styled.button`
  border-radius: 6px;
  padding: 16px 0;
  background: ${({ $isSelected }) => ($isSelected ? "#004FFF" : "white")};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#a0a0a0")};
  font-size: ${({ theme }) => theme.font.size.body};
  cursor: pointer;

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const WidthdrawLink = styled(Link)`
  display: flex;
  justify-content: center;
  color: #8d989f;
  font-size: 14px;
`;
