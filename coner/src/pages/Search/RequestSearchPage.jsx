import React from "react";
import styled from "styled-components";
import RequestSearch from "../../components/search/RequestSearch";
import RequestHeader from "../../components/common/Header/RequestHeader";

const RequestSearchPage = () => {
  return (
    <Container>
      <RequestHeader showPrevButton={false} userName="의뢰서 조회" to="/" />

      <RequestSearch />
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
`;

export default RequestSearchPage;
