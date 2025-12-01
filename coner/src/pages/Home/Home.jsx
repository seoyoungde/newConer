import ServiceGrid from "./sections/ServiceGrid";
import styled from "styled-components";
import Footer from "../../components/common/Footer";
import mianbannerIcon from "../../assets/images/mainbanner.png";
import PartnerSection from "./sections/PartnerSection";
import ReviewSection from "./sections/ReviewSection";
import BlogSection from "./sections/BlogSection";
import EnterpriseBanner from "./sections/EnterpriseBanner";

const Home = () => {
  sessionStorage.removeItem("entryFrom");
  return (
    <div style={{ width: "100%", background: "#F7F7F7" }}>
      <img
        src={mianbannerIcon}
        alt="코너 배너"
        loading="lazy"
        width={604}
        height={302}
      />
      <ServiceGrid />
      <EnterpriseBanner />
      <MainContent>
        <PartnerSection />
        {/* <ReviewSection /> */}
        <BlogSection />
        <Footer />
      </MainContent>
    </div>
  );
};
export default Home;
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 34px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 34px 15px;
  }
`;
