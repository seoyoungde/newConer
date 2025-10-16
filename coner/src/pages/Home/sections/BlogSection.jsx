import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useNavigate } from "react-router-dom";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // 랜덤 셔플 함수
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogQuery = query(collection(db, "Blog"), limit(10));
        const blogSnapshot = await getDocs(blogQuery);

        const blogList = blogSnapshot.docs.map((doc) => {
          const blog = doc.data();

          return {
            id: doc.id,
            title: blog.title || "",
            imageUrl: blog.imageUrl || "/default-blog.png",
            createdAt: blog.createdAt || "",
            author: blog.author || "",
            link: blog.link || "",
          };
        });

        // 랜덤으로 섞기
        const shuffledBlogs = shuffleArray(blogList);
        setBlogs(shuffledBlogs);
      } catch (err) {
        console.error("블로그 데이터를 불러오는 데 실패했습니다:", err);
      }
    };

    fetchBlogs();
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHasMoved(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;

    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }

    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleBlogClick = (blog) => {
    if (blog.link && blog.link.trim() !== "") {
      window.open(blog.link, "_blank");
    } else {
      navigate(`/blog/${blog.id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const match = dateString.match(/(\d{4})년(\d{2})월(\d{2})일/);
    if (match) {
      const [, year, month, day] = match;
      return `${year}.${month}.${day}`;
    }

    return dateString;
  };

  return (
    <BlogContainer>
      <Title>코너의 이야기</Title>

      <ScrollContainer
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        $isDragging={isDragging}
      >
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            onClick={(e) => {
              if (hasMoved) {
                e.preventDefault();
                return;
              }
              handleBlogClick(blog);
            }}
            $isDragging={isDragging}
          >
            <BlogImage
              src={blog.imageUrl}
              alt={blog.title}
              loading="lazy"
              decoding="async"
            />
            <BlogContent>
              <BlogTitle>{blog.title}</BlogTitle>
              <BlogMeta>
                <MetaItem>
                  <ClockIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M6.19255 2C8.50809 2 10.3851 3.877 10.3851 6.19255C10.3851 8.50809 8.50809 10.3851 6.19255 10.3851C3.877 10.3851 2 8.50809 2 6.19255C2 3.877 3.877 2 6.19255 2ZM6.19255 3.67702C6.08135 3.67702 5.97471 3.72119 5.89609 3.79982C5.81746 3.87844 5.77329 3.98508 5.77329 4.09627V6.19255C5.77332 6.30373 5.8175 6.41035 5.89613 6.48896L7.1539 7.74672C7.23297 7.82309 7.33887 7.86535 7.4488 7.8644C7.55873 7.86344 7.66388 7.81935 7.74162 7.74162C7.81935 7.66388 7.86344 7.55873 7.8644 7.4488C7.86535 7.33887 7.82309 7.23297 7.74672 7.1539L6.6118 6.01898V4.09627C6.6118 3.98508 6.56763 3.87844 6.489 3.79982C6.41038 3.72119 6.30374 3.67702 6.19255 3.67702Z"
                        fill="#A0A0A0"
                      />
                    </svg>
                  </ClockIcon>
                  <MetaText>{formatDate(blog.createdAt)} | </MetaText>
                </MetaItem>
                <MetaItem>
                  <AuthorIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M7.71817 6.41382L5.97127 4.65528L7.26398 3.37422L6.92624 3.03649L4.70186 5.26087C4.6087 5.35404 4.5 5.40062 4.37578 5.40062C4.25155 5.40062 4.14286 5.35404 4.04969 5.26087C3.95652 5.1677 3.90994 5.05714 3.90994 4.92919C3.90994 4.80124 3.95652 4.69053 4.04969 4.59705L6.26242 2.38432C6.44876 2.19798 6.66817 2.10481 6.92065 2.10481C7.17314 2.10481 7.39239 2.19798 7.57842 2.38432L7.91615 2.72205L8.49845 2.13975C8.59162 2.04658 8.70233 2 8.83059 2C8.95885 2 9.06941 2.04658 9.16227 2.13975L10.2453 3.22283C10.3385 3.31599 10.3851 3.42671 10.3851 3.55497C10.3851 3.68323 10.3385 3.79379 10.2453 3.88665L7.71817 6.41382ZM2.46584 10.3851C2.33385 10.3851 2.22329 10.3404 2.13416 10.2509C2.04503 10.1615 2.00031 10.0509 2 9.91925V9.02252C2 8.89829 2.02329 8.77981 2.06988 8.66708C2.11646 8.55435 2.18245 8.45543 2.26786 8.37034L5.30745 5.3191L7.06599 7.06599L4.01475 10.1172C3.92935 10.2026 3.83043 10.2686 3.71801 10.3152C3.60559 10.3618 3.48711 10.3851 3.36258 10.3851H2.46584Z"
                        fill="#A0A0A0"
                      />
                    </svg>
                  </AuthorIcon>
                  <MetaText>{blog.author}</MetaText>
                </MetaItem>
              </BlogMeta>
            </BlogContent>
          </BlogCard>
        ))}
      </ScrollContainer>
    </BlogContainer>
  );
};

export default BlogSection;

const BlogContainer = styled.section`
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
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    gap: 12px;
    cursor: default;
  }
`;

const BlogCard = styled.div`
  min-width: 233px;
  height: 198px;
  border-radius: 12px;

  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "pointer")};
  background: white;
`;

const BlogImage = styled.img`
  width: 100%;
  height: 125px;
  object-fit: cover;
  pointer-events: none;
  border-radius: 12px 12px 0px 0px;
`;

const BlogContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const BlogTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text || "#000"};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const BlogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ClockIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetaText = styled.span`
  color: #8b8b8b;
  font-size: 10px;
`;
const AuthorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
