import axios from "axios";
import axiosInstance from "./instance";

export async function getStats() {
  const response = await axiosInstance.get(
    `${import.meta.env.VITE_API}/leaderboards`
  );
  return response.data;
}
