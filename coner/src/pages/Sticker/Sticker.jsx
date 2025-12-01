import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import LogoHeader from "../../components/common/Header/LogoHeader";
import RequestHeader from "../../components/common/Header/RequestHeader";

import 청우냉열 from "../../assets/partnerimages/청우냉열.jpg";
import 에스디에어시스템 from "../../assets/partnerimages/에스디에어시스템.jpg";
import 예은공조 from "../../assets/partnerimages/예은공조.jpg";
import 이룸에어컨 from "../../assets/partnerimages/이룸에어컨.jpg";
import 쿨가이 from "../../assets/partnerimages/쿨가이.jpg";
import 스마트공조시스템 from "../../assets/partnerimages/스마트공조시스템.jpg";
import 이원공조 from "../../assets/partnerimages/이원공조.jpeg";
import 깔끔히홈케어 from "../../assets/partnerimages/깔끔히홈케어.jpg";
import 수공조시스템 from "../../assets/partnerimages/수공조시스템.jpeg";

import 배가공조 from "../../assets/partnerimages/배가공조.jpeg";
import 윤스클린 from "../../assets/partnerimages/윤스클린.jpeg";

import 더원공조시스템 from "../../assets/partnerimages/더원공조시스템.jpeg";

import 이공홈케어 from "../../assets/partnerimages/이공홈케어.jpg";

import 에어컨마트 from "../../assets/partnerimages/에어컨마트.png";

import 라이트홈케어 from "../../assets/partnerimages/라이트홈케어.jpeg";

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

const SERVICE_TYPES = [
  "전체",
  "냉매충전",
  "보유기기 설치",
  "설치 및 구매",
  "수리",
  "청소",
  "이전설치",
];

