import React, { useState } from "react";
import styled from "styled-components";
import DaumPostCode from "react-daum-postcode";
import { useLocation, useNavigate } from "react-router-dom";

export const SERVICE_AREAS = [];

const EntireAddressModal = ({
  onSelect,
  onClose,
  height = "70vh",
  serviceAreas = SERVICE_AREAS,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postcodeKey, setPostcodeKey] = useState(0);

  const prevState = location.state || {};
  const prevPath = prevState.prevPath || "/";

  const handleAddressSelect = (data) => {
    const selectedAddress = data.address;

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
      <DaumPostCode
        key={postcodeKey}
        className="daum-postcode"
        onComplete={handleAddressSelect}
        style={{ width: "100%", height, maxWidth: "100vw" }}
      />
    </PostcodeWrapper>
  );
};
export default EntireAddressModal;

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
      transform: scale(0.9);
      transform-origin: top left;
    }
    @media (max-width: 360px) {
      .daum-postcode {
        transform: scale(0.8);
        transform-origin: top left;
      }
    }
  }
`;
