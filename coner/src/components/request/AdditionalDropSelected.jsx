import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import { MdOutlineComment } from "react-icons/md";

const AdditionalDropSelected = ({
  options,
  placeholderText = "옵션 선택하기",
  boxPerRow = 2,
  isMultiSelect = false,
  onSelect,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const handleOptionClick = useCallback(
    (option) => {
      if (isMultiSelect) {
        setSelectedOptions((prev) =>
          prev.includes(option)
            ? prev.filter((item) => item !== option)
            : [...prev, option]
        );
      } else {
        setSelectedOption(option);
      }
    },
    [isMultiSelect]
  );

  useEffect(() => {
    if (!onSelect) return;
    if (isMultiSelect) {
      onSelect(selectedOptions.join(", "));
    } else if (selectedOption) {
      onSelect(selectedOption);
    }
  }, [isMultiSelect, selectedOptions, selectedOption, onSelect]);

  return (
    <Form>
      <DropdownContainer>
        <DropdownHeader onClick={() => setIsDropdownOpen((prev) => !prev)}>
          <DropdownLabelBox>
            <CommentIcon>
              <MdOutlineComment size={23} />
            </CommentIcon>
            <DropdownLabel>
              {isMultiSelect
                ? selectedOptions.join(", ") || placeholderText
                : selectedOption || placeholderText}
            </DropdownLabel>
          </DropdownLabelBox>
          <DropdownIcon>
            {isDropdownOpen ? (
              <HiOutlineChevronUp size={25} color="#333" />
            ) : (
              <HiOutlineChevronDown size={25} color="#333" />
            )}
          </DropdownIcon>
        </DropdownHeader>
        {isDropdownOpen && (
          <DropdownContent $boxPerRow={boxPerRow}>
            {options.map((option, index) => (
              <OptionBox
                key={index}
                $isSelected={
                  isMultiSelect
                    ? selectedOptions.includes(option)
                    : selectedOption === option
                }
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </OptionBox>
            ))}
          </DropdownContent>
        )}
      </DropdownContainer>
    </Form>
  );
};

export default AdditionalDropSelected;

const Form = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropdownContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  border: 1.5px solid #e3e3e3;
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.bg};
`;
const CommentIcon = styled(MdOutlineComment)``;
const DropdownHeader = styled.div`
  padding: 25px 20px 5px 20px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const DropdownLabelBox = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 7px;
  margin-bottom: 10px;
`;

const DropdownLabel = styled.div`
  color: ${({ theme }) => theme.colors.text};
  margin-left: 10px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const DropdownIcon = styled.div`
  color: #a0a0a0;
`;

const DropdownContent = styled.div`
  display: grid;
  grid-template-columns: repeat(
    ${({ $boxPerRow = 2 }) => $boxPerRow},
    minmax(0, 1fr)
  );
  gap: 10px;
  padding: 12px;
  margin-bottom: 10px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;
const OptionBox = styled.button`
  all: unset;
  display: block;
  padding: 7px;
  width: ${({ width }) => width};
  border-radius: 20px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-align: center;
  border: 1px solid #d6d6d6;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : "white"};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? "#fff" : theme.colors.text};
  cursor: pointer;
  white-space: normal;
  word-break: keep-all;
`;
