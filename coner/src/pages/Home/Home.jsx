import ServiceGrid from "./sections/ServiceGrid";
import PartnerSelect from "./sections/PartnerSelect";
import ServiceType from "./sections/ServiceType";
import Footer from "../../components/common/footer";

const Home = () => {
  return (
    <div style={{ width: "100%" }}>
      <ServiceGrid />
      <PartnerSelect />
      <ServiceType />
      <Footer />
    </div>
  );
};
export default Home;
