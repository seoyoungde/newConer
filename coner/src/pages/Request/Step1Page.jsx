import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarPicker from "../../components/request/CalendarPicker";
import TimeSlotPicker from "../../components/request/TimeSlotPicker";
import styled from "styled-components";
import FormLayout from "../../components/request/FormLayout";
import { GrFormCalendar } from "react-icons/gr";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useRequest } from "../../context/context";
import StepProgressBar from "../../components/request/StepProgressBar";
import NavHeader from "../../components/common/Header/NavHeader";
import Modal from "../../components/common/Modal/Modal";
import { useFunnelStep } from "../../analytics/useFunnelStep";

const Step1Page = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  const [selectedDate, setSelectedDate] = useState(() => {
    const s = requestData.service_date;
    const m = s?.match?.(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  });
  const [selectedTime, setSelectedTime] = useState(
    requestData.service_time || ""
  );

  const [popupMessage, setPopupMessage] = useState("");
  const [isDateTouched, setIsDateTouched] = useState(
    Boolean(requestData.service_date)
  );

  // 퍼널: 1단계
  const { onAdvance } = useFunnelStep({ step: 1 });

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  const handleNext = () => {
    if (!isDateTouched && !requestData.service_date) {
      setPopupMessage("서비스 날짜를 선택해주세요.");
      return;
    }
    if (!selectedTime && !requestData.service_time) {
      setPopupMessage("방문 시간을 선택해주세요.");
      return;
    }
    const formattedDate = formatDate(selectedDate);
    updateRequestData("service_date", formattedDate);
    updateRequestData("service_time", selectedTime);

    onAdvance(2);
    navigate("/request/step2");
  };

  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={1} totalSteps={2} />

      <FormLayout
        title="서비스 희망 날짜 선택"
        subtitle="원하시는 서비스 날짜를 선택해주세요."
        onNext={handleNext}
      >
        <InfoText>오늘 날짜로부터 2일 이후에 예약이 가능합니다.</InfoText>

        <DateBox>
          <SelectedContainer>
            <CalendarIcon>
              <GrFormCalendar />
            </CalendarIcon>
            <SelectedText>{formatDate(selectedDate)}</SelectedText>
          </SelectedContainer>
          <CalendarPicker
            selectedDate={selectedDate}
            setSelectedDate={(date) => {
              setSelectedDate(date);
              setIsDateTouched(true);
              updateRequestData("service_date", formatDate(date));
            }}
          />
        </DateBox>

        <TimeBox>
          <SelectedContainer>
            <TimeIcon>
              <AiOutlineClockCircle />
            </TimeIcon>
            <SelectedText>{selectedTime || "시간을 선택해주세요"}</SelectedText>
          </SelectedContainer>
          <InfoText>선택하신 시간대에 기사님이 방문해요</InfoText>
          <TimeSlotPicker
            selectedTime={selectedTime}
            setSelectedTime={(time) => {
              setSelectedTime(time);
              updateRequestData("service_time", time);
            }}
          />
        </TimeBox>

        {/* <InfoText2>
          <strong />
          안내드립니다 <br />
          현재 LGU+ 프로젝트 진행으로 인해 일부 일정에 변동이 생길 수 있습니다.
          <br />
          최상의 서비스 제공을 위해 조율이 필요한 점 너른 양해 부탁드립니다.
          <br />더 나은 일정으로 찾아뵐 수 있도록 최선을 다하겠습니다
          감사합니다.
        </InfoText2> */}
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
export default Step1Page;

const Container = styled.section`
  width: 100%;
`;
const InfoText = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.subtext};
`;
const InfoText2 = styled.p`
  text-align: left;
  padding: 25px 10px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.subtext};
`;
const DateBox = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  display: flex;
  flex-direction: column;
`;
const TimeBox = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;
const TimeIcon = styled(AiOutlineClockCircle)`
  font-size: 1.3rem;
`;
const CalendarIcon = styled(GrFormCalendar)`
  font-size: 1.8rem;
`;
const SelectedContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;
const SelectedText = styled.div`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;
