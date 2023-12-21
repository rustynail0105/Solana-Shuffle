import axios from "axios";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/instance";

// component to send request to backend when user enters site
// using a referal link

// backend then saves a cookie

const Referral = ({ children }) => {
  const [searchParams, _] = useSearchParams();

  useEffect(() => {
    const referer = searchParams.get("ref");
    if (!referer) {
      return;
    }

    axiosInstance.get(
      `${import.meta.env.VITE_REFERRALS_API}/activate?ref=${referer}`,
      {
        withCredentials: true,
      }
    );
  }, [searchParams]);

  return <>{children}</>;
};

export default Referral;
