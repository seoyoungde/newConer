import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import DaumPostcode from "react-daum-postcode";

export const SERVICE_AREAS = ["서울"];

const AddressModal = ({
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
        className="daum-postcode"
        onComplete={handleAddressSelect}
        style={{ width: "100%", height, maxWidth: "100vw" }}
      />
    </PostcodeWrapper>
  );
};

export default AddressModal;

const PostcodeWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  .daum-postcode {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
  }

  @media (max-width: 380px) {
    .daum-postcode {
      transform: scale(0.9); /* 전체 위젯 90%로 축소 */
      transform-origin: top left; /* 왼쪽 상단 기준으로 줄어듦 */
    }
        @media (max-width: 360px) {
    .daum-postcode {
      transform: scale(0.8); /* 전체 위젯 90%로 축소 */
      transform-origin: top left; /* 왼쪽 상단 기준으로 줄어듦 */
    }
  }
`;
