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
  };

  const handleSearch = async () => {
    if (loading) return;

    const phoneDigits = (formData.customer_phone || "").replace(/\D/g, "");

    if (!phoneDigits) {
      setErrorMessage("전화번호를 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const requests = await fetchRequestByClient(phoneDigits);

      if (!requests || requests.length === 0) {
        setErrorMessage("조회된 의뢰서가 없습니다.");
        return;
      }

      const validRequests = requests.filter((request) => request.status !== 0);

      if (validRequests.length === 0) {
        setErrorMessage("조회된 의뢰서가 없습니다.");
        return;
      }

      navigate("/search/inquiry", {
        state: {
          customer_phone: phoneDigits,
        },
      });
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
      <Title>의뢰 시 작성했던 전화번호를 입력해주세요.</Title>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <InputWrapper>
          <TextField
            label="전화번호"
            size="stepsize"
            id="customer_phone"
            name="customer_phone"
            placeholder="전화번호를 입력해주세요."
            value={formData.customer_phone}
            onChange={handleChange}
            maxLength={13}
            type="tel"
            inputMode="numeric"
          />
        </InputWrapper>
        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
        <Button type="submit" size="stepsize" fullWidth disabled={loading}>
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
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 21px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 17px;
  }
`;

const InputWrapper = styled.div`
  margin-bottom: 64px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: 20px;
  text-align: center;
`;

export default RequestSearch;
