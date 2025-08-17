import React from "react";
import styled from "styled-components";
import RequestSearch from "../../components/search/RequestSearch";
import NavHeader from "../../components/common/Header/NavHeader";

const RequestSearchPage = () => {
  return (
    <Container>
      <NavHeader to="/" />
      <RequestSearch />
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
`;
export default RequestSearchPage;
