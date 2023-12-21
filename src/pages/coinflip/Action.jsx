import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import base58 from "bs58";
import axios from "axios";

import {
  StatusDrawn,
  StatusWaitingAction,
  StatusWaitingPlayers,
  StatusWaitingSolana,
} from "./Session";
import { MAX_ACTION } from "./Countdown";

import { getCoinflipRoomActivity } from "../../api/coinflip";
import { formatToken, solToken } from "../../util/util";

import heads from "./assets/heads.png";
import tails from "./assets/tails.png";
import axiosInstance from "../../api/instance";

const Action = () => {
  const wallet = useWallet();

  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
  });
  const userQuery = useQuery({
    queryKey: ["coinflipHistory", roomID],
    queryFn: () => getCoinflipRoomActivity(roomID),
    refetchInterval: 5000,
  });

  const [active, setActive] = useState(false);
  const [myChoice, setMyChoice] = useState("");
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (userQuery.isSuccess && wallet.publicKey) {
      setTotalUsers(userQuery.data.activeUsers);
    }

    if (!roomQuery.isSuccess || !wallet.publicKey) {
      return;
    }

    setActive(
      roomQuery.data.session.status === StatusWaitingAction &&
        roomQuery.data.session.users.some(
          (user) =>
            user.publicKey === wallet.publicKey.toBase58() && !user.eliminated
        )
      // true
    );

    setTotalVolume(roomQuery.data.stats.totalVolume);

    if (
      roomQuery.data.session.status === StatusWaitingPlayers ||
      roomQuery.data.session.status === StatusWaitingSolana
    ) {
      setMyChoice("");
    }

    if (
      roomQuery.data.session.status === StatusWaitingAction &&
      roomQuery.data.session.countdown === MAX_ACTION
    ) {
      setMyChoice("");
    }

    if (roomQuery.data.session.status === StatusDrawn) {
      try {
        const round = roomQuery.data.session.round - 1;
        console.log("setting choice 3");
        setMyChoice(
          roomQuery.data.session.users.find(
            (user) => user.publicKey === wallet.publicKey.toBase58()
          ).actionValues[round]
        );
      } catch (err) {
        console.log(err);
      }
    }
  }, [roomQuery.data, wallet.publicKey]);

  const choose = async (value) => {
    const key = `home-signature-${wallet.publicKey.toBase58()}`;
    let localSignature = localStorage.getItem(key);
    if (!localSignature) {
      try {
        console.log(value);
        const msg = `solanashuffle my rooms ${wallet.publicKey.toBase58()}`;
        const data = new TextEncoder().encode(msg);
        const signature = base58.encode(await wallet.signMessage(data));

        localSignature = signature;
        localStorage.setItem(key, localSignature);
      } catch (err) {
        return;
      }
    }

    await axiosInstance.post(
      `${import.meta.env.VITE_COINFLIP_API}/${roomID}/action`,
      {
        publicKey: wallet.publicKey.toBase58(),
        signature: localSignature,
        actionValue: value,
      }
    );

    setMyChoice(value);
  };

  return (
    <div className="w-full">
      {active || myChoice ? (
        <div className="relative flex flex-col items-center duration-300">
          <span className="font-bold text-mute">Select your Side!</span>
          <div className="flex items-center gap-2">
            <button disabled={!active} onClick={() => choose("heads")}>
              <img
                style={{
                  filter:
                    myChoice === "heads" &&
                    `drop-shadow(0 0 15px rgba(109, 97, 255, 0.7))`,
                }}
                className={`${
                  active && !myChoice ? "animate-bounce1" : ""
                } w-24 `}
                src={heads}
                alt="heads"
              />
            </button>
            <button disabled={!active} onClick={() => choose("tails")}>
              <img
                style={{
                  filter:
                    myChoice === "tails" &&
                    `drop-shadow(0 0 25px rgba(140, 97, 255, 0.7))`,
                }}
                className={`${
                  active && !myChoice ? "animate-bounce2" : ""
                } w-24`}
                src={tails}
                alt="tails"
              />
            </button>
          </div>
          <span className="font-bold text-mute">
            You selected:{" "}
            <span className="text-primary underline">
              {myChoice ? myChoice : "Nothing!"}
            </span>
          </span>
        </div>
      ) : (
        // <div className="relative flex w-full flex-col items-center justify-center duration-300">
        //   <div className="flex w-[75%] justify-between 1.5xl:w-[40%]">
        //     <span className="font-bold text-mute">Today's volume</span>
        //     <span className="font-bold text-mute">
        //       {formatToken(totalVolume, solToken)}
        //     </span>
        //   </div>
        //   <div className="flex w-[75%] justify-between 1.5xl:w-[40%]">
        //     <span className="font-bold text-mute">Active players</span>
        //     <span className="font-bold text-mute">{totalUsers}</span>
        //   </div>
        // </div>
        <div className="relative flex w-full flex-col items-center justify-center duration-300">
          <div className="">
            <span className="font-bold text-mute">How to Play</span>
          </div>
          <div className="flex w-[75%] justify-between 1.5xl:w-[80%]">
            <span className="font-bold text-mute">
              1. Bet & wait players. <p />
              2. Pick Heads or Tails. <p />
              3. Winners advance, losers out. <p />
              4. Last player takes all. <p />
              5. No winners, pot to pool. 50% added back to pot each game.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Action;
