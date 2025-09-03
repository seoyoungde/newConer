import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { collection, query, where } from "firebase/firestore";
import * as firebaseAuth from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider";
import { onSnapshot } from "firebase/firestore";
import mypagelogo from "../../assets/images/mypagelogo.png";
import NavHeader from "../../components/common/Header/NavHeader";

const sections = [
  {
    items: [
      {
        label: "공지사항",
        link: "https://coner-aircon.notion.site/e3cfa3b4d2e447cc8ee54048172e61db",
      },
      {
        label: "개인정보처리방침",
        link: "https://seojinhyeong.notion.site/79b84540aa2642e2ba26db26c2d39e7d",
      },
    ],
  },
];

const MyPage = () => {
  const navigate = useNavigate();
  const { currentUser, userInfo, setUserInfo } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!userInfo?.phone || userInfo?.isDeleted) return;

    const q = query(
      collection(db, "Request"),
      where("customer_uid", "==", userInfo.member_id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => doc.data());
      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, [userInfo]);

  const handleLogout = async () => {
    await firebaseAuth.signOut(auth);
    setUserInfo(null);
    navigate("/login");
  };
  const requestStates = [
    {
      label: "진행예정",
      count: `${requests.filter((r) => r.status === 1).length}건`,
      statusValue: 1,
    },
    {
      label: "진행중",
      count: `${requests.filter((r) => r.status === 2).length}건`,
      statusValue: 2,
    },
    {
      label: "진행완료",
      count: `${requests.filter((r) => r.status === 4).length}건`,
      statusValue: 4,
    },
  ];

  return (
    <Container>
      <NavHeader to="/" title="마이페이지" />
      <UserBox>
        <h1>반가워요 {userInfo?.name || "고객"}님</h1>

        {currentUser ? <div></div> : <Link to="/loginpage">로그인하기</Link>}
      </UserBox>
      <ProfileSection>
        <Logo src={mypagelogo} alt="앱 로고" />
        <h3>{userInfo?.name || "고객"}님</h3>
        {currentUser ? (
          <ModifyLink to="/mypage/modify">내 정보 수정하기</ModifyLink>
        ) : (
          <div></div>
        )}
      </ProfileSection>

      <UserRequestNumber>
        <StateBox>
          {requestStates.map((status, i) => (
            <StateItem
              key={i}
              $isLast={i === requestStates.length - 1}
              onClick={() =>
                navigate("/mypage/inquiry", {
                  status: {
                    status: status.statusValue,
                    customer_uid: currentUser?.uid,
                  },
                })
              }
            >
              <p>{status.label}</p>
              <p>{status.count}</p>
            </StateItem>
          ))}
        </StateBox>
      </UserRequestNumber>

      {sections.map((section, index) => (
        <InfoSection key={index}>
          {section.items.map((item, idx) => (
            <InfoItem key={idx}>
              {item.link.startsWith("http") ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : (
                <Link to={item.link}>{item.label}</Link>
              )}
            </InfoItem>
          ))}
        </InfoSection>
      ))}

      <Footer>
        {currentUser ? (
          <LogoutBtn onClick={handleLogout}>로그아웃하기</LogoutBtn>
        ) : (
          <div></div>
        )}
        <p>©CONER Co., All rights reserved.</p>
      </Footer>
    </Container>
  );
};
export default MyPage;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const UserBox = styled.div`
  h1 {
    text-align: center;
    padding: 15px;
  }
`;

const UserRequestNumber = styled.div`
  width: 100%;
  margin: auto;
  background: #f5f5f5;
  margin-bottom: 13px;
  border-radius: 8px;
`;

const StateBox = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px 30px;
  text-align: center;
`;

const StateItem = styled.div`
  flex: 1;
  line-height: 1.5;
  border-right: ${({ $isLast }) => ($isLast ? "none" : "1px solid #b5b3b3")};

  p:nth-child(1) {
    font-weight: ${({ theme }) => theme.font.weight.bold};
    font-size: ${({ theme }) => theme.font.size.body};
    margin-bottom: 10px;
  }

  p:nth-child(2) {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    font-size: ${({ theme }) => theme.font.size.body};
  }
`;

const ProfileSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
  h3 {
    margin-top: 15px;
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const Logo = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin-bottom: 17px;
  margin: auto;
`;

const InfoSection = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 5px 0 5px 42px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  padding: 10px 0;
  font-size: ${({ theme }) => theme.font.size.body};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 40px;
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;
const ModifyLink = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.bodySmall};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.subtext};
  cursor: pointer;
`;
const LogoutBtn = styled.button`
  border: none;
  backgroundcolor: #f9f9f9;
  textdecoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;
