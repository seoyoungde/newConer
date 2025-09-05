// TimeSlotPicker.jsx
import React from "react";
import styled from "styled-components";

const timesSlots = [
  { display: "오전9시 ~ 오전12시", startHour: 9 },
  { display: "오후1시 ~ 오후4시", startHour: 13 },
  { display: "오후5시 ~ 오후 8시", startHour: 17 },
];

const TimeSlotPicker = ({
  selectedDate, // Date | null
  selectedTime,
  setSelectedTime,
  disabled = false, // ASAP 등 외부에서 비활성 제어
}) => {
  const now = new Date();

  const isAvailable = (startHour) => {
    // 1) 외부 비활성
    if (disabled) return false;

    // 2) 날짜가 없으면 선택 불가
    if (!(selectedDate instanceof Date) || isNaN(selectedDate)) return false;

    // 3) 오늘이 아니면 모두 가능
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return true;

    // 4) 오늘이면 현재 시각 이후만 가능
    return startHour > now.getHours();
  };

  return (
    <TimeSlotContainer aria-disabled={disabled}>
      {timesSlots.map((t) => {
        const available = isAvailable(t.startHour);
        return (
          <TimeSlotButton
            key={t.display}
            $isSelected={selectedTime === t.display}
            $isDisabled={!available}
            onClick={() => available && setSelectedTime(t.display)}
            disabled={!available}
            aria-disabled={!available}
          >
            {t.display}
          </TimeSlotButton>
        );
      })}
    </TimeSlotContainer>
  );
};

export default TimeSlotPicker;

const TimeSlotContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 20px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const TimeSlotButton = styled.button`
  padding: 8px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  border: ${({ $isSelected, $isDisabled }) => {
    if ($isDisabled) return "1px solid #e0e0e0";
    return $isSelected ? "2px solid #004FFF" : "1px solid #d6d6d6";
  }};
  background: ${({ $isSelected, $isDisabled }) => {
    if ($isDisabled) return "#f5f5f5";
    return $isSelected ? "#004FFF" : "white";
  }};
  color: ${({ $isSelected, $isDisabled }) => {
    if ($isDisabled) return "#999";
    return $isSelected ? "white" : "#333";
  }};
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  text-align: center;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.6 : 1)};
`;
