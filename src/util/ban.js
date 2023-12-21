import { useWallet } from "@solana/wallet-adapter-react";

export const CHAT_BAN_LIST = [
  "EM7XGtouhys2XEdcxroxiZC3VGfRij5EDvJbjcroakaz",
  "9qivEU3UDJMJNuDdqvLPAXLapsPkLWQvWTY1Pov9QQRt",
  "6qV3JXSsc4khCy5qN2K8mX4dxWUbTK4eFKFwSBYM6dw9",
];

export const CHAT_IP_BAN_LIST = [];

export const GAME_BAN_LIST = [
  "6riv7NU1VsZsPq9yKfVodS3sVor316ZkAYVwZrg4bxM6",
  "9PE6YqxYT6ctnAaNitkd2z7k2ZKBNK9yabZtkkJVUGSk",
];

export const isGameBanned = (publicKey) => {
  return GAME_BAN_LIST.includes(publicKey);
};
