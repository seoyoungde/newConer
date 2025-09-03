import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import FormLayout from "../../components/request/FormLayout";
import { useRequest } from "../../context/context";
import NavHeader from "../../components/common/Header/NavHeader";

const AREAS = [
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

const PartnerListPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedArea, setSelectedArea] = useState("전체");
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const { updateRequestData } = useRequest();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const partnerSnapshot = await getDocs(collection(db, "Partner"));
        const engineerSnapshot = await getDocs(collection(db, "Engineer"));

        const engineersByPartner = new Map();

        engineerSnapshot.docs.forEach((doc) => {
          const engineer = doc.data();
          if (!engineersByPartner.has(engineer.partner_id)) {
            engineersByPartner.set(engineer.partner_id, engineer);
          }
        });

        const OUR_STAFF_PARTNER_ID = "pozMcVxtmmsXvtMLaItJ";

        const partners = partnerSnapshot.docs
          .map((doc) => {
            const partner = doc.data();
            const engineer = engineersByPartner.get(partner.partner_id) || {};

            return {
              id: doc.id,
              name: partner.name,
              partner_id: partner.partner_id,
              career: partner.career,
              address: partner.address,
              address_detail: partner.address_detail || "",
              experience: engineer.registered_at || "정보 없음",
              count: partner.completed_request_count || 0,
              logo_image_url: partner.logo_image_url,
              area: partner.Area || [],
            };
          })
          .filter((p) => p.partner_id !== OUR_STAFF_PARTNER_ID);

        setTechnicians(partners);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  // 랜덤 매칭 시 기사님 뽑지 않고 undefined로 처리
  const handleRandomMatch = () => {
    updateRequestData("selectedTechnician", undefined);
    navigate(`/partner/step1/undefined`, {
      state: {
        flowType: "randomTechnician",
        selectedTechnician: undefined,
      },
    });
  };

  const filteredTechnicians =
    selectedArea === "전체"
      ? technicians
      : technicians.filter(
          (tech) =>
            Array.isArray(tech.area) &&
            (tech.area.includes(selectedArea) || tech.area[0] === "서울 전지역")
        );

  return (
    <Container>
      <NavHeader to="/" />
      <FormLayout
        title="기사님 선택"
        subtitle="서비스 받고 싶은 기사님을 선택해서 의뢰하세요!"
      >
        {/* 지역 선택 버튼 그룹 */}
        <FilterSection>
          <FilterTitle>서비스 가능한 지역별 찾기</FilterTitle>
          <FilterBox>
            <Wrapper>
              <SelectButton onClick={() => setOpen(!open)}>
                {selectedArea || "지역 선택"}
                <Arrow>▼</Arrow>
              </SelectButton>
              {open && (
                <Dropdown>
                  {["전체", ...AREAS].map((area) => (
                    <Option
                      key={area}
                      onClick={() => {
                        setSelectedArea(area);
                        setExpandedId(null);
                        setOpen(false);
                      }}
                    >
                      {area}
                    </Option>
                  ))}
                </Dropdown>
              )}
            </Wrapper>
          </FilterBox>
        </FilterSection>

        {filteredTechnicians.map((tech) => {
          const isExpanded = expandedId === tech.id;
          const visibleAreas = Array.isArray(tech.area)
            ? isExpanded
              ? tech.area
              : tech.area.slice(0, 4)
            : [];

          return (
            <Card
              key={tech.id}
              selected={tech.id === selectedId}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(tech.id);
                navigate(`/partner/step1/${tech.id}`, {
                  state: {
                    flowType: "fromTechnician",
                    selectedTechnician: tech,
                  },
                });
              }}
            >
              <ProfileImage
                src={tech.logo_image_url || "/default-profile.png"}
                alt={tech.name}
              />
              <LeftBox>
                <TextBox>
                  <InfoContent>
                    <CareerBox>
                      <TagBox>
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
                        <Tag>{tech.career}년 이상 </Tag>
                      </TagBox>
                      <Tag2>완료한 건수 : {tech.count}</Tag2>
                    </CareerBox>
                    <Name>{tech.name}</Name>
                  </InfoContent>

                  <ActionText>의뢰하기</ActionText>
                </TextBox>

                <AreaBox>
                  <AreaToggleBox>
                    <AreaListTitle style={{ margin: 0 }}>
                      서비스 가능한 지역
                    </AreaListTitle>
                    {Array.isArray(tech.area) && tech.area.length > 4 && (
                      <ToggleButton
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : tech.id);
                        }}
                      >
                        {isExpanded ? "접기" : "+ 더보기"}
                      </ToggleButton>
                    )}
                  </AreaToggleBox>
                  <AreaList $expanded={isExpanded}>
                    {visibleAreas.map((area, idx) => (
                      <AreaPill key={idx}>{area}</AreaPill>
                    ))}
                    {Array.isArray(tech.area) && tech.area.length === 0 && (
                      <AreaEmpty>정보 없음</AreaEmpty>
                    )}
                    {!Array.isArray(tech.area) && (
                      <AreaEmpty>정보 없음</AreaEmpty>
                    )}
                  </AreaList>
                </AreaBox>
              </LeftBox>
            </Card>
          );
        })}

        <TechCard onClick={handleRandomMatch}>
          <Name>기사님 랜덤 매칭하기</Name>
          <TechInfo>
            <RandomDesc>
              원하는 시간과 날짜에 바로 서비스가 가능한 기사님을 바로
              매칭해드립니다
            </RandomDesc>
            <SubmitButton>랜덤으로 의뢰하기</SubmitButton>
          </TechInfo>
        </TechCard>
      </FormLayout>
    </Container>
  );
};

