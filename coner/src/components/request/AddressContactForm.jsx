import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useRequest } from "../../context/context";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useAuth } from "../../context/AuthProvider";
import TextField from "../ui/formControls/TextField";
import Button from "../ui/Button";
import Modal from "../common/Modal/Modal";

const AddressContactForm = ({ title, description, buttonText }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [popupMessage, setPopupMessage] = useState("");
  const { updateRequestData } = useRequest();
  const { currentUser, userInfo } = useAuth();

  const isLoggedIn = !!currentUser;
  const isReadOnly = isLoggedIn && !!userInfo;
  const [job, setJob] = useState(userInfo?.job || "");

  const [formData, setFormData] = useState({
    customer_address: "",
    customer_address_detail: "",
    customer_phone: "",
    clientName: "",
  });

  useEffect(() => {
    const restoredService =
      location.state?.selectedService || searchParams.get("service_type");
    if (restoredService) {
      updateRequestData("service_type", restoredService);
    }
  }, [location.state, searchParams]);

  useEffect(() => {
    if (location.state?.selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        customer_address: location.state.selectedAddress,
      }));
    }
  }, [location.state]);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        customer_address: userInfo.address || "",
        customer_address_detail: userInfo.address_detail || "",
        customer_phone: userInfo.phone || "",
        clientName: userInfo.name || "",
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isReadOnly) return;

    if (name === "customer_phone") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

      let formatted = onlyNumbers;
      if (onlyNumbers.length >= 4 && onlyNumbers.length < 8) {
        formatted = onlyNumbers.slice(0, 3) + "-" + onlyNumbers.slice(3);
      } else if (onlyNumbers.length >= 8) {
        formatted =
          onlyNumbers.slice(0, 3) +
          "-" +
          onlyNumbers.slice(3, 7) +
          "-" +
          onlyNumbers.slice(7);
      }

      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_address)
      return setPopupMessage("주소를 선택해주세요.");
    if (!formData.customer_address_detail)
      return setPopupMessage("상세주소를 입력해주세요.");
    if (!formData.customer_phone)
      return setPopupMessage("전화번호를 입력해주세요.");
    if (!formData.clientName) return setPopupMessage("성함을 입력해주세요.");

    const formattedPhone = formData.customer_phone.replace(/\D/g, "");

    updateRequestData("customer_address", formData.customer_address);
    +updateRequestData(
      "customer_address_detail",
      formData.customer_address_detail
    );
    updateRequestData("customer_phone", formattedPhone);
    updateRequestData("customer_type", job);
    updateRequestData("clientName", formData.clientName);

    const st = searchParams.get("service_type") || "";
    navigate(`/request/schedule?service_type=${encodeURIComponent(st)}`);
  };

  const goToAddressSearch = () => {
    if (!isReadOnly) {
      navigate("/request/addressmodal", {
        state: {
          prevPath: location.pathname,
          selectedService: searchParams.get("service_type"),
        },
      });
    }
  };

  const goToModifyInfo = () => {
    navigate("/request/modify", {
      state: {
        from: "addressform",
      },
    });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <TitleSection>
          <Title>
            {title || `${searchParams.get("service_type")} 서비스 신청`}
          </Title>
          <Description>{description}</Description>
        </TitleSection>

        <Field>
          <Label>주소</Label>
          <HelperTextBox>
            <HelperIcon>
              <HiOutlineExclamationCircle color=" #a5a5a5" size="18" />
            </HelperIcon>
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
            value={formData.customer_address}
            readOnly={isReadOnly}
            onChange={isReadOnly ? undefined : handleChange}
            onClick={!isReadOnly ? goToAddressSearch : undefined}
          />
          <div style={{ height: "6px" }}></div>
          <TextField
            type="text"
            name="customer_address_detail"
            size="md"
            placeholder="상세주소입력"
            value={formData.customer_address_detail}
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
            value={formData.customer_phone}
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
            value={formData.clientName}
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </Field>
        <Field>
          <Label>고객유형</Label>
          {isReadOnly ? (
            <TextField size="md" value={job} readOnly />
          ) : (
            <JobButtonBox>
              {["사업장(기업/매장)", "개인(가정)"].map((item) => (
                <JobButton
                  key={item}
                  $isSelected={job === item}
                  onClick={() => setJob(item)}
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
  padding: 0px 0px 15px 5px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.small};
  }
`;
const HelperTextBox = styled.div`
  display: flex;
  padding-left: 5px;
`;
const HelperIcon = styled(HiOutlineExclamationCircle)`
  font-size: 1.5rem;
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
    ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f9f9f9")};
  border-radius: 6px;
  padding: 10px 0;
  background: ${({ $isSelected }) => ($isSelected ? "#80BFFF" : "#f2f2f2")};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;

  &:hover {
    background: ${({ isSelected }) => (isSelected ? "#80BFFF" : "#80BFFF")};
  }
`;
export default AddressContactForm;
