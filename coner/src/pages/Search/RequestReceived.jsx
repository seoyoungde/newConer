import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useRequest } from "../../context/context";
import CalendarPicker from "../../components/request/CalendarPicker";
import TimeSlotPicker from "../../components/request/TimeSlotPicker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import DropdownSelector from "./DropdownSelector";
import AdditionalDropSelected from "../../components/request/AdditionalDropSelected";
import RequestDetails from "../../components/request/RequestDetails";
import { GrApps, GrUserSettings, GrBookmark } from "react-icons/gr";
import { MdRefresh } from "react-icons/md";
import { db } from "../../lib/firebase";
import Button from "../../components/ui/Button";
import Modal from "../../components/common/Modal/Modal";

const RequestReceived = ({
  requestData,
  onRealtimeUpdate,
  onDeleteRequest,
}) => {
  const navigate = useNavigate();
  const [localRequestData, setLocalRequestData] = useState(requestData);

  const { updateRequestData } = useRequest();
  const initialServiceTypeRef = useRef(requestData.service_type);

  const isMounted = useRef(true);
  const [requests, setRequests] = useState(requestData ? [requestData] : []);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [selectedService_date, setSelectedService_date] = useState(
    requestData.service_date
  );
  const [selectedServcie_time, setSelectedService_time] = useState(
    requestData.service_time
  );
  const [selectedBrand, setSelectedBrand] = useState(requestData.brand);
  const [selectedService_type, setSelectedService_type] = useState(
    requestData.service_type
  );
  const [selectedAircon_type, setSelectedAircon_type] = useState(
    requestData.aircon_type
  );

  const [isServiceOpen, setIsServiceOpen] = useState(true);
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState(
    requestData.detailInfo || ""
  );
  const [selectedDropdownOption, setSelectedDropdownOption] = useState("");
  const [selectedairconditionerform, setSelectedAirconditionerform] =
    useState("");

  const steps = [
    { label: "접수 완료", content: "접수가 완료되었습니다." },
    { label: "기사님 배정 완료", content: "기사님이 배정되었습니다." },
    { label: "결제요청", content: "결제 url 전송예정" },
  ];

  const handleEditClick = (requestId) => {
    setEditingRequestId(requestId);
    setSelectedDropdownOption(requestData.selectedDropdownOption || "");
    setSelectedAirconditionerform(requestData.selectedairconditionerform || "");
    setAdditionalInfo(requestData.detailInfo || "");
    initialServiceTypeRef.current = requestData.service_type;
  };

  const handleCancelClick = () => {
    setEditingRequestId(null);
    setSelectedService_date(requestData.service_date);
    setSelectedService_time(requestData.service_time);
    setSelectedBrand(requestData.brand);
    setSelectedService_type(requestData.service_type);
    setSelectedAircon_type(requestData.aircon_type);
    setAdditionalInfo(requestData.detailInfo || "");
    setSelectedDropdownOption("");
    setSelectedAirconditionerform("");
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSaveClick = async (request) => {
    if (!request.id) return;

    let formattedDetailInfo = "";
    if (["청소", "철거", "점검", "냉매 충전"].includes(selectedService_type)) {
      formattedDetailInfo = additionalInfo;
    } else if (selectedService_type === "설치") {
      formattedDetailInfo = [
        selectedDropdownOption,
        additionalInfo,
        selectedairconditionerform,
      ]
        .filter(Boolean)
        .join("\n");
    } else if (["수리", "이전"].includes(selectedService_type)) {
      formattedDetailInfo = [additionalInfo, selectedDropdownOption]
        .filter(Boolean)
        .join("\n");
    } else if (selectedService_type === "설치&에어컨구매") {
      formattedDetailInfo = [
        selectedDropdownOption,
        selectedairconditionerform,
        additionalInfo,
      ]
        .filter(Boolean)
        .join("\n");
    }

    const updatedRequest = {
      ...request,
      service_date: selectedService_date,
      service_time: selectedServcie_time,
      service_type: selectedService_type,
      brand: selectedBrand,
      aircon_type: selectedAircon_type,
      detailInfo: formattedDetailInfo,
    };
    try {
      const docRef = doc(db, "testrequest", request.id);
      await updateDoc(docRef, updatedRequest);

      if (isMounted.current) {
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === request.id
              ? { ...req, detailInfo: formattedDetailInfo }
              : req
          )
        );
        updateRequestData(request.id, {
          ...updatedRequest,
          detailInfo: formattedDetailInfo,
        });
        setAdditionalInfo(formattedDetailInfo);
        setEditingRequestId(null);
      }
    } catch (error) {
      console.error("Firestore 업데이트 중 오류 발생:", error);
    }
  };
  useEffect(() => {
    setLocalRequestData(requestData);
  }, [requestData]);

  const handleRefresh = async () => {
    if (!requestData?.id) return;

    try {
      const docRef = doc(db, "testrequest", requestData.id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const updatedData = { id: snapshot.id, ...snapshot.data() };

        setLocalRequestData(updatedData);
        setSelectedService_date(updatedData.service_date);
        setSelectedService_time(updatedData.service_time);
        setSelectedBrand(updatedData.brand);
        setSelectedService_type(updatedData.service_type);
        setSelectedAircon_type(updatedData.aircon_type);

        if (editingRequestId !== requestData.id) {
          setAdditionalInfo(updatedData.detailInfo || "");
        }

        setSelectedDropdownOption(updatedData.selectedDropdownOption || "");
        setSelectedAirconditionerform(
          updatedData.selectedairconditionerform || ""
        );

        if (onRealtimeUpdate && typeof onRealtimeUpdate === "function") {
          onRealtimeUpdate(updatedData);
        }
      }
    } catch (error) {
      console.error("새로고침 중 오류:", error);
    }
  };

  //   useEffect(() => {
  //     setRequests((prevRequests) =>
  //       prevRequests.map((req) =>
  //         req.id === requestData.id ? { ...req, detailInfo: additionalInfo } : req
  //       )
  //     );
  //   }, [additionalInfo]);

  const handleCancelRequestPopup = (requestId) => {
    setCancelRequestId(requestId);
    setIsCancelPopupOpen(true);
  };

  const handleCancelRequest = async () => {
    if (!cancelRequestId) return;

    try {
      const cancelRef = doc(db, "testrequest", cancelRequestId);
      await updateDoc(cancelRef, { status: 0 });

      updateRequestData(cancelRequestId, null);

      setIsCancelPopupOpen(false);
      setCancelRequestId(null);

      if (onDeleteRequest && typeof onDeleteRequest === "function") {
        onDeleteRequest(cancelRequestId);
      }
    } catch (error) {
      console.error("Firestore 삭제 중 오류 발생:", error);
      alert("⚠️ 의뢰 취소 중 오류가 발생했습니다.");
    }
  };

  const formatPhoneForDisplay = (number) => {
    if (!number) return "";
    const onlyNumbers = number.replace(/\D/g, "");
    if (onlyNumbers.length === 11) {
      return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(
        3,
        7
      )}-${onlyNumbers.slice(7, 11)}`;
    } else if (onlyNumbers.length === 10) {
      return `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(
        3,
        6
      )}-${onlyNumbers.slice(6, 10)}`;
    }
    return number;
  };
  const formatDateForPicker = (dateStr) => {
    const match = dateStr.match(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  useEffect(() => {
    if (
      editingRequestId === requestData.id &&
      selectedService_type !== initialServiceTypeRef.current
    ) {
      setAdditionalInfo(
        "※ 서비스 유형이 변경되었습니다.\n새로운 요청사항을 다시 입력해주세요."
      );
      setSelectedDropdownOption("");
      setSelectedAirconditionerform("");
    }
  }, [selectedService_type]);

  return (
    <Container>
      <RequestBox>
        <ProgressBar>
          {steps.map((step, index) => (
            <ProgressStep key={index}>
              <Circle $isActive={index + 1 <= localRequestData.status} />
              <StepLabel $isActive={index + 1 === localRequestData.status}>
                {step.label}
              </StepLabel>
              {index < steps.length - 1 && (
                <Line $isActive={index + 1 < localRequestData.status} />
              )}
            </ProgressStep>
          ))}
        </ProgressBar>
        <RefreshIconButton onClick={handleRefresh} title="새로고침">
          <MdRefresh />
          <RefreshText>실시간 의뢰서 정보 업데이트하기</RefreshText>
        </RefreshIconButton>
        {localRequestData.status >= 2 && (
          <TechnicianContainer>
            <TechnicianCard>
              <TechnicianTitle>배정된 기사님 정보</TechnicianTitle>
              <ProfileImage
                loading="lazy"
                decoding="async"
                src={
                  requestData.engineer_profile_image || "default-profile.jpg"
                }
                alt="기사님 사진"
              />
              <TechnicianName>
                {requestData.engineer_name || "배정된 기사 없음"}
              </TechnicianName>
              <ContactInfo>
                <PhoneNumber>
                  {requestData.engineer_phone || "없음"}
                </PhoneNumber>
              </ContactInfo>
              <CompanyInfo>
                <CompanyTitle>
                  {requestData.partner_name || "업체 정보 없음"}
                </CompanyTitle>
                <CompanyAddress>
                  {requestData.partner_address || "주소 정보 없음"}
                  {requestData.partner_address_detail || "주소 정보 없음"}
                </CompanyAddress>
              </CompanyInfo>
              <TechnicianFooter>
                <CompanyAcceptTimeInfo>
                  <Tag>기사님 승인날짜</Tag>
                  <Tag2>{requestData.accepted_at || "접수완료시간없음"}</Tag2>
                </CompanyAcceptTimeInfo>
              </TechnicianFooter>
            </TechnicianCard>
            <TechnicianETC>
              진행 중인 의뢰는 기사님의 일정에 따라 변경되거나 취소될 수
              있습니다
            </TechnicianETC>
          </TechnicianContainer>
        )}
        <ContentBox>
          {/* 방문 희망 날짜 수정 */}
          <Section>
            <Label>방문 희망 일자</Label>
            {editingRequestId === requestData.id ? (
              <LabelBox>
                <CalendarPicker
                  selectedDate={
                    selectedService_date &&
                    !isNaN(new Date(formatDateForPicker(selectedService_date)))
                      ? new Date(formatDateForPicker(selectedService_date))
                      : null
                  }
                  setSelectedDate={(date) => {
                    const formattedForDisplay = `${date.getFullYear()}년 ${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}월 ${String(date.getDate()).padStart(
                      2,
                      "0"
                    )}일`;

                    setSelectedService_date(formattedForDisplay);
                    updateRequestData("service-date", formattedForDisplay);
                  }}
                />
              </LabelBox>
            ) : (
              <Value>{selectedService_date || "없음"}</Value>
            )}
          </Section>

          {/* 방문 희망 시간 수정*/}
          <Section>
            <Label>방문 희망 시간</Label>
            {editingRequestId === requestData.id ? (
              <LabelBox>
                <TimeSlotPicker
                  selectedTime={selectedServcie_time}
                  setSelectedTime={(time) => {
                    setSelectedService_time(time);
                    updateRequestData("service_time", time);
                  }}
                />
              </LabelBox>
            ) : (
              <Value>{selectedServcie_time || "없음"}</Value>
            )}
          </Section>
          {/* 에어컨종류 */}
          <Section>
            <Label>서비스 받을 에어컨 종류</Label>
            {editingRequestId === requestData.id ? (
              <DropdownSelector
                title="에어컨 종류 선택하기"
                icon={<GrApps size="18" />}
                options={[
                  "벽걸이형",
                  "스탠드형",
                  "천장형",
                  "창문형",
                  "항온항습기",
                ]}
                selected={selectedAircon_type}
                setSelected={setSelectedAircon_type}
                isOpen={isTypeOpen}
                setIsOpen={setIsTypeOpen}
                optionWidths={["90px", "90px", "90px", "90px", "110px"]}
              />
            ) : (
              <Value>{selectedAircon_type || "없음"}</Value>
            )}
          </Section>
          {/* 원하는서비스수정 */}
          <Section>
            <Label>원하는서비스</Label>
            {editingRequestId === requestData.id ? (
              <DropdownSelector
                title={selectedService_type}
                icon={<GrUserSettings size="18" />}
                options={[
                  "설치",
                  "설치&에어컨구매",
                  "점검",
                  "청소",
                  "수리",
                  "냉매 충전",
                  "이전",
                  "철거",
                ]}
                selected={selectedService_type}
                setSelected={setSelectedService_type}
                isOpen={isServiceOpen}
                setIsOpen={setIsServiceOpen}
                optionWidths={[
                  "70px",
                  "70px",
                  "70px",
                  "70px",
                  "90px",
                  "70px",
                  "70px",
                ]}
                disabled
              />
            ) : (
              <Value>{selectedService_type || "없음"}</Value>
            )}
          </Section>
          {/* 브랜드수정 */}
          <Section>
            <Label>브랜드</Label>
            {editingRequestId === requestData.id ? (
              <DropdownSelector
                title="브랜드 선택하기"
                icon={<GrBookmark size="18" />}
                options={[
                  "삼성전자",
                  "LG전자",
                  "캐리어",
                  "센추리",
                  "귀뚜라미",
                  "SK매직",
                  "기타(추천 또는 모름)",
                ]}
                selected={selectedBrand}
                setSelected={setSelectedBrand}
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
            ) : (
              <Value>{selectedBrand || "없음"}</Value>
            )}
          </Section>
          {/* 주소수정불가능 */}
          <Section>
            <Label>주소</Label>
            <Value>{requestData.customer_address || "없음"}</Value>
            <Value style={{ marginTop: "5px" }}>
              {requestData.customer_address_detail || "없음"}
            </Value>
          </Section>
          {/* 연락처수정불가능 */}
          <Section>
            <Label>연락처</Label>
            <Value>
              {formatPhoneForDisplay(requestData.customer_phone) || "없음"}
            </Value>
          </Section>
          {/* 이름수정불가능 */}
          <Section>
            <Label>이름</Label>
            <Value style={{ marginTop: "5px" }}>
              {requestData.clientName || "없음"}
            </Value>
          </Section>
          {/* 추가요청사항 */}
          <Section style={{ whiteSpace: "pre-line" }}>
            {editingRequestId === requestData.id ? (
              <>
                {["청소", "철거", "점검", "냉매 충전"].includes(
                  selectedService_type
                ) && (
                  <RequestDetails
                    additionalInfo={additionalInfo}
                    setAdditionalInfo={setAdditionalInfo}
                  />
                )}
                {selectedService_type === "수리" && (
                  <>
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
                      onSelect={(option) => setSelectedDropdownOption(option)}
                    />
                    <Label>추가요청사항</Label>
                    <RequestDetails
                      additionalInfo={additionalInfo}
                      setAdditionalInfo={setAdditionalInfo}
                    />
                  </>
                )}

                {selectedService_type === "설치" && (
                  <>
                    <AdditionalDropSelected
                      options={[
                        "에어컨 구매까지 원해요",
                        "에어컨은 있어요. 설치 서비스만 원해요",
                      ]}
                      placeholderText="에어컨 구매 여부 선택하기"
                      boxPerRow={2}
                      onSelect={setSelectedAirconditionerform}
                    />
                    <AdditionalDropSelected
                      options={[
                        "앵글 설치가 필요해요.",
                        "앵글 설치는 필요 없어요.",
                      ]}
                      placeholderText="앵글 설치 여부 선택하기"
                      boxPerRow={2}
                      onSelect={setSelectedDropdownOption}
                    />
                    <Label>추가요청사항</Label>
                    <RequestDetails
                      additionalInfo={additionalInfo}
                      setAdditionalInfo={setAdditionalInfo}
                    />
                  </>
                )}
                {selectedService_type === "설치&에어컨구매" && (
                  <>
                    <AdditionalDropSelected
                      options={[
                        "중고에어컨 구매원해요",
                        "신규에어컨 구매원해요",
                      ]}
                      placeholderText="에어컨 구매 종류 선택하기"
                      boxPerRow={2}
                      onSelect={setSelectedAirconditionerform}
                    />
                    <AdditionalDropSelected
                      options={[
                        "앵글 설치가 필요해요.",
                        "앵글 설치는 필요 없어요.",
                      ]}
                      placeholderText="앵글 설치 여부 선택하기"
                      boxPerRow={2}
                      onSelect={setSelectedDropdownOption}
                    />
                    <Label>추가요청사항</Label>
                    <RequestDetails
                      additionalInfo={additionalInfo}
                      setAdditionalInfo={setAdditionalInfo}
                    />
                  </>
                )}
                {selectedService_type === "이전" && (
                  <>
                    <AdditionalDropSelected
                      options={[
                        "앵글 설치가 필요해요.",
                        "앵글 설치는 필요 없어요.",
                      ]}
                      placeholderText="앵글 설치 여부 선택하기"
                      boxPerRow={2}
                      onSelect={setSelectedDropdownOption}
                    />
                    <Label>추가요청사항</Label>
                    {additionalInfo.startsWith(
                      "※ 서비스 유형이 변경되었습니다."
                    ) && (
                      <InfoNotice>
                        서비스 유형을 변경하셨습니다. 새로운 추가 요청사항을
                        다시 입력해주세요.
                      </InfoNotice>
                    )}
                    <RequestDetails
                      additionalInfo={additionalInfo}
                      setAdditionalInfo={setAdditionalInfo}
                    />
                  </>
                )}
              </>
            ) : (
              <div>
                <Label>추가요청사항</Label>

                <Value style={{ whiteSpace: "pre-line" }}>
                  {additionalInfo || "없음"}
                </Value>
              </div>
            )}
          </Section>
        </ContentBox>

        {requestData.state === 1 && (
          <WarningText>
            의뢰서 수정은 기사님 배정 전까지만 가능합니다.
          </WarningText>
        )}

        {editingRequestId === requestData.id ? (
          <ButtonGroup>
            <EditButton onClick={handleCancelClick}>취소</EditButton>
            <Button
              size="md"
              style={{ width: "50%" }}
              onClick={() => handleSaveClick(requestData)}
            >
              저장
            </Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            {requestData.status < 2 && (
              <Button
                size="md"
                style={{ width: "50%" }}
                onClick={() => handleCancelRequestPopup(requestData.id)}
              >
                의뢰 취소
              </Button>
            )}
            {requestData.status === 1 && (
              <EditButton onClick={() => handleEditClick(requestData.id)}>
                수정
              </EditButton>
            )}
          </ButtonGroup>
        )}
      </RequestBox>

      {isCancelPopupOpen && (
        <Modal
          open={isCancelPopupOpen}
          onClose={() => setIsCancelPopupOpen(false)}
          title="의뢰 취소"
          width={360}
          footer={
            <PopupButtons>
              <CloseButton
                onClick={handleCancelRequest}
                style={{ backgroundColor: "red" }}
              >
                의뢰 취소
              </CloseButton>
              <CloseButton
                onClick={() => setIsCancelPopupOpen(false)}
                style={{ backgroundColor: "gray" }}
              >
                닫기
              </CloseButton>
            </PopupButtons>
          }
        >
          <PopupMessage>정말로 의뢰를 취소하시겠습니까?</PopupMessage>
        </Modal>
      )}
    </Container>
  );
};

export default RequestReceived;
const InfoNotice = styled.p`
  color: #ff5c5c;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  margin-bottom: 10px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const LabelBox = styled.div`
  width: 100%;
  border: 2px solid #e3e3e3;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bg};
  padding: 20px 10px 30px 20px;
