import { lazy, Suspense } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import Step1Page from "./pages/Request/Step1Page.jsx";
import Step2Page from "./pages/Request/Step2Page.jsx";
import Step3Page from "./pages/Request/Step3Page.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx";
import NoHeaderLayout from "./NOHeaderLayout.jsx";
import AuthAddressPage from "./pages/Auth/AuthAddressPage.jsx";
import PricingPage from "./pages/Price/PricePage.jsx";
import RequestPricePage from "./pages/Price/RequestPricePage.jsx";
import InstallpurchasePage from "./pages/Request/InstallPurchasePage.jsx";
import RequestSearchPage from "./pages/Search/RequestSearchPage.jsx";
import InquiryPage from "./pages/Search/InquiryPage.jsx";
import PartnerListPage from "./pages/partner/PartnerListPage.jsx";
import PartnerStep1Page from "./pages/partner/PartnerStep1Page.jsx";
import PartnerStep2Page from "./pages/partner/PartnerStep2Page.jsx";
import PartnerStep3Page from "./pages/partner/PartnerStep3Page.jsx";
import PartnerPricePage from "./pages/Price/PartnerPricePage.jsx";
import MyPage from "./pages/Mypage/MyPage.jsx";
import MypageInquiryPage from "./pages/Mypage/MypageInquiryPage.jsx";
import ModifyPage from "./pages/Mypage/ModifyPage.jsx";
import RequestDraftResetter from "./components/guards/RequestDraftResetter.jsx";
import { usePageView } from "./analytics/usePageView.jsx";
import PayPage from "./pages/Pay/payPage.jsx";
import SuccessPage from "./pages/Pay/successPage.jsx";
import PartnerApply from "./pages/partner/PartnerApply.jsx";

const FailPage = lazy(() => import("./pages/Pay/FailPage.jsx"));
const WithdrawPage = lazy(() => import("./pages/Mypage/WithdrawPage.jsx"));
const QnaPage = lazy(() => import("./pages/Mypage/QnaPage.jsx"));
const RequestModifyPage = lazy(() =>
  import("./pages/Request/RequestModifyPage.jsx")
);
const PartnerModifyPage = lazy(() =>
  import("./pages/partner/PartnerModifyPage.jsx")
);

function PageViewTracker() {
  usePageView();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route index path="/" element={<Home />} />

          <Route path="*" element={<div>Not Found</div>} />
        </Route>

        <Route element={<NoHeaderLayout />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/price" element={<PricingPage />} />
          <Route
            path="/request/install-purchase"
            element={<InstallpurchasePage />}
          />
          <Route path="/request/step1" element={<Step1Page />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/addressmodal" element={<AuthAddressPage />} />

          <Route path="/request/step2" element={<Step2Page />} />
          <Route path="/request/step3" element={<Step3Page />} />

          <Route path="/request/price" element={<RequestPricePage />} />
          <Route path="/search/request" element={<RequestSearchPage />} />
          <Route path="/search/inquiry" element={<InquiryPage />} />
          <Route path="/partner/list" element={<PartnerListPage />} />
          <Route
            path="/partner/step1/:partnerId"
            element={<PartnerStep1Page />}
          />
          <Route
            path="/partner/step2/:partnerId"
            element={<PartnerStep2Page />}
          />
          <Route
            path="/partner/step3/:partnerId"
            element={<PartnerStep3Page />}
          />

          <Route
            path="/partner/price/:partnerId"
            element={<PartnerPricePage />}
          />

          <Route path="/partner/apply" element={<PartnerApply />} />

          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/inquiry" element={<MypageInquiryPage />} />
          <Route path="/qna" element={<QnaPage />} />
          <Route path="/mypage/modify" element={<ModifyPage />} />
          <Route path="/mypage/withdraw" element={<WithdrawPage />} />
          <Route path="/request/modify" element={<RequestModifyPage />} />
          <Route
            path="/partner/modify/:partnerId"
            element={<PartnerModifyPage />}
          />
          <Route path="/pay/:requestId" element={<PayPage />} />
          <Route path="/pay/success/:requestId" element={<SuccessPage />} />
          <Route path="/pay/fail/:requestId" element={<FailPage />} />
        </Route>
      </Routes>
      <RequestDraftResetter />
    </BrowserRouter>
  );
}
