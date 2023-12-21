import axios from "axios";
import axiosInstance from "./instance";

export async function createTower(signature, difficulty) {
  const response = await axiosInstance.post(
    `${import.meta.env.VITE_API}/tower`,
    {
      signature,
      difficulty,
      tokenTicker: "SOL",
      clientSeed: "aGVsbG8gd29ybGQ=",
    }
  );

  return response.data;
}

export async function actionTower(id, level, tile) {
  const response = await axiosInstance.post(
    `${import.meta.env.VITE_API}/tower/${id}/action`,
    { level, tile }
  );

  return response.data;
}

export async function cashoutTower(id) {
  const response = await axiosInstance.post(
    `${import.meta.env.VITE_API}/tower/${id}/cashout`
  );

  return response.data;
}

export async function getTower(id) {
  if (!id) {
    return {
      difficulty: 9,
    };
  }

  const response = await axiosInstance.get(
    `${import.meta.env.VITE_API}/tower/${id}`
  );

  return {
    id,
    ...response.data,
  };
}
