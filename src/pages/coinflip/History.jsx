import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

import { getCoinflipRoomHistory } from "../../api/coinflip";
import { base58ToColor } from "../../util/color";
import {
  formatToken,
  getSafeTimeoutInterval,
  shortenAddress,
  solToken,
} from "../../util/util";
import { PoolAddress } from "../../config";

import rightCircle from "./assets/rightCircle.svg";
import leftCircle from "./assets/leftCircle.svg";
import tails from "./assets/tails.png";
import heads from "./assets/heads.png";

import TimeAgo from "javascript-time-ago";

const ITEMS_PER_PAGE = 3;

const Session = ({ users, pot, result, round, closeTime, flipValues }) => {
  const [formattedCloseTime, setFormattedCloseTime] = useState("");

  const [src, setSrc] = useState(tails);

  useEffect(() => {
    if (flipValues[flipValues.length - 1] == "tails") {
      setSrc(tails);
    } else {
      setSrc(heads);
    }
  }, [flipValues]);

  useEffect(() => {
    const date = new Date(closeTime * 1000);

    const timeAgo = new TimeAgo("en-US");
    timeAgo.format(date, "round");

    let updateTimer;

    function render() {
      const [formattedDate, timeToNextUpdate] = timeAgo.format(date, {
        getTimeToNextUpdate: true,
      });

      setFormattedCloseTime(formattedDate);
      updateTimer = setTimeout(
        render,
        getSafeTimeoutInterval(timeToNextUpdate || 60 * 1000)
      );
    }

    render();

    return () => {
      clearTimeout(updateTimer);
    };
  }, [closeTime]);

  const winnerUser = users.find((user) => user.publicKey === result.winner);

  return (
    <div className="relative flex w-full items-center gap-4 rounded-lg p-4">
      <div className="absolute top-4 right-4">
        <span className="text-sm font-semibold text-mute">
          {closeTime ? formattedCloseTime : null}
        </span>
      </div>
      <div className="flex w-1/3 lg:w-1/4">
        <AspectRatio ratio={1 / 1}>
          <img
            src={src}
            alt="coin flip result"
            className="h-full w-full duration-1000"
          />
        </AspectRatio>
      </div>
      <div className="flex h-full flex-1 flex-col justify-center">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-mute sm:text-sm lg:text-xs xl:text-sm">
            Pot
          </label>
          <span className="-mt-1 font-semibold sm:text-lg lg:text-base xl:text-lg">
            {formatToken(pot, solToken)}
          </span>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-mute sm:text-sm lg:text-xs xl:text-sm">
            Winner
          </label>
          <a
            target="_blank"
            href={`https://solscan.io/account/${result.winner}`}
          >
            <span
              style={{
                color:
                  result.winner != PoolAddress
                    ? base58ToColor(result.winner).hex
                    : "#02D0C8",
              }}
              className="-mt-1 font-semibold underline sm:text-lg lg:text-base xl:text-lg"
            >
              {winnerUser && winnerUser.profile && winnerUser.profile.name
                ? winnerUser.profile.name
                : result.winner == PoolAddress
                ? "Funding Pool"
                : shortenAddress(result.winner)}
            </span>
          </a>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-mute sm:text-sm lg:text-xs xl:text-sm">
            Rounds
          </label>
          <span
            className={`-mt-1 font-semibold sm:text-lg lg:text-base xl:text-lg`}
          >
            {round}
          </span>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const { roomID } = useParams();

  const [page, setPage] = useState(0);
  const [offset, setOffset] = useState(0);

  const historyQuery = useQuery({
    queryKey: ["coinflipHistory", roomID, offset],
    queryFn: () => getCoinflipRoomHistory(roomID, offset),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!historyQuery.isSuccess) {
      return;
    }
  }, [historyQuery.data]);

  if (!historyQuery.isSuccess) {
    return (
      <div
        className="flex w-full flex-col gap-x-8 gap-y-4 
                rounded-3xl border-2 border-[#2F2E5F] bg-[#25244E] p-4"
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col gap-x-8 gap-y-4 
            rounded-3xl border-2 border-[#2F2E5F] bg-[#25244E] p-4"
    >
      <div className="flex items-center">
        <span className="text-lg font-semibold">Bet History</span>
        <div className="ml-auto flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => {
              setPage((prevData) => prevData - 1);
            }}
            className={`${
              page === 0 ? "opacity-50" : "transition hover:opacity-90"
            }`}
          >
            <img className="w-7" src={leftCircle} alt="" />
          </button>
          <button
            onClick={() => {
              setPage((prevData) => prevData + 1);
            }}
            disabled={
              (page + 1) * ITEMS_PER_PAGE >= historyQuery.data.sessions.length
            }
            className={`${
              (page + 1) * ITEMS_PER_PAGE >= historyQuery.data.sessions.length
                ? "opacity-50"
                : "transition hover:opacity-90"
            }`}
          >
            <img className="w-7" src={rightCircle} alt="" />
          </button>
        </div>
      </div>

      {historyQuery.isSuccess ? (
        <div className="flex flex-col gap-4 [&>*:nth-child(odd)]:bg-[#201F48]">
          {(() => {
            const firstIndex = page * ITEMS_PER_PAGE;
            let lastIndex = (page + 1) * ITEMS_PER_PAGE;
            if (lastIndex > historyQuery.length) {
              lastIndex = historyQuery.length;
            }

            const historySlice = historyQuery.data.sessions.slice(
              firstIndex,
              lastIndex
            );

            return historySlice.map((session) => {
              return <Session {...session} key={session.id} />;
            });
          })()}
        </div>
      ) : (
        <span className="text-center font-semibold text-mute">Loading...</span>
      )}
    </div>
  );
};

export default History;
