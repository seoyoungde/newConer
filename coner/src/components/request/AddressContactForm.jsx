import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useRequest } from "../../context/context";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useAuth } from "../../context/AuthProvider";
import TextField from "../ui/formControls/TextField";
import Button from "../ui/Button";
import Modal from "../common/Modal/Modal";
import AddressModal, { SERVICE_AREAS } from "../common/Modal/AddressModal";
import { useFunnelStep } from "../../analytics/useFunnelStep";
import AgreementForm from "./AgreementForm";

import axios from "axios";
import { auth } from "../../lib/firebase";

const AddressContactForm = ({ title, description }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [popupMessage, setPopupMessage] = useState("");

  const {
    requestData,
    updateRequestData,
    updateRequestDataMany,
    submitRequest,
    resetRequestData,
  } = useRequest();

  const { currentUser, userInfo } = useAuth();
  const isLoggedIn = !!currentUser;
  const isReadOnly = isLoggedIn && !!userInfo;
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const [agreementsOK, setAgreementsOK] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onComplete } = useFunnelStep({ step: 3 });

  useEffect(() => {
    const restoredService =
      location.state?.selectedService || searchParams.get("service_type");
    if (restoredService && requestData.service_type !== restoredService) {
      updateRequestData("service_type", restoredService);
    }
  }, [
    location.state,
    searchParams,
    requestData.service_type,
    updateRequestData,
  ]);

  useEffect(() => {
    if (location.state?.selectedAddress) {
      updateRequestData("customer_address", location.state.selectedAddress);
    }
  }, [location.state, updateRequestData]);

  useEffect(() => {
    if (!userInfo || !isReadOnly) return;
    updateRequestDataMany({
      clientName: userInfo.name || "",
      customer_phone: formatPhone(userInfo.phone || ""),
      customer_address: userInfo.address || "",
      customer_address_detail: userInfo.address_detail || "",
      customer_type: userInfo.job || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, isReadOnly]);

  const formatPhone = (raw) => {
    const only = raw.replace(/\D/g, "").slice(0, 11);
    if (only.length < 4) return only;
    if (only.length < 8) return `${only.slice(0, 3)}-${only.slice(3)}`;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    if (name === "customer_phone") {
      updateRequestData("customer_phone", formatPhone(value));
    } else {
      updateRequestData(name, value);
    }
  };

  const goToAddressSearch = () => {
    if (!isReadOnly) setIsAddressOpen(true);
  };

  const selectCustomerType = (val) => {
    if (!isReadOnly) updateRequestData("customer_type", val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreementsOK)
      return setPopupMessage("약관(필수)에 모두 동의해주세요.");
    if (!requestData.customer_address)
      return setPopupMessage("주소를 선택해주세요.");
    if (!requestData.customer_address_detail)
      return setPopupMessage("상세주소를 입력해주세요.");
    if (!requestData.customer_phone)
      return setPopupMessage("전화번호를 입력해주세요.");

    const requiredBefore = [
      ["service_date", "서비스 날짜를 선택해주세요."],
      ["service_time", "방문 시간을 선택해주세요."],
      ["service_type", "서비스를 선택해주세요."],
      ["aircon_type", "에어컨 종류를 선택해주세요."],
      ["brand", "브랜드를 선택해주세요."],
    ];
    for (const [key, msg] of requiredBefore) {
      if (!requestData[key]) return setPopupMessage(msg);
    }

    const digitsPhone = requestData.customer_phone.replace(/\D/g, "");
    if (digitsPhone !== requestData.customer_phone) {
      updateRequestData("customer_phone", digitsPhone);
    }

    try {
      setIsSubmitting(true);

      const user = auth.currentUser;
      const clientId = user?.uid || "";

      const n_keyword = sessionStorage.getItem("n_keyword") || "";
      const n_ad = sessionStorage.getItem("n_ad") || "";
      const n_rank = sessionStorage.getItem("n_rank") || "";
      const trackingInfo = [
        `n_keyword=${n_keyword}`,
        `n_ad=${n_ad}`,
        `n_rank=${n_rank}`,
      ];
      const updatedSprint = [
        ...(requestData.sprint || []),
        JSON.stringify(trackingInfo),
      ];

      const payload = {
        ...requestData,
        customer_uid: clientId,
        sprint: updatedSprint,
        customer_phone: digitsPhone,
      };

      const requestId = await submitRequest(payload);

      try {
        await axios.post("https://api.coner.kr/sms/notify", {
          service_date: requestData.service_date,
          service_time: requestData.service_time,
          brand: requestData.brand,
          aircon_type: requestData.aircon_type,
          service_type: requestData.service_type,
          customer_address: requestData.customer_address,
          customer_phone: digitsPhone,
        });
      } catch (err) {
        console.error("❌ 알림 전송 실패:", err.response?.data || err.message);
      }

      onComplete();
      resetRequestData();

      navigate("/search/inquiry", {
        state: { customer_phone: digitsPhone, requestId },
      });
    } catch (error) {
      console.error(error);
      setPopupMessage("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToModifyInfo = () => {
    navigate("/request/modify", {
      state: { from: "addressform" },
    });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {title || description ? (
          <TitleSection>
            <Title>
              {title || `${searchParams.get("service_type") || ""} 서비스 신청`}
            </Title>
            <Description>{description}</Description>
          </TitleSection>
        ) : null}

        <Field>
          <Label>주소</Label>
          <HelperTextBox>
            <InfoIcon />
            <HelperText>서울 지역으로만 제한되어 있습니다.</HelperText>
          </HelperTextBox>

          {isReadOnly && (
            <ModifyLink onClick={goToModifyInfo}>
              내 정보 (주소 / 고객유형) 수정하러가기
            </ModifyLink>
          )}

          <TextField
            type="text"
            name="customer_address"
            size="md"
            placeholder="클릭하여 주소 검색"
            value={requestData.customer_address || ""}
            readOnly
            onClick={goToAddressSearch}
          />
          <div style={{ height: "6px" }} />
          <TextField
            type="text"
            name="customer_address_detail"
            size="md"
            placeholder="상세주소입력"
            value={requestData.customer_address_detail || ""}
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </Field>

        <Field>
          <TextField
            label="연락처"
            size="md"
            placeholder="전화번호"
            inputMode="numeric"
            name="customer_phone"
            value={requestData.customer_phone || ""}
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </Field>

        <Field>
          <Label>고객유형</Label>
          <JobButtonBox>
            {["사업장(기업/매장)", "개인(가정)"].map((item) => (
              <JobButton
                key={item}
                $isSelected={requestData.customer_type === item}
                onClick={() => selectCustomerType(item)}
                type="button"
              >
                {item}
              </JobButton>
            ))}
          </JobButtonBox>

          <AgreementForm onRequiredChange={setAgreementsOK} />
        </Field>

        <Button
          type="submit"
          fullWidth
          size="lg"
          style={{ marginTop: 20, marginBottom: 24 }}
          disabled={!agreementsOK || isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </Button>
      </Form>

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
              onSelect={(addr) => {
                updateRequestData("customer_address", addr);
                setIsAddressOpen(false);
              }}
              onClose={() => setIsAddressOpen(false)}
              serviceAreas={SERVICE_AREAS}
            />
          </div>
        </Modal>
      )}

      <Modal
        open={!!popupMessage}
        onClose={() => setPopupMessage("")}
        width={320}
        containerId="rightbox-modal-root"
      >
        {popupMessage}
      </Modal>
    </Container>
  );
};

export default AddressContactForm;

/* styled */
const Container = styled.div``;

const TitleSection = styled.div`
  margin-bottom: 35px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 3px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const Description = styled.p`
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const Form = styled.form`
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding-bottom: 30px;
  }
`;

const Field = styled.div`
  margin-bottom: 45px;
`;

const Label = styled.label`
  margin-bottom: 10px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const HelperText = styled.p`
  color: ${({ theme }) => theme.colors.subtext};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  padding: 0 0 5px 0px;
`;

const HelperTextBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-left: 5px;
`;

const InfoIcon = styled(HiOutlineExclamationCircle)`
  color: #a5a5a5;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const JobButtonBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const JobButton = styled.button`
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f0f0f0")};
  border-radius: 6px;
  padding: 10px 0;
  background: ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f2f2f2")};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;

  &:hover {
    background: #80bfff;
  }
`;
const ModifyLink = styled.a`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.subtext};
  padding: 10px;
  cursor: pointer;
`;