const Sticker = () => {
  const [technicians, setTechnicians] = useState([]);
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("전체");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const serviceScrollRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // 서비스 필터 드래그 관련 state
  const [isServiceDragging, setIsServiceDragging] = useState(false);
  const [serviceStartX, setServiceStartX] = useState(0);
  const [serviceScrollLeft, setServiceScrollLeft] = useState(0);
  const [serviceHasMoved, setServiceHasMoved] = useState(false);

  useEffect(() => {
    const source = searchParams.get("source");

    if (source) {
      sessionStorage.setItem("requestSource", source);
    } else {
      sessionStorage.removeItem("requestSource");
    }
  }, [searchParams]);

  const gangbukDistricts = [
    "강북구",
    "광진구",
    "노원구",
    "도봉구",
    "동대문구",
    "성북구",
    "은평구",
    "종로구",
    "중랑구",
  ];

  const gangnamDistricts = [
    "강남구",
    "강동구",
    "강서구",
    "관악구",
    "구로구",
    "금천구",
    "동작구",
    "서초구",
    "송파구",
    "양천구",
    "영등포구",
  ];

  // 서울 전체 25개 구
  const allSeoulDistricts = [
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

  // area 배열을 표시용 지역명으로 변환하는 함수
  const getDisplayArea = (areaArray) => {
    if (!areaArray || areaArray.length === 0) return [];

    // 서울 전체 25개 구 체크
    const hasAllSeoul = allSeoulDistricts.every((district) =>
      areaArray.includes(district)
    );

    if (hasAllSeoul) {
      return ["서울전지역"];
    }

    // 강북 지역 체크
    const hasAllGangbuk = gangbukDistricts.every((district) =>
      areaArray.includes(district)
    );

    if (hasAllGangbuk) {
      return ["서울강북지역"];
    }

    // 강남 지역 체크
    const hasAllGangnam = gangnamDistricts.every((district) =>
      areaArray.includes(district)
    );

    if (hasAllGangnam) {
      return ["서울강남지역"];
    }

    // 일부 서울 구만 포함된 경우 - 그대로 반환
    const seoulDistricts = areaArray.filter((area) =>
      allSeoulDistricts.includes(area)
    );

    if (seoulDistricts.length > 0) {
      return seoulDistricts;
    }

    // 서울이 아닌 다른 지역
    return areaArray;
  };

  // 지역 확장/축소 토글 함수
  const toggleAreaExpansion = (e, techId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(techId)) {
        newSet.delete(techId);
      } else {
        newSet.add(techId);
      }
      return newSet;
    });
  };

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
              service_type: partner.service_type || [],
            };
          })
          .filter(
            (p) => p.partner_id !== OUR_STAFF_PARTNER_ID && p.status === 2
          );

        const sortedByCount = partners.sort((a, b) => b.count - a.count);

        setAllTechnicians(sortedByCount);

        const selected = sortedByCount.slice(0, 15);
        setTechnicians(selected);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  useEffect(() => {
    let filteredList = [...allTechnicians];

    // 검색어 필터링
    if (searchQuery.trim()) {
      filteredList = filteredList.filter((tech) =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 서비스 종류 필터링
    if (selectedService !== "전체") {
      filteredList = filteredList.filter((tech) => {
        // service_type 배열에 선택된 서비스가 포함되어 있는지 확인
        return tech.service_type && tech.service_type.includes(selectedService);
      });
    }

    setTechnicians(filteredList.slice(0, 17));
  }, [
    isNearbyMode,
    userLocation,
    allTechnicians,
    searchQuery,
    selectedService,
  ]);

  // 카드 스크롤 핸들러
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

  // 서비스 필터 스크롤 핸들러 (마우스)
  const handleServiceMouseDown = (e) => {
    setIsServiceDragging(true);
    setServiceHasMoved(false);
    setServiceStartX(e.pageX - serviceScrollRef.current.offsetLeft);
    setServiceScrollLeft(serviceScrollRef.current.scrollLeft);
  };

  const handleServiceMouseLeave = () => {
    setIsServiceDragging(false);
    setServiceHasMoved(false);
  };

  const handleServiceMouseUp = () => {
    setIsServiceDragging(false);
    setTimeout(() => setServiceHasMoved(false), 50);
  };

  const handleServiceMouseMove = (e) => {
    if (!isServiceDragging) return;
    e.preventDefault();
    const x = e.pageX - serviceScrollRef.current.offsetLeft;
    const walk = (x - serviceStartX) * 2;

    if (Math.abs(walk) > 5) {
      setServiceHasMoved(true);
    }

    serviceScrollRef.current.scrollLeft = serviceScrollLeft - walk;
  };

  // 서비스 필터 스크롤 핸들러 (터치)
  const handleServiceTouchStart = (e) => {
    setIsServiceDragging(true);
    setServiceHasMoved(false);
    setServiceStartX(e.touches[0].pageX - serviceScrollRef.current.offsetLeft);
    setServiceScrollLeft(serviceScrollRef.current.scrollLeft);
  };

  const handleServiceTouchMove = (e) => {
    if (!isServiceDragging) return;
    const x = e.touches[0].pageX - serviceScrollRef.current.offsetLeft;
    const walk = (x - serviceStartX) * 2;

    if (Math.abs(walk) > 5) {
      setServiceHasMoved(true);
    }

    serviceScrollRef.current.scrollLeft = serviceScrollLeft - walk;
  };

  const handleServiceTouchEnd = () => {
    setIsServiceDragging(false);
    setTimeout(() => setServiceHasMoved(false), 50);
  };

  const handleServiceClick = (service) => {
    if (!serviceHasMoved) {
      setSelectedService(service);
    }
  };

  const handleToggle = () => {
    setIsNearbyMode(!isNearbyMode);
  };

  const handleRandomRequest = () => {
    if (allTechnicians.length === 0) return;

    const randomIndex = Math.floor(Math.random() * allTechnicians.length);
    const randomTech = allTechnicians[randomIndex];

    const source = sessionStorage.getItem("requestSource");
    navigate(`/partner/step0/undefined`, {
      state: {
        flowType: "fromTechnician",
        selectedTechnician: randomTech,
        source: source,
        isRandom: true,
      },
    });
  };

  return (
    <PartnerSelectContainer>
      <RequestHeader showPrevButton={false} userName="" to="/" />
      <PartnerSection>
        <TitleWrapper>
          <Title>전문가에게 바로 의뢰해보세요.</Title>
        </TitleWrapper>

        {/* 검색창 */}
        <SearchWrapper>
          <SearchIcon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4"
                stroke="#A0A0A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="업체 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery("")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="#A0A0A0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </ClearButton>
          )}
        </SearchWrapper>

        {/* 서비스 종류 필터 */}
        <ServiceFilterWrapper>
          <ServiceFilterScroll
            ref={serviceScrollRef}
            onMouseDown={handleServiceMouseDown}
            onMouseLeave={handleServiceMouseLeave}
            onMouseUp={handleServiceMouseUp}
            onMouseMove={handleServiceMouseMove}
            onTouchStart={handleServiceTouchStart}
            onTouchMove={handleServiceTouchMove}
            onTouchEnd={handleServiceTouchEnd}
            $isDragging={isServiceDragging}
          >
            {SERVICE_TYPES.map((service) => (
              <ServiceTag
                key={service}
                $isActive={selectedService === service}
                onClick={() => handleServiceClick(service)}
              >
                {service}
              </ServiceTag>
            ))}
          </ServiceFilterScroll>

          <RandomButtonWrapper>
            <RandomRequestButton onClick={handleRandomRequest}>
              <RandomIcon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M14.5 3.5L17.5 6.5L14.5 9.5M17.5 6.5H9.5C7.29086 6.5 5.5 8.29086 5.5 10.5V11.5M5.5 16.5L2.5 13.5L5.5 10.5M2.5 13.5H10.5C12.7091 13.5 14.5 11.7091 14.5 9.5V8.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </RandomIcon>
              가장 가까운 기사님에게 의뢰하기
            </RandomRequestButton>
            {/* <div>
            <RandomDescription>
              어떤 기사님을 선택할지 고민되시나요?
            </RandomDescription>
            <RandomDescription>
              지역에 맞는 기사님을 선택해드려요. 
            </RandomDescription>
          </div> */}
          </RandomButtonWrapper>
        </ServiceFilterWrapper>

        {technicians.length === 0 &&
          (searchQuery || selectedService !== "전체") && (
            <NoResultMessage>
              {searchQuery && selectedService !== "전체"
                ? `"${searchQuery}" 검색 결과 중 "${selectedService}" 서비스를 제공하는 업체가 없습니다.`
                : searchQuery
                ? `"${searchQuery}" 검색 결과가 없습니다.`
                : `"${selectedService}" 서비스를 제공하는 업체가 없습니다.`}
            </NoResultMessage>
          )}

        <ScrollContainer
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          $isDragging={isDragging}
        >
          {technicians.map((tech) => {
            const displayArea = getDisplayArea(tech.area);
            const isExpanded = expandedCards.has(tech.id);

            // 그룹화된 지역이 아니고 5개 이상인 경우에만 펼치기 기능 활성화
            const isGroupedArea =
              displayArea.length === 1 &&
              (displayArea[0] === "서울전지역" ||
                displayArea[0] === "서울강북지역" ||
                displayArea[0] === "서울강남지역");

            const showMoreButton = !isGroupedArea && displayArea.length > 4;
            const visibleAreas = isExpanded
              ? displayArea
              : displayArea.slice(0, 4);

            return (
              <Card
                key={tech.id}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                    return;
                  }
                  const source = sessionStorage.getItem("requestSource");
                  navigate(`/partner/step0/${tech.id}`, {
                    state: {
                      flowType: "fromTechnician",
                      selectedTechnician: tech,
                      source: source,
                      from: "sticker",
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

                <CardContent>
                  <InfoSection>
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
                            fill="#004FFF"
                          />
                        </svg>
                      </CheckIcon>
                      <CareerText>{tech.career}년 이상</CareerText>
                    </CareerBadge>

                    <PartnerName>{tech.name}</PartnerName>

                    <AreaTagsWrapper>
                      <AreaTags>
                        {visibleAreas.length > 0 ? (
                          visibleAreas.map((area, idx) => (
                            <AreaTag key={idx}>#{area}</AreaTag>
                          ))
                        ) : (
                          <AreaTag>#지역 정보 없음</AreaTag>
                        )}
                        {showMoreButton && !isExpanded && (
                          <MoreButton
                            onClick={(e) => toggleAreaExpansion(e, tech.id)}
                          >
                            ...
                          </MoreButton>
                        )}
                      </AreaTags>
                      {showMoreButton && isExpanded && (
                        <CollapseButton
                          onClick={(e) => toggleAreaExpansion(e, tech.id)}
                        >
                          접기
                        </CollapseButton>
                      )}
                    </AreaTagsWrapper>
                  </InfoSection>

                  <Divider />
                  <RequestButton>의뢰하기</RequestButton>
                </CardContent>
              </Card>
            );
          })}
        </ScrollContainer>
      </PartnerSection>
    </PartnerSelectContainer>
  );
};

export default Sticker;

const PartnerSelectContainer = styled.section`
  margin-bottom: 60px;
  width: 100%;
`;

const PartnerSection = styled.section`
  padding: 36px 24px 24px 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 24px 15px 24px 15px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    margin-bottom: 16px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.colors.text || "#000"};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 20px;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 12px 14px;
    margin-bottom: 12px;
  }
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: #a0a0a0;
    border: none;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 16px;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.7;
  }
`;

const ServiceFilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 520px;
  margin: auto;
  margin-bottom: 20px;
  overflow: hidden;
  @media (max-width: 555px) {
    width: 460px;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    margin-bottom: 16px;
    width: 360px;
  }
  @media (max-width: 375px) {
    margin-bottom: 16px;
    width: 320px;
  }
  @media (max-width: 320px) {
    margin-bottom: 16px;
    width: 280px;
  }
`;

const ServiceFilterScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;

  /* 스크롤바 숨기기 */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* 스크롤 부드럽게 */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* 하드웨어 가속으로 성능 개선 */
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 5px;
  }
`;

const ServiceTag = styled.button`
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  pointer-events: ${({ $isDragging }) => ($isDragging ? "none" : "auto")};

  background: ${({ $isActive }) => ($isActive ? "#004FFF" : "#E8E8E8")};
  color: ${({ $isActive }) => ($isActive ? "#FFFFFF" : "#666666")};

  /* 렌더링 최적화 */
  transform: translateZ(0);

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "#0040CC" : "#E8E8E8")};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const NoResultMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
  font-size: 15px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 14px;
    padding: 30px 15px;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "default")};
  user-select: none;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
  }
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "pointer")};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
  }
`;

const CardImage = styled.img`
  width: 154px;
  height: 104px;
  border-radius: 10px 0px 0px 10px;
  object-fit: cover;
  flex-shrink: 0;
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 90px;
    height: 94px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 85px;
    height: 94px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px;
  gap: 8px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding-right: 6px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 0px;
  }
`;

const CareerBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  color: #004fff;
  font-size: 14px;
  font-weight: 600;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 13px;
  }
