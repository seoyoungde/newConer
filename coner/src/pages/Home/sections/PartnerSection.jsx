import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import 청우냉열 from "../../../assets/partnerimages/청우냉열.jpg";
import 에스디에어시스템 from "../../../assets/partnerimages/에스디에어시스템.jpg";
import 예은공조 from "../../../assets/partnerimages/예은공조.jpg";
import 이룸에어컨 from "../../../assets/partnerimages/이룸에어컨.jpg";
import 쿨가이 from "../../../assets/partnerimages/쿨가이.jpg";
import 스마트공조시스템 from "../../../assets/partnerimages/스마트공조시스템.jpg";
import 이원공조 from "../../../assets/partnerimages/이원공조.jpeg";
import 깔끔히홈케어 from "../../../assets/partnerimages/깔끔히홈케어.jpg";
import 수공조시스템 from "../../../assets/partnerimages/수공조시스템.jpeg";

import 윤스클린 from "../../../assets/partnerimages/윤스클린.jpeg";
import 배가공조 from "../../../assets/partnerimages/배가공조.jpeg";

import 더원공조시스템 from "../../../assets/partnerimages/더원공조시스템.jpeg";

import 이공홈케어 from "../../../assets/partnerimages/이공홈케어.jpg";

import 에어컨마트 from "../../../assets/partnerimages/에어컨마트.png";

import 라이트홈케어 from "../../../assets/partnerimages/라이트홈케어.jpeg";

const partnerImages = {
  partner_IRoQdhzbK6dqvxME2xLh: 청우냉열,
  partner_qCpXWRHg5BhzemDgZ59y: 에스디에어시스템,
  partner_jNWEwUFfuiTLmfHilNpP: 예은공조,
  partner_DJzycy4MlxD98rzaiQ8M: 이룸에어컨,
  partner_IOPG8XV80Z8VKT95LzgW: 쿨가이,
  partner_H6iMH3sxiHdtD59wrbMm: 스마트공조시스템,
  partner_2t7WiRLVHXJdNYnxPSPy: 이원공조,
  partner_4jG7dd2lAoi7k0nOlckT: 깔끔히홈케어,
  partner_EuIvYioQRQYSGMyCosjk: 수공조시스템,

  partner_2FEIdZelpWqhiNUO903i: 배가공조,
  partner_hJvrg2kVztKRbSci5vGr: 윤스클린,

  partner_K6VQGBB9AVsSp20mwDO7: 더원공조시스템,

  partner_nIHj5ApFSz3OPlK5F5sY: 이공홈케어,

  partner_pFIBZ3K2I3tJW66jbuWH: 에어컨마트,

  partner_zTNGOBnrQrRxEzomFLdp: 라이트홈케어,
};

// 서울 전체 25개 구
const SEOUL_ALL_DISTRICTS = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

// 서울 강북지역 10개 구
const SEOUL_GANGBUK_DISTRICTS = [
  "강북구",
  "광진구",
  "노원구",
  "도봉구",
  "동대문구",
  "마포구",
  "성북구",
  "은평구",
  "종로구",
  "중랑구",
];

const getAreaDisplayText = (areaArray) => {
  if (!areaArray || areaArray.length === 0) return "";

  // 서울 전지역인지 확인 (25개 구 모두 포함)
  const hasAllSeoulDistricts = SEOUL_ALL_DISTRICTS.every((district) =>
    areaArray.includes(district)
  );

  if (hasAllSeoulDistricts) {
    return "서울전지역";
  }

  // 서울 강북지역인지 확인 (강북 10개 구만 포함)
  const hasAllGangbukDistricts = SEOUL_GANGBUK_DISTRICTS.every((district) =>
    areaArray.includes(district)
  );
  const hasOnlyGangbukDistricts = areaArray.every((district) =>
    SEOUL_GANGBUK_DISTRICTS.includes(district)
  );

  if (
    hasAllGangbukDistricts &&
    hasOnlyGangbukDistricts &&
    areaArray.length === 10
  ) {
    return "서울강북지역";
  }

  // 그 외의 경우 첫 번째 지역 표시
  return areaArray[0];
};

