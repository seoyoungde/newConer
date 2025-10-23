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
  padding: 14px 0;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ $active }) => ($active ? "#004FFF" : "white")};
  border: 1px solid #f2f3f6;
  color: ${({ $active }) => ($active ? "#white" : "#a0a0a0")};
  cursor: pointer;

  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
