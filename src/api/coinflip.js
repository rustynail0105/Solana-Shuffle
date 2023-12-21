import axios from "axios";
import axiosInstance from "./instance";

export async function getCoinflipRoom(id) {
  if (!id) {
    return null;
  }

  console.log("fetching coinflip room", id);

  const response = await axiosInstance.get(
    `${import.meta.env.VITE_COINFLIP_API}/${id}`
  );
  return response.data;
}

export async function getCoinflipRooms(sort) {
  console.log("getting cf rooms");
  const response = await axiosInstance.get(
    `${import.meta.env.VITE_COINFLIP_API}/explore?sort=${sort}`
  );
  return response.data;
}

export async function getCoinflipRoomActivity(id) {
  const response = await axiosInstance.get(
    `${import.meta.env.VITE_COINFLIP_API}/${id}/active-users`
  );

  return response.data;
}

export async function getCoinflipRoomHistory(id, offset) {
  const response = await axiosInstance.get(
    `${import.meta.env.VITE_COINFLIP_API}/${id}/history?offset=${offset}`
  );

  return response.data;
}
