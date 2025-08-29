import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarPicker from "../../components/request/CalendarPicker";
import TimeSlotPicker from "../../components/request/TimeSlotPicker";
import styled from "styled-components";
import FormLayout from "../../components/request/FormLayout";
import { GrFormCalendar } from "react-icons/gr";
import { AiOutlineClockCircle } from "react-icons/ai";
import { RiFlashlightLine } from "react-icons/ri";
import { useRequest } from "../../context/context";
import StepProgressBar from "../../components/request/StepProgressBar";
import NavHeader from "../../components/common/Header/NavHeader";
import Modal from "../../components/common/Modal/Modal";
import { useFunnelStep } from "../../analytics/useFunnelStep";

const Step1Page = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();

  const [asap, setAsap] = useState(requestData.service_date === "최대한빨리");
  const [selectedDate, setSelectedDate] = useState(() => {
    const s = requestData.service_date;
    if (s === "최대한빨리") return new Date();
    const m = s?.match?.(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  });
  const [selectedTime, setSelectedTime] = useState(
    requestData.service_time || ""
  );
  const [popupMessage, setPopupMessage] = useState("");
  const [isDateTouched, setIsDateTouched] = useState(
    Boolean(
      requestData.service_date && requestData.service_date !== "최대한빨리"
    )
  );

  // 퍼널: 1단계
  const { onAdvance } = useFunnelStep({ step: 1 });

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  };

  const handleToggleAsap = () => {
    const next = !asap;
    setAsap(next);
    if (next) {
      // ASAP 켜짐: 날짜/시간 모두 자동 배정 값으로 저장
      updateRequestData("service_date", "최대한빨리");
      updateRequestData("service_time", "");
      // selectedTime은 유지 → ASAP 해제 시 이전 선택 복원
    } else {
      updateRequestData("service_date", formatDate(selectedDate));
      if (requestData.service_time === "") {
        updateRequestData("service_time", "");
      }
    }
  };

  const handleNext = () => {
    if (!asap && !isDateTouched && !requestData.service_date) {
      setPopupMessage("서비스 날짜를 선택해주세요.");
      return;
    }
    // ASAP일 땐 시간 검증 스킵
    if (!asap && !selectedTime && !requestData.service_time) {
      setPopupMessage("방문 시간을 선택해주세요.");
      return;
    }

    if (asap) {
      updateRequestData("service_date", "최대한빨리");
      updateRequestData("service_time", "");
    } else {
      updateRequestData("service_date", formatDate(selectedDate));
      updateRequestData("service_time", selectedTime);
    }

    onAdvance(2);
    navigate("/request/step2");
  };

  const timeSelectedText = asap
    ? "가장 빠른 시간으로 요청됨"
    : selectedTime || "시간을 선택해주세요";

  return (
    <Container>
      <NavHeader to="/" />
      <StepProgressBar currentStep={1} totalSteps={2} />

      <FormLayout
        title="서비스 희망 날짜 선택"
        subtitle="원하시는 서비스 날짜를 선택해주세요."
        onNext={handleNext}
      >
        {/* ASAP 버튼 + 안내문구 */}
        <DateButtonBox>
          <AsapButton
            type="button"
            aria-pressed={asap}
            onClick={handleToggleAsap}
          >
            <RiFlashlightLine />
            {asap ? "가장 빠른 날짜 희망" : "최대한 빠른 날짜로 서비스 받기"}
          </AsapButton>
          <AsapHelp>
            지역과 서비스에 맞춰, 가장 빠른 기사님이 연락드려요.
          </AsapHelp>
        </DateButtonBox>

        <DateBox aria-live="polite">
          <SelectedContainer>
            <CalendarIcon />
            <SelectedText>
              {asap ? "가장 빠른 날짜 희망" : formatDate(selectedDate)}
            </SelectedText>
          </SelectedContainer>

          {/* 달력: ASAP 시 시각적 비활성 + 입력가드 (스크롤은 유지) */}
          <CalendarWrapper $disabled={asap} aria-disabled={asap}>
            <InfoText>오늘 날짜로부터 2일 이후에 예약이 가능합니다.</InfoText>
            <CalendarPicker
              selectedDate={selectedDate}
              setSelectedDate={(date) => {
                if (asap) return; // 클릭/터치 가드
                setSelectedDate(date);
                setIsDateTouched(true);
                updateRequestData("service_date", formatDate(date));
              }}
              disabled={asap}
            />
          </CalendarWrapper>
        </DateBox>

        {/* 시간: ASAP 시 비활성 + 가드 */}
        <TimeBox aria-disabled={asap}>
          <SelectedContainer>
            <TimeIcon />
            <SelectedText>
              {asap
                ? "가장 빠른 시간으로 요청됨"
                : selectedTime || "시간을 선택해주세요"}
            </SelectedText>
          </SelectedContainer>

          <TimeControls $disabled={asap}>
            <InfoText>
              {asap
                ? "빠른 배정 옵션에서는 시간 선택 없이 가장 빠른 시간대로 방문합니다."
                : "선택하신 시간대에 기사님이 방문해요"}
            </InfoText>

            <TimeSlotPicker
              selectedTime={selectedTime}
              setSelectedTime={(time) => {
                if (asap) return; // 입력 가드
                setSelectedTime(time);
                updateRequestData("service_time", time);
              }}
              disabled={asap}
            />
          </TimeControls>
        </TimeBox>
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
  text-align: left;
  padding-left: 10px;
`;

const DateBox = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DateButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 15px;
  gap: 8px;
`;

const AsapButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary + "10"};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  transition: transform 0.04s ease;
  &:active {
    transform: translateY(1px);
  }
  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

const AsapHelp = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.subtext};
  line-height: 1.4;
  text-align: left;
  padding-left: 15px;
`;

const CalendarWrapper = styled.div`
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
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
const TimeControls = styled.div`
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
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
  margin-bottom: 2px;
`;

const SelectedText = styled.div`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
`;
