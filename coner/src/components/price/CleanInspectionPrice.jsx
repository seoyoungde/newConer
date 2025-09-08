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

const BasicTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;

  th {
    background: linear-gradient(135deg, #4b83ff 0%, #4b83ff 100%);
    color: white;
    padding: 10px;
    text-align: center;
    font-weight: 700;
    font-size: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  td {
    padding: 8px 10px;
    text-align: center;
    border: 1px solid #e2e8f0;
    vertical-align: middle;
    font-size: 0.7rem;
  }

  .category {
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
    font-weight: 700;
    color: #334155;
    text-align: center;
  }

  .service-name {
    font-weight: 600;
    color: #1e293b;
  }

  .price {
    font-weight: 700;
    color: #333 !important;
  }

  .special-price {
    color: #333 !important;
    font-weight: 800;
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

const CleanInspectionPrice = () => {
  return (
    <Container>
      <PricingContainer>
        <BasicTable>
          <thead>
            <tr>
              <th style={{ width: "20%" }}>구분</th>
              <th style={{ width: "30%" }}>항목</th>

              <th style={{ width: "25%" }}>예상 비용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="5" className="category">
                청소 / 점검
              </td>
              <td className="service-name">벽걸이형</td>

              <td className="price">30,000원~</td>
            </tr>
            <tr>
              <td className="service-name">스탠드형</td>

              <td className="price">30,000원~</td>
            </tr>
            <tr>
              <td className="service-name">투인원</td>

              <td className="price">50,000원~</td>
            </tr>
            <tr>
              <td className="service-name">천장형</td>

              <td className="price">70,000원~</td>
            </tr>
            <tr>
              <td className="service-name">추가옵션 → 약품청소/분해약품청소</td>

              <td className="special-price">100,000 / 250,000원</td>
            </tr>
          </tbody>
        </BasicTable>
      </PricingContainer>
    </Container>
  );
};

export default CleanInspectionPrice;
