import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const endOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

const CalendarPicker = ({ selectedDate, setSelectedDate, excludeDates }) => {
  const minDate = startOfToday();
  const maxDate = endOfDay(addMonths(minDate, 6)); // 최대 6개월

  return (
    <CalendarWrapper>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate || undefined}
        minDate={minDate}
        maxDate={maxDate}
        tileDisabled={({ date }) => {
          const disabledByExclude = excludeDates?.some(
            (excluded) =>
              date.toDateString() === new Date(excluded).toDateString()
          );
          return disabledByExclude;
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
