import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useRequest } from "../../../context/context";
import installIcon from "../../../assets/servicegridimages/install.png";
import inspectionIcon from "../../../assets/servicegridimages/inspection.png";
import cleanIcon from "../../../assets/servicegridimages/clean.png";
import repairIcon from "../../../assets/servicegridimages/repair.png";
import chargeIcon from "../../../assets/servicegridimages/charge.png";
import moveIcon from "../../../assets/servicegridimages/move.png";
import demolishIcon from "../../../assets/servicegridimages/demolish.png";
import purchaseIcon from "../../../assets/servicegridimages/purchase.png";
import priceIcon from "../../../assets/servicegridimages/price.png";
import requestIcon from "../../../assets/servicegridimages/request.png";

const serviceData = [
  {
    id: 1,
    title: "설치",
    icon: installIcon,
    path: "/request/install",
  },
  {
    id: 2,
    title: "설치 및 구매",
    icon: purchaseIcon,
    path: "/request/install-purchase",
  },

  {
    id: 3,
    title: "점검",
    icon: inspectionIcon,
    path: "/inspection",
  },
  {
    id: 4,
    title: "청소",
    icon: cleanIcon,
    path: "/clean",
  },

  {
    id: 5,
    title: "수리",
    icon: repairIcon,
    path: "/repair",
  },

  {
    id: 6,
    title: "냉매충전",
    icon: chargeIcon,
    path: "/charge",
  },
  {
    id: 7,
    title: "이전",
    icon: moveIcon,
    path: "/move",
  },

  {
    id: 8,
    title: "철거",
    icon: demolishIcon,
    path: "/demolish",
  },
  {
    id: 9,
    title: "서비스별 가격",
    icon: priceIcon,
    path: "/price",
  },
  {
    id: 10,
    title: "의뢰서 조회",
    icon: requestIcon,
    path: "/search/request",
  },
];

const ServiceGrid = () => {
  const navigate = useNavigate();
  const { requestData, updateRequestData, clearPartner } = useRequest();
  const [selectedService, setSelectedService] = useState(
    requestData.service_type || ""
  );

  useEffect(() => {
    setSelectedService(requestData.service_type || "");
  }, [requestData.service_type]);

  const handleServiceClick = (service) => {
    clearPartner();
    updateRequestData("service_type", service.title);
    setSelectedService(service.title);

    const qs = `?service_type=${encodeURIComponent(service.title)}`;

    if (
      service.path === "/request/install" ||
      service.path === "/request/install-purchase" ||
      service.path === "/price" ||
      service.path === "/search/request"
    ) {
      navigate(`${service.path}${qs}`);
    } else {
      navigate(`/request/address-contact${qs}`, {
        state: { selectedService: service.title },
      });
    }
  };

  return (
    <ServiceContainer>
      <ServiceList>
        {serviceData.map((service) => (
          <ServiceItem
            key={service.id}
            role="button"
            onClick={() => handleServiceClick(service)}
            $isSelected={selectedService === service.title}
          >
            <img
              src={service.icon}
              alt={`${service.title} 아이콘`}
              loading="lazy"
              width={80}
              height={80}
            />
            <p className="service_title">{service.title}</p>
          </ServiceItem>
        ))}
      </ServiceList>
    </ServiceContainer>
  );
};
export default ServiceGrid;
const ServiceContainer = styled.section`
  width: 100%;
  padding-bottom: 60px;
`;

const ServiceList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ServiceItem = styled.li`
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    flex: 0 0 25%;
  }

  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
      width: 70px;
      height: 70px;
    }
  }
  p {
    font-size: ${({ theme }) => theme.font.size.body};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
      font-size: 14px;
    }
  }
`;
