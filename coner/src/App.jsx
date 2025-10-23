import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx";
import NoHeaderLayout from "./NOHeaderLayout.jsx";
import AuthAddressPage from "./pages/Auth/AuthAddressPage.jsx";
import PricingPage from "./pages/Price/PricePage.jsx";
import RequestSearchPage from "./pages/Search/RequestSearchPage.jsx";
import MyPage from "./pages/Mypage/MyPage.jsx";
import MypageInquiryPage from "./pages/Mypage/MypageInquiryPage.jsx";
import ModifyPage from "./pages/Mypage/ModifyPage.jsx";
import RequestDraftResetter from "./components/guards/RequestDraftResetter.jsx";
import { usePageView } from "./analytics/usePageView.jsx";
import PayPage from "./pages/Pay/PayPage.jsx";
import SuccessPage from "./pages/Pay/SuccessPage.jsx";
import PartnerApply from "./pages/partner/PartnerApply.jsx";
import SmsRequestPage from "./pages/Search/SmsRequestPage.jsx";
import CompletedRequests from "./pages/Search/CompletedRequests.jsx";
import InProgressRequest from "./pages/Search/InProgressRequest.jsx";
import RequestSearchLayout from "./RequestSearchLayout.jsx";

// 단계 리뉴얼 디자인
import Step0 from "./pages/Request/Steps/Step0.jsx";
import Step1 from "./pages/Request/Steps/Step1.jsx";
import StepLayout from "./StepLayout.jsx";
import Step2 from "./pages/Request/Steps/Step2.jsx";
import Step3 from "./pages/Request/Steps/Step3.jsx";
import Step4 from "./pages/Request/Steps/Step4.jsx";
import Step5 from "./pages/Request/Steps/Step5.jsx";
import Step6 from "./pages/Request/Steps/Step6.jsx";
import SubmitSuccess from "./pages/Request/SubmitSuccess.jsx";

import PartnerStep0 from "./pages/partner/Steps/PartnerStep0.jsx";
import PartnerStepPurchase from "./pages/partner/Steps/PartnerStepPurchase.jsx";
import PartnerStep1 from "./pages/partner/Steps/PartnerStep1.jsx";
import PartnerStep2 from "./pages/partner/Steps/PartnerStep2.jsx";
import PartnerStep3 from "./pages/partner/Steps/PartnerStep3.jsx";
import PartnerStep4 from "./pages/partner/Steps/PartnerStep4.jsx";
import PartnerStep5 from "./pages/partner/Steps/PartnerStep5.jsx";
import PartnerStep6 from "./pages/partner/Steps/PartnerStep6.jsx";

const FailPage = lazy(() => import("./pages/Pay/FailPage.jsx"));
const WithdrawPage = lazy(() => import("./pages/Mypage/WithdrawPage.jsx"));
const QnaPage = lazy(() => import("./pages/Mypage/QnaPage.jsx"));
const RequestModifyPage = lazy(() =>
  import("./pages/Request/RequestModifyPage.jsx")
);
const PartnerModifyPage = lazy(() =>
  import("./pages/partner/PartnerModifyPage.jsx")
);
const CancelReviewPage = lazy(() =>
  import("./pages/Review/CancelReviewPage.jsx")
);
const ReviewPage = lazy(() => import("./pages/Review/ReviewPage.jsx"));

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/addressmodal" element={<AuthAddressPage />} />

          <Route path="/partner/apply" element={<PartnerApply />} />

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
          <Route path="/reviewform/:requestId" element={<ReviewPage />} />
          <Route path="/cancelform/:requestId" element={<CancelReviewPage />} />
        </Route>
        <Route element={<StepLayout />}>
          {/* 단계리뉴얼디자인 */}
          <Route path="/request/step0" element={<Step0 />} />
          <Route path="/request/step1" element={<Step1 />} />
          <Route path="/request/step2" element={<Step2 />} />
          <Route path="/request/step3" element={<Step3 />} />
          <Route path="/request/step4" element={<Step4 />} />
          <Route path="/request/step5" element={<Step5 />} />
          <Route path="/request/step6" element={<Step6 />} />
          <Route path="/request/submitsuccess" element={<SubmitSuccess />} />
          {/* 파트너의뢰서신청단계 */}
          <Route path="/partner/step0/:partnerId" element={<PartnerStep0 />} />
          <Route
            path="/partner/step0/purchase/:partnerId"
            element={<PartnerStepPurchase />}
          />
          <Route path="/partner/step1/:partnerId" element={<PartnerStep1 />} />
          <Route path="/partner/step2/:partnerId" element={<PartnerStep2 />} />
          <Route path="/partner/step3/:partnerId" element={<PartnerStep3 />} />
          <Route path="/partner/step4/:partnerId" element={<PartnerStep4 />} />
          <Route path="/partner/step5/:partnerId" element={<PartnerStep5 />} />
          <Route path="/partner/step6/:partnerId" element={<PartnerStep6 />} />
        </Route>

        <Route element={<RequestSearchLayout />}>
          {/* 의뢰서 조회하기 -> 진행중 /완료 보기 */}
          <Route path="/search/inquiry" element={<InProgressRequest />} />
          <Route path="/search/completed" element={<CompletedRequests />} />
          <Route path="/mypage/inquiry" element={<MypageInquiryPage />} />
          <Route path="/search/sms/:requestId" element={<SmsRequestPage />} />
          <Route path="/search/request" element={<RequestSearchPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/price" element={<PricingPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
      <RequestDraftResetter />
    </BrowserRouter>
  );
}
