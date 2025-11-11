import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StepHeader from "../../../components/common/Header/StepHeader";
import styled from "styled-components";
import Button from "../../../components/ui/Button";
import { useRequest } from "../../../context/context";
import { useFunnelStep } from "../../../analytics/useFunnelStep";
import CalendarPicker from "../../../components/request/CalendarPicker";
import Modal from "../../../components/common/Modal/Modal";

const CustomTimeDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)} $hasValue={!!value}>
        <span>{displayValue}</span>
        <ArrowIcon $isOpen={isOpen}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ArrowIcon>
      </DropdownButton>

      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownItem
              key={option}
              onClick={() => handleSelect(option)}
              $isSelected={value === option}
            >
              {option}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

const PartnerStep1 = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { requestData, updateRequestData } = useRequest();

  // 퍼널: 1단계
  const { onAdvance } = useFunnelStep({ step: 1 });

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  useEffect(() => {
    if (requestData.service_time) {
      setSelectedTime(requestData.service_time);
    }
    if (requestData.service_date && requestData.service_date !== "최대한빨리") {
      // "YYYY년 MM월 DD일" 형식에서 Date 객체로 변환
      const match = requestData.service_date.match(
        /(\d{4})년\s*(\d{2})월\s*(\d{2})일/
      );
      if (match) {
        setSelectedDate(new Date(+match[1], +match[2] - 1, +match[3]));
      }
    }
  }, []);

  const timeOptions = [
    "오전9시 ~ 오전12시",
    "오전12시 ~ 오후3시",
    "오후3시 ~ 오후6시",
    "오후6시 ~ 오후8시",
  ];

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  const getTimeOptionStartHour = (timeOption) => {
    if (timeOption === "오전9시 ~ 오전12시") return 9;
    if (timeOption === "오전12시 ~ 오후3시") return 12;
    if (timeOption === "오후3시 ~ 오후6시") return 15;
    if (timeOption === "오후6시 ~ 오후8시") return 18;
    return 0;
  };

  const isDateToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getAvailableTimeOptions = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (!selectedDate || !isDateToday(selectedDate)) {
      return timeOptions;
    }

    return timeOptions.filter((timeOption) => {
      const startHour = getTimeOptionStartHour(timeOption);
      return currentHour < startHour;
    });
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
    setSelectedTime("");
    updateRequestData("service_date", formatDate(date));
    updateRequestData("service_time", "");
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);

    updateRequestData("service_time", time);
  };

  const handleHelpClick = () => {
    window.open("http://pf.kakao.com/_jyhxmn/chat", "_blank");
  };

  const handleCalendarClick = () => {
    setIsCalendarModalOpen(true);
  };

  const handleCalendarModalClose = () => {
    setIsCalendarModalOpen(false);
  };

  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    updateRequestData("service_date", formatDate(date));
    updateRequestData("service_time", "");
    setIsCalendarModalOpen(false);
  };

  const handleNext = () => {
    if (!selectedDate) {
      alert("희망 날짜를 선택해주세요.");
      return;
    }

    if (!selectedTime) {
      alert("희망 시간을 선택해주세요.");
      return;
    }

    updateRequestData("service_date", formatDate(selectedDate));
    updateRequestData("service_time", selectedTime);

    onAdvance(2);
    navigate(`/partner/step2/${partnerId}`);
  };

  const getTitle = () => {
    if (!selectedDate) {
      return "희망하시는 날짜를 선택해주세요.";
    } else if (
      !selectedTime ||
      !getAvailableTimeOptions().includes(selectedTime)
    ) {
      return "희망하시는 시간을 선택해주세요.";
    } else {
      return "희망하시는 시간을 선택해주세요.";
    }
  };

  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : 3;
  const availableTimeOptions = getAvailableTimeOptions();

  const backPath = useMemo(() => {
    if (requestData.service_type === "설치 및 구매") {
      return `/partner/step0/purchase/${partnerId}`;
    }
    return `/partner/step0/${partnerId}`;
  }, [requestData.service_type, partnerId]);

  return (
    <PageContainer>
      <StepHeader to={backPath} currentStep={currentStep} totalSteps={10} />
      <ContentSection>
        <PageTitle>{getTitle()}</PageTitle>

        {/* 날짜가 선택된 후 시간 선택 (위쪽에 표시) */}
        {selectedDate && (
          <SectionContainer>
            <SectionLabel>희망 시간</SectionLabel>
            <CustomTimeDropdown
              value={selectedTime}
              onChange={handleTimeChange}
              options={availableTimeOptions}
              placeholder="시간을 선택해주세요"
            />
            {availableTimeOptions.length === 0 && (
              <NoTimeAvailable>
                오늘은 선택 가능한 시간이 없습니다.
              </NoTimeAvailable>
            )}
          </SectionContainer>
        )}

        {/* 희망 날짜 선택 (항상 표시) */}
        <SectionContainer>
          <SectionLabel style={{ marginBottom: "2px" }}>희망 날짜</SectionLabel>
          <DateHeader>
            <SelectedDateText>
              {formatSelectedDate(selectedDate) || "날짜를 선택해주세요"}
            </SelectedDateText>
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
          </DateHeader>

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

          {/* 당일 신청 안내 문구 */}
          <NoticeText>
            당일신청시 기사님과 일정조율이 필요할 수 있습니다.
          </NoticeText>
        </SectionContainer>
      </ContentSection>

      {/* 하단 고정 버튼 영역 - 조건부 렌더링 */}
      {selectedDate &&
        selectedTime &&
        availableTimeOptions.includes(selectedTime) && (
          <FixedButtonArea>
            <Button fullWidth size="stepsize" onClick={handleNext}>
              확인
            </Button>
            <CSButtonContainer>
              <CSButton onClick={handleHelpClick}>
                <CSButtonText>도움이 필요해요</CSButtonText>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="14"
                  viewBox="0 0 8 14"
                  fill="none"
                >
                  <path d="M0.999999 13L7 7L1 1" stroke="#A0A0A0" />
                </svg>
              </CSButton>
            </CSButtonContainer>
          </FixedButtonArea>
        )}

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
    </PageContainer>
  );
};

