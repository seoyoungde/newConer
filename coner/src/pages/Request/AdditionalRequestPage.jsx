import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const AdditionalRequestPage = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData, submitRequest, resetRequestData } =
    useRequest();
  const [popupMessage, setPopupMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const needsAdditionalDropSelected = ["설치", "이전", "설치 및 구매"].includes(
    requestData.service_type
  );
  const needsRepairAdditionalDropSelected = ["수리"].includes(
    requestData.service_type
  );
  const [selectedDropdownOption, setSelectedDropdownOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectDropdown = useCallback((value) => {
    setSelectedDropdownOption(value);
  }, []);

  const handleSubmit = async () => {
    if (!additionalInfo.trim()) {
      setPopupMessage("요청사항을 입력해주세요");
      return;
    }

    const { service_type } = requestData;
    if (["설치", "이전", "수리", "설치&에어컨구매"].includes(service_type)) {
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
      } else if (
        requestData.service_type === "설치" ||
        requestData.service_type === "설치 및 구매"
      ) {
        //
        formattedDetailInfo =
          `${requestData.detailInfo}\n${selectedDropdownOption}\n${additionalInfo}`.trim();
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

      // https: try {
      //   await axios.post("https://api.coner.kr/sms/notify", {
      //     service_date: requestData.service_date,
      //     service_time: requestData.service_time,
      //     brand: requestData.brand,
      //     aircon_type: requestData.aircon_type,
      //     service_type: requestData.service_type,
      //     customer_address: requestData.customer_address,
      //     customer_phone: requestData.customer_phone,
      //   });
      //   console.log("✅ 알림 전송 성공");
      // } catch (err) {
      //   console.error("❌ 알림 전송 실패:", err.response?.data || err.message);
      //   console.log("❓ 실제 요청 보낸 데이터:", {
      //     service_date: requestData.service_date,
      //     service_time: requestData.service_time,
      //     brand: requestData.brand,
      //     aircon_type: requestData.aircon_type,
      //     service_type: requestData.service_type,
      //     customer_address: requestData.customer_address,
      //     customer_phone: requestData.customer_phone,
      //   });
      // }

      navigate("/search/inquiry", {
        state: { customer_phone: requestData.customer_phone, requestId }, // 🔁 InquiryPage에 맞춤
      });
    } catch (error) {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <NavHeader to="/request/service-type" />
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

        <ServiceCostContainer>
          <CostTitle>서비스 기본 비용</CostTitle>
          <CostDescription>
            견적을 위해 기사님이 방문한 후, 서비스를 취소하시면 아래 비용이
            발생할 수 있어요.
          </CostDescription>
          <CostTable>
            <CostRow>
              <CostLabel>출장비</CostLabel>
              <CostValue>
                2만원 ~ 5만원
                <SmallText>(근무 외 시간 : 1.5배, 주말 : 2배)</SmallText>
              </CostValue>
            </CostRow>
            <CostRow>
              <CostLabel>제품 분해·조립비</CostLabel>
              <CostValue>7만원</CostValue>
            </CostRow>
          </CostTable>
        </ServiceCostContainer>
        <Button
          type="submint"
          size="lg"
          style={{ marginTop: 20, marginBottom: 24 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </Button>
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

export default AdditionalRequestPage;

const Container = styled.div`
  width: 100%;
`;

const ServiceCostContainer = styled.div`
  border-radius: 10px;
`;

const CostTitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 5px;
  text-align: left;
`;

const CostDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: 10px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-align: left;
`;

const CostTable = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
`;

const CostLabel = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const CostValue = styled.p`
  font-weight: ${({ theme }) => theme.font.weight.bold};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  text-align: right;
`;

const SmallText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  display: block;
  margin-top: 3px;
`;
