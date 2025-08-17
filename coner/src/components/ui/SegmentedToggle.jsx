import React from "react";
import styled from "styled-components";

export default function SegmentedToggle({ value, onChange, options }) {
  return (
    <Group role="tablist" aria-label="옵션 선택">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Item
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            $active={active}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
          </Item>
        );
      })}
    </Group>
  );
}

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Item = styled.button`
  padding: 10px 0;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ $active }) => ($active ? "#e8f0ff" : "#f2f2f2")};
  border: 1px solid ${({ $active }) => ($active ? "#80BFFF" : "#f9f9f9")};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
