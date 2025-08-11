import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import AddressContactForm from "./pages/Request/AddressContactForm.jsx";
import ScheduleSelect from "./pages/Request/ScheduleSelect.jsx";
import ServiceTypeSelect from "./pages/Request/ServiceTypeSelect.jsx";
import AdditionalRequestForm from "./pages/Request/AdditionalRequestForm.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="request/address-contact"
            element={<AddressContactForm />}
          />
          <Route path="request/schedule" element={<ScheduleSelect />} />
          <Route path="request/service-type" element={<ServiceTypeSelect />} />
          <Route
            path="request/additional-request"
            element={<AdditionalRequestForm />}
          />
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
