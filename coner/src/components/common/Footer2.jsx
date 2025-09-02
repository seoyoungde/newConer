import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  border-top: 1px solid #e5e5e5;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-top: 5px;
`;

const FooterInner = styled.div`
  margin: 0 auto;
`;

const Footer2 = () => {
  return (
    <FooterContainer>
      <FooterInner>
        <p>
          (주)코너플랫폼 | 서울시 중랑구 겸재로 10가길 28, 1층 | 대표 : 서진형 |
          사업자등록번호 : 527-86-03637
        </p>
        <p>전화번호 : 010-5543-0636</p>
        {/* <p>
          (주)크몽은 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품,
          상품정보, 거래에 관한 의무와 책임은 판매회원에게 있습니다.
        </p>
        <p>
          (주)크몽 사이트의 상품/전문가/이벤트 정보, 디자인 및 화면의 구성, UI
          등의 무단복제, 배포, 방송 또는 전송, 스크래핑 등의 행위는 저작권법,
          콘텐츠산업 진흥법 등 관련법령에 의하여 엄격히 금지됩니다. [안내 보기]
        </p>
        <p style={{ marginTop: "12px", fontWeight: "500" }}>
          Copyright © 2025 kmong Inc. All rights reserved.
        </p> */}
      </FooterInner>
    </FooterContainer>
  );
};

export default Footer2;
