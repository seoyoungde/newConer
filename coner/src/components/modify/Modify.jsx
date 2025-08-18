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
import ModifyAddressModal from "../../components/common/Modal/ModifyAddressModal";
import TextField from "../ui/formControls/TextField";
import Button from "../ui/Button";
const Modify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { partnerId } = useParams();
  const { setUserInfo, userInfo } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        phone: location.state?.phone || userInfo.phone || "",
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
      if (location.state?.from === "addressform") {
        navigate("/request/address-contact", { replace: true });
      } else if (location.state?.from === "partnermodify") {
        navigate(`/partner/address-contact/${partnerId}`);
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
            label="이메일"
            name="이메일"
            size="sm"
            placeholder="이메일입력은 선택사항입니다"
            type="email"
            value={formData.email}
            onFocus={() => handleFocusClear("email")}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="이름"
            name="이름"
            size="sm"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onFocus={() => handleFocusClear("name")}
            onChange={handleChange}
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
            label="생년월일 8자리"
            size="sm"
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
          <TextField
            label="거주지"
            size="sm"
            placeholder="클릭하여 주소검색"
            name="address"
            value={formData.address}
            readOnly
            onClick={() => setIsAddressModalOpen(true)}
          />

          {isAddressModalOpen && (
            <ModifyAddressModal
              onClose={() => setIsAddressModalOpen(false)}
              onSelect={handleAddressSelect}
            />
          )}
          <div style={{ height: "5px" }}></div>
          <TextField
            size="sm"
            placeholder="상세주소입력"
            name="address_detail"
            value={formData.address_detail}
            onFocus={() => handleFocusClear("address_detail")}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="전화번호는 수정이 불가능합니다"
            size="sm"
            name="phone"
            value={formData.phone}
            readOnly
            onChange={formatPhoneInput}
          />
        </FormGroup>
        <WidthdrawLink to="/mypage/withdraw">회원탈퇴하기</WidthdrawLink>
      </FormBox>

      <Button
        fullWidth
        size="md"
        onClick={handleSubmit}
        style={{ marginTop: 20, marginBottom: 24 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "수정 중..." : "수정완료"}
      </Button>
    </Container>
  );
};

export default Modify;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const FormBox = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.p`
  margin-bottom: 6px;
`;

const JobButtonBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const JobButton = styled.button`
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f9f9f9")};
  border-radius: 6px;
  padding: 10px 0;
  background: ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f2f2f2")};
  color: black;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;

  &:hover {
    background: ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#80BFFF")};
  }
`;

const WidthdrawLink = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;
`;
