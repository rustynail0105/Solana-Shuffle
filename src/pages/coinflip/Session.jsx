import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";

import Countdown from "./Countdown";
import BetButton from "./BetButton";
import Action from "./Action";
import Result from "./Result";
import Divider from "../../components/Divider";
import { PlusPotAnimation } from "../../components/Animation";

import { getCoinflipRoom } from "../../api/coinflip";
import { formatToken, solToken } from "../../util/util";
import { useApp } from "../../contexts";

export const StatusWaitingPlayers = "waitingPlayers";
export const StatusWaitingSolana = "waitingSolana";
export const StatusWaitingAction = "waitingAction";
export const StatusDrawing = "drawing";
export const StatusDrawn = "drawn";
export const StatusClearing = "clearing";

const Session = ({ className }) => {
  const wallet = useWallet();

  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!roomQuery.isSuccess) {
      return;
    }

    switch (roomQuery.data.session.status) {
      case StatusWaitingPlayers:
        setStatus(`Waiting for Players...`);
        break;
      case StatusWaitingSolana:
        setStatus(`Waiting for Network...`);
        break;
      case StatusWaitingAction:
        setStatus(
          `Round ${
            roomQuery.data.session.round + 1
          }: Waiting for user actions...`
        );
        break;
      case StatusDrawing:
        setStatus(
          `Round ${roomQuery.data.session.round + 1}: Drawing result...`
        );
        break;
      case StatusClearing:
        setStatus(`Clearing up...`);
        break;
    }
  }, [roomQuery.data, roomID]);

  return (
    <div
      className={`-mt-[40px] flex max-h-full flex-col items-center rounded-3xl border-2 border-[#2F2E5F] bg-[#25244E] py-4 lg:border-0 1.5xl:border-2 ${className}`}
    >
      <span className="text-center text-lg font-extrabold uppercase">
        {status}
      </span>
      <Divider className="my-2 w-3/4" />
      <div className="peer flex w-fit flex-col items-center">
        <span className="font-bold text-mute">Total Pot</span>
        <span className="text-xl font-semibold">
          {formatToken(
            roomQuery.isSuccess ? roomQuery.data.session.pot : 0,
            solToken
          )}
        </span>
        <PlusPotAnimation />
      </div>
      <div className="container absolute top-[16%] left-[45%] mx-auto max-w-[228px] rounded bg-[#2f0941] px-4 py-4 opacity-0 duration-500 peer-hover:opacity-100">
        <div className="flex gap-2">
          <svg
            className="h-4 w-4"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z"
              stroke="#ccc"
              strokeMiterlimit={10}
            />
            <path
              d="M6.875 6.875H7.875V10.5"
              stroke="#ccc"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 10.625H9.25"
              stroke="#ccc"
              strokeMiterlimit={10}
              strokeLinecap="round"
            />
            <path
              d="M7.75 4.0625C7.5893 4.0625 7.43222 4.11015 7.2986 4.19943C7.16499 4.28871 7.06084 4.41561 6.99935 4.56407C6.93785 4.71254 6.92176 4.8759 6.95311 5.03351C6.98446 5.19112 7.06185 5.3359 7.17548 5.44953C7.28911 5.56316 7.43388 5.64054 7.59149 5.67189C7.7491 5.70324 7.91247 5.68715 8.06093 5.62566C8.2094 5.56416 8.3363 5.46002 8.42557 5.3264C8.51485 5.19279 8.5625 5.0357 8.5625 4.875C8.5625 4.65951 8.4769 4.45285 8.32453 4.30048C8.17215 4.1481 7.96549 4.0625 7.75 4.0625Z"
              fill="#ccc"
            />
          </svg>
          <p className="text-sm font-semibold leading-none text-gray-300">
            Room's total pot
          </p>
        </div>
        <p className=" pt-2 pb-2 text-xs leading-none text-gray-400">
          For each game, 50% of the room's funding pool and players' bets form
          the pot. One winner takes all. If no winner, the pot returns to the
          funding pool.
        </p>
        <svg
          className="absolute bottom-[-10px] z-10"
          width={16}
          height={10}
          viewBox="0 0 16 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 10L0 0L16 1.41326e-06L8 10Z" fill="#2f0941" />
        </svg>
      </div>
      <div className="my-3 w-3/4">
        <Countdown />
      </div>
      <BetButton className="my-3 w-3/4 1.5xl:w-1/2" />
      <div className="my-3 w-full">
        {roomQuery.isSuccess && roomQuery.data.session.result ? (
          <Result />
        ) : (
          <Action />
        )}
      </div>
    </div>
  );
};

export default Session;
