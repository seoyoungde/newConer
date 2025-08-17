// AddressModal.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import DaumPostcode from "react-daum-postcode";

export const SERVICE_AREAS = [
  "서울 강북구",
  "서울 광진구",
  "서울 노원구",
  "서울 도봉구",
  "서울 동대문구",
  "서울 성북구",
  "서울 종로구",
  "서울 중랑구",
];

const AuthAddressModal = ({
  onSelect,
  onClose,
  serviceAreas = SERVICE_AREAS,
  height = "70vh",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postcodeKey, setPostcodeKey] = useState(0);

  const prevState = location.state || {};
  const prevPath = prevState.prevPath || "/";

  const handleAddressSelect = (data) => {
    const selectedAddress = data.address;
    const isServiceArea = serviceAreas.some((area) =>
      selectedAddress.includes(area)
    );

    if (!isServiceArea) {
      alert("서비스 제공 지역이 아닙니다. 다른 주소를 선택해주세요.");
      setTimeout(() => setPostcodeKey((k) => k + 1), 0);
      return;
    }

    if (onSelect) {
      onSelect(selectedAddress);
      onClose?.();
    } else {
      navigate(prevPath, {
        state: { ...prevState, selectedAddress },
        replace: true,
      });
    }
  };

  return (
    <PostcodeWrapper>
      <DaumPostcode
        key={postcodeKey}
        onComplete={handleAddressSelect}
        style={{ width: "100%", height }}
      />
    </PostcodeWrapper>
  );
};

export default AuthAddressModal;

const PostcodeWrapper = styled.div`
  width: 100%;
`;
