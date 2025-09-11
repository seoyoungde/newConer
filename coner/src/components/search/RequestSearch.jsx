import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useRequest } from "../../context/context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import TextField from "../ui/formControls/TextField";
import Button from "../ui/Button";

const RequestSearch = () => {
  const navigate = useNavigate();
  const { fetchRequestByClient } = useRequest();
  const [formData, setFormData] = useState({
    customer_phone: "",
    // clientName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customer_phone") {
      if (isNaN(value.replace(/-/g, ""))) return;

      let onlyNumbers = value.replace(/\D/g, "").slice(0, 11);
      if (onlyNumbers.length >= 4) {
        onlyNumbers = onlyNumbers.slice(0, 3) + "-" + onlyNumbers.slice(3);
      }
      if (onlyNumbers.length >= 9) {
        onlyNumbers = onlyNumbers.slice(0, 8) + "-" + onlyNumbers.slice(8);
      }
      setFormData((prev) => ({ ...prev, customer_phone: onlyNumbers }));
      return;
    }

    // if (name === "clientName") {
    //   setFormData((prev) => ({ ...prev, clientName: value }));
    //   return;
    // }
  };

  const handleSearch = async () => {
    if (loading) return;

    // const nameTrimmed = (formData.clientName || "").trim();
    const phoneDigits = (formData.customer_phone || "").replace(/\D/g, "");

    if (
      // !nameTrimmed ||
      !phoneDigits
    ) {
      setErrorMessage("전화번호를 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const requests = await fetchRequestByClient(phoneDigits);
      // const matched = (requests || []).filter(
      //   (r) => (r.clientName || "").trim() === nameTrimmed
      // );

      // if (matched.length > 0) {

      navigate("/search/inquiry", {
        state: {
          customer_phone: phoneDigits,
          // , clientName: nameTrimmed
        },
      });
      // } else {
      //   setErrorMessage("일치하는 의뢰서를 찾을 수 없습니다.");
      // }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/search/inquiry", {
          state: { customer_uid: currentUser.uid },
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <Container>
      <Title>
        <h1>의뢰서 조회</h1>
        <p>의뢰서에 작성했던 전화번호를 입력해주세요</p>
      </Title>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <InputWrapper>
          {/* <TextField
            label="이름"
            size="md"
            id="clientName"
            name="clientName"
            placeholder="이름"
            value={formData.clientName}
            onChange={handleChange}
          />
          <div style={{ marginBottom: "15px" }}></div> */}
          <TextField
            label="전화번호"
            size="md"
            id="customer_phone"
            name="customer_phone"
            placeholder="전화번호"
            value={formData.customer_phone}
            onChange={handleChange}
            maxLength={13}
            type="tel"
            inputMode="numeric"
          />
        </InputWrapper>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <Button type="submit" size="md" fullWidth disabled={loading}>
          {loading ? "조회 중..." : "의뢰서 조회하기"}
        </Button>
      </form>
    </Container>
  );
};

const Container = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  text-align: center;
  margin-top: 45px;
  margin-bottom: 25px;
`;

const InputWrapper = styled.div`
  margin-bottom: 35px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: 20px;
  text-align: center;
`;

export default RequestSearch;
