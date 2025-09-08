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

const RepairPrice = () => {
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
              <td rowSpan="4" className="category">
                수리
              </td>
              <td className="service-name">냉매가스충전</td>

              <td className="price">40,000~120,000원</td>
            </tr>
            <tr>
              <td className="service-name">배수막힘수리</td>

              <td className="price">30,000~80,000원</td>
            </tr>
            <tr>
              <td className="service-name">실외기 팬/모터교체</td>

              <td className="price">80,000~250,000원</td>
            </tr>
            <tr>
              <td className="service-name">리모컨 오류/교체</td>

              <td className="price">20,000~50,000원</td>
            </tr>
          </tbody>
        </BasicTable>
      </PricingContainer>
    </Container>
  );
};

export default RepairPrice;
