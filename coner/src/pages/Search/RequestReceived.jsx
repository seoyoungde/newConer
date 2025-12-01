import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useRequest } from "../../context/context";
import CalendarPicker from "../../components/request/CalendarPicker";
import { doc, updateDoc, getDoc } from "firebase/firestore";

import { MdRefresh } from "react-icons/md";
import { IoCall, IoCheckmarkCircle } from "react-icons/io5";
import { db } from "../../lib/firebase";
import Button from "../../components/ui/Button";
import Modal from "../../components/common/Modal/Modal";
import AddressModal, {
  SERVICE_AREAS,
} from "../../components/common/Modal/AddressModal";
import TextField from "../../components/ui/formControls/TextField";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const phoneNumbers = "010-8079-0636";

const handlePhoneSelect = (phoneNumber) => {
  if (isMobileDevice()) {
    window.location.href = `tel:${phoneNumber}`;
  } else {
  }
};

const SelectBox = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <SelectBoxContainer>
      <SelectBoxButton onClick={() => setIsOpen(!isOpen)}>
        <SelectBoxValue>{value || placeholder}</SelectBoxValue>
        <SelectBoxArrow $isOpen={isOpen}>▼</SelectBoxArrow>
      </SelectBoxButton>
      {isOpen && (
        <SelectBoxDropdown>
          {options.map((option, index) => (
            <SelectBoxOption
              key={index}
              onClick={() => handleSelect(option)}
              $isSelected={option === value}
            >
              {option}
            </SelectBoxOption>
          ))}
        </SelectBoxDropdown>
      )}
    </SelectBoxContainer>
  );
};

