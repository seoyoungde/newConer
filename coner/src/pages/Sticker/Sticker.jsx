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
};

const Sticker = () => {
  const [technicians, setTechnicians] = useState([]);
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ko`
            );
            const data = await response.json();

            const address = data.address;
            let region = "";
            let district = "";

            const possibleDistrictFields = [
              "suburb",
              "borough",
              "municipality",
              "city_district",
              "county",
              "town",
              "village",
            ];

            for (const field of possibleDistrictFields) {
              if (address[field]) {
                district = address[field];

                break;
              }
            }

            if (address.city) {
              region = address.city;
            } else if (address.state) {
              region = address.state;
            } else if (address.province) {
              region = address.province;
            }

            if (region.includes("서울")) {
              const matchedGangbuk = gangbukDistricts.find((gu) =>
                district.includes(gu)
              );
              const matchedGangnam = gangnamDistricts.find((gu) =>
                district.includes(gu)
              );

              if (matchedGangbuk) {
                region = "서울강북지역";
              } else if (matchedGangnam) {
                region = "서울강남지역";
              } else {
                region = "서울";
              }
            } else if (region.includes("경기")) {
              region = "경기";
            } else if (region.includes("인천")) {
              region = "인천";
            } else if (region.includes("부산")) {
              region = "부산";
            } else if (region.includes("대구")) {
              region = "대구";
            } else if (region.includes("대전")) {
              region = "대전";
            } else if (region.includes("광주")) {
              region = "광주";
            } else if (region.includes("울산")) {
              region = "울산";
            } else if (region.includes("세종")) {
              region = "세종";
            }

            setUserLocation(region);
          } catch (error) {
            setUserLocation("서울강북지역");
          }
        },
        (error) => {
          setUserLocation("서울강북지역");
        }
      );
    }
  }, []);

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
              area: partner.Area || [],
              count: partner.completed_request_count || 0,
              status: partner.status,
            };
          })
          .filter(
            (p) => p.partner_id !== OUR_STAFF_PARTNER_ID && p.status === 1
          );

        const sortedByCount = partners.sort((a, b) => b.count - a.count);

        setAllTechnicians(sortedByCount);

        const selected = sortedByCount.slice(0, 8);
        setTechnicians(selected);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  useEffect(() => {
    if (isNearbyMode && userLocation && allTechnicians.length > 0) {
      const filtered = allTechnicians
        .filter((tech) => {
          return tech.area.some((area) => {
            if (userLocation === "서울강북지역") {
              return area === "서울강북지역" || area === "서울전지역";
            } else if (userLocation === "서울강남지역") {
              return area === "서울강남지역" || area === "서울전지역";
            } else if (userLocation === "서울") {
              return area.includes("서울");
            } else {
              return area === userLocation;
            }
          });
        })
        .map((tech) => {
          const sortedArea = [...tech.area].sort((a, b) => {
            const getPriority = (area) => {
              if (userLocation === "서울강북지역") {
                if (area === "서울강북지역") return 1;
                if (area === "서울전지역") return 2;
                return 999;
              } else if (userLocation === "서울강남지역") {
                if (area === "서울강남지역") return 1;
                if (area === "서울전지역") return 2;
                return 999;
              } else if (userLocation === "서울") {
                if (area.includes("서울")) return 1;
                return 999;
              } else {
                if (area === userLocation) return 1;
                return 999;
              }
            };

            return getPriority(a) - getPriority(b);
          });

          return {
            ...tech,
            area: sortedArea,
          };
        });

      console.log(
        "필터링된 업체들:",
        filtered.map((t) => ({ name: t.name, areas: t.area }))
      );
      setTechnicians(filtered.slice(0, 8));
    } else {
      setTechnicians(allTechnicians.slice(0, 8));
    }
  }, [isNearbyMode, userLocation, allTechnicians]);

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
      {/* <LogoHeader /> */}
      <RequestHeader showPrevButton={false} userName="" to="/" />
      <PartnerSection>
        <TitleWrapper>
          <Title>전문가에게 바로 의뢰해보세요.</Title>
        </TitleWrapper>

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
                const source = sessionStorage.getItem("requestSource");
                navigate(`/partner/step0/${tech.id}`, {
                  state: {
                    flowType: "fromTechnician",
                    selectedTechnician: tech,
                    source: source,
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

                  <AreaTags>
                    {tech.area.slice(0, 1).map((area, idx) => (
                      <AreaTag key={idx}>#{area}</AreaTag>
                    ))}
                  </AreaTags>
                </InfoSection>

                <Divider />
                <RequestButton>의뢰하기</RequestButton>
              </CardContent>
            </Card>
          ))}
        </ScrollContainer>

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
          <div>
            <RandomDescription>
              어떤 기사님을 선택할지 고민되시나요?
            </RandomDescription>
            <RandomDescription>
              지역에 맞는 기사님을 선택해드려요.
            </RandomDescription>
          </div>
        </RandomButtonWrapper>
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

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #8d989f;
  font-weight: bold;
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 12px;
  }
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 52px;
  height: 24px;
  background: ${({ $isOn }) => ($isOn ? "#004FFF" : "#a2afb7")};
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  padding: 0 4px;
`;

const ToggleSlider = styled.div`
  position: absolute;
  left: ${({ $isOn }) => ($isOn ? "26px" : "2px")};
  width: 24px;
  height: 20px;
  background: white;
  border-radius: 3px;
  transition: left 0.3s ease;
  z-index: 1;
`;

const ToggleButton = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${({ $isOn }) => ($isOn ? "white" : "#a2afb7")};
  letter-spacing: 0.3px;
  position: absolute;
  z-index: 2;
  left: ${({ $isOn }) => ($isOn ? "6px" : "auto")};
  right: ${({ $isOn }) => ($isOn ? "auto" : "6px")};
  transition: all 0.3s ease;
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
    width: 80px;
    height: 80px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    width: 70px;
    height: 70px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-right: 16px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding-right: 12px;
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

const AreaTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const AreaTag = styled.span`
  color: #888;
  font-size: 12px;
  font-weight: 500;
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
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    margin-top: 24px;
    gap: 10px;
  }
`;

const RandomRequestButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  height: 56px;
  background: #004fff;
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 79, 255, 0.2);

  &:hover {
    background: #0040cc;
    box-shadow: 0 4px 12px rgba(0, 79, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    height: 52px;
    font-size: 15px;
    max-width: 100%;
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
