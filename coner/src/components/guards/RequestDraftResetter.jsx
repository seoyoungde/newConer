import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRequest } from "../../context/context";

const KEEP_PREFIXES = ["/request", "/partner"];

const RequestDraftResetter = () => {
  const location = useLocation();
  const { resetRequestData } = useRequest();

  useEffect(() => {
    const inScope = KEEP_PREFIXES.some((p) => location.pathname.startsWith(p));
    if (!inScope) {
      resetRequestData();
    }
  }, [location.pathname, resetRequestData]);

  return null;
};

export default RequestDraftResetter;
