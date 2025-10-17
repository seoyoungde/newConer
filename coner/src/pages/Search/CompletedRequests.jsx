import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider";
import RequestHeader from "../../components/common/Header/RequestHeader";
import { IoChevronForward } from "react-icons/io5";

const CompletedRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const requestId = location.state?.requestId;
  const [customer_uid, setCustomerUid] = useState(
    location.state?.customer_uid || null
  );
  const customer_phone = location.state?.customer_phone;

  const [requestDataList, setRequestDataList] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({}); // 리뷰 작성 여부 저장

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!customer_uid && u) {
        setCustomerUid(u.uid);
      }
    });
    return () => unsubscribe();
  }, [customer_uid]);

  const fetchRequestByClient = useCallback(async () => {
    const requests = new Map();

    try {
      const tasks = [];

      if (requestId) {
        tasks.push(getDoc(doc(db, "Request", requestId)));
      }

      if (customer_uid) {
        tasks.push(
          getDocs(
            query(
              collection(db, "Request"),
              where("customer_uid", "==", customer_uid)
            )
          )
        );
      }

      if (customer_phone) {
        tasks.push(
          getDocs(
            query(
              collection(db, "Request"),
              where("customer_phone", "==", customer_phone)
            )
          )
        );
      }

      const results = await Promise.all(tasks);

      for (const res of results) {
        if ("exists" in res) {
          if (res.exists()) {
            requests.set(res.id, { id: res.id, ...res.data() });
          }
          continue;
        }

        res.forEach((d) => {
          if (!requests.has(d.id)) {
            requests.set(d.id, { id: d.id, ...d.data() });
          }
        });
      }
    } catch (error) {
      console.error("Firestore에서 데이터 조회 중 오류 발생:", error);
    } finally {
      setRequestDataList(Array.from(requests.values()));
    }
  }, [customer_phone, customer_uid, requestId]);

  // 리뷰 작성 여부 확인 함수
  const checkReviewStatus = useCallback(async (requestIds) => {
    const statusMap = {};

    try {
      const reviewChecks = await Promise.all(
        requestIds.map(async (id) => {
          const reviewDoc = await getDoc(doc(db, "Review", id));
          return { id, exists: reviewDoc.exists() };
        })
      );

      reviewChecks.forEach(({ id, exists }) => {
        statusMap[id] = exists;
      });

      setReviewStatus(statusMap);
    } catch (error) {
      console.error("리뷰 상태 확인 중 오류 발생:", error);
    }
  }, []);

  useEffect(() => {
    fetchRequestByClient();
  }, [fetchRequestByClient]);

  const { completedRequests } = useMemo(() => {
    const completed = requestDataList.filter((r) => {
      const s = Number(r?.status ?? 0);
      return s >= 4;
    });
    return { completedRequests: completed };
  }, [requestDataList]);

  // 완료된 의뢰서들의 리뷰 상태 확인
  useEffect(() => {
    if (completedRequests.length > 0) {
      const requestIds = completedRequests.map((req) => req.id);
      checkReviewStatus(requestIds);
    }
  }, [completedRequests, checkReviewStatus]);

  const handleReviewClick = (requestId, hasReview) => {
    if (!hasReview) {
      // 리뷰 작성 페이지로 이동
      navigate(`/reviewform/${requestId}`);
    }
  };

  return (
    <Container>
      <RequestHeader showPrevButton={false} userName="이전" to={-1} />

      <RequestSection>
        {completedRequests.length > 0 ? (
          completedRequests.map((req) => {
            const hasReview = reviewStatus[req.id] || false;

            return (
              <RequestCard key={req.id}>
                <CardHeader>
                  <DateAndStatus>
                    <DateText>{req.completed_at || ""}</DateText>
                    <Divider>|</Divider>
                    <StatusText>
                      {req.brand || ""} {req.service_type || ""}
                    </StatusText>
                  </DateAndStatus>
                </CardHeader>

                <AddressContainer>
                  <AddressLabel>방문지</AddressLabel>
                  <AddressValue>{req.customer_address || ""}</AddressValue>
                </AddressContainer>

                <CardFooter>
                  <EngineerInfo>
                    <EngineerAvatar
                      $hasImage={!!req.engineer_profile_image}
                      style={{
                        backgroundImage: req.engineer_profile_image
                          ? `url(${req.engineer_profile_image})`
                          : "none",
                      }}
                    />
                    <EngineerNameContainer>
                      <PartnerName>{req.partner_name || ""}</PartnerName>
                      <EngineerName>
                        {req.engineer_name || ""} 기사님
                      </EngineerName>
                    </EngineerNameContainer>
                  </EngineerInfo>

                  <ReviewButton
                    onClick={() => handleReviewClick(req.id, hasReview)}
                    $completed={hasReview}
                    disabled={hasReview}
                  >
                    <ReviewText $completed={hasReview}>
                      {hasReview ? "리뷰 작성완료" : "리뷰 작성하러 가기"}
                    </ReviewText>
                    {!hasReview && <IoChevronForward size={16} />}
                  </ReviewButton>
                </CardFooter>
              </RequestCard>
            );
          })
        ) : (
          <CenteredContent>완료된 의뢰가 없습니다.</CenteredContent>
        )}
      </RequestSection>
    </Container>
  );
};

export default memo(CompletedRequests);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const RequestSection = styled.section`
  padding: 36px 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 16px 15px;
  }
`;

const RequestCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 16px;

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 14px;
  }
`;

const CardHeader = styled.div`
  margin-bottom: 12px;
`;

const DateAndStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateText = styled.span`
  color: #004fff;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const Divider = styled.span`
  color: #d9d9d9;
  font-size: 14px;
`;

const StatusText = styled.span`
  color: #000;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const AddressContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const AddressLabel = styled.span`
  color: #8d989f;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
`;

const AddressValue = styled.span`
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #f2f3f6;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    padding-top: 14px;
  }
`;

const EngineerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EngineerAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background-color: #d9d9d9;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const EngineerNameContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const PartnerName = styled.span`
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 16px;
  }
`;

const EngineerName = styled.span`
  color: #8d989f;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;

const ReviewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: ${({ $completed }) => ($completed ? "default" : "pointer")};
  color: ${({ $completed }) => ($completed ? "#999" : "#666")};
  opacity: ${({ $completed }) => ($completed ? "0.6" : "1")};
`;

const ReviewText = styled.span`
  color: ${({ $completed }) => ($completed ? "#999" : "#646b70")};
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.smobile}) {
    font-size: 12px;
  }
`;

const CenteredContent = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;