const PartnerSection = () => {
  const [technicians, setTechnicians] = useState([]);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const partnerSnapshot = await getDocs(collection(db, "Partner"));

        const OUR_STAFF_PARTNER_ID = "pozMcVxtmmsXvtMLaItJ";

        const partners = partnerSnapshot.docs
          .map((doc) => {
            const partner = doc.data();

            return {
              id: doc.id,
              name: partner.name,
              partner_id: partner.partner_id,
              career: partner.career,
              address: partner.address,
              logo_image_url: partner.logo_image_url,
              area: partner.area || [],
              count: partner.completed_request_count || 0,
              status: partner.status,
            };
          })
          .filter(
            (p) => p.partner_id !== OUR_STAFF_PARTNER_ID && p.status === 2
          );

        const sortedByCount = partners.sort((a, b) => b.count - a.count);
        const selected = sortedByCount.slice(0, 20);

        setTechnicians(selected);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHasMoved(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    setTimeout(() => setHasMoved(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;

    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <PartnerSelectContainer>
      <TitleBox>
        <Title>내게 맞는 전문가 바로 예약</Title>
        <MoreLink to="/sticker">+더보기</MoreLink>
      </TitleBox>
      <ScrollContainer
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        $isDragging={isDragging}
      >
        {technicians.map((tech) => (
          <Card
            key={tech.id}
            onClick={(e) => {
              if (hasMoved) {
                e.preventDefault();
                return;
              }
              navigate(`/partner/step0/${tech.id}`, {
                state: {
                  flowType: "fromTechnician",
                  selectedTechnician: tech,
                },
              });
            }}
            $isDragging={isDragging}
          >
            <CardImage
              src={
                partnerImages[`partner_${tech.id}`] ||
                partnerImages[`partner_${tech.partner_id}`] ||
                "/default-profile.png"
              }
              alt={tech.name}
              loading="lazy"
              decoding="async"
            />
            <CardOverlay />

            <CardContent>
              <BottomInfo>
                <CareerBadge>
                  <CheckIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2417 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2417 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 7.21207 13.8448 6.43185 13.5433 5.7039C13.2417 4.97595 12.7998 4.31451 12.2426 3.75736C11.6855 3.20021 11.0241 2.75825 10.2961 2.45672C9.56815 2.15519 8.78793 2 8 2C6.4087 2 4.88258 2.63214 3.75736 3.75736C2.63214 4.88258 2 6.4087 2 8C2 9.5913 2.63214 11.1174 3.75736 12.2426C4.88258 13.3679 6.4087 14 8 14ZM7.84533 10.4267L11.1787 6.42667L10.1547 5.57333L7.288 9.01267L5.80467 7.52867L4.862 8.47133L6.862 10.4713L7.378 10.9873L7.84533 10.4267Z"
                        fill="#5B8EFF"
                      />
                    </svg>
                  </CheckIcon>
                  <CareerText>{tech.career}년 이상</CareerText>
                </CareerBadge>

                <PartnerName>{tech.name}</PartnerName>
                <AreaTags>
                  <AreaTag>#{getAreaDisplayText(tech.area)}</AreaTag>
                </AreaTags>
              </BottomInfo>
            </CardContent>
          </Card>
        ))}
      </ScrollContainer>
    </PartnerSelectContainer>
  );
};

export default PartnerSection;

const PartnerSelectContainer = styled.section`
  margin-bottom: 60px;
  width: 100%;
`;
const TitleBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text || "#000"};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;
const MoreLink = styled(Link)`
  color: black;
  line-height: 35px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 14px;
  }
`;
const ScrollContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;

  /* 스크롤바 숨기기 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
    cursor: default;
  }
`;

const Card = styled.div`
  position: relative;
  min-width: 161px;
  height: 264px;
  border-radius: 16px;
  overflow: hidden;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "pointer")};
  transition: transform 0.2s ease;

  &:hover {
    transform: ${({ $isDragging }) => ($isDragging ? "none" : "scale(1.02)")};
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    min-width: 171px;
    height: 264px;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
`;

const CardContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
`;

const BottomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CareerBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

const CareerText = styled.span`
  color: #5b8eff;
  font-size: 13px;
  font-weight: bold;
`;

const PartnerName = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const AreaTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const AreaTag = styled.span`
  color: white;
  font-size: 10px;
  font-weight: bold;
`;
