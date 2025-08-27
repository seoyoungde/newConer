import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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

// 추가요청 UI들
import AdditionalDropSelected from "../../components/request/AdditionalDropSelected";
import RequestDetails from "../../components/request/RequestDetails";

const imageMap = {
  청소: cleanInspection,
  설치: installMove,
  이전: installMove,
  수리: repair,
  점검: cleanInspection,
  철거: demolish,
  냉매충전: gas,
};

const PartnerStep2Page = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { requestData, updateRequestData, updateRequestDataMany } =
    useRequest();

  const [popupMessage, setPopupMessage] = useState("");
  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  // 추가요청 로컬 상태 (Step2에서만 입력받고 Context에 저장)
  const [additionalInfo, setAdditionalInfo] = useState(
    requestData.detailInfo || ""
  );
  const [selectedDropdownOption, setSelectedDropdownOption] = useState(
    requestData.selectedDropdownOption || ""
  );
  const [purchaseOption, setPurchaseOption] = useState(
    requestData.purchaseOption || ""
  );

  // 페이지이탈률: 2단계
  const { onAdvance } = useFunnelStep({ step: 2 });

  const needsAdditionalDropSelected = useMemo(
    () =>
      ["설치", "이전", "설치 및 구매"].includes(requestData.service_type || ""),
    [requestData.service_type]
  );
  const needsAdditionalDrop2Selected = useMemo(
    () => ["설치 및 구매"].includes(requestData.service_type || ""),
    [requestData.service_type]
  );
  const needsRepairAdditionalDropSelected = useMemo(
    () => ["수리"].includes(requestData.service_type || ""),
    [requestData.service_type]
  );

  const handleSelectDropdown = useCallback((value) => {
    // 단일/멀티 모두 수용: 배열이면 문자열로 합쳐 저장
    if (Array.isArray(value)) {
      setSelectedDropdownOption(value.join(", "));
    } else {
      setSelectedDropdownOption(value);
    }
  }, []);

  const makeDetailInfo = () => {
    const st = requestData.service_type;
    const add = (additionalInfo || "").trim();
    const sel = (selectedDropdownOption || "").trim();
    const buy = (purchaseOption || "").trim();

    if (["청소", "철거", "점검", "냉매충전"].includes(st)) {
      return add;
    }
    if (st === "설치") {
      return [sel, add].filter(Boolean).join("\n");
    }
    if (st === "설치 및 구매") {
      return [sel, buy, add].filter(Boolean).join("\n");
    }
    if (["이전", "수리"].includes(st)) {
      return [sel, add].filter(Boolean).join("\n");
    }
    return add; // fallback
  };

  const handleNext = () => {
    const { service_type, aircon_type, brand } = requestData;

    // 기본 3요소 필수
    if (!service_type || !aircon_type || !brand) {
      setPopupMessage("서비스/종류/브랜드를 모두 선택해주세요.");
      return;
    }

    // 추가요청 필수 검증
    if (
      ["설치", "이전", "수리", "설치 및 구매"].includes(service_type) &&
      !selectedDropdownOption
    ) {
      setPopupMessage("추가 요청사항(상단 선택)을 1개 이상 선택해주세요.");
      return;
    }

    if (!(additionalInfo || "").trim()) {
      setPopupMessage("요청사항 설명을 입력해주세요.");
      return;
    }

    // detailInfo 작성하여 Context에 저장
    const detailInfo = makeDetailInfo();
    updateRequestDataMany({
      detailInfo,
      selectedDropdownOption,
      purchaseOption,
    });

    // 페이지이탈률: 3단계로 진입
    onAdvance(3);
    navigate(`/partner/step3/${partnerId}`);
  };

  return (
    <Container>
      <NavHeader to={`/partner/step1/${partnerId}`} />
      <StepProgressBar currentStep={2} totalSteps={2} />

      <FormLayout
        title={"의뢰서 기본 정보"}
        subtitle="희망 서비스와 에어컨 종류를 선택하고, 추가 요청사항을 적어주세요."
        onNext={handleNext}
      >
        {/* 서비스 선택 */}
        <DropdownSelector
          title={requestData.service_type || "서비스 선택"}
          icon={<GrUserSettings />}
          options={[
            "설치",
            "설치 및 구매",
            "점검",
            "청소",
            "수리",
            "냉매충전",
            "이전",
            "철거",
          ]}
          selected={requestData.service_type}
          setSelected={(value) => updateRequestData("service_type", value)}
          isOpen={isServiceTypeOpen}
          setIsOpen={setIsServiceTypeOpen}
          optionWidths={["90px", "100px", "70px", "70px", "70px"]}
        />

        {/* 에어컨 종류 */}
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

        {/* 브랜드 */}
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

        {/* 추가요청 선택 */}
        {needsAdditionalDropSelected && (
          <AdditionalDropSelected
            options={["앵글 설치가 필요해요.", "앵글 설치는 필요 없어요."]}
            placeholderText="앵글 설치 여부 선택하기"
            boxPerRow={2}
            onSelect={handleSelectDropdown}
          />
        )}
        {needsAdditionalDrop2Selected && (
          <AdditionalDropSelected
            options={["중고에어컨설치를 원해요.", "신규에어컨설치를 원해요."]}
            placeholderText="구매할 에어컨 선택하기"
            boxPerRow={2}
            onSelect={(option) => setPurchaseOption(option)}
          />
        )}
        {needsRepairAdditionalDropSelected && (
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
            isMultiSelect={true}
            onSelect={handleSelectDropdown}
          />
        )}

        {/* 요청 상세 입력 */}
        <RequestDetails
          additionalInfo={additionalInfo}
          setAdditionalInfo={setAdditionalInfo}
        />
        {/* 가격 이미지 (선택 사항) */}
        {requestData.service_type && imageMap[requestData.service_type] && (
          <ImageBox>
            <img
              src={imageMap[requestData.service_type]}
              alt={`${requestData.service_type} 이미지`}
            />
          </ImageBox>
        )}
        <StyledLink to={`/partner/price/${partnerId}`}>
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

export default PartnerStep2Page;

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
