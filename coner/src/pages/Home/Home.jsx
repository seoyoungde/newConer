import ServiceGrid from "./sections/ServiceGrid";
import styled from "styled-components";
import PartnerSelect from "./sections/PartnerSelect";
import ServiceType from "./sections/ServiceType";
import Footer from "../../components/common/Footer";
import mianbannerIcon from "../../assets/images/mainbanner.png";

const Home = () => {
  return (
    <div style={{ width: "100%", background: "#F7F7F7" }}>
      <img
        src={mianbannerIcon}
        alt="코너 배너"
        loading="lazy"
        width={604}
        height={302}
      />
      <MainContent>
        <ServiceGrid />
        <PartnerSelect />
        {/* <ServiceType /> */}
        <Footer />
      </MainContent>
    </div>
  );
};
export default Home;
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 34px 34px;
  @media (max-width: ${({ theme }) => theme.font.breakpoints.mobile}) {
    padding: 34px 15px;
  }
`;
