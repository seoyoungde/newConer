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
import { db } from "../../lib/firebase";
import CompletedRequests from "../../components/search/CompletedRequests";
import RequestReceived from "../Search/RequestReceived";
import * as firebaseAuth from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider";
import NavHeader from "../../components/common/Header/NavHeader";

const MypageInquiryPage = () => {
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (u) => {
      if (!customer_uid && u) {
        setCustomerUid(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRequestByClient = useCallback(async () => {
    setLoading(true);
    const requests = new Map();

    try {
      const tasks = [];

      if (requestId) {
        tasks.push(getDoc(doc(db, "testrequest", requestId)));
      }

      if (customer_uid) {
        tasks.push(
          getDocs(
            query(
              collection(db, "testrequest"),
              where("customer_uid", "==", customer_uid)
            )
          )
        );
      }

      if (customer_phone) {
        tasks.push(
          getDocs(
            query(
              collection(db, "testrequest"),
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
      setLoading(false);
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

  const { inProgressRequests, completedRequests } = useMemo(() => {
    const inProg = [];
    const done = [];
    for (const r of requestDataList) {
      const s = Number(r?.status ?? 0);
      if (s >= 4) done.push(r);
      else if (s > 0 && s < 4) inProg.push(r);
    }
    return { inProgressRequests: inProg, completedRequests: done };
  }, [requestDataList]);

  return (
    <Container>
      <NavHeader to="/mypage" title="의뢰서 조회" />
      <TabHeader>
        <Tab
          $isActive={activeTab === "progress"}
          onClick={() => setActiveTab("progress")}
        >
          진행 중
        </Tab>
        <Tab
          $isActive={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        >
          완료된
        </Tab>
      </TabHeader>

      <TabContent>
        {loading ? (
          <CenteredContent>로딩 중...</CenteredContent>
        ) : activeTab === "progress" ? (
          inProgressRequests.length > 0 ? (
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
          )
        ) : completedRequests.length > 0 ? (
          completedRequests.map((req) => (
            <CompletedRequests key={req.id} requestData={req} />
          ))
        ) : (
          <CenteredContent>아직 완료된 의뢰가 없습니다.</CenteredContent>
        )}
      </TabContent>
    </Container>
  );
};

export default MypageInquiryPage;

const Container = styled.div`
  width: 100%;
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  background: ${({ theme }) => theme.colors.bg};
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px 0;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};
  color: ${({ $isActive }) => ($isActive ? "#0080FF" : "#333")};
  text-align: center;
  position: relative;
  border: none;
  background: none;
  cursor: pointer;

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${({ $isActive }) => ($isActive ? "100%" : "0")};
    height: 2px;
    background-color: ${({ $isActive }) =>
      $isActive ? "#0080FF" : "transparent"};
    transition: width 0.3s ease;
  }
`;

const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const CenteredContent = styled.div`
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;
