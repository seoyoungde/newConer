import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import LeftbannerIcon from "../src/assets/images/leftbanner2.png";
import Header from "./components/common/Header/Header";
import Navigation from "./components/common/Navigation/Navigation";

const Layout = () => {
  const rightRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const scrollRef = useRef(null);

  const [navPos, setNavPos] = useState({ left: 0, width: 0, height: 64 });

  // RightBox 위치/폭을 측정해 fixed 네비에 반영
  useEffect(() => {
    const update = () => {
      const box = rightRef.current;
      const navEl = navRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      setNavPos((p) => ({
        left: rect.left,
        width: rect.width,
        height: navEl?.offsetHeight || p.height,
      }));
    };

    update();

    const ro = new ResizeObserver(() => requestAnimationFrame(update));
    if (rightRef.current) ro.observe(rightRef.current);

    const onResize = () => requestAnimationFrame(update);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      vv?.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const target = scrollRef.current;
    const headers = [headerRef.current, navRef.current].filter(Boolean);
    if (!target || headers.length === 0) return;

    const attachScrollProxy = (el) => {
      if (!el) return;

      const onWheel = (e) => {
        target.scrollBy({ top: e.deltaY, behavior: "auto" });
        e.preventDefault();
      };

      let startY = 0;
      let lastY = 0;
      let dragging = false;

      const onTouchStart = (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        startY = lastY = e.touches[0].clientY;
        dragging = true;
      };

      const onTouchMove = (e) => {
        if (!dragging || !e.touches || e.touches.length !== 1) return;
        const y = e.touches[0].clientY;
        const dy = y - lastY;
        lastY = y;

        target.scrollTop -= dy;

        e.preventDefault();
      };

      const onTouchEnd = () => {
        dragging = false;
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
      el.addEventListener("touchcancel", onTouchEnd, { passive: true });

      return () => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("touchcancel", onTouchEnd);
      };
    };

    const cleanups = headers.map(attachScrollProxy);

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, []);

  return (
    <Container>
      <LeftImage>
        <img src={LeftbannerIcon} alt="코너 배너" loading="lazy" />
      </LeftImage>

      <RightBox ref={rightRef}>
        <HeaderArea ref={headerRef}>
          <Header />
        </HeaderArea>

        {/* 네비가 가리지 않도록 네비 높이만큼 패딩 */}
        <ScrollArea
          ref={scrollRef}
          style={{
            paddingBottom: `calc(${navPos.height}px + env(safe-area-inset-bottom))`,
          }}
        >
          <ContentBox>
            <Outlet />
          </ContentBox>
        </ScrollArea>

        {/* fixed 네비: RightBox의 left/width에 정확히 맞춤 */}
        <NavFixed
          ref={navRef}
          style={{
            left: `${navPos.left}px`,
            width: `${navPos.width}px`,
          }}
        >
          <Navigation />
        </NavFixed>

        <div id="rightbox-modal-root" />
      </RightBox>
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100dvh; /* 모바일 브라우저 주소창 대응 */
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const LeftImage = styled.aside`
  width: 340px;
  img {
    width: 100%;
    display: block;
  }
  @media (max-width: 1050px) {
    display: none;
  }
`;

const RightBox = styled.main`
  position: relative;
  width: 605px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #d4d4d4;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const HeaderArea = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  /* 헤더 위에서의 스크롤 제스처 허용 */
  touch-action: pan-y;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  contain: layout paint;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const ContentBox = styled.div`
  max-width: 605px;
  width: 100%;
  margin: 0 auto;
`;

/* 뷰포트 하단 고정 네비 - RightBox left/width에 맞춤 */
const NavFixed = styled.nav`
  position: fixed;
  bottom: env(safe-area-inset-bottom, 0px);
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  touch-action: pan-y; /* 네비 위에서도 세로 제스처 허용 */

  /* 합성 레이어 승격: 스크롤과 독립 */
  will-change: transform;
  transform: translateZ(0);
`;
