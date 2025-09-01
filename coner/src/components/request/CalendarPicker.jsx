import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

const CalendarPicker = ({ selectedDate, setSelectedDate, excludeDates }) => {
  return (
    <CalendarWrapper>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate || undefined}
        minDate={new Date()}
        excludeDates={excludeDates}
        tileDisabled={({ date }) => {
          const disabled = excludeDates?.some(
            (excluded) =>
              date.toDateString() === new Date(excluded).toDateString()
          );
          return disabled;
        }}
      />
    </CalendarWrapper>
  );
};

export default CalendarPicker;

const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 10px;
    font-weight: bold;
    font-size: ${({ theme }) => theme.font.size.body};
    color: ${({ theme }) => theme.colors.text};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
      font-size: 13px;
    }
  }
  .react-calendar__tile {
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .react-calendar__navigation__label {
    font-size: ${({ theme }) => theme.font.size.body};
    color: ${({ theme }) => theme.colors.text};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
      font-size: ${({ theme }) => theme.font.size.bodySmall};
    }
  }

  .react-calendar__navigation__arrow {
    font-size: ${({ theme }) => theme.font.size.h3};
    color: ${({ theme }) => theme.colors.text};
  }
  .react-calendar__tile:disabled {
    background-color: #f0f0f0 !important;
    color: #ccc !important;
    cursor: not-allowed !important;
    border-radius: 0 !important;
  }
  .react-calendar__tile--now {
    background: transparent !important;
    color: inherit !important;
    font-weight: inherit !important;
    border-radius: 0 !important;
  }

  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.primary} !important;
    color: white !important;
    border-radius: 10px !important;
  }
`;
