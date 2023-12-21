import React from "react";
import Container from "../../components/Container";
import { useLocalStorage, useWindowSize } from "../../util/hooks";
import Confetti from "react-confetti";
import { localStorageKey } from "./Game";
import { useQuery } from "@tanstack/react-query";
import { getTower } from "../../api/tower";

import win from "../jackpot/assets/win.mp3";
import { formatToken, shortenAddress, solToken } from "../../util/util";
import Divider from "../../components/Divider";
import { useEffect } from "react";
import { useApp } from "../../contexts";

const CashoutPopup = () => {
  const { hidePopup } = useApp();

  const [id, _] = useLocalStorage(localStorageKey);
  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  const { width, height } = useWindowSize();

  useEffect(() => {
    const winClone = new Audio(win);
    winClone.volume = 0.4;
    winClone.play();
  }, []);

  if (!towerQuery.isSuccess) {
    return null;
  }

  return (
    <Container className="max-w-[500px]">
      <Confetti
        tweenDuration={7000}
        recycle={false}
        numberOfPieces={1000}
        width={width}
        height={height}
      />
      <span className="text-2xl font-bold">
        You won{" "}
        <span className="font-extrabold text-green">
          {formatToken(towerQuery.data.cashoutResult.amount, solToken, 5)}
        </span>
        !
      </span>
      <Divider className="my-3" />
      <div className="flex flex-col items-center overflow-hidden text-light">
        <span className="z-10 flex flex-col text-center font-semibold">
          Transaction:
          <a
            href={`https://solscan.io/tx/${towerQuery.data.cashoutResult.signature}`}
            target="_blank"
            className="pointer-events-auto font-bold text-green"
            onClick={(e) => {
              e.preventDefault();
              window.open(
                `https://solscan.io/tx/${towerQuery.data.cashoutResult.signature}`,
                "_blank"
              );
            }}
          >
            {shortenAddress(towerQuery.data.cashoutResult.signature, 8)}
          </a>
        </span>
        <div className="flex items-center gap-4">
          <button
            delay={500}
            onClick={() => {
              hidePopup();
            }}
            className={`mt-3 h-9 w-40 rounded-xl bg-green font-semibold`}
          >
            Skip
          </button>
          <button
            delay={500}
            onClick={() => {
              window.open(
                "https://twitter.com/intent/tweet?text=" +
                encodeURIComponent(
                  `I just won ${formatToken(
                    towerQuery.data.cashoutResult.amount,
                    solToken
                  )} worth of assets on https://solanashuffle.com @immortalsSOL`
                )
              );
              hidePopup();
            }}
            className={`mt-3 h-9 w-40 rounded-xl bg-[#1DA1F2] font-semibold`}
          >
            Tweet!
          </button>
        </div>
      </div>
    </Container>
  );
};

export default CashoutPopup;
