import AddressModal from "../../components/common/Modal/AddressModal";
import NavHeader from "../../components/common/Header/NavHeader";

const AddressPage = () => {
  return (
    <div>
      <NavHeader to="/signup" />
      <AddressModal />
    </div>
  );
};
export default AddressPage;
