import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import RequestReceived from "./RequestReceived";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider";
import RequestHeader from "../../components/common/Header/RequestHeader";

const InProgressRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requestId = location.state?.requestId;
  const [customer_uid, setCustomerUid] = useState(
    location.state?.customer_uid || null
  );

  const customer_phone = location.state?.customer_phone;
  const statusFilter = location.state?.status || null;
  const { currentUser } = useAuth();

  const [requestDataList, setRequestDataList] = useState([]);

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

      // 단건 ID 조회
      if (requestId) {
        tasks.push(getDoc(doc(db, "Request", requestId)));
      }

      // 로그인 사용자 기반 조회(이름 조건 없이 본인 모든 의뢰)
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

      // 전화번호 + 이름이 모두 있을 때만 “둘 다 일치” 검색
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

  useEffect(() => {
    fetchRequestByClient();
  }, [fetchRequestByClient]);

  const handleRealtimeUpdate = useCallback((updatedRequest) => {
    setRequestDataList((prevList) => {
      const exists = prevList.some((r) => r.id === updatedRequest.id);
      if (!exists) return [...prevList, updatedRequest];
      return prevList.map((r) =>
        r.id === updatedRequest.id ? updatedRequest : r
      );
    });
  }, []);

  const handleDeleteRequest = useCallback((id) => {
    setRequestDataList((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const { inProgressRequests } = useMemo(() => {
    const inProg = [];
    const done = [];
    for (const r of requestDataList) {
      const s = Number(r?.status ?? 0);
      if (s >= 4) done.push(r);
      else if (s > 0 && s < 4) inProg.push(r);
    }
    return { inProgressRequests: inProg };
  }, [requestDataList]);

  return (
    <Container>
      <RequestHeader
        showPrevButton={true}
        userName="고객님의 "
        to={currentUser ? "/" : "/search/request"}
        prevRequestTo="/search/completed"
        prevRequestState={{
          customer_uid: customer_uid,
          customer_phone: customer_phone,
        }}
      />

      <RequestSection>
        {inProgressRequests.length > 0 ? (
          inProgressRequests.map((req) => (
            <RequestReceived
              key={req.id}
              requestData={req}
              onRealtimeUpdate={handleRealtimeUpdate}
              onDeleteRequest={handleDeleteRequest}
            />
          ))
        ) : (
          <CenteredContent>아직 진행 중인 의뢰가 없습니다.</CenteredContent>
        )}
      </RequestSection>
    </Container>
  );
};

export default InProgressRequest;

const Container = styled.div`
  width: 100%;
`;

const CenteredContent = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;
const RequestSection = styled.section`
  width: 100%;
  padding: 0 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;
