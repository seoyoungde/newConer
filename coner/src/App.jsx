import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import AddressContactPage from "./pages/Request/AddressContactPage.jsx";
import ScheduleSelectPage from "./pages/Request/ScheduleSelectPage.jsx";
import ServiceTypeSelectPage from "./pages/Request/ServiceTypeSelectPage.jsx";
import AdditionalRequestPage from "./pages/Request/AdditionalRequestPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx";
import NoHeaderLayout from "./NOHeaderLayout.jsx";
import AuthAddressPage from "./pages/Auth/AuthAddressPage.jsx";
import PricingPage from "./pages/Price/PricePage.jsx";
import RequestAddressModalPage from "./pages/Request/RequestAddressModalPage.jsx";
import RequestPricePage from "./pages/Price/RequestPricePage.jsx";
import InstallPage from "./pages/Request/InstallPage.jsx";
import InstallpurchasePage from "./pages/Request/InstallPurchasePage.jsx";
import RequestSearchPage from "./pages/Search/RequestSearchPage.jsx";
import NavHeaderLayout from "./NavHeaderLayout.jsx";
import InquiryPage from "./pages/Search/InquiryPage.jsx";
import PartnerListPage from "./pages/partner/PartnerListPage.jsx";
import PartnerAddressContactPage from "./pages/partner/partenrAddressContactPage.jsx";
import PartnerScheduleSelectPage from "./pages/partner/PartenrScheduleSelectPage.jsx";
import PartnerServiceTypeSelectPage from "./pages/partner/PartnerServiceTypeSelectPage.jsx";
import PartnerAdditionalRequestPage from "./pages/partner/PartnerAdditionalRequestPage.jsx";
import PartnerPricePage from "./pages/Price/PartnerPricePage.jsx";
import MyPage from "./pages/Mypage/MyPage.jsx";
import MypageInquiryPage from "./pages/Mypage/MypageInquiryPage.jsx";
import QnaPage from "./pages/Mypage/QnaPage.jsx";
import ModifyPage from "./pages/Mypage/ModifyPage.jsx";
import WithdrawPage from "./pages/Mypage/WIthdrawPage.jsx";
import RequestModifyPage from "./pages/Request/RequestModifyPage.jsx";
import PartnerModifyPage from "./pages/partner/PartnerModifyPage.jsx";
import RequestDraftResetter from "./components/guards/RequestDraftResetter.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index path="/" element={<Home />} />

          <Route path="*" element={<div>Not Found</div>} />
        </Route>

        <Route element={<NoHeaderLayout />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/price" element={<PricingPage />} />
          <Route path="/request/install" element={<InstallPage />} />
          <Route
            path="/request/install-purchase"
            element={<InstallpurchasePage />}
          />
          <Route
            path="/request/address-contact"
            element={<AddressContactPage />}
          />
          <Route
            path="/request/addressmodal"
            element={<RequestAddressModalPage />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/addressmodal" element={<AuthAddressPage />} />

          <Route path="/request/schedule" element={<ScheduleSelectPage />} />
          <Route
            path="/request/service-type"
            element={<ServiceTypeSelectPage />}
          />
          <Route
            path="/request/additional"
            element={<AdditionalRequestPage />}
          />
          <Route path="/request/price" element={<RequestPricePage />} />
          <Route path="/search/request" element={<RequestSearchPage />} />
          <Route path="/search/inquiry" element={<InquiryPage />} />
          <Route path="/partner/list" element={<PartnerListPage />} />
          <Route
            path="/partner/address-contact/:partnerId"
            element={<PartnerAddressContactPage />}
          />
          <Route
            path="/partner/schedule/:partnerId"
            element={<PartnerScheduleSelectPage />}
          />
          <Route
            path="/partner/service-type/:partnerId"
            element={<PartnerServiceTypeSelectPage />}
          />
          <Route
            path="/partner/additional/:partnerId"
            element={<PartnerAdditionalRequestPage />}
          />
          <Route
            path="/partner/price/:partnerId"
            element={<PartnerPricePage />}
          />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/inquiry" element={<MypageInquiryPage />} />
          <Route path="/mypage/qna" element={<QnaPage />} />
          <Route path="/mypage/modify" element={<ModifyPage />} />
          <Route path="/mypage/withdraw" element={<WithdrawPage />} />
          <Route path="/request/modify" element={<RequestModifyPage />} />
          <Route
            path="/partner/modify/:partnerId"
            element={<PartnerModifyPage />}
          />
        </Route>

        <Route element={<NavHeaderLayout />}></Route>
      </Routes>
      <RequestDraftResetter />
    </BrowserRouter>
  );
}
