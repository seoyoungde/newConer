// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import styled from "styled-components";
// import DaumPostcode from "react-daum-postcode";

// export const SERVICE_AREAS = ["서울"];

// const AddressModal = ({
//   onSelect,
//   onClose,
//   serviceAreas = SERVICE_AREAS,
//   height = "70vh",
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [postcodeKey, setPostcodeKey] = useState(0);

//   const prevState = location.state || {};
//   const prevPath = prevState.prevPath || "/";

//   const handleAddressSelect = (data) => {
//     const selectedAddress = data.address;
//     const isServiceArea = serviceAreas.some((area) =>
//       selectedAddress.includes(area)
//     );

//     if (!isServiceArea) {
//       alert("서비스 제공 지역이 아닙니다. 다른 주소를 선택해주세요.");
//       setTimeout(() => setPostcodeKey((k) => k + 1), 0);
//       return;
//     }

//     if (onSelect) {
//       onSelect(selectedAddress);
//       onClose?.();
//     } else {
//       navigate(prevPath, {
//         state: { ...prevState, selectedAddress },
//         replace: true,
//       });
//     }
//   };

//   return (
//     <PostcodeWrapper>
//       <DaumPostcode
//         key={postcodeKey}
//         className="daum-postcode"
//         onComplete={handleAddressSelect}
//         style={{ width: "100%", height, maxWidth: "100vw" }}
//       />
//     </PostcodeWrapper>
//   );
// };

// export default AddressModal;

// const PostcodeWrapper = styled.div`
//   width: 100%;
//   max-width: 100%;
//   box-sizing: border-box;

//   .daum-postcode {
//     width: 100% !important;
//     max-width: 100% !important;
//     min-width: 0 !important;
//     box-sizing: border-box;
//   }

//   @media (max-width: 380px) {
//     .daum-postcode {
//       transform: scale(0.9);
//       transform-origin: top left;
//     }
//         @media (max-width: 360px) {
//     .daum-postcode {
//       transform: scale(0.8);
//       transform-origin: top left;
//     }
//   }
// `;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import DaumPostcode from "react-daum-postcode";

export const SERVICE_AREAS = ["서울"];

const AddressModal = ({
  onSelect,
  onClose,
  serviceAreas = SERVICE_AREAS,
  height = "70vh",
  partnerId = null, // 업체 ID
  partnerAreas = null, // 업체의 서비스 가능 지역 배열
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postcodeKey, setPostcodeKey] = useState(0);

  const prevState = location.state || {};
  const prevPath = prevState.prevPath || "/";

  const handleAddressSelect = (data) => {
    const selectedAddress = data.address;

    // 1차 검증: 서울인지 확인
    const isInServiceArea = serviceAreas.some((area) =>
      selectedAddress.includes(area)
    );

    if (!isInServiceArea) {
      alert("서비스 제공 지역이 아닙니다. 서울 지역만 선택 가능합니다.");
      setTimeout(() => setPostcodeKey((k) => k + 1), 0);
      return;
    }

    // 2차 검증: 업체별 서비스 가능 구 확인
    if (partnerAreas && partnerAreas.length > 0) {
      const isInPartnerArea = partnerAreas.some((area) =>
        selectedAddress.includes(area)
      );

      if (!isInPartnerArea) {
        alert(
          `선택하신 업체는 해당 지역에 서비스를 제공하지 않습니다.\n\n서비스 가능 지역: ${partnerAreas.join(
            ", "
          )}`
        );
        setTimeout(() => setPostcodeKey((k) => k + 1), 0);
        return;
      }
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
      {/* {partnerAreas && partnerAreas.length > 0 && (
        <ServiceAreaInfo>
          <InfoTitle>🏠 서비스 가능 지역</InfoTitle>
          <AreaList>
            {partnerAreas.map((area, index) => (
              <AreaChip key={index}>{area}</AreaChip>
            ))}
          </AreaList>
        </ServiceAreaInfo>
      )} */}
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
      transform: scale(0.9);
      transform-origin: top left;
    }
  }

  @media (max-width: 360px) {
    .daum-postcode {
      transform: scale(0.8);
      transform-origin: top left;
    }
  }
`;

const ServiceAreaInfo = styled.div`
  background: #f0f7ff;
  border: 1px solid #407bff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  @media (max-width: 380px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #407bff;
  margin-bottom: 12px;

  @media (max-width: 380px) {
    font-size: 13px;
    margin-bottom: 8px;
  }
`;

const AreaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 380px) {
    gap: 6px;
  }
`;

const AreaChip = styled.span`
  display: inline-block;
  padding: 6px 12px;
  background: white;
  border: 1px solid #407bff;
  border-radius: 16px;
  font-size: 13px;
  color: #407bff;
  font-weight: 500;

  @media (max-width: 380px) {
    padding: 4px 10px;
    font-size: 12px;
  }
`;
