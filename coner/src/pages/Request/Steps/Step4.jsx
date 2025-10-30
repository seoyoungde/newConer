import React, { useState, useEffect } from "react";
import styled from "styled-components";
import StepHeader from "../../../components/common/Header/StepHeader";
import TextField from "../../../components/ui/formControls/TextField";
import StepSegmentedToggle from "../../../components/ui/StepSegementedToggle";
import Button from "../../../components/ui/Button";
import AddressModal, {
  SERVICE_AREAS,
} from "../../../components/common/Modal/AddressModal";
import Modal from "../../../components/common/Modal/Modal";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";
import { useAuth } from "../../../context/AuthProvider";

const Step4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { requestData, updateRequestData, updateRequestDataMany } =
    useRequest();
  const { currentUser, userInfo } = useAuth();
  const isLoggedIn = !!currentUser;
  const isReadOnly = isLoggedIn && !!userInfo;

  // 퍼널: 4단계
  const { onAdvance } = useFunnelStep({ step: 4 });

  const [phone, setPhone] = useState(requestData.customer_phone || "");
  const [address, setAddress] = useState(requestData.customer_address || "");
  const [detailaddress, setDetailaddress] = useState(
    requestData.customer_address_detail || ""
  );
  const [customerType, setCustomerType] = useState(
    requestData.customer_type || ""
  );
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  // 로그인 사용자 정보 자동 입력
  useEffect(() => {
    if (!userInfo || !isReadOnly) return;

    const formattedPhone = formatPhoneNumber(userInfo.phone || "");
    setPhone(formattedPhone);
    setAddress(userInfo.address || "");
    setDetailaddress(userInfo.address_detail || "");
    setCustomerType(userInfo.job || "");

    updateRequestDataMany({
      customer_phone: formattedPhone,
      customer_address: userInfo.address || "",
      customer_address_detail: userInfo.address_detail || "",
      customer_type: userInfo.job || "",
    });
  }, [userInfo, isReadOnly]);

  useEffect(() => {
    const restoredService =
      location.state?.selectedService || searchParams.get("service_type");
    if (restoredService && !requestData.service_type) {
      updateRequestData("service_type", restoredService);
    }
  }, [
    location.state,
    searchParams,
    requestData.service_type,
    updateRequestData,
  ]);

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat");
  };

  const handleNext = () => {
    if (!phone || !address || !detailaddress || !customerType) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const phoneNumbers = phone.replace(/[^\d]/g, "");
    if (phoneNumbers.length !== 11) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    updateRequestDataMany({
      customer_phone: phoneNumbers,
      customer_address: address,
      customer_address_detail: detailaddress,
      customer_type: customerType,
    });

    onAdvance(5);
    navigate("/request/step5");
  };

  // 휴대폰 번호 포맷팅 (000-0000-0000)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handlePhoneChange = (e) => {
    if (isReadOnly) return;
    const value = e.target ? e.target.value : e;
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const phoneNumbers = formatted.replace(/[^\d]/g, "");
    updateRequestData("customer_phone", phoneNumbers);
  };

  const handleDetailAddressChange = (e) => {
    if (isReadOnly) return;
    const value = e.target ? e.target.value : e;
    setDetailaddress(value);
    updateRequestData("customer_address_detail", value);
  };

  const handleAddressClick = () => {
    if (!isReadOnly) {
      setIsAddressOpen(true);
    }
  };

  const handleAddressSelect = (addr) => {
    setAddress(addr);
    updateRequestData("customer_address", addr);
    setIsAddressOpen(false);
  };

  const handleCustomerTypeChange = (value) => {
    if (!isReadOnly) {
      setCustomerType(value);
      updateRequestData("customer_type", value);
    }
  };

  const phoneNumbers = phone.replace(/[^\d]/g, "");
  const isPhoneComplete = phoneNumbers.length === 11;
  const isAddressComplete =
    address.trim().length > 0 && detailaddress.trim().length > 0;
  const isCustomerTypeComplete = customerType.trim().length > 0;

  let currentStep = 4;
  let title = "휴대폰 번호를 입력해주세요.";

  if (isPhoneComplete && !isAddressComplete) {
    currentStep = 5;
    title = "주소를 입력해주세요.";
  } else if (isPhoneComplete && isAddressComplete && !isCustomerTypeComplete) {
    currentStep = 6;
    title = "개인이신가요? 사업이신가요?";
  } else if (isPhoneComplete && isAddressComplete && isCustomerTypeComplete) {
    currentStep = 7;
    title = "확인버튼을 눌러주세요";
  }

  return (
    <PageContainer>
      <StepHeader
        to="/request/step3"
        currentStep={currentStep}
        totalSteps={9}
      />
      <ContentSection>
        <PageTitle>{title}</PageTitle>

        {/* 로그인 사용자 정보 수정 링크 */}
        {isReadOnly && (
          <ModifyLink
            onClick={() =>
              navigate("/request/modify", { state: { from: "step4" } })
            }
          >
            내 정보 (주소 / 고객유형) 수정하러가기
          </ModifyLink>
        )}

        {/* 3단계: 의뢰인 유형 */}
        {currentStep >= 6 && (
          <FormGroup>
            <Label>의뢰인 유형</Label>
            <StepSegmentedToggle
              value={customerType}
              onChange={handleCustomerTypeChange}
              options={[
                { label: "사업장(기업/매장)", value: "사업장(기업/매장)" },
                { label: "개인(가정)", value: "개인(가정)" },
              ]}
              disabled={isReadOnly}
            />
          </FormGroup>
        )}

        {/* 2단계: 주소 */}
        {currentStep >= 5 && (
          <FormGroup>
            <ClickableTextField
              label="주소"
              size="stepsize"
              value={address}
              placeholder="주소를 입력해주세요"
              onClick={handleAddressClick}
              readOnly
            />
            <p style={{ marginBottom: "5px" }}></p>
            <TextField
              size="stepsize"
              value={detailaddress}
              onChange={handleDetailAddressChange}
              placeholder="상세주소를 입력해주세요"
              readOnly={isReadOnly}
            />
            {/* 서울 지역 제한 안내 */}
            <HelperText>서울 지역으로만 제한되어 있습니다.</HelperText>
          </FormGroup>
        )}

        {/* 1단계: 휴대폰 번호 (항상 표시) */}
        <FormGroup>
          <TextField
            label="휴대폰 번호"
            size="stepsize"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="000-0000-0000"
            maxLength={13}
            readOnly={isReadOnly}
          />
        </FormGroup>
      </ContentSection>

      {/* 하단 고정 버튼 - 조건부 렌더링 */}
      {currentStep === 7 && (
        <FixedButtonArea>
          <Button fullWidth size="stepsize" onClick={handleNext}>
            확인
          </Button>
          <CSButtonContainer>
            <CSButton onClick={handleHelpClick}>
              <CSButtonText>도움이 필요해요</CSButtonText>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
              >
                <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
              </svg>
            </CSButton>
          </CSButtonContainer>
        </FixedButtonArea>
      )}

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
              onSelect={handleAddressSelect}
              onClose={() => setIsAddressOpen(false)}
              serviceAreas={SERVICE_AREAS}
            />
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default Step4;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const ContentSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
  margin-bottom: 32px;
`;

const FixedButtonArea = styled.div`
  flex-shrink: 0;
  margin-bottom: 87px;
  padding: 16px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 15px;
    margin-bottom: 10px;
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const Label = styled.p`
  margin-bottom: 6px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.subtext};
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const ClickableTextField = styled(TextField)`
  cursor: pointer;
  input {
    cursor: pointer;
  }
`;

const HelperText = styled.p`
  color: ${({ theme }) => theme.colors.subtext};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  padding: 5px 0 0 0;
  margin: 0;
`;

const ModifyLink = styled.a`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.subtext};
  padding: 10px;
  cursor: pointer;
  display: block;
  margin-bottom: 20px;
`;

const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const CSButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;

const CSButtonText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;
