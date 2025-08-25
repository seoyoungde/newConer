import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import FormLayout from "../../components/request/FormLayout";
import DropdownSelector from "../../components/request/DropdownSelector";
import styled from "styled-components";
import { GrApps, GrUserSettings, GrBookmark } from "react-icons/gr";
import { useRequest } from "../../context/context";
import StepProgressBar from "../../components/request/StepProgressBar";
import cleanInspection from "../../assets/price/clean_inspection_price.png";
import installMove from "../../assets/price/install_move_price.png";
import repair from "../../assets/price/repair_price.png";
import demolish from "../../assets/price/demolish_price.png";
import gas from "../../assets/price/gas_price.png";
import NavHeader from "../../components/common/Header/NavHeader";
import Modal from "../../components/common/Modal/Modal";
import { useFunnelStep } from "../../analytics/useFunnelStep";

const imageMap = {
  청소: cleanInspection,
  설치: installMove,
  이전: installMove,
  수리: repair,
  점검: cleanInspection,
  철거: demolish,
  냉매충전: gas,
};

const ServiceTypeSelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestData, updateRequestData } = useRequest();
  const [popupMessage, setPopupMessage] = useState("");
  const [searchParams] = useSearchParams();
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  //페이지이탈률
  const { onAdvance } = useFunnelStep({ step: 3 });

  useEffect(() => {
    const restoredService =
      location.state?.selectedService || searchParams.get("service_type");

    if (restoredService && !requestData.service_type) {
      updateRequestData("service_type", restoredService);
    }
  }, [location.state, searchParams]);

  const handleNext = () => {
    const { service_type, aircon_type, brand } = requestData;
    if (!service_type || !aircon_type || !brand) {
      setPopupMessage("모든정보를 선택해주세요");
      return;
    }
    //페이지이탈률
    onAdvance(4);
    navigate("/request/additional", {
      state: { service_type, aircon_type, brand },
    });
  };

  const priceKey = `${requestData.service_type}-${requestData.aircon_type}-${requestData.brand}`;

  return (
    <Container>
      <NavHeader to="/request/schedule" />
      <StepProgressBar currentStep={3} totalSteps={4} />
      <FormLayout
        title={`"의뢰서 기본 정보"- ${
          requestData.service_type || "서비스 미선택"
        }`}
        subtitle="희망 서비스와 에어컨 종류를 선택해주세요."
        onNext={handleNext}
      >
        <DropdownSelector
          title={requestData.service_type || "서비스 선택"}
          icon={<GrUserSettings />}
          options={["청소", "설치", "이전", "수리", "철거", "냉매충전", "점검"]}
          selected={requestData.service_type}
          setSelected={(value) => updateRequestData("service_type", value)}
          isOpen={false}
          setIsOpen={() => {}}
          optionWidths={["70px", "70px", "70px", "70px", "70px"]}
          disabled
        />

        <DropdownSelector
          title="에어컨 종류 선택하기"
          icon={<GrApps />}
          options={["벽걸이형", "스탠드형", "천장형", "창문형", "항온항습기"]}
          selected={requestData.aircon_type}
          setSelected={(value) => updateRequestData("aircon_type", value)}
          isOpen={isTypeOpen}
          setIsOpen={setIsTypeOpen}
          optionWidths={["90px", "90px", "90px", "90px", "110px"]}
        />

        <DropdownSelector
          title="브랜드 선택하기"
          icon={<GrBookmark />}
          options={[
            "삼성전자",
            "LG전자",
            "캐리어",
            "센추리",
            "귀뚜라미",
            "SK매직",
            "기타(추천 또는 모름)",
          ]}
          selected={requestData.brand}
          setSelected={(value) => updateRequestData("brand", value)}
          isOpen={isBrandOpen}
          setIsOpen={setIsBrandOpen}
          optionWidths={[
            "100px",
            "90px",
            "90px",
            "90px",
            "100px",
            "100px",
            "150px",
          ]}
        />

        {requestData.service_type && imageMap[requestData.service_type] && (
          <ImageBox>
            <img
              src={imageMap[requestData.service_type]}
              alt={`${requestData.service_type} 이미지`}
            />
          </ImageBox>
        )}

        <StyledLink to="/request/price" state={{ from: "request-basic-info" }}>
          서비스비용이 궁금하신가요?
        </StyledLink>
      </FormLayout>
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

export default ServiceTypeSelectPage;

const Container = styled.section`
  width: 100%;
`;
const ImageBox = styled.div`
  margin-top: 10px;

  img {
    width: 100%;
    height: auto;
  }
`;
const StyledLink = styled(Link)`
  color: #a0a0a0;
  font-size: 14px;
  padding: 30px;
`;
