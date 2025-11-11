import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  padding-bottom: 30px;
  min-height: 100vh;
  color: #333;
  width: 100%;
  padding: 36px 24px 24px 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: #0078d7;
`;

const Title = styled.h1`
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: #334155;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  color: #64748b;
`;

const PricingContainer = styled.div`
  background: white;
`;

const TabsHeader = styled.div`
  display: flex;
  background: linear-gradient(135deg, #4b83ff 0%, #4b83ff 100%);
  border-radius: 6px 6px 0px 0px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  color: ${(props) => (props.$active ? "white" : "rgba(255,255,255,0.8)")};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  background: ${(props) => (props.$active ? "rgba(255,255,255,0.1)" : "none")};

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const TabContent = styled.div`
  display: ${(props) => (props.$active ? "block" : "none")};
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
  ㅌ @media (max-width: 768px) {
    font-size: 0.6rem;

    th,
    td {
      padding: 4px 2px;
    }
  }
`;

const ContactBanner = styled.div`
  background: linear-gradient(135deg, #4b83ff 0%, #4b83ff 100%);
  color: white;
  padding: 18px;
  text-align: center;
  border-radius: 0px 0px 6px 6px;

  h3 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  p {
    opacity: 0.9;
    margin-bottom: 15px;
    font-size: 0.8rem;
  }
`;

const PricingTable = () => {
  const [activeTab, setActiveTab] = useState(0);

  const switchTab = (index) => {
    setActiveTab(index);
  };

  return (
    <Container>
      <Header>
        <Title>코너 서비스 가격표</Title>
        <Subtitle>
          전문적이고 신뢰할 수 있는 서비스를 합리적인 가격으로
        </Subtitle>
        <Subtitle>
          * 추가비용이 발생할 수 있으니 정확한 가격은 견적문의를 통해
          신청해주시기 바랍니다
        </Subtitle>
      </Header>

      <PricingContainer>
        <TabsHeader>
          <TabButton $active={activeTab === 0} onClick={() => switchTab(0)}>
            기본 서비스
          </TabButton>
          <TabButton $active={activeTab === 1} onClick={() => switchTab(1)}>
            상세 서비스
          </TabButton>
        </TabsHeader>

        <TabContent $active={activeTab === 0}>
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
                <td className="service-name">
                  추가옵션 → 약품청소/분해약품청소
                </td>

                <td className="special-price">100,000 / 250,000원</td>
              </tr>

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

              <tr>
                <td rowSpan="4" className="category">
                  설치 / 이전설치
                </td>
                <td className="service-name">벽걸이형</td>

                <td className="price">150,000원</td>
              </tr>
              <tr>
                <td className="service-name">스탠드형</td>

                <td className="price">200,000원</td>
              </tr>
              <tr>
                <td className="service-name">투인원</td>

                <td className="price">350,000원</td>
              </tr>
              <tr>
                <td className="service-name">천장형시스템</td>
                <td className="price">500,000원</td>
              </tr>
            </tbody>
          </BasicTable>
        </TabContent>

        <TabContent $active={activeTab === 1}>
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
                <td rowSpan="8" className="category">
                  설치대 앵글 설치
                </td>
                <td rowSpan="4" className="subcategory">
                  알루미늄
                </td>
                <td>32.5㎡ 이하 8.3kw 이하</td>
                <td className="price">110,000</td>
                <td className="price">130,000</td>
                <td>-</td>
              </tr>
              <tr>
                <td>100.0㎡ 미만 8.3kw 초과</td>
                <td className="price">130,000</td>
                <td className="consultation">견적후 협의</td>
                <td>-</td>
              </tr>
              <tr>
                <td>100.0㎡ 이상</td>
                <td className="consultation">견적후 협의</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td rowSpan="2" className="subcategory">
                  스텐
                </td>
                <td>kw</td>
                <td className="price">180,000</td>
                <td className="price">180,000</td>
                <td>-</td>
              </tr>
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td rowSpan="2" className="subcategory">
                  철재
                </td>
                <td>1단</td>
                <td>-</td>
                <td>-</td>
                <td className="price">50,000</td>
              </tr>
              <tr>
                <td>2단</td>
                <td>-</td>
                <td>-</td>
                <td className="price">130,000</td>
              </tr>
              <tr>
                <td rowSpan="2" className="category">
                  설치대 內 설외기 설치/철거
                </td>
                <td className="subcategory">설치</td>
                <td>-</td>
                <td className="price">30,000</td>
                <td className="price">30,000</td>
                <td className="price">30,000</td>
              </tr>
              <tr>
                <td className="subcategory">철거</td>
                <td>-</td>
                <td className="price">10,000</td>
                <td className="price">10,000</td>
                <td className="price">10,000</td>
              </tr>

              <tr>
                <td rowSpan="2" className="category">
                  실외기 실내 받침대
                </td>
                <td rowSpan="2" className="subcategory">
                  -
                </td>
                <td>1단</td>
                <td className="price">50,000</td>
                <td className="consultation">견적후 협의</td>
                <td className="price">50,000</td>
              </tr>
              <tr>
                <td>2단</td>
                <td className="price">130,000</td>
                <td>-</td>
                <td className="price">130,000</td>
              </tr>

              <tr>
                <td className="category">설외기 고정</td>
                <td>-</td>
                <td>-</td>
                <td className="price">5,000</td>
                <td className="price">5,000</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">설외기바람막이설치</td>
                <td>-</td>
                <td>-</td>
                <td className="price">40,000</td>
                <td className="price">40,000</td>
                <td className="price">40,000</td>
              </tr>

              <tr>
                <td rowSpan="7" className="category">
                  배관추가
                </td>
                <td rowSpan="4" className="subcategory">
                  동
                </td>
                <td>32.5㎡ 이하 6.0kw 이하</td>
                <td className="price">19,000</td>
                <td className="price">22,000</td>
                <td>-</td>
              </tr>
              <tr>
                <td>100.0㎡ 미만 7.2kw</td>
                <td className="price">22,000</td>
                <td className="price">24,000</td>
                <td>-</td>
              </tr>
              <tr>
                <td>100.0㎡ 이상 8.3~14.5kw</td>
                <td className="price">27,000</td>
                <td className="price">26,000</td>
                <td className="price">20,000</td>
              </tr>
              <tr>
                <td>159.1㎡ 이상 21.0kw</td>
                <td className="consultation">견적후 협의</td>
                <td className="consultation">견적후 협의</td>
                <td className="price">26,000</td>
              </tr>

              <tr>
                <td rowSpan="2" className="subcategory">
                  알루미늄
                </td>
                <td>159.1㎡ 이상</td>
                <td className="price">13,000</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>159.1㎡ 이상</td>
                <td className="price">15,000</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td className="subcategory">특수</td>
                <td>주름배관</td>
                <td className="price">24,000</td>
                <td>-</td>
                <td className="price">24,000</td>
              </tr>

              <tr>
                <td rowSpan="2" className="category">
                  배관 용접
                </td>
                <td rowSpan="2" className="subcategory">
                  -
                </td>
                <td>14.5kw 이하</td>
                <td className="price">3,000</td>
                <td className="price">3,000</td>
                <td className="price">3,000</td>
              </tr>
              <tr>
                <td>21.0kw 이상</td>
                <td>-</td>
                <td className="consultation">견적후 협의</td>
                <td>-</td>
              </tr>

              <tr>
                <td rowSpan="2" className="category">
                  선매립 배관세척 작업
                </td>
                <td className="subcategory">홈멀티</td>
                <td>-</td>
                <td className="price">100,000</td>
                <td className="price">100,000</td>
                <td>-</td>
              </tr>
              <tr>
                <td className="subcategory">단품</td>
                <td>-</td>
                <td className="price">50,000</td>
                <td className="price">50,000</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">선배관</td>
                <td className="subcategory">선배관작업</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="price">100,000</td>
              </tr>

              <tr>
                <td rowSpan="5" className="category">
                  배수펌프
                </td>
                <td rowSpan="3" className="subcategory">
                  일반
                </td>
                <td>4m~6m</td>
                <td className="price">70,000</td>
                <td className="price">70,000</td>
                <td className="price">70,000</td>
              </tr>
              <tr>
                <td>8m~10m</td>
                <td className="price">100,000</td>
                <td className="price">100,000</td>
                <td className="price">100,000</td>
              </tr>
              <tr>
                <td>12m~15m</td>
                <td className="price">130,000</td>
                <td className="price">130,000</td>
                <td className="price">130,000</td>
              </tr>
              <tr>
                <td rowSpan="2" className="subcategory">
                  무소음
                </td>
                <td>6m</td>
                <td className="price">80,000</td>
                <td className="price">80,000</td>
                <td className="price">80,000</td>
              </tr>
              <tr>
                <td>8m~10m</td>
                <td className="price">110,000</td>
                <td className="price">110,000</td>
                <td className="price">110,000</td>
              </tr>

              <tr>
                <td className="category">소음 저감 Kit</td>
                <td>-</td>
                <td>-</td>
                <td className="price">18,000</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">단내림 Kit</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="price">100,000</td>
              </tr>

              <tr>
                <td className="category">설외수 배수 Kit</td>
                <td>-</td>
                <td>-</td>
                <td className="price">14,000</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">제어기</td>
                <td className="subcategory">wifi</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="price">100,000</td>
              </tr>

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

              <tr>
                <td rowSpan="2" className="category">
                  냉매가스 주입
                </td>
                <td className="subcategory">R-410</td>
                <td>0.1kg 당</td>
                <td className="price">2,200</td>
                <td className="price">2,200</td>
                <td className="price">2,200</td>
              </tr>
              <tr>
                <td className="subcategory">R-32</td>
                <td>0.1kg 당</td>
                <td className="price">4,000</td>
                <td className="price">4,000</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">몰딩 추가</td>
                <td>-</td>
                <td>-</td>
                <td className="consultation">실비</td>
                <td className="consultation">실비</td>
                <td>-</td>
              </tr>

              <tr>
                <td rowSpan="2" className="category">
                  드레인호스추가
                </td>
                <td className="subcategory">일반</td>
                <td>-</td>
                <td className="price">4,000</td>
                <td className="price">4,000</td>
                <td className="price">5,000</td>
              </tr>
              <tr>
                <td className="subcategory">선배관</td>
                <td>-</td>
                <td className="price">4,000</td>
                <td className="price">4,000</td>
                <td>-</td>
              </tr>

              <tr>
                <td rowSpan="3" className="category">
                  전원선
                </td>
                <td>-</td>
                <td>25sq이하</td>
                <td className="price">6,000</td>
                <td className="price">6,000</td>
                <td className="price">6,000</td>
              </tr>
              <tr>
                <td>-</td>
                <td>4sq</td>
                <td>-</td>
                <td className="price">10,000</td>
                <td className="price">10,000</td>
              </tr>
              <tr>
                <td>-</td>
                <td>6sq</td>
                <td>-</td>
                <td className="price">11,000</td>
                <td className="price">11,000</td>
              </tr>

              <tr>
                <td className="category">스마트링크</td>
                <td>-</td>
                <td>-</td>
                <td className="price">4,000</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">에어가이드</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td className="price">150,000</td>
              </tr>

              <tr>
                <td className="category">유니온</td>
                <td>-</td>
                <td>-</td>
                <td className="price">12,000</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">점검구</td>
                <td>-</td>
                <td>-</td>
                <td className="price">40,000</td>
                <td>-</td>
                <td>-</td>
              </tr>

              <tr>
                <td className="category">천공(타공)</td>
                <td>-</td>
                <td>-</td>
                <td className="price">15,000</td>
                <td className="price">15,000</td>
                <td className="price">15,000</td>
              </tr>

              <tr>
                <td className="category">사다리차 사용</td>
                <td>-</td>
                <td>-</td>
                <td className="consultation">제품운반 무상</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </DetailedTable>
        </TabContent>

        <ContactBanner></ContactBanner>
      </PricingContainer>
    </Container>
  );
};

export default PricingTable;
