import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import PartnerAddressContactForm from "../../components/request/PartnerAddressContactForm";
import NavHeader from "../../components/common/Header/NavHeader";

const PartnerStep3Page = () => {
  const { partnerId } = useParams();
  return (
    <Container>
      <NavHeader to={`/partner/step2/${partnerId}`} />
      <PartnerAddressContactForm
        title={`연락받으실 정보 입력`}
        description="기사님께 제공할 주소와 연락처를 입력해주세요."
        buttonText="제출하기"
      />
    </Container>
  );
};

const Container = styled.div``;
export default PartnerStep3Page;
