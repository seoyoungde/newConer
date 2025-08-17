import RequestAddressModal from "../../components/common/Modal/RequestAddressModal";
import NavHeader from "../../components/common/Header/NavHeader";

const RequestAddressModalPage = () => {
  return (
    <div>
      <NavHeader to="/request/address-contact" />
      <RequestAddressModal />
    </div>
  );
};
export default RequestAddressModalPage;
