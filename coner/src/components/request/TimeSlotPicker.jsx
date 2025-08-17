import React from "react";
import styled from "styled-components";

const timeSlots = [
  "오전9시 ~ 오후12시",
  "오후1시 ~ 오후4시",
  "오후5시 ~ 오후8시",
];

const TimeSlotPicker = ({ selectedTime, setSelectedTime }) => {
  return (
    <TimeSlotContainer>
      {timeSlots.map((time) => (
        <TimeSlotButton
          key={time}
          $isSelected={selectedTime === time}
          onClick={() => setSelectedTime(time)}
        >
          {time}
        </TimeSlotButton>
      ))}
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
  border: ${({ $isSelected }) =>
    $isSelected ? "2px solid #004FFF" : "1px solid #d6d6d6"};
  background: ${({ $isSelected }) => ($isSelected ? "#004FFF" : "white")};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
  text-align: center;
`;
