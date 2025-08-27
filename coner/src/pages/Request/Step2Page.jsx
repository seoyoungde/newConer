import React, { useState, useEffect, useCallback } from "react";
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
import repairImg from "../../assets/price/repair_price.png";
import demolish from "../../assets/price/demolish_price.png";
import gas from "../../assets/price/gas_price.png";
import NavHeader from "../../components/common/Header/NavHeader";
import Modal from "../../components/common/Modal/Modal";
import { useFunnelStep } from "../../analytics/useFunnelStep";

import AdditionalDropSelected from "../../components/request/AdditionalDropSelected";
import RequestDetails from "../../components/request/RequestDetails";

const imageMap = {
  청소: cleanInspection,
  설치: installMove,
  이전: installMove,
  수리: repairImg,
  점검: cleanInspection,
  철거: demolish,
  냉매충전: gas,
};

const Step2Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestData, updateRequestData } = useRequest();
  const [popupMessage, setPopupMessage] = useState("");
  const [searchParams] = useSearchParams();

  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  const [selectedDropdownOption, setSelectedDropdownOption] = useState(
    requestData?.selectedDropdownOption ?? ""
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    requestData?.additionalInfo ?? ""
  );

  // 퍼널: 2단계
  const { onAdvance } = useFunnelStep({ step: 2 });

  useEffect(() => {
    const restoredService =
      location.state?.selectedService || searchParams.get("service_type");
    if (restoredService && !requestData.service_type) {
      updateRequestData("service_type", restoredService);
    }
  }, [location.state, searchParams]); // eslint-disable-line

  const needsInstallMove = ["설치", "이전", "설치 및 구매"].includes(
    requestData.service_type
  );
  const needsRepair = requestData.service_type === "수리";

  // 선택값 변경 (로컬 상태만 변경 — 저장은 '다음'에서 한 번만)
  const handleSelectDropdown = useCallback((value) => {
    setSelectedDropdownOption(value);
  }, []);

  // detailInfo를 항상 "현재 입력값"으로만 조합 (이전 저장본 절대 재사용 X)
  const buildDetailInfo = () => {
    const normalizePick = (v) =>
      Array.isArray(v) ? Array.from(new Set(v)).join(", ") : v || "";

    const pick = normalizePick(selectedDropdownOption);
    const memo = (additionalInfo || "").trim();

    const svc = requestData.service_type;

    if (["청소", "철거", "점검", "냉매충전"].includes(svc)) {
      return memo;
    }
    if (svc === "설치" || svc === "설치 및 구매") {
      // 예: [옵션] + 메모
      return [pick, memo].filter(Boolean).join("\n");
    }
    if (svc === "이전" || svc === "수리") {
      // 예: [이상사항] + 메모
      return [pick, memo].filter(Boolean).join("\n");
    }
    return memo;
  };

  const handleNext = () => {
    const { service_type, aircon_type, brand } = requestData;
    if (!service_type || !aircon_type || !brand) {
      setPopupMessage("서비스·종류·브랜드를 모두 선택해주세요.");
      return;
    }

    // 추가 항목 검증
    if (needsInstallMove || needsRepair) {
      const sel = selectedDropdownOption;
      const emptyMulti = Array.isArray(sel) && sel.length === 0;
      const emptySingle = !Array.isArray(sel) && !sel;
      if (emptyMulti || emptySingle) {
        setPopupMessage("추가 선택 항목을 선택해주세요.");
        return;
      }
    }

    if (!additionalInfo.trim()) {
      setPopupMessage("추가 요청사항을 입력해주세요.");
      return;
    }

    // 저장은 항상 '덮어쓰기' (append 금지) + 다중선택은 중복 제거
    const normalizedSelected = Array.isArray(selectedDropdownOption)
      ? Array.from(new Set(selectedDropdownOption))
      : selectedDropdownOption || "";

    updateRequestData("selectedDropdownOption", normalizedSelected);
    updateRequestData("additionalInfo", additionalInfo.trim());
    updateRequestData("detailInfo", buildDetailInfo());

    onAdvance(3);
    navigate("/request/step3");
  };

  const priceKey = `${requestData.service_type}-${requestData.aircon_type}-${requestData.brand}`;

  return (
    <Container>
      <NavHeader to="/request/step1" />

      <StepProgressBar currentStep={2} totalSteps={2} />

      <FormLayout
        title={`"의뢰서 기본 정보" - ${
          requestData.service_type || "서비스 미선택"
        }`}
        subtitle="희망 서비스와 에어컨 정보를 선택하고 추가 요청을 입력해주세요."
        onNext={handleNext}
      >
        <DropdownSelector
          title={requestData.service_type || "서비스 선택"}
          icon={<GrUserSettings />}
          options={["청소", "설치", "이전", "수리", "철거", "냉매충전", "점검"]}
          selected={requestData.service_type}
          setSelected={(v) => updateRequestData("service_type", v)}
          isOpen={false}
          setIsOpen={() => {}}
          optionWidths={["70px", "70px", "70px", "70px", "70px"]}
          disabled
        />

        {/* 에어컨 종류 */}
        <DropdownSelector
          title="에어컨 종류 선택하기"
          icon={<GrApps />}
          options={["벽걸이형", "스탠드형", "천장형", "창문형", "항온항습기"]}
          selected={requestData.aircon_type}
          setSelected={(v) => updateRequestData("aircon_type", v)}
          isOpen={isTypeOpen}
          setIsOpen={setIsTypeOpen}
          optionWidths={["90px", "90px", "90px", "90px", "110px"]}
        />

        {/* 브랜드 선택 */}
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
          setSelected={(v) => updateRequestData("brand", v)}
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

        {/* 추가선택 & 추가요청 — 브랜드 다음, 가격표 이전 */}
        {needsInstallMove && (
          <AdditionalDropSelected
            options={["앵글 설치가 필요해요.", "앵글 설치는 필요 없어요."]}
            placeholderText="앵글 설치 여부 선택하기"
            boxPerRow={2}
            onSelect={handleSelectDropdown}
            defaultValue={
              typeof requestData.selectedDropdownOption === "string"
                ? requestData.selectedDropdownOption
                : Array.isArray(requestData.selectedDropdownOption)
                ? ""
                : selectedDropdownOption || ""
            }
          />
        )}
        {needsRepair && (
          <AdditionalDropSelected
            options={[
              "에어컨이 작동하지 않아요.",
              "에어컨에서 이상한 소리가 나요.",
              "에어컨 전원이 켜지지 않아요.",
              "에어컨에서 이상한 냄새가 나요.",
              "에어컨에서 물이 흘러나와요.",
              "에어컨이 부분적으로만 작동돼요.",
              "에어컨이 자동으로 꺼지거나 켜져요.",
              "에어컨 온도 조절이 잘 안돼요.",
              "기타",
            ]}
            placeholderText="에어컨 이상사항을 선택해주세요"
            boxPerRow={2}
            isMultiSelect
            onSelect={handleSelectDropdown}
            defaultValue={
              Array.isArray(requestData.selectedDropdownOption)
                ? Array.from(new Set(requestData.selectedDropdownOption))
                : Array.isArray(selectedDropdownOption)
                ? selectedDropdownOption
                : []
            }
          />
        )}

        <RequestDetails
          additionalInfo={additionalInfo}
          setAdditionalInfo={setAdditionalInfo} // 로컬만 변경; 저장은 onNext에서 한 번
        />

        {/* 가격표 이미지 */}
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

export default Step2Page;

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