export default PartnerStep1;
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const ContentSection = styled.div`
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
  margin-bottom: 32px;
`;

const FixedButtonArea = styled.div`
  flex-shrink: 0;
  margin-bottom: 87px;
  padding: 16px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 15px;
    margin-bottom: 10px;
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.h1};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 36px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: ${({ theme }) => theme.font.size.h2};
  }
`;

const SectionContainer = styled.div``;

const SectionLabel = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: 8px;
  margin: 0;
  margin-top: 24px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 8px;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ $hasValue }) => ($hasValue ? "#333" : "#999")};
  font-size: ${({ theme }) => theme.font.size.body};
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ArrowIcon = styled.div`
  color: #666;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  display: flex;
  align-items: center;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;

  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    -webkit-overflow-scrolling: touch;
  }
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ $isSelected }) => ($isSelected ? "#f8f9fa" : "white")};
  font-weight: ${({ $isSelected }) => ($isSelected ? "600" : "400")};

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const NoTimeAvailable = styled.p`
  font-size: ${({ theme }) => theme.font.size.body};
  color: #ff6b6b;
  margin-top: 8px;
  margin-bottom: 0;
  text-align: center;
`;

const DateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SelectedDateText = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
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

  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 360px;

    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    gap: 8px;
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
  border-radius: 8px;
  background-color: ${({ $isSelected }) => ($isSelected ? "#004FFF" : "white")};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #007bff;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 12px 10px;
    min-width: 50px;
  }
`;

const DateNumber = styled.span`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 4px;
`;

const DayName = styled.span`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;

const CSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const CSButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
`;

const CSButtonText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  color: #a0a0a0;
`;

const NoticeText = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: #888;
  margin-top: 8px;
  margin-bottom: 0;
  text-align: center;
  line-height: 1.4;
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