// 시간 선택 SelectBox 컴포넌트
const TimeSelectBox = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeOptions = [
    "오전9시 ~ 오전12시",
    "오후1시 ~ 오후4시",
    "오후5시 ~ 오후8시",
  ];

  const handleSelect = (time) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <SelectBoxContainer>
      <SelectBoxButton onClick={() => setIsOpen(!isOpen)}>
        <SelectBoxValue>{value || "시간 선택"}</SelectBoxValue>
        <SelectBoxArrow $isOpen={isOpen}>▼</SelectBoxArrow>
      </SelectBoxButton>
      {isOpen && (
        <SelectBoxDropdown>
          {timeOptions.map((time, index) => (
            <SelectBoxOption
              key={index}
              onClick={() => handleSelect(time)}
              $isSelected={time === value}
            >
              {time}
            </SelectBoxOption>
          ))}
        </SelectBoxDropdown>
      )}
    </SelectBoxContainer>
  );
};

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

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState(
    requestData.detailInfo || ""
  );

  const [selectedCustomer_type, setSelectedCustomer_type] = useState(
    requestData.customer_type || "개인"
  );
  const [selectedCustomer_address_detail, setSelectedCustomer_address_detail] =
    useState(requestData.customer_address_detail || "");
  const [address, setAddress] = useState(requestData.customer_address || "");

  // 날짜 선택을 위한 state
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const steps = [
    { label: "접수 완료" },
    { label: "기사님 배정 완료" },
    { label: "결제 단계" },
  ];

  const handleGoToPayment = () => {
    const id = localRequestData?.id || requestData?.id;

    if (!id) {
      return;
    }

    navigate(`/pay/${id}`);
  };

  const handleAddressClick = () => {
    setIsAddressOpen(true);
  };

  const handleAddressSelect = (addr) => {
    setAddress(addr);
    setIsAddressOpen(false);
  };

  const handleEditClick = (requestId) => {
    setEditingRequestId(requestId);
    setSelectedService_date(localRequestData.service_date ?? "");
    setSelectedService_time(localRequestData.service_time ?? "");
    setSelectedBrand(localRequestData.brand ?? "");
    setSelectedService_type(localRequestData.service_type ?? "");
    setSelectedAircon_type(localRequestData.aircon_type ?? "");
    setSelectedCustomer_type(localRequestData.customer_type ?? "개인");
    setAddress(localRequestData.customer_address ?? "");
    setSelectedCustomer_address_detail(
      localRequestData.customer_address_detail ?? ""
    );

    setAdditionalInfo(localRequestData.detailInfo ?? "");

    initialServiceTypeRef.current = localRequestData.service_type ?? "";

    // 날짜 파싱
    if (localRequestData.service_date) {
      const match = localRequestData.service_date.match(
        /(\d{4})년\s*(\d{2})월\s*(\d{2})일/
      );
      if (match) {
        setSelectedDate(new Date(+match[1], +match[2] - 1, +match[3]));
      }
    }
  };

  const handleCancelClick = () => {
    setEditingRequestId(null);
    setSelectedService_date(localRequestData.service_date);
    setSelectedService_time(localRequestData.service_time);
    setSelectedBrand(localRequestData.brand);
    setSelectedService_type(localRequestData.service_type);
    setSelectedAircon_type(localRequestData.aircon_type);
    setSelectedCustomer_type(localRequestData.customer_type || "개인");
    setAddress(localRequestData.customer_address || "");
    setSelectedCustomer_address_detail(
      localRequestData.customer_address_detail || ""
    );
    setAdditionalInfo(localRequestData.detailInfo || "");

    setSelectedDate(null);
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
    if (
      ["청소", "냉매충전", "수리", "이전설치", "보유기기 설치"].includes(
        selectedService_type
      )
    ) {
      formattedDetailInfo = additionalInfo;
    } else if (selectedService_type === "설치 및 구매") {
      formattedDetailInfo = [additionalInfo].filter(Boolean).join("\n");
    }

    const updatedRequest = {
      ...request,
      service_date: selectedService_date,
      service_time: selectedServcie_time,
      service_type: selectedService_type,
      brand: selectedBrand,
      aircon_type: selectedAircon_type,
      customer_type: selectedCustomer_type,
      customer_address: address,
      customer_address_detail: selectedCustomer_address_detail,
      detailInfo: formattedDetailInfo,
    };

    try {
      const docRef = doc(db, "Request", request.id);
      await updateDoc(docRef, updatedRequest);

      if (isMounted.current) {
        // localRequestData 업데이트 추가
        setLocalRequestData(updatedRequest);

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
    if (!localRequestData?.id) return;

    try {
      const docRef = doc(db, "Request", localRequestData.id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const updatedData = { id: snapshot.id, ...snapshot.data() };

        setLocalRequestData(updatedData);
        setSelectedService_date(updatedData.service_date);
        setSelectedService_time(updatedData.service_time);
        setSelectedBrand(updatedData.brand);
        setSelectedService_type(updatedData.service_type);
        setSelectedAircon_type(updatedData.aircon_type);

        if (editingRequestId !== localRequestData.id) {
          setAdditionalInfo(updatedData.detailInfo || "");
        }

        if (onRealtimeUpdate && typeof onRealtimeUpdate === "function") {
          onRealtimeUpdate(updatedData);
        }
      }
    } catch (error) {
      console.error("새로고침 중 오류:", error);
    }
  };

  const handleCancelRequestPopup = (requestId) => {
    navigate(`/cancelform/${requestId}`);
  };

  // const handleCancelRequestPopup = (requestId) => {
  //   setCancelRequestId(requestId);
  //   setIsCancelPopupOpen(true);
  // };

  // const handleCancelRequest = async () => {
  //   if (!cancelRequestId) return;

  //   try {
  //     const cancelRef = doc(db, "Request", cancelRequestId);
  //     await updateDoc(cancelRef, { status: 0 });

  //     updateRequestData(cancelRequestId, null);

  //     setIsCancelPopupOpen(false);
  //     setCancelRequestId(null);

  //     if (onDeleteRequest && typeof onDeleteRequest === "function") {
  //       onDeleteRequest(cancelRequestId);
  //     }
  //   } catch (error) {
  //     console.error("Firestore 삭제 중 오류 발생:", error);
  //     alert("⚠️ 의뢰 취소 중 오류가 발생했습니다.");
  //   }
  // };

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

  // 날짜 관련 함수들 (Step1에서 가져옴)
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  const isDateToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDateButtons = () => {
    const today = new Date();
    const buttons = [];

    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dayName = dayNames[date.getDay()];

      buttons.push({
        date: date,
        day: date.getDate(),
        dayName: i === 0 ? "오늘" : dayName,
        isToday: i === 0,
      });
    }

    return buttons;
  };

  const formatSelectedDate = (date) => {
    if (!date) return "";
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[date.getDay()];

    if (isDateToday(date)) {
      return `${month}월 ${day}일 오늘`;
    }

    return `${month}월 ${day}일 ${dayName}요일`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    setSelectedService_date(formattedDate);
    updateRequestData("service_date", formattedDate);
  };

  const handleCalendarClick = () => {
    setIsCalendarModalOpen(true);
  };

  const handleCalendarModalClose = () => {
    setIsCalendarModalOpen(false);
  };

  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    setSelectedService_date(formattedDate);
    updateRequestData("service_date", formattedDate);
    setIsCalendarModalOpen(false);
  };

  return (
    <Container>
      <RequestBox>
        {/* 수정 모드가 아닐 때만 ProgressBar 표시 */}
        {editingRequestId !== localRequestData.id && (
          <ProgressBar>
            <ProgressStepsContainer>
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber <= localRequestData.status;
                const isPending = stepNumber > localRequestData.status;

                return (
                  <React.Fragment key={index}>
                    <ProgressStep>
                      <StepIconWrapper
                        $isCompleted={isCompleted}
                        $isPending={isPending}
                      >
                        {isCompleted ? (
                          <IoCheckmarkCircle size={24} />
                        ) : (
                          <PendingCircle>
                            <DotContainer>
                              <Dot />
                              <Dot />
                              <Dot />
                            </DotContainer>
                          </PendingCircle>
                        )}
                      </StepIconWrapper>
                      <StepLabel $isActive={isCompleted}>
                        {step.label}
                      </StepLabel>
                    </ProgressStep>
                    {index < steps.length - 1 && (
                      <Line $isActive={stepNumber < localRequestData.status} />
                    )}
                  </React.Fragment>
                );
              })}
            </ProgressStepsContainer>
            <RefreshIconButton onClick={handleRefresh} title="새로고침">
              <MdRefresh />
            </RefreshIconButton>
          </ProgressBar>
        )}

        {!editingRequestId && localRequestData.status === 3 && (
          <ButtonGroup>
            <Button
              size="md"
              style={{ width: "100%" }}
              onClick={handleGoToPayment}
            >
              바로 결제하기
            </Button>
          </ButtonGroup>
        )}

        {localRequestData.status >= 2 && (
          <TechnicianContainer>
            <TechnicianTitle>배정된 기사님 정보</TechnicianTitle>
            <TechnicianCard>
              <TechnicianContent>
                <ProfileImage
                  loading="lazy"
                  decoding="async"
                  src={
                    localRequestData.engineer_profile_image ||
                    "default-profile.jpg"
                  }
                  alt="기사님 사진"
                />

                <TechnicianInfo>
                  <NameRow>
                    <TechnicianName>
                      {localRequestData.engineer_name || "기사님"} 기사님
                    </TechnicianName>
                    <PartnerName>
                      {localRequestData.partner_name || ""}
                    </PartnerName>
                  </NameRow>

                  <ContactInfo>
                    <IoCall size={14} color="#333" />
                    <PhoneNumber
                      $isMobile={isMobileDevice()}
                      onClick={() =>
                        isMobileDevice() && handlePhoneSelect(phoneNumbers)
                      }
                    >
                      {"010-8079-0636"}
                    </PhoneNumber>
                  </ContactInfo>

                  <CompanyAddress>
                    {localRequestData.partner_address || ""}{" "}
                  </CompanyAddress>

                  <AcceptDate>
                    의뢰 수락 날짜 | {localRequestData.accepted_at || ""}
                  </AcceptDate>
                </TechnicianInfo>
              </TechnicianContent>
            </TechnicianCard>
            <NoticeText>
              ⓘ 진행 중 의뢰는 기사님 일정에 따라 변동사항이 있을 수 있습니다.
            </NoticeText>
          </TechnicianContainer>
        )}

        <ContentBox>
          {editingRequestId === localRequestData.id ? (
            <>
              {/* 수정 모드 - 방문 희망일 */}
              <EditSection style={{ marginTop: "36px" }}>
                <SectionTitle>방문 희망일</SectionTitle>

                <EditLabelBox>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <EditLabel>희망 날짜</EditLabel>
                      {selectedDate && (
                        <SelectedLabel>
                          {formatSelectedDate(selectedDate)}
                        </SelectedLabel>
                      )}
                    </div>
                    <CalendarIconButton onClick={handleCalendarClick}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="20"
                        viewBox="0 0 18 20"
                        fill="none"
                      >
                        <path
                          d="M16 2H15V0H13V2H5V0H3V2H2C0.89 2 0.00999999 2.9 0.00999999 4L0 18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H16C17.1 20 18 19.1 18 18V4C18 2.9 17.1 2 16 2ZM16 18H2V8H16V18ZM6 12H4V10H6V12ZM10 12H8V10H10V12ZM14 12H12V10H14V12ZM6 16H4V14H6V16ZM10 16H8V14H10V16ZM14 16H12V14H14V16Z"
                          fill="#A0A0A0"
                        />
                      </svg>
                    </CalendarIconButton>
                  </div>
                  <DateHeaderRow>
                    <DateButtonsContainer>
                      {getDateButtons().map((item, index) => (
                        <DateButton
                          key={index}
                          $isSelected={
                            selectedDate &&
                            selectedDate.getDate() === item.day &&
                            selectedDate.getMonth() === item.date.getMonth()
                          }
                          $isToday={item.isToday}
                          onClick={() => handleDateSelect(item.date)}
                        >
                          <DateNumber>{item.day}</DateNumber>
                          <DayName>{item.dayName}</DayName>
                        </DateButton>
                      ))}
                    </DateButtonsContainer>
                  </DateHeaderRow>
                </EditLabelBox>

                <EditLabelBox>
                  <EditLabel>희망 시간</EditLabel>
                  <TimeSelectBox
                    value={selectedServcie_time}
                    onChange={(time) => {
                      setSelectedService_time(time);
                      updateRequestData("service_time", time);
                    }}
                  />
                </EditLabelBox>
              </EditSection>

              {/* 수정 모드 - 서비스 세부내역 */}
              <EditSection>
                <SectionTitle>서비스 세부내역</SectionTitle>
                <ThreeColumnGrid>
                  <SelectBox
                    value={selectedBrand}
                    options={["삼성전자", "LG전자", "캐리어", "센추리", "기타"]}
                    onChange={setSelectedBrand}
                    placeholder="삼성전자"
                  />
                  <SelectBox
                    value={selectedAircon_type}
                    options={["스탠드형", "천장형", "항온항습기", "벽걸이형"]}
                    onChange={setSelectedAircon_type}
                    placeholder="천장형"
                  />
                  <SelectBox
                    value={selectedService_type}
                    options={[
                      "보유기기 설치",
                      "설치 및 구매",
                      "청소",
                      "수리",
                      "냉매충전",
                      "이전설치",
                    ]}
                    onChange={setSelectedService_type}
                    placeholder="청소"
                  />
                </ThreeColumnGrid>
              </EditSection>

              {/* 수정 모드 - 주소 */}
              <EditSection>
                <SectionTitle>주소</SectionTitle>
                <ClickableTextField
                  size="stepsize"
                  value={address}
                  placeholder="주소를 입력해주세요"
                  onClick={handleAddressClick}
                  readOnly
                />
                <AddressDetailInput
                  type="text"
                  placeholder="상세주소를 입력해주세요"
                  value={selectedCustomer_address_detail}
                  onChange={(e) =>
                    setSelectedCustomer_address_detail(e.target.value)
                  }
                />
              </EditSection>

              {/* 수정 모드 - 연락처와 의뢰인 유형 */}
              <TwoColumnGrid>
                <div>
                  <EditLabel>연락처 수정 불가</EditLabel>
                  <ValueBox>
                    {formatPhoneForDisplay(localRequestData.customer_phone) ||
                      "없음"}
                  </ValueBox>
                </div>

                <div>
                  <EditLabel>의뢰인 유형</EditLabel>
                  <SelectBox
                    value={selectedCustomer_type}
                    options={["개인", "사업장"]}
                    onChange={setSelectedCustomer_type}
                    placeholder="개인"
                  />
                </div>
              </TwoColumnGrid>

              {/* 수정 모드 - 추가 사항 */}
              <EditSection>
                <SectionTitle>추가 사항</SectionTitle>

                <AdditionalTextarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="추가 요청사항을 입력해주세요"
                  rows={5}
                />
              </EditSection>
            </>
          ) : (
            <>
              {/* 조회 모드 - 방문 희망일 */}
              <SectionTitle>방문 희망일</SectionTitle>
              <TwoColumnGrid>
                <Section>
                  <ValueBox>{selectedService_date || "없음"}</ValueBox>
                </Section>
                <Section>
                  <ValueBox>{selectedServcie_time || "없음"}</ValueBox>
                </Section>
              </TwoColumnGrid>

              {/* 조회 모드 - 서비스 세부내역 */}
              <SectionTitle>서비스 세부내역</SectionTitle>
              <ThreeColumnGrid>
                <Section>
                  <ValueBox>{selectedBrand || "없음"}</ValueBox>
                </Section>
                <Section>
                  <ValueBox>{selectedAircon_type || "없음"}</ValueBox>
                </Section>
                <Section>
                  <ValueBox>{selectedService_type || "없음"}</ValueBox>
                </Section>
              </ThreeColumnGrid>

              {/* 조회 모드 - 주소 */}
              <SectionTitle>주소</SectionTitle>
              <Section>
                <ValueBox>
                  {localRequestData.customer_address || "없음"}
                  {localRequestData.customer_address_detail && (
                    <> {localRequestData.customer_address_detail}</>
                  )}
                </ValueBox>
              </Section>

              {/* 조회 모드 - 연락처와 의뢰인 유형 */}
              <TwoColumnGrid>
                <div>
                  <SectionTitle style={{ marginBottom: "12px" }}>
                    연락처
                  </SectionTitle>
                  <Section>
                    <ValueBox>
                      {formatPhoneForDisplay(localRequestData.customer_phone) ||
                        "없음"}
                    </ValueBox>
                  </Section>
                </div>

                <div>
                  <SectionTitle style={{ marginBottom: "12px" }}>
                    의뢰인 유형
                  </SectionTitle>
                  <Section>
                    <ValueBox>
                      {localRequestData.customer_type || "개인"}
                    </ValueBox>
                  </Section>
                </div>
              </TwoColumnGrid>

              {/* 조회 모드 - 추가 사항 */}
              <SectionTitle>추가 사항</SectionTitle>
              <Section style={{ whiteSpace: "pre-line" }}>
                <ValueBox style={{ whiteSpace: "pre-line" }}>
                  {additionalInfo || "없음"}
                </ValueBox>
              </Section>
            </>
          )}
        </ContentBox>

        {localRequestData.state === 1 && (
          <WarningText>
            의뢰서 수정은 기사님 배정 전까지만 가능합니다.
          </WarningText>
        )}

        {editingRequestId === localRequestData.id ? (
          <EditButtonGroup>
            <CancelButton onClick={handleCancelClick}>취소</CancelButton>
            <SaveButton onClick={() => handleSaveClick(localRequestData)}>
              수정 완료
            </SaveButton>
          </EditButtonGroup>
        ) : (
          <ButtonGroup>
            {localRequestData.status === 1 && (
              <EditButton onClick={() => handleEditClick(localRequestData.id)}>
                수정하기
              </EditButton>
            )}
            {localRequestData.status < 2 && (
              <Button
                size="md"
                style={{
                  backgroundColor: "#F2F3F6",
                  border: "none",
                  color: "#A0A0A0",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
                onClick={() => handleCancelRequestPopup(localRequestData.id)}
              >
                의뢰 취소
              </Button>
            )}
          </ButtonGroup>
        )}
      </RequestBox>

      {/* 주소검색 모달 */}
      <Modal
        open={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        title="주소 검색"
        width={420}
        containerId="rightbox-modal-root"
      >
        <div style={{ width: "100%", height: "70vh" }}>
          <AddressModal
            onSelect={handleAddressSelect}
            onClose={() => setIsAddressOpen(false)}
            serviceAreas={SERVICE_AREAS}
          />
        </div>
      </Modal>

      {/* 캘린더 모달 */}
      <Modal
        open={isCalendarModalOpen}
        onClose={handleCalendarModalClose}
        title="날짜 선택"
        width={400}
        containerId="rightbox-modal-root"
      >
        <CalendarPicker
          selectedDate={selectedDate}
          setSelectedDate={handleCalendarDateSelect}
        />
      </Modal>
    </Container>
  );
};

export default RequestReceived;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 36px;
  padding-bottom: 32px;
`;

const ProgressStepsContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StepIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isCompleted }) => ($isCompleted ? "#004FFF" : "#D9D9D9")};
`;

const PendingCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #8d989f;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DotContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

const Dot = styled.div`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: white;
`;

const Line = styled.div`
  width: 50px;
  height: 2px;
  background-color: ${({ $isActive }) => ($isActive ? "#004FFF" : "#8D989F")};
  margin: 0 8px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 20px;
    margin: 0 4px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 6px;
    margin: 0 2px;
  }
`;

const StepLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  font-size: 13px;
  font-weight: 700;
  color: ${({ $isActive }) => ($isActive ? "#004fff" : "#8D989F")};
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 12px;
  }
