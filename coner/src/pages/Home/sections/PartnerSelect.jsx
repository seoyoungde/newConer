import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useNavigate } from "react-router-dom";

const PartnerSelect = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

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
              area: partner.Area || [], // 배열
              count: partner.count || 0,
            };
          })
          .filter((p) => p.partner_id !== OUR_STAFF_PARTNER_ID);

        const sortedByCount = partners.sort((a, b) => b.count - a.count);
        const selected = sortedByCount.slice(0, 3);

        setTechnicians(selected);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  return (
    <PartnerSelectContainer>
      <Section>
        <Title>코너 협력업체</Title>

        <MoreButton
          onClick={() => {
            navigate("/partner/list");
          }}
        >
          협력업체 더보기 &gt;
        </MoreButton>
      </Section>
      {technicians.map((tech) => {
        const isExpanded = expandedId === tech.id;
        const visibleAreas = isExpanded ? tech.area : tech.area.slice(0, 4);

        return (
          <Card
            key={tech.id}
            selected={tech.id === selectedId}
            onClick={() => {
              setSelectedId(tech.id);
              navigate(`/partner/address-contact/${tech.id}`, {
                state: { flowType: "fromTechnician", selectedTechnician: tech },
              });
            }}
          >
            <ProfileImage
              src={tech.logo_image_url || "/default-profile.png"}
              alt={tech.name}
              loading="lazy"
              decoding="async"
              width={114}
              height={114}
            />
            <LeftBox>
              <TextBox>
                <InfoContent>
                  <CareerBox>
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
                    <Tag>{tech.career}년 이상</Tag>
                  </CareerBox>
                  <Name>{tech.name}</Name>
                </InfoContent>
                <ActionText>의뢰하기</ActionText>
              </TextBox>
              <AreaBox>
                <div style={{ display: "flex" }}>
                  <AreaListTitle style={{ margin: "0" }}>
                    서비스 가능한 지역
                  </AreaListTitle>
                  {tech.area.length > 4 && (
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
                </div>
                <AreaList $expanded={isExpanded}>
                  {visibleAreas.map((area, idx) => (
                    <Address key={idx}>{area}</Address>
                  ))}
                </AreaList>
              </AreaBox>
            </LeftBox>
          </Card>
        );
      })}
    </PartnerSelectContainer>
  );
};

export default PartnerSelect;

const PartnerSelectContainer = styled.section`
  margin-bottom: 60px;
`;
const Section = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;
const MoreButton = styled.button`
  font-size: ${({ theme }) => theme.font.size.body};
  cursor: pointer;
  text-align: center;
  display: block;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  background: none;
`;
const Title = styled.h1``;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  margin: 0 auto 10px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.bg};
`;

const LeftBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;
const TextBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 0px 24px;
  flex-direction: row;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0px 14px;
  }
`;
const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileImage = styled.img`
  width: 114px;
  height: 114px;
  border-radius: 8px;
  background-color: #ddd;
  object-fit: cover;
  margin-left: 15px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    width: 104px;
    height: 104px;
  }
`;

const Name = styled.h3`
  margin-top: 4px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.body};
  }
`;
const AreaBox = styled.div`
  padding: 0px 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0px 14px;
  }
`;
const AreaList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: ${({ $expanded }) => ($expanded ? "500px" : "80px")};
  transition: max-height 0.3s ease;
  margin-bottom: 13px;
`;
const AreaListTitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  padding-top: 5px;
`;
const Address = styled.div`
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

const Tag = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  font-size: ${({ theme }) => theme.font.size.bodySmall};
`;
const CareerBox = styled.div`
  display: flex;
  line-height: 16px;
  margin-bottom: 4px;
  margin-top: 15px;
`;
const ActionText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.body};
  margin-top: 25px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.font.size.bodySmall};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    margin-top: 11px;
  }
`;

const ToggleButton = styled.button`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  color: ${({ theme }) => theme.colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  padding-right: 20px;
  padding-left: 20px;
  padding: 8px 20px;
`;
