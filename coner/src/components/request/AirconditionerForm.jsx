import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import { MdOutlineComment } from "react-icons/md";
import { useRequest } from "../../context/context";
import Button from "../ui/Button";
import Modal from "../common/Modal/Modal";

const AirconditionerForm = ({
  options,
  title,
  description,
  onSubmit,
  boxWidths = ["45%", "45%"],
}) => {
  const navigate = useNavigate();
  const { requestData, updateRequestData } = useRequest();
  const [selectedOption, setSelectedOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");

  const handleSubmit = async () => {
    if (!selectedOption) {
      setPopupMessage("옵션을 선택해주세요.");
      return;
    }

    updateRequestData("detailInfo", selectedOption);

    if (onSubmit) {
      onSubmit(selectedOption);
    }

    const st = encodeURIComponent(
      selectedOption
        ? requestData?.service_type || ""
        : requestData?.service_type || ""
    );
    navigate(`/request/address-contact?service_type=${st}`);
  };

  return (
    <Container>
      <Form>
        <TitleSection>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <InfoText>
            아직 에어컨이 없으시다면 걱정 마세요!
            <br /> 기사님이 직접 공간과 환경을 확인한 뒤, <br /> 가장 적합한
            제품을 추천해드립니다
          </InfoText>
        </TitleSection>

        <DropdownContainer>
          <DropdownHeader onClick={() => setIsDropdownOpen((prev) => !prev)}>
            <DropdownLabelBox>
              <MdOutlineComment size={23} />
              <DropdownLabel>
                {selectedOption || "에어컨 옵션 선택하기"}
              </DropdownLabel>
            </DropdownLabelBox>
            {isDropdownOpen ? (
              <HiOutlineChevronUp size={25} />
            ) : (
              <HiOutlineChevronDown size={25} />
            )}
          </DropdownHeader>

          {isDropdownOpen && (
            <DropdownContent>
              {options.map((option, index) => (
                <OptionBox
                  key={index}
                  $isSelected={selectedOption === option}
                  onClick={() => setSelectedOption(option)}
                  $width={boxWidths[index] || "45%"}
                >
                  {option}
                </OptionBox>
              ))}
            </DropdownContent>
          )}
        </DropdownContainer>
        <Button
          type="submit"
          fullWidth="true"
          size="lg"
          style={{ marginTop: 20, marginBottom: 24 }}
          onClick={handleSubmit}
        >
          다음으로
        </Button>
      </Form>
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
const Container = styled.section``;
const TitleSection = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 3px;
`;

const Description = styled.p``;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DropdownContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  border: 2px solid #e3e3e3;
  border-radius: 8px;
`;

const DropdownHeader = styled.div`
  padding: 25px 20px 5px 20px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const DropdownLabel = styled.div`
  color: ${({ theme }) => theme.colors.text};
`;

const DropdownLabelBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const DropdownContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px 20px 30px 20px;
  gap: 10px;
  justify-content: center;
`;

const OptionBox = styled.div`
  width: ${({ $width }) => $width};
  padding: 8px;
  border: 1.5px solid #ebebeb;
  border-radius: 20px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#0080FF" : "#ffffff"};
  color: ${({ $isSelected }) => ($isSelected ? "white" : "#333")};
  cursor: pointer;
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.text};
  margin-top: 10px;
`;
export default AirconditionerForm;