`;

const RequestBox = styled.div`
  width: 100%;
`;

const TechnicianContainer = styled.div``;

const TechnicianCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 8px;
  }
`;

const TechnicianTitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const TechnicianContent = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 10px;
  }
`;

const ProfileImage = styled.img`
  width: 116px;
  height: 116px;
  border-radius: 6px;
  background: #d9d9d9;
  flex-shrink: 0;
  object-fit: cover;
`;

const TechnicianInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const TechnicianName = styled.span`
  font-size: 18px;
  font-weight: 700;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const PartnerName = styled.span`
  color: #8d989f;
  font-size: 14px;
  font-weight: 600;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 3px;
  }
`;

const PhoneNumber = styled.span`
  font-size: 14px;
  font-weight: 400;
  cursor: ${({ $isMobile }) => ($isMobile ? "pointer" : "default")};
  color: ${({ $isMobile }) => ($isMobile ? "#004FFF" : "inherit")};
  text-decoration: ${({ $isMobile }) => ($isMobile ? "underline" : "none")};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;

const CompanyAddress = styled.p`
  font-size: 14px;
  font-weight: 400;
  margin: 0 0 8px 0;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;

const AcceptDate = styled.p`
  color: #004fff;
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 10px;
  }
`;

const NoticeText = styled.p`
  color: #8d989f;
  font-size: 10px;
  font-weight: 500;
  text-align: right;
  margin: 16px 0 0 0;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const EditSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EditLabelBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditLabel = styled.div`
  color: #8d989f;
  font-size: 14px;
  font-weight: 500;
