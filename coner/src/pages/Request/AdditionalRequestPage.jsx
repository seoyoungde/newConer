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
import AgreementModal from "../../components/common/Modal/AgreementModal";
import SignupAgreementModal from "../../components/common/Modal/SignupAgreementModal";
import axios from "axios";
import { useFunnelStep } from "../../analytics/useFunnelStep";

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

  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isSignupAgreementOpen, setIsSignupAgreementOpen] = useState(false);
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    customer: false,
    privacy: false,
    privacy2: false,
    privacy3: false,
    privacy4: false,
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const handleSelectDropdown = useCallback((value) => {
    setSelectedDropdownOption(value);
  }, []);
  //페이지이탈률
  const { onComplete } = useFunnelStep({ step: 4 });

  const handlePreSubmit = () => {
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
    const user = auth.currentUser;
    if (user) {
      // 로그인 회원: 휴대폰 인증 없이 '동의만' 받는 모달
      setIsSignupAgreementOpen(true);
    } else {
      // 비회원: 기존 AgreementModal (동의 + 휴대폰 인증)
      setIsAgreementOpen(true);
    }
  };

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

      https: try {
        await axios.post("https://api.coner.kr/sms/notify", {
          service_date: requestData.service_date,
          service_time: requestData.service_time,
          brand: requestData.brand,
          aircon_type: requestData.aircon_type,
          service_type: requestData.service_type,
          customer_address: requestData.customer_address,
          customer_phone: requestData.customer_phone,
        });
        console.log("✅ 알림 전송 성공");
      } catch (err) {
        console.error("❌ 알림 전송 실패:", err.response?.data || err.message);
        console.log("❓ 실제 요청 보낸 데이터:", {
          service_date: requestData.service_date,
          service_time: requestData.service_time,
          brand: requestData.brand,
          aircon_type: requestData.aircon_type,
          service_type: requestData.service_type,
          customer_address: requestData.customer_address,
          customer_phone: requestData.customer_phone,
        });
      }
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
      </FormLayout>
      <Button
        type="button"
        size="lg"
        fullWidth="true"
        style={{ marginTop: 20, marginBottom: 24 }}
        onClick={handlePreSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "제출 중..." : "제출하기"}
      </Button>

      <AgreementModal
        open={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        agreements={agreements}
        setAgreements={setAgreements}
        isPhoneVerified={isPhoneVerified}
        setIsPhoneVerified={setIsPhoneVerified}
        onConfirm={() => {
          // updateRequestData("confirm", {
          //   ...(requestData.confirm || {}),
          //   consent: {
          //     age: agreements.age,
          //     customerTos: agreements.customer,
          //     privacy: agreements.privacy,
          //     at: new Date().toISOString(),

          //     tosVersion: "v1.0",
          //     privacyVersion: "v1.0",
          //   },
          //   phone: {
          //     verified: isPhoneVerified,
          //     method: "sms",
          //     at: isPhoneVerified ? new Date().toISOString() : "",
          //     phoneLast4: requestData.customer_phone?.slice(-4) || "",
          //   },
          // });
          handleSubmit();
          setIsAgreementOpen(false);
        }}
      />
      <SignupAgreementModal
        open={isSignupAgreementOpen}
        onClose={() => setIsSignupAgreementOpen(false)}
        onConfirm={({ agreements: agreedState }) => {
          handleSubmit();
          setIsSignupAgreementOpen(false);
        }}
        containerId="rightbox-modal-root"
        policyLinks={{
          customer:
            "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
          privacy:
            "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
          privacy2:
            "https://www.notion.so/harvies/2475c6005f128035b4d7e9f362c1f81c",
        }}
      />

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