`;
const TechnicianContainer = styled.div``;

const TechnicianETC = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
`;
const RequestBox = styled.div`
  width: 100%;
`;
const Circle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${({ $isActive }) => ($isActive ? "#0080FF" : "#ddd")};
`;

const Line = styled.div`
  width: 60px;
  height: 2px;
  background-color: ${({ $isActive }) => ($isActive ? "#0080FF" : "#ddd")};
  margin: 0px 0px 0px 35px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 40px;
    margin: 0px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 20px;
    margin: 0px;
  }
`;

const StepLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};
  color: ${({ $isActive }) => ($isActive ? "#0080FF" : "#666")};
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const TechnicianCard = styled.div`
  background: #f9f9f9;
  padding-top: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
`;

const TechnicianTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 15px;
`;
const ProfileImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: #ddd;
  margin: 0 auto;
`;
const CompanyAcceptTimeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Tag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  padding: 5px 10px;
  border-radius: 15px;
  margin-top: 10px;
`;
const Tag2 = styled.div``;
const TechnicianName = styled.h2`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-top: 5px;
`;

const ContactInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const PhoneNumber = styled.span`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-right: 10px;
`;

const CompanyInfo = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const CompanyTitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: #666;
`;

const CompanyAddress = styled.p`
  font-size: ${({ theme }) => theme.font.size.small};
  color: #999;
`;
const TechnicianFooter = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 30px 20px 30px 20px;
  border-radius: 0px 0px 10px 10px;
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  color: ${({ theme }) => theme.colors.bg};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  background: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const WarningText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  margin-top: 40px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const EditButton = styled.button`
  flex: 1;
  background-color: #ddd;
  color: ${({ theme }) => theme.colors.bg};
  border-radius: 8px;
  padding: 13px;
  font-size: ${({ theme }) => theme.font.size.body};
  border: none;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const PopupMessage = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  padding: 30px 30px 50px 30px;
  margin-bottom: 20px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 20px;
  border: none;
  background-color: blue;
  color: ${({ theme }) => theme.colors.bg};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  border-radius: 0px 0px 0px 0px;
  cursor: pointer;
`;
const PopupButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const RefreshIconButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 10px 10px 0px;
  margin-bottom: 5px;
  display: flex;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 26px;
    transition: transform 0.2s;

    &:hover {
      transform: rotate(90deg);
    }
  }
`;
const RefreshText = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  padding: 0.3rem;
`;
