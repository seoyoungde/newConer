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

const AddressContactForm = ({ title, description }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [popupMessage, setPopupMessage] = useState("");
  const { requestData, updateRequestData, updateRequestDataMany } =
    useRequest();
  const { currentUser, userInfo } = useAuth();

  const isLoggedIn = !!currentUser;
  const isReadOnly = isLoggedIn && !!userInfo;
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  //페이지이탈률
  const { onAdvance } = useFunnelStep({ step: 1 });

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

  // 예전 페이지에서 state로 주소 넘어온 경우 (보조)
  useEffect(() => {
    if (location.state?.selectedAddress) {
      updateRequestData("customer_address", location.state.selectedAddress);
    }
  }, [location.state, updateRequestData]);

  // 유저 기본정보로 "비어있는 필드만" 1회 채우기
  useEffect(() => {
    if (!userInfo) return;
    const patch = {};
    if (!requestData.clientName) patch.clientName = userInfo.name || "";
    if (!requestData.customer_phone)
      patch.customer_phone = userInfo.phone || "";
    if (!requestData.customer_address)
      patch.customer_address = userInfo.address || "";
    if (!requestData.customer_address_detail)
      patch.customer_address_detail = userInfo.address_detail || "";
    if (!requestData.customer_type && userInfo.job)
      patch.customer_type = userInfo.job;
    if (Object.keys(patch).length) updateRequestDataMany(patch);
  }, [userInfo, requestData, updateRequestDataMany]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestData.customer_address)
      return setPopupMessage("주소를 선택해주세요.");
    if (!requestData.customer_address_detail)
      return setPopupMessage("상세주소를 입력해주세요.");
    if (!requestData.customer_phone)
      return setPopupMessage("전화번호를 입력해주세요.");
    if (!requestData.clientName) return setPopupMessage("성함을 입력해주세요.");

    const digitsPhone = requestData.customer_phone.replace(/\D/g, "");
    if (digitsPhone !== requestData.customer_phone) {
      updateRequestData("customer_phone", digitsPhone);
    }

    const st = searchParams.get("service_type") || "";
    //페이지이탈률
    onAdvance(2);
    navigate(`/request/schedule?service_type=${encodeURIComponent(st)}`);
  };

  const goToAddressSearch = () => {
    if (!isReadOnly) setIsAddressOpen(true);
  };

  const goToModifyInfo = () => {
    navigate("/request/modify", { state: { from: "addressform" } });
  };

  const selectCustomerType = (val) => {
    if (isReadOnly) return;
    updateRequestData("customer_type", val);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <TitleSection>
          <Title>
            {title || `${searchParams.get("service_type") || ""} 서비스 신청`}
          </Title>
          <Description>{description}</Description>
        </TitleSection>

        <Field>
          <Label>주소</Label>
          <HelperTextBox>
            <InfoIcon />
            <HelperText>
              현재 서비스 제공 지역은 서울 강북권 일부로 제한되어 있습니다.
              <br />
              강북구, 광진구, 노원구, 동대문구, 성북구, 도봉구, 은평구, 중랑구,
              종로구
            </HelperText>
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
            onClick={!isReadOnly ? goToAddressSearch : undefined}
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
          <TextField
            label="이름"
            size="md"
            placeholder="성함을 입력해주세요"
            type="text"
            name="clientName"
            value={requestData.clientName || ""}
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </Field>

        <Field>
          <Label>고객유형</Label>
          {isReadOnly ? (
            <TextField
              size="md"
              value={requestData.customer_type || ""}
              readOnly
            />
          ) : (
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
          )}
        </Field>

        <Button
          type="submit"
          fullWidth
          size="lg"
          style={{ marginTop: 20, marginBottom: 24 }}
        >
          의뢰 시작하기
        </Button>
      </Form>

      {/* 주소 검색 모달 */}
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
  padding: 0 0 15px 5px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.small};
  }
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

const ModifyLink = styled.a`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.subtext};
  padding: 10px;
  cursor: pointer;
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

export default AddressContactForm;
