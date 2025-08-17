import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const RequestContext = createContext();

const initialRequestState = {
  request_id: "",
  service_type: "",
  aircon_type: "",
  brand: "",
  customer_uid: "",
  clientName: "",
  customer_phone: "",
  customer_address: "",
  customer_address_detail: "",
  partner_uid: "",
  partner_name: "",
  partner_address: "",
  partner_address_detail: "",
  engineer_uid: "",
  engineer_name: "",
  engineer_phone: "",
  engineer_profile_image: "",
  service_date: "",
  service_time: "",
  service_images: [],
  accepted_at: "",
  created_at: "",
  completed_at: "",
  memo: "",
  payment_requested_at: "",
  status: 1,
  sprint: [],
  detailInfo: "",
  customer_type: "",
  selectedTechnician: null,
  partner_flow: false,
};
const DRAFT_KEY = "request_draft_v1";
export const RequestProvider = ({ children }) => {
  const [requestData, setRequestData] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw
        ? { ...initialRequestState, ...JSON.parse(raw) }
        : initialRequestState;
    } catch {
      return initialRequestState;
    }
  });

  const allowedFields = [
    "request_id",
    "service_type",
    "aircon_type",
    "brand",
    "clientName",
    "customer_uid",
    "customer_phone",
    "customer_address",
    "customer_address_detail",
    "partner_uid",
    "partner_name",
    "partner_address",
    "partner_address_detail",
    "engineer_uid",
    "engineer_name",
    "engineer_phone",
    "engineer_profile_image",
    "service_date",
    "service_time",
    "service_images",
    "accepted_at",
    "created_at",
    "completed_at",
    "memo",
    "payment_requested_at",
    "status",
    "sprint",
    "detailInfo",
    "customer_type",
  ];
  const filterAllowedFields = (data) => {
    const filtered = {};
    allowedFields.forEach((key) => {
      if (key in data) filtered[key] = data[key];
    });
    return filtered;
  };

  const updateRequestData = useCallback((key, value) => {
    setRequestData((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);
  const updateRequestDataMany = useCallback((patch) => {
    setRequestData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetRequestData = useCallback(() => {
    setRequestData(initialRequestState);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, []);

  //업체선택후 로컬에 저장
  const setPartner = useCallback((p) => {
    setRequestData((prev) => {
      const next = {
        ...prev,
        partner_uid: p.partner_uid || "",
        partner_name: p.partner_name || "",
        partner_address: p.partner_address || "",
        partner_address_detail: p.partner_address_detail || "",
        partner_flow: true,
        selectedTechnician: p.selectedTechnician ?? prev.selectedTechnician,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    localStorage.setItem("req.partner_uid", p.partner_uid || "");
    localStorage.setItem("req.partner_name", p.partner_name || "");
    localStorage.setItem("req.partner_address", p.partner_address || "");
    localStorage.setItem(
      "req.partner_address_detail",
      p.partner_address_detail || ""
    );
  }, []);
  const clearPartner = useCallback(() => {
    setRequestData((prev) => {
      const next = {
        ...prev,
        partner_uid: "",
        partner_name: "",
        partner_address: "",
        partner_address_detail: "",
        partner_flow: false,
        selectedTechnician: null,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);
  const fetchRequestByClient = useCallback(async (customer_phone) => {
    try {
      const q = query(
        collection(db, "testrequest"),
        where("customer_phone", "==", customer_phone)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        console.log("❌ 일치하는 의뢰서를 찾을 수 없습니다.");
        return [];
      }
    } catch (error) {
      console.error("❌ Firestore에서 데이터 조회 중 오류 발생:", error);
      return [];
    }
  }, []);

  const setRequestState = useCallback((newState) => {
    if (![1, 2, 3, 4].includes(newState)) {
      console.error("잘못된 상태 값입니다. (1~4만 허용)");
      return;
    }
    setRequestData((prev) => {
      const next = { ...prev, status: newState };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const submitRequest = useCallback(
    async (updatedRequestData) => {
      if (!updatedRequestData || !updatedRequestData.service_type) {
        console.error(
          "submitRequest: requestData가 비어 있습니다.",
          updatedRequestData
        );
        return;
      }

      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = `${today.getMonth() + 1}`.padStart(2, "0");
        const day = `${today.getDate()}`.padStart(2, "0");
        const formattedDate = `${year}년 ${month}월 ${day}일`;
        const isPartnerFlow = !!updatedRequestData.partner_flow;
        const newDocRef = doc(collection(db, "testrequest"));
        const sanitizedData = {
          ...filterAllowedFields(updatedRequestData),
          request_id: newDocRef.id,
          created_at: formattedDate,
        };
        if (!isPartnerFlow) {
          sanitizedData.partner_uid = "";
          sanitizedData.partner_name = "";
          sanitizedData.partner_address = "";
          sanitizedData.partner_address_detail = "";
        }
        await setDoc(newDocRef, sanitizedData);

        resetRequestData();
        return newDocRef.id;
      } catch (error) {
        console.error("❌ Firestore 저장 중 오류 발생:", error);
      }
    },
    [resetRequestData]
  );
  const value = useMemo(
    () => ({
      requestData,
      updateRequestData,
      updateRequestDataMany,
      resetRequestData,
      fetchRequestByClient,
      submitRequest,
      setRequestState,
      setPartner,
      clearPartner,
    }),
    [
      requestData,
      updateRequestData,
      updateRequestDataMany,
      resetRequestData,
      fetchRequestByClient,
      submitRequest,
      setRequestState,
      setPartner,
      clearPartner,
    ]
  );
  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  );
};

export const useRequest = () => useContext(RequestContext);