export default PartnerListPage;

const Container = styled.div`
  width: 100%;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  margin-top: 15px;
`;

const FilterTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  margin-bottom: 8px;
  text-align: left;
`;

const FilterBox = styled.div`
  width: 100%;
  max-width: 200px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    max-width: 100%;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 200px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    max-width: 100%;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: black;
  font-size: ${({ theme }) => theme.font.size.body};
  text-align: left;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.body};
    padding: 8px 18px;
  }
  &:focus {
    outline: none;
    border: 1px solid #ccc;
  }
`;

const Arrow = styled.span`
  float: right;
  color: gray;
  font-size: 14px;
  line-height: 18px;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  margin: 4px 0 0 0;
  padding: 0;
  list-style: none;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  background: #fff;
  z-index: 1000;
`;

const Option = styled.li`
  padding: 14px 16px;
  font-size: ${({ theme }) => theme.font.size.body};
  cursor: pointer;

  &:hover {
    background: #f1f4ff;
    color: #004fff;
  }
`;

const Card = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 2px solid ${({ selected }) => (selected ? "#C2E1FF" : "#eee")};
  border-radius: 8px;
  margin-bottom: 10px;
  width: 100%;
  cursor: pointer;
  background: #fff;
  padding-top: 10px;
  padding-bottom: 10px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    flex-direction: column;
  }
`;

const ProfileImage = styled.img`
  width: 114px;
  height: 114px;
  border-radius: 8px;
  object-fit: cover;
  background: #eee;
  margin-left: 15px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 104px;
    height: 104px;
  }
`;

const LeftBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    margin-top: 5px;
  }
`;

const TextBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 24px;
  flex-direction: row;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 14px;
    flex-direction: column;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    align-items: center;
  }
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    align-items: center;
  }
`;

const CareerBox = styled.div`
  display: flex;
  line-height: 16px;
  margin-bottom: 4px;
  margin-top: 8px;
  gap: 6px;
  align-items: center;
`;

const Name = styled.h3`
  margin-top: 4px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.body};
  }
`;
const TagBox = styled.div`
  display: flex;
`;
const Tag = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;
const Tag2 = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;

const ActionText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.body};
  margin-top: 25px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    margin-top: 11px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AreaBox = styled.div`
  width: 100%;
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 14px;
  }
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding: 0px;
    width: 210px;
    margin: auto;
  }
`;

const AreaListTitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
`;
const AreaToggleBox = styled.div`
  display: flex;
`;
const AreaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: ${({ $expanded }) => ($expanded ? "500px" : "80px")};
  transition: max-height 0.3s ease;
  margin: 8px 0 6px;
`;

const AreaPill = styled.span`
  color: #8b8b8b;
  border: 1px solid #d2d2d2;
  border-radius: 10px;
  padding: 4px 6px;
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  font-size: ${({ theme }) => theme.font.size.bodySmall};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 2px 4px;
  }
`;

const AreaEmpty = styled.span`
  color: #999;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;

const ToggleButton = styled.button`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 20px;
`;

const TechCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: ${(props) => (props.selected ? "#C2E1FF" : "#fff")};
  cursor: pointer;
  align-items: flex-start;
  margin-top: 10px;
  margin-bottom: 80px;
`;

const TechInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const RandomDesc = styled.p`
  font-size: ${({ theme }) => theme.font.size.small};
  color: #777;
  margin-top: 5px;
`;

const SubmitButton = styled.button`
  color: ${({ theme }) => theme.colors.text};
  border: none;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;