`;

const SelectedLabel = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1fr;
  gap: 8px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const ValueBox = styled.div`
  font-weight: 500;
  background: #ffffff;
  padding: 14px 0px 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
    padding: 12px 0px 12px 12px;
  }
`;

const AddressDetailInput = styled.input`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #0080ff;
  }
`;

const DateHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CalendarIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #e0e0e0;
  }

  svg {
    pointer-events: none;
  }
`;

const DateButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;

  padding: 4px 0 8px 0;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 360px;
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    gap: 12px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 280px;

    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    gap: 8px;
  }
`;

const DateButton = styled.button`
  flex: none;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 1px solid
    ${({ $isSelected, $isToday }) =>
      $isSelected ? "#007BFF" : $isToday ? "#007BFF" : "#d6d6d6"};
  border-radius: 8px;
  background-color: ${({ $isSelected }) => ($isSelected ? "#004FFF" : "white")};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #007bff;
  }
`;

const DateNumber = styled.span`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const DayName = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const SelectBoxContainer = styled.div`
  position: relative;
  width: 100%;
`;
const SelectBoxButton = styled.button`
  width: 100%;
  padding: 16px 14px 16px 20px;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: border-color 0.2s;

  &:hover {
    border-color: #0080ff;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
    padding: 12px 12px 12px 12px;
  }
`;

const SelectBoxValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #000;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const SelectBoxArrow = styled.span`
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const SelectBoxDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const SelectBoxOption = styled.div`
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
  background: ${({ $isSelected }) => ($isSelected ? "#f0f7ff" : "#ffffff")};
  color: ${({ $isSelected }) => ($isSelected ? "#0080ff" : "#000")};

  &:hover {
    background: #f9f9f9;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const WarningText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  margin-top: 40px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
`;

const EditButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 64px;
  margin-bottom: 20px;
`;

const EditButton = styled.button`
  background-color: #004fff;
  color: ${({ theme }) => theme.colors.bg};
  height: 44px;
  padding: 0 16px;
  font-size: ${({ theme }) => theme.font.size.body};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  margin-top: 64px;
`;

const CancelButton = styled.button`
  flex: 3;
  background-color: #e0e0e0;
  color: #666;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  font-weight: 600;
`;

const SaveButton = styled.button`
  flex: 8;
  background-color: #004fff;
  color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  font-weight: 600;
`;

const PopupMessage = styled.p`
  font-size: 14px;
  padding: 30px 20px 40px 20px;

  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 20px;
  border: none;
  background-color: blue;
  color: ${({ theme }) => theme.colors.bg};
  font-size: 14px;
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
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    color: #8d989f;
    font-size: 24px;
    transition: transform 0.2s;

    &:hover {
      transform: rotate(90deg);
    }
  }
`;

const AdditionalTextarea = styled.textarea`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #333;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;

  &::placeholder {
    color: #999;
  }
  &:focus {
    outline: none;
    border-color: #004fff;
  }
`;

const ClickableTextField = styled(TextField)`
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;
