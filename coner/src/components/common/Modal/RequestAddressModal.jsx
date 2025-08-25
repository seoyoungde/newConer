import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import DaumPostcode from "react-daum-postcode";

const SERVICE_AREAS = ["서울"];

const RequestAddressModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postcodeKey, setPostcodeKey] = useState(0);

  const handleAddressSelect = (data) => {
    const selectedAddress = data.address;
    const isServiceArea = SERVICE_AREAS.some((area) =>
      selectedAddress.includes(area)
    );
    if (!isServiceArea) {
      setTimeout(() => {
        setPostcodeKey((prev) => prev + 1);
      }, 0);
    } else {
      const prevPath = location.state?.prevPath || "/";
      navigate(prevPath, { state: { selectedAddress } });
    }
  };

  return (
    <PostcodeWrapper>
      <DaumPostcode
        key={postcodeKey}
        onComplete={handleAddressSelect}
        style={{
          width: "100%",
          height: "700px",
          transformOrigin: "top center",
        }}
      />
    </PostcodeWrapper>
  );
};

const PostcodeWrapper = styled.div`
  width: 100%;
`;

export default RequestAddressModal;
