import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import RequestReceived from "./RequestReceived";
import RequestHeader from "../../components/common/Header/RequestHeader";

const SmsRequestPage = () => {
  const { requestId } = useParams(); // URL에서 requestId 가져오기
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!requestId) {
        setError("의뢰서 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, "Request", requestId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequestData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("해당 의뢰서를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("의뢰서 조회 중 오류 발생:", error);
        setError("의뢰서 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [requestId]);

  const handleRealtimeUpdate = (updatedRequest) => {
    setRequestData(updatedRequest);
  };

  const handleDeleteRequest = () => {
    // 삭제 후 홈으로 이동
    navigate("/");
  };

  if (loading) {
    return (
      <Container>
        <RequestHeader showPrevButton={false} userName="고객님의 " to={"/"} />
        <CenteredContent>로딩 중...</CenteredContent>
      </Container>
    );
  }

  if (error || !requestData) {
    return (
      <Container>
        <RequestHeader showPrevButton={false} userName="고객님의 " to={"/"} />
        <CenteredContent>
          {error || "의뢰서를 찾을 수 없습니다."}
        </CenteredContent>
      </Container>
    );
  }

  const status = Number(requestData?.status ?? 0);
  const isCompleted = status >= 4;

  return (
    <Container>
      <RequestHeader showPrevButton={false} userName="고객님의 " to={"/"} />
      <RequestSection>
        <RequestReceived
          requestData={requestData}
          onRealtimeUpdate={handleRealtimeUpdate}
          onDeleteRequest={handleDeleteRequest}
        />
      </RequestSection>
    </Container>
  );
};

export default SmsRequestPage;

const Container = styled.div`
  width: 100%;
`;

const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: ${({ theme }) => theme.font.size.bodyLarge};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;
const RequestSection = styled.section`
  width: 100%;
  padding: 0 24px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 0 15px;
  }
`;
