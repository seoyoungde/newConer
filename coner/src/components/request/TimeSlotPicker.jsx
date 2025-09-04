import React from "react";
import styled from "styled-components";

const timesSlots = [
  { display: "오전9시 ~ 오전12시", startHour: 9 },
  { display: "오후1시 ~ 오후4시", startHour: 13 },
  { display: "오후5시 ~ 오후 8시", startHour: 17 },
];

const isTimeSlotAvailable = (startHour) => {
  const now = new Date();
  const currentHour = now.getHours();
  return startHour > currentHour;
};

const TimeSlotPicker = ({ selectedTime, setSelectedTime }) => {
  return (
    <TimeSlotContainer>
      {timesSlots.map((timeSlot) => {
        const isAvailable = isTimeSlotAvailable(timeSlot.startHour);
        return (
          <TimeSlotButton
            key={timeSlot.display}
            $isSelected={selectedTime === timeSlot.display}
            $isDisabled={!isAvailable}
            onClick={() => isAvailable && setSelectedTime(timeSlot.display)}
            disabled={!isAvailable}
          >
            {timeSlot.display}
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
    grid-template-columns: repeat(1, 1fr);
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