`;

const PartnerName = styled.h3`
  color: #000;
  font-size: 18px;
  font-weight: 700;
  margin: 0;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 17px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 14px;
  }
`;

const AreaTagsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AreaTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const AreaTag = styled.span`
  color: #888;
  font-size: 12px;
  font-weight: 500;
`;

const MoreButton = styled.button`
  color: #004fff;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }
`;

const CollapseButton = styled.button`
  color: #888;
  font-size: 11px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 0;
  text-decoration: underline;
  align-self: flex-start;

  &:hover {
    color: #666;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 79.5px;
  background: #e0e0e0;
  margin: 0 8px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    height: 30px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    margin: 0 2px;
  }
`;

const RequestButton = styled.button`
  color: #004fff;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding: 2px 2px;
  }
`;

const RandomButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RandomRequestButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 41px;
  margin-right: 5px;
  background: #004fff;
  margin-top: 15px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 79, 255, 0.2);

  @media (max-width: 555px) {
    width: 460px;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 360px;
    font-size: 15px;
    height: 38px;
  }
  @media (max-width: 375px) {
    width: 320px;
  }
  @media (max-width: 320px) {
    width: 280px;
  }
`;

const RandomIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const RandomDescription = styled.p`
  color: #888;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 0;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 13px;
  }
`;
