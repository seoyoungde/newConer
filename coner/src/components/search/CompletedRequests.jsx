import React, { memo } from "react";
import styled from "styled-components";

const CompletedRequests = ({ requestData }) => {
  if (!requestData) {
    return <CenteredContent>완료된 의뢰가 없습니다.</CenteredContent>;
  }

  return (
    <RequestCard>
      <RequestHeader>
        <DateText>{requestData.completed_at || "날짜 없음"}</DateText>
        <TechnicianText>
          {requestData.engineer_name || "기사님 없음"}
        </TechnicianText>
      </RequestHeader>
      <RequestDetails>
        <TagContainer>
          <CategoryTag>{requestData.service_type || "서비스 없음"}</CategoryTag>
          <ServiceTag>
            {requestData.aircon_type || "에어컨 종류 없음"}
          </ServiceTag>
        </TagContainer>
        <AddressText>{requestData.customer_address || "주소 없음"}</AddressText>
      </RequestDetails>
    </RequestCard>
  );
};

const CenteredContent = styled.div``;

const RequestCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 10px;
`;

const RequestHeader = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 18px;
`;

const DateText = styled.div`
  font-size: 14px;
  color: #a0a0a0;
`;

const TechnicianText = styled.div`
  font-size: 14px;
  color: #a0a0a0;
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: row;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const CategoryTag = styled.div`
  font-size: 12px;
  background-color: #0080ff;
  color: white;
  border-radius: 20px;
  padding: 5px 10px;
  font-weight: bold;
`;

const ServiceTag = styled.div`
  font-size: 12px;
  background-color: #d9d9d9;
  color: white;
  border-radius: 20px;
  padding: 5px 10px;
  font-weight: bold;
`;

const AddressText = styled.div`
  font-size: 14px;
  color: #333;
  padding: 5px 10px;
`;

export default memo(CompletedRequests);
