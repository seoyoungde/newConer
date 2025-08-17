import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import FormLayout from "../../components/request/FormLayout";
import { useRequest } from "../../context/context";
import NavHeader from "../../components/common/Header/NavHeader";

const PartnerListPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const { updateRequestData } = useRequest();

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
            };
          })
          .filter((p) => p.partner_id !== OUR_STAFF_PARTNER_ID);

        const shuffled = partners.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        setTechnicians(selected);
      } catch (err) {
        console.error("업체 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchTechnicians();
  }, []);

  const handleRandomMatch = () => {
    if (technicians.length === 0) return;
    const randomTech =
      technicians[Math.floor(Math.random() * technicians.length)];
    updateRequestData("selectedTechnician", randomTech);
    navigate(`/partner/address-contact/${randomTech.id}`, {
      state: {
        flowType: "randomTechnician",
        selectedTechnician: randomTech,
      },
    });
  };

  return (
    <Container>
      <NavHeader to="/" />
      <FormLayout
        title="협력업체 선택"
        subtitle="서비스 받고 싶은 업체를 선택해서 의뢰하세요!"
      >
        {technicians.map((tech) => (
          <Card
            key={tech.id}
            selected={tech.id === selectedId}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/partner/address-contact/${tech.id}`, {
                state: { flowType: "fromTechnician", selectedTechnician: tech },
              });
            }}
          >
            <ProfileImage
              src={tech.logo_image_url || "/default-profile.png"}
              alt={tech.name}
            />
            <LeftBox>
              <InfoContent>
                <Name>{tech.name}</Name>
                <Address>{tech.address}</Address>
                <Tag>경력 : {tech.career}</Tag>
                <Tag>
                  완료한 건수 : <strong>{tech.count}</strong>
                </Tag>
              </InfoContent>
              <ActionText>의뢰하기</ActionText>
            </LeftBox>
          </Card>
        ))}

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

const LeftBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  align-items: flex-start;
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
  margin-bottom: 30px;
`;
const ProfileImage = styled.img`
  width: 94px;
  height: 94px;
  border-radius: 8px;
  object-fit: cover;
  background: #eee;
`;
const TechInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Tag = styled.div`
  font-size: ${({ theme }) => theme.font.size.small};
`;
const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 2px solid ${(props) => (props.selected ? "#C2E1FF" : "#eee")};
  border-radius: 8px;
  margin: 0 auto 10px;
  width: 100%;
  cursor: pointer;
`;

const Name = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 4px;
`;
const Address = styled.div`
  color: #555;
  font-size: ${({ theme }) => theme.font.size.small};
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

const ActionText = styled.button`
  color: ${({ theme }) => theme.colors.text};
  border: none;
  width: 80px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  cursor: pointer;
  margin-top: 10px;
`;
