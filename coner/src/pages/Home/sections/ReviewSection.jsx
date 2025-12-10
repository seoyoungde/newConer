import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // status가 1인 리뷰만 가져오기
        const reviewQuery = query(
          collection(db, "Review"),
          where("status", "==", 2)
        );
        const reviewSnapshot = await getDocs(reviewQuery);

        const reviewList = await Promise.all(
          reviewSnapshot.docs.map(async (reviewDoc) => {
            const review = reviewDoc.data();

            let partnerName = "";
            let serviceType = "";
            let requestAddress = "";
            let airconBrand = "";
            let airconType = "";

            try {
              // 리뷰 ID와 동일한 Request ID로 의뢰서 데이터 가져오기
              const requestRef = doc(db, "Request", reviewDoc.id);
              const requestSnap = await getDoc(requestRef);

              if (requestSnap.exists()) {
                const requestData = requestSnap.data();
                partnerName = requestData.partner_name || "";
                serviceType =
                  requestData.service_type || requestData.service_type || "";
                requestAddress =
                  requestData.customer_address ||
                  requestData.customer_address ||
                  "";
                airconBrand = requestData.brand || requestData.brand || "";
                airconType =
                  requestData.aircon_type || requestData.aircon_type || "";
              }
            } catch (err) {}

            let createdAt = "";
            if (review.created_at) {
              if (typeof review.created_at === "string") {
                createdAt = review.created_at;
              } else if (typeof review.created_at.toDate === "function") {
                const date = review.created_at.toDate();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                createdAt = `${year}.${month}.${day}`;
              }
            }

            return {
              id: reviewDoc.id,
              rating:
                parseInt(review.partner_rating) ||
                parseInt(review.service_rating) ||
                5,
              serviceOpinion: review.service_opinion || "",
              address:
                requestAddress || review.address || review.location || "서울시",
              createdAt: createdAt,
              photos: review.photo || [],
              partnerName: partnerName,
              serviceType: serviceType,
              airconBrand: airconBrand,
              airconType: airconType,
            };
          })
        );

        // 랜덤으로 섞기
        const shuffledReviews = reviewList.sort(() => Math.random() - 0.5);
        setReviews(shuffledReviews);
      } catch (err) {}
    };

    fetchReviews();
  }, []);

  // 마우스 드래그 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // 이미 "YYYY.MM.DD" 형식이면 그대로 반환
    if (dateString.includes(".")) {
      return dateString;
    }

    // "2025년09월09일" 형식이면 변환
    const match = dateString.match(/(\d{4})년(\d{2})월(\d{2})일/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}.${month}.${day}`;
    }

    return dateString;
  };

  // 주소에서 "구"만 추출하는 함수
  const extractDistrict = (address) => {
    if (!address) return "";

    // "00구" 패턴 찾기
    const districtMatch = address.match(/([가-힣]+구)/);
    if (districtMatch) {
      return districtMatch[1];
    }

    return address;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} $filled={index < rating}>
        ★
      </Star>
    ));
  };

  return (
    <ReviewContainer>
      <Title>고객님 후기</Title>

      <ScrollContainer
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <CardHeader>
              <StarRating>{renderStars(review.rating)}</StarRating>
              <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
            </CardHeader>

            <UserName>{review.partnerName || "업체이름"}</UserName>

            {review.serviceOpinion && (
              <ReviewContent>{review.serviceOpinion}</ReviewContent>
            )}

            <LocationInfo>
              <LocationIcon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M7 1.75C5.067 1.75 3.5 3.317 3.5 5.25C3.5 7.875 7 12.25 7 12.25C7 12.25 10.5 7.875 10.5 5.25C10.5 3.317 8.933 1.75 7 1.75ZM7 6.5625C6.2755 6.5625 5.6875 5.9745 5.6875 5.25C5.6875 4.5255 6.2755 3.9375 7 3.9375C7.7245 3.9375 8.3125 4.5255 8.3125 5.25C8.3125 5.9745 7.7245 6.5625 7 6.5625Z"
                    fill="#8B8B8B"
                  />
                </svg>
              </LocationIcon>
              <LocationText>{extractDistrict(review.address)}</LocationText>
              {review.airconBrand && (
                <ServiceTypeText>{review.airconBrand}</ServiceTypeText>
              )}
              {review.airconType && (
                <ServiceTypeText>{review.airconType}</ServiceTypeText>
              )}
              {review.serviceType && (
                <ServiceTypeText>{review.serviceType}</ServiceTypeText>
              )}
            </LocationInfo>
          </ReviewCard>
        ))}
      </ScrollContainer>
    </ReviewContainer>
  );
};

export default ReviewSection;

const ReviewContainer = styled.section`
  margin-bottom: 60px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text || "#000"};

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  cursor: grab;
  user-select: none;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
  }
`;

const ReviewCard = styled.div`
  min-width: 310px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: none;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    min-width: 300px;
    max-width: 300px;
    padding: 20px;
    height: 250px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${({ $filled }) => ($filled ? "#407BFF" : "#E0E0E0")};
  font-size: 20px;
`;

const ReviewDate = styled.span`
  color: #999;
  font-size: 14px;
`;

const UserName = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 4px;
`;

const ReviewContent = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0px;
  flex: 1;
  word-break: break-word;
  white-space: pre-wrap;
`;

const LocationInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  align-self: flex-start;
  margin-top: auto;
`;

const LocationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LocationText = styled.span`
  color: #8b8b8b;
  font-size: 13px;
`;

const ServiceTypeText = styled.span`
  color: #8b8b8b;
  font-size: 13px;
`;
