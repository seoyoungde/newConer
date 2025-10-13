import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  collection,
  getDocs,
  query,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewQuery = query(collection(db, "Review"), limit(10));
        const reviewSnapshot = await getDocs(reviewQuery);

        const reviewList = await Promise.all(
          reviewSnapshot.docs.map(async (reviewDoc) => {
            const review = reviewDoc.data();

            let partnerName = "";
            let serviceType = "";
            let requestAddress = "";

            try {
              const requestRef = doc(db, "Request", reviewDoc.id);
              const requestSnap = await getDoc(requestRef);

              if (requestSnap.exists()) {
                const requestData = requestSnap.data();
                partnerName = requestData.partnerName || "";
                serviceType = requestData.serviceType || requestData.type || "";
                requestAddress =
                  requestData.address || requestData.location || "";
              }
            } catch (err) {
              console.error("Request 데이터 가져오기 실패:", err);
            }

            let createdAt = "";
            if (review.createdAt) {
              if (typeof review.createdAt === "string") {
                createdAt = review.createdAt;
              } else if (typeof review.createdAt.toDate === "function") {
                const date = review.createdAt.toDate();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                createdAt = `${year}.${month}.${day}`;
              }
            }

            return {
              id: reviewDoc.id,
              userName: review.userName || "익명",
              rating:
                parseInt(review.partner_rating) ||
                parseInt(review.service_rating) ||
                5,
              serviceOpinion: review.serviceOpinion || "",
              complaints: review.complaints || "",
              address:
                requestAddress || review.address || review.location || "서울시",
              createdAt: createdAt,
              photos: review.photo || [],
              partnerName: partnerName,
              serviceType: serviceType,
            };
          })
        );

        setReviews(reviewList);
      } catch (err) {
        console.error("리뷰 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchReviews();
  }, []);

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} $filled={index < rating}>
        ★
      </Star>
    ));
  };

  return (
    <ReviewContainer>
      <Title>후기</Title>

      <ScrollContainer>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <CardHeader>
              <StarRating>{renderStars(review.rating)}</StarRating>
              <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
            </CardHeader>

            <UserName>{review.userName}</UserName>

            {review.serviceOpinion && (
              <ReviewContent>{review.serviceOpinion}</ReviewContent>
            )}

            {review.complaints && (
              <ComplaintsContent>{review.complaints}</ComplaintsContent>
            )}

            <ServiceInfo>
              {review.partnerName && (
                <InfoItem>
                  <InfoLabel>업체:</InfoLabel>
                  <InfoText>{review.partnerName}</InfoText>
                </InfoItem>
              )}
              {review.serviceType && (
                <InfoItem>
                  <InfoLabel>서비스:</InfoLabel>
                  <InfoText>{review.serviceType}</InfoText>
                </InfoItem>
              )}
            </ServiceInfo>

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
              <LocationText>{review.address}</LocationText>
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

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
  }
`;

const ReviewCard = styled.div`
  min-width: 320px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    min-width: 280px;
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${({ $filled }) => ($filled ? "#004FFF" : "#E0E0E0")};
  font-size: 16px;
`;

const ReviewDate = styled.span`
  color: #8b8b8b;
  font-size: 13px;
`;

const UserName = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text || "#000"};
  margin: 0;
`;

const ReviewContent = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ComplaintsContent = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoLabel = styled.span`
  color: #666;
  font-size: 12px;
  font-weight: 600;
`;

const InfoText = styled.span`
  color: #333;
  font-size: 12px;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
