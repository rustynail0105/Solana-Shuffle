import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import base58 from "bs58";

import Chat from "../../frame/Chat";
import Coin from "./Coin";
import Pot from "./Pot";
import RoomInfo from "./RoomInfo";
import WinPopup from "./WinPopup";
import Session from "./Session";
import History from "./History";

import { useApp } from "../../contexts";

import { useWindowSize } from "../../util/hooks";
import { PoolAddress } from "../../config";
import { useQuery } from "@tanstack/react-query";

import background from "./assets/background.png";
import "./coinflip.css";

const MessageCountdownPlayers = "countdownPlayers";
const MessageUserJoined = "userJoined";
const MessageWaitingSolana = "waitingSolana";
const MessageCountdownAction = "countdownAction";
const MessageEliminationResult = "eliminationResult";
const MessageResult = "result";
const MessageResultAnnotation = "resultAnnotation";
const MessageClearing = "clearing";
const MessageReset = "reset";

const Coinflip = () => {
  const wallet = useWallet();
  const { setPopup, setPoolAmount, setPotAmount } = useApp();

  const { roomID } = useParams();

  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
  });

  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [roomID]);

  useEffect(() => {
    if (!wallet.publicKey) {
      return;
    }

    // setPopup({
    //   lock: true,
    //   show: true,
    //   html: <WinPopup result={{ signatures: [], payout: 100000 }} />,
    // });

    (async () => {
      const key = `home-signature-${wallet.publicKey.toBase58()}`;
      let localSignature = localStorage.getItem(key);
      if (!localSignature) {
        try {
          const msg = `solanashuffle my rooms ${wallet.publicKey?.toBase58()}`;
          const data = new TextEncoder().encode(msg);
          const signature = base58.encode(await wallet.signMessage(data));

          localSignature = signature;
          localStorage.setItem(key, localSignature);
        } catch (err) {
          return;
        }
      }
    })();
  }, [wallet.publicKey]);

  const queryClient = useQueryClient();

  const { width } = useWindowSize();

  useEffect(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_COINFLIP_WS}`);
    websocket.onopen = () => {
      console.log("connected");
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MessageCountdownPlayers:
          console.log("MessageCountdownPlayers", message.data);
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                countdown: message.data.countdown,
                status: message.data.status,
              },
            })
          );
          break;
        case MessageUserJoined:
          console.log("MessageUserJoined", message.data);

          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                users: [...oldData.session.users, message.data.user],
                pot: message.data.pot,
                status: message.data.status,
              },
            })
          );
          break;
        case MessageWaitingSolana:
          console.log("MessageWaitingSolana", message.data);

          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                status: message.data.status,
              },
            })
          );
          break;
        case MessageCountdownAction:
          console.log("MessageCountdownAction", message.data);
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                countdown: message.data.countdown,
                status: message.data.status,
              },
            })
          );
          break;

        case MessageEliminationResult:
          console.log("MessageEliminationResult", message.data);
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => {
              return {
                ...oldData,
                session: {
                  ...oldData.session,
                  users: message.data.users,
                  flipValues: message.data.flipValues,
                  round: message.data.round,
                  status: message.data.status,
                },
              };
            }
          );
          break;

        case MessageResult:
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                result: message.data.result,
                status: message.data.status,
              },
            })
          );

          console.log(message.data);
          if (message.data.result.winner === wallet.publicKey.toBase58()) {
            setPopup({
              lock: true,
              show: true,
              html: <WinPopup result={message.data.result} />,
            });
          } else if (message.data.result.winner === PoolAddress) {
            setPoolAmount({
              isPlus: true,
              amount: roomQuery.data.session.pot,
              isVisible: true,
            });
          }
          break;
        case MessageResultAnnotation:
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                ...oldData.session,
                result: message.data.result,
                status: message.data.status,
              },
            })
          );
          console.log(message.data);

          if (message.data.result.winner === wallet.publicKey.toBase58()) {
            setPopup({
              lock: true,
              show: true,
              html: <WinPopup result={message.data.result} />,
            });
          }
          break;

        case MessageClearing:
          console.log("MessageClearing", message.data);
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => {
              return {
                ...oldData,
                session: {
                  ...oldData.session,
                  status: message.data.status,
                },
              };
            }
          );
          break;
        case MessageReset:
          console.log("MessageReset", message.data);
          queryClient.setQueryData(
            ["coinflipRoom", message.data.roomId],
            (oldData) => ({
              ...oldData,
              session: {
                status: message.data.status,
                pot: message.data.pot,
                users: [],
                result: null,
              },
            })
          );

          setPoolAmount({
            isPlus: false,
            amount: message.data.pot,
            isVisible: true,
          });
          setPotAmount({ isPlus: true, amount: message.data.pot });

          break;
      }
    };

    const interval = setInterval(() => {
      websocket.send(
        JSON.stringify({
          type: "heartbeat",
          value: "ping",
        })
      );
    }, 5000);

    return () => {
      clearInterval(interval);
      websocket.close();
    };
  }, [queryClient, wallet.publicKey]);

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
      }}
      className="relative flex h-full w-full max-w-full flex-row overflow-x-hidden overflow-y-scroll px-2 md:p-4 lg:p-2"
    >
      {width >= 1024 && width < 1348 && (
        <div className="sticky top-0 left-0 mr-2 hidden h-full w-[300px] flex-col gap-2 py-0 lg:flex 1.5xl:hidden">
          <Session className="w-[280px]" />
          <Chat />
        </div>
      )}
      <div
        className="z-10 mt-2 flex h-min w-full flex-col items-center 
                lg:mt-0 lg:flex-row lg:items-start"
      >
        <div
          className="relative flex w-full max-w-[500px] flex-col items-center
					md:mx-auto md:max-w-none 1.5xl:max-w-[650px]"
        >
          <Coin />
          <div className="mt-2 block w-full max-w-[500px] md:max-w-none lg:hidden 1.5xl:block">
            <Session />
          </div>
          <div className="mt-2 w-full max-w-[500px] md:max-w-none">
            <Pot />
          </div>
          <div className="mt-2 w-full max-w-[500px] md:max-w-none">
            <RoomInfo />
          </div>
          <div className="mt-2 w-full max-w-[500px] md:max-w-none">
            <History />
          </div>
        </div>
      </div>
      {width >= 1348 ? (
        <div className="sticky right-0 top-0 z-10 hidden h-full min-w-[320px] p-4 1.5xl:flex">
          <Chat key={key} />
        </div>
      ) : null}
    </div>
  );
};

export default Coinflip;
