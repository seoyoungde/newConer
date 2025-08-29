import React, { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RequestDetails from "../../components/request/RequestDetails";
import styled from "styled-components";
import FormLayout from "../../components/request/FormLayout";
import { useRequest } from "../../context/context";
import AdditionalDropSelected from "../../components/request/AdditionalDropSelected";
import StepProgressBar from "../../components/request/StepProgressBar";
import { auth } from "../../lib/firebase";
import NavHeader from "../../components/common/Header/NavHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/common/Modal/Modal";
import { useFunnelStep } from "../../analytics/useFunnelStep";

const PartnerAdditionalRequestPage = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData, submitRequest, resetRequestData } =
    useRequest();
  const [popupMessage, setPopupMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [purchaseOption, setPurchaseOption] = useState("");
  const { partnerId } = useParams();
  const needsAdditionalDropSelected = ["설치", "이전", "설치 및 구매"].includes(
    requestData.service_type
  );
  const needsAdditionalDrop2Selected = ["설치 및 구매"].includes(
    requestData.service_type
  );
  const needsRepairAdditionalDropSelected = ["수리"].includes(
    requestData.service_type
  );
  const [selectedDropdownOption, setSelectedDropdownOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //페이지이탈률
  const { onComplete } = useFunnelStep({ step: 4 });
  const handleSelectDropdown = useCallback((value) => {
    setSelectedDropdownOption(value);
  }, []);

  const handleSubmit = async () => {
    if (!additionalInfo.trim()) {
      setPopupMessage("요청사항을 입력해주세요");
      return;
    }

    const { service_type } = requestData;
    if (["설치", "이전", "수리", "설치 및 구매"].includes(service_type)) {
      if (!selectedDropdownOption) {
        setPopupMessage("요청사항을 선택해주세요");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      let formattedDetailInfo = "";

      if (
        ["청소", "철거", "점검", "냉매충전"].includes(requestData.service_type)
      ) {
        formattedDetailInfo = additionalInfo.trim();
      } else if (requestData.service_type === "설치") {
        formattedDetailInfo =
          `${requestData.detailInfo}\n${selectedDropdownOption}\n${additionalInfo}`.trim();
      } else if (requestData.service_type === "설치 및 구매") {
        formattedDetailInfo =
          `${requestData.detailInfo}\n${selectedDropdownOption}\n${purchaseOption}\n${additionalInfo}`.trim();
      } else if (["이전", "수리"].includes(requestData.service_type)) {
        formattedDetailInfo =
          `${selectedDropdownOption}\n${additionalInfo}`.trim();
      }

      const user = auth.currentUser;
      const clientId = user?.uid || "";

      const n_keyword = sessionStorage.getItem("n_keyword") || "";
      const n_ad = sessionStorage.getItem("n_ad") || "";
      const n_rank = sessionStorage.getItem("n_rank") || "";

      const trackingInfo = [
        `n_keyword=${n_keyword}`,
        `n_ad=${n_ad}`,
        `n_rank=${n_rank}`,
      ];
      const updatedSprint = [
        ...(requestData.sprint || []),
        JSON.stringify(trackingInfo),
      ];

      updateRequestData("sprint", updatedSprint);

      updateRequestData("selectedDropdownOption", selectedDropdownOption);
      updateRequestData("detailInfo", formattedDetailInfo);
      if (clientId) {
        updateRequestData("customer_uid", clientId);
      }

      await new Promise((resolve) => {
        updateRequestData("detailInfo", formattedDetailInfo);
        setTimeout(resolve, 300);
      });

      const requestId = await submitRequest({
        ...requestData,
        detailInfo: formattedDetailInfo,
        customer_uid: clientId,
        sprint: updatedSprint,
      });

      resetRequestData();

      // try {
      //   const validPartnerId =
      //     partnerId && partnerId !== "undefined" && partnerId !== "null"
      //       ? partnerId
      //       : null;

      //   const hasPartnerInfo =
      //     !!validPartnerId ||
      //     !!requestData?.partner_uid ||
      //     !!requestData?.partner_name ||
      //     !!requestData?.partner_flow ||
      //     !!requestData?.selectedTechnician;

      //   if (hasPartnerInfo) {
      //     await axios.post("https://api.coner.kr/sms/notifyToSelectedCompany", {
      //       service_date: requestData.service_date,
      //       service_time: requestData.service_time,
      //       brand: requestData.brand,
      //       aircon_type: requestData.aircon_type,
      //       service_type: requestData.service_type,
      //       customer_address: requestData.customer_address,
      //       customer_phone: requestData.customer_phone,
      //       partner_id: validPartnerId || requestData?.partner_uid || "",
      //     });
      //   } else {
      //     await axios.post("https://api.coner.kr/sms/notify", {
      //       service_date: requestData.service_date,
      //       service_time: requestData.service_time,
      //       brand: requestData.brand,
      //       aircon_type: requestData.aircon_type,
      //       service_type: requestData.service_type,
      //       customer_address: requestData.customer_address,
      //       customer_phone: requestData.customer_phone,
      //     });
      //   }
      //   console.log("✅ 알림 전송 성공");
      // } catch (err) {
      //   console.error("❌ 알림 전송 실패:", err?.response?.data || err.message);
      //   console.log("❓ 실제 요청 보낸 데이터:", {
      //     service_date: requestData.service_date,
      //     service_time: requestData.service_time,
      //     brand: requestData.brand,
      //     aircon_type: requestData.aircon_type,
      //     service_type: requestData.service_type,
      //     customer_address: requestData.customer_address,
      //     customer_phone: requestData.customer_phone,
      //     partner_id:
      //       (partnerId &&
      //         partnerId !== "undefined" &&
      //         partnerId !== "null" &&
      //         partnerId) ||
      //       requestData?.partner_uid ||
      //       "",
      //   });
      // }
      onComplete();
      navigate("/search/inquiry", {
        state: { customer_phone: requestData.customer_phone, requestId },
      });
    } catch (error) {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <NavHeader to={`/partner/service-type/${partnerId}`} />
      <StepProgressBar currentStep={4} totalSteps={4} />
      <FormLayout
        title="추가 요청사항"
        subtitle="추가적으로 작성할 내용이 있나요?"
      >
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
            placeholderText="구매할에어컨 선택하기"
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
        <RequestDetails
          additionalInfo={additionalInfo}
          setAdditionalInfo={setAdditionalInfo}
        />
      </FormLayout>
      <Button
        type="button"
        size="lg"
        fullWidth="true"
        style={{ marginTop: 20, marginBottom: 24 }}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "제출 중..." : "제출하기"}
      </Button>

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

export default PartnerAdditionalRequestPage;

const Container = styled.div`
  width: 100%;
`;
