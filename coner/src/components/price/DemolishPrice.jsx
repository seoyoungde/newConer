import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  padding-bottom: 30px;
  color: #333;
`;

const PricingContainer = styled.div`
  background: white;
`;

const DetailedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.65rem;

  th {
    background: linear-gradient(135deg, #4b83ff 0%, #4b83ff 100%);
    color: white;
    padding: 8px 5px;
    text-align: center;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.75rem;
  }

  td {
    padding: 5px;
    text-align: center;
    border: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  .category {
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
    font-weight: 700;
    color: #334155;
    text-align: left;
    padding-left: 12px;
  }

  .subcategory {
    background: #f8fafc;
    font-weight: 600;
    color: #475569;
    text-align: left;
    padding-left: 20px;
  }

  .price {
    font-weight: 600;
    color: #0078d7;
  }

  .consultation {
    color: #dc2626;
    font-weight: 600;
    font-style: italic;
    font-size: 0.6rem;
  }

  tr:hover {
    background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  }

  @media (max-width: 768px) {
    font-size: 0.6rem;

    th,
    td {
      padding: 4px 2px;
    }
  }
`;

const DemolishPrice = () => {
  return (
    <Container>
      <PricingContainer>
        <DetailedTable>
          <thead>
            <tr>
              <th style={{ width: "20%" }}>구분</th>
              <th style={{ width: "20%" }}>항목</th>
              <th style={{ width: "20%" }}>세부구분</th>
              <th style={{ width: "13%" }}>일반</th>
              <th style={{ width: "13%" }}>중대형</th>
              <th style={{ width: "14%" }}>시스템</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="3" className="category">
                사용중인 제품 철거
              </td>
              <td className="subcategory">벽걸이형</td>
              <td>벽걸이형</td>
              <td className="price">20,000</td>
              <td className="price">20,000</td>
              <td className="price">40,000</td>
            </tr>
            <tr>
              <td className="subcategory">시스템에어컨</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td className="price">100,000</td>
            </tr>
            <tr>
              <td className="subcategory">스탠드형</td>
              <td>스탠드형</td>
              <td className="price">40,000</td>
              <td className="price">40,000</td>
              <td className="price">20,000</td>
            </tr>
          </tbody>
        </DetailedTable>
      </PricingContainer>
    </Container>
  );
};

export default DemolishPrice;
