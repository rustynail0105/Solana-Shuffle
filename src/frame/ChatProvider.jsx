import { useWallet } from "@solana/wallet-adapter-react";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { getUser, getMetadata } from "../api/user";
import BadWordsFilter from "bad-words";
import base58 from "bs58";
import { useQuery } from "@tanstack/react-query";
import { CHAT_BAN_LIST, CHAT_IP_BAN_LIST } from "../util/ban";

const SEPARATOR = "!@#$%";

export const ChatContext = React.createContext();

const ChatProvider = ({ children }) => {
  const wallet = useWallet();
  const [messages, setMessages] = useState([]);
  const userQuery = useQuery({
    queryKey: ["user", wallet.publicKey],
    queryFn: () => getUser(wallet.publicKey),
  });
  const ipQuery = useQuery({
    queryKey: ["ip", wallet.publicKey],
    queryFn: () => getMetadata("https://api.ipify.org/?format=json"),
  });

  const filter = new BadWordsFilter();

  const ws = useRef(null);
  const isBanned = () => {
    return (
      CHAT_BAN_LIST.includes(wallet.publicKey.toString()) ||
      CHAT_IP_BAN_LIST.includes(ipQuery.data?.ip)
    );
  };
  const messageHandler = async (e) => {
    const msg = e.data;
    if (msg === undefined) {
      return;
    }

    const data = JSON.parse(msg);
    switch (data.type) {
      case "message":
        if (
          CHAT_BAN_LIST.includes(data.publicKey) &&
          wallet.publicKey.toString() !== data.publicKey
        ) {
          return;
        }
        data.value = data.value.split(SEPARATOR)[0];
        setMessages((prevData) => {
          let clone = [...prevData];
          if (clone.length > 50) {
            clone.shift();
          }
          // filter can fail with weird characters, so we wrap it in a try catch
          try {
            // Remove links
            const regex = /(https?:\/\/[^\s]+)/g;
            // Filter bad words
            data.value = filter.clean(data.value.replace(regex, "*"));
          } catch {}
          clone.push(data);
          return clone;
        });
        break;
      case "warning":
        setMessages((prevData) => {
          let clone = [...prevData];
          clone.push(data);
          return clone;
        });
        break;
    }
  };

  useEffect(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_WS}/chat`);
    websocket.onclose = () => console.log("ws closed");
    websocket.onmessage = messageHandler;

    ws.current = websocket;

    const interval = setInterval(() => {
      if (!ws.current.OPEN) {
        return;
      }
      ws.current.send(
        JSON.stringify({
          type: "heartbeat",
          value: "ping",
        })
      );
    }, 5000);

    return () => {
      websocket.close();
      clearInterval(interval);
    };
  }, []);

  const send = async (message) => {
    if (!wallet.connected) {
      return;
    }
    if (isBanned()) {
      // If the user is banned, we still want to show their messages to themselves so they may not think they are banned
      await messageHandler({
        data: JSON.stringify({
          type: "message",
          value: message,
          publicKey: wallet.publicKey.toBase58(),
          signature: "localSignature",
          image: userQuery.data?.image,
          name: userQuery.data?.name,
        }),
      });
      return;
    }

    (async () => {
      const key = `chat-signature-${wallet.publicKey.toBase58()}`;
      let localSignature = localStorage.getItem(key);
      if (!localSignature) {
        const msg = `solanashuffle chat ${wallet.publicKey.toBase58()}`;
        const data = new TextEncoder().encode(msg);
        const signature = base58.encode(await wallet.signMessage(data));

        localSignature = signature;
        localStorage.setItem(key, localSignature);
      }
      ws.current.send(
        JSON.stringify({
          type: "message",
          value: message,
          publicKey: wallet.publicKey.toBase58(),
          signature: localSignature,
          ip: ipQuery.data?.ip,
        })
      );
    })();
  };

  const chatValue = {
    send,
    messages,
  };

  return (
    <ChatContext.Provider value={chatValue}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
