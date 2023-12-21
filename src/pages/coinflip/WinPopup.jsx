import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Confetti from "react-confetti";

import Container from "../../components/Container";
import Divider from "../../components/Divider";
import Spinner2 from "../../components/Spinner2";
import SuccessIcon from "../../components/SuccessIcon";

import { useApp } from "../../contexts";

import { getCoinflipRoom } from "../../api/coinflip";
import { getUser } from "../../api/user";

import { useWindowSize } from "../../util/hooks";
import { formatToken, shortenAddress, sleep, solToken } from "../../util/util";

import win from "./assets/win.mp3";
import Fireworks from "./Fireworks";

const REWARDS_LEVEL = 30;

const WinPopup = ({ result }) => {
  const wallet = useWallet();
  const { roomID } = useParams();

  const userQuery = useQuery({
    queryKey: ["user", wallet.publicKey],
    queryFn: () => getUser(wallet.publicKey),
  });

  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [processing, setProcessing] = useState(true);

  const { width, height } = useWindowSize();
  const { connection } = useConnection();

  const [fetchingSignatures, setFetchingSignatures] = useState(false);

  useEffect(() => {
    const winClone = new Audio(win);
    winClone.volume = 0.4;
    winClone.play();
  }, []);

  useEffect(() => {
    if (!result) {
      return;
    }

    if (!Object.keys(result).length) {
      return;
    }

    if (!result.signatures || !result.signatures.length) {
      return;
    }

    if (fetchingSignatures) {
      return;
    }
    setFetchingSignatures(true);
    (async () => {
      try {
        console.log(result.signatures, "here");
        for (let signature of result.signatures) {
          while (true) {
            const status = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true,
            });
            if (
              status.value &&
              status.value.confirmationStatus == "confirmed"
            ) {
              break;
            }

            await sleep(500);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setProcessing(false);
      }
    })();
  }, [result, fetchingSignatures]);

  if (!roomQuery.isSuccess || !result) {
    return null;
  }

  if (!userQuery.isSuccess) {
    return (
      <DefaultConfetti
        width={width}
        height={height}
        result={result}
        processing={processing}
      />
    );
  }

  if (userQuery.data.level.level >= REWARDS_LEVEL)
    return <EnhancedConfetti result={result} processing={processing} />;
  else
    return (
      <DefaultConfetti
        width={width}
        height={height}
        result={result}
        processing={processing}
      />
    );
};

export default WinPopup;

const DefaultConfetti = ({ width, height, result, processing }) => {
  const { hidePopup } = useApp();
  return (
    <Container className="max-w-[500px]">
      <Confetti
        tweenDuration={7000}
        recycle={false}
        numberOfPieces={1000}
        width={width}
        height={height}
      />
      <span className="text-2xl font-bold uppercase">
        You won{" "}
        <span className="font-extrabold text-green">
          {formatToken(result.payout, solToken)}
        </span>
      </span>
      <Divider className="my-3" />
      <div className="my-3 flex flex-col items-center overflow-hidden text-light">
        <div className="h-[90px] w-[90px]">
          {processing ? <Spinner2 height={90} /> : <SuccessIcon />}
        </div>
        <span className="z-10 mt-3 flex flex-col text-center font-semibold">
          {result.signatures
            ? processing
              ? "Confirming Transactions..."
              : "Confirmed Transactions!"
            : "Sending SOL..."}

          {result.signatures
            ? result.signatures.map((signature) => {
                return (
                  <a
                    href={`https://solscan.io/tx/${signature}`}
                    target="_blank"
                    className="font-bold text-green"
                    key={signature}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://solscan.io/tx/${signature}`,
                        "_blank"
                      );
                    }}
                  >
                    {shortenAddress(signature)}
                  </a>
                );
              })
            : null}
        </span>
        <div className="flex items-center gap-4">
          <button
            disabled={processing}
            delay={500}
            onClick={() => {
              hidePopup();
            }}
            className={
              `mt-3 h-9 w-40 rounded-xl font-semibold ` +
              (() => {
                if (processing) {
                  return "cursor-not-allowed bg-mute";
                }
                return "bg-green";
              })()
            }
          >
            Skip
          </button>
          <button
            disabled={processing}
            delay={500}
            onClick={() => {
              window.open(
                "https://twitter.com/intent/tweet?text=" +
                  encodeURIComponent(
                    `I just won ${formatToken(
                      result.payout,
                      roomQuery.data.token
                    )} on https://solanashuffle.com PvP coinflip! @immortalsSOL`
                  )
              );
              hidePopup();
            }}
            className={
              `mt-3 h-9 w-40 rounded-xl font-semibold ` +
              (() => {
                if (processing) {
                  return "cursor-not-allowed bg-mute";
                }
                return "bg-[#1DA1F2]";
              })()
            }
          >
            Tweet!
          </button>
        </div>
      </div>
    </Container>
  );
};

const EnhancedConfetti = ({ result, processing }) => {
  const { hidePopup } = useApp();
  return (
    <Container className="max-w-[500px]">
      <Fireworks />
      <span className="text-2xl font-bold uppercase">
        You won{" "}
        <span className="font-extrabold text-green">
          {formatToken(result.payout, solToken)}
        </span>
      </span>
      <Divider className="my-3" />
      <div className="my-3 flex flex-col items-center overflow-hidden text-light">
        <div className="h-[90px] w-[90px]">
          {processing ? <Spinner2 height={90} /> : <SuccessIcon />}
        </div>
        <span className="z-10 mt-3 flex flex-col text-center font-semibold">
          {result.signatures
            ? processing
              ? "Confirming Transactions..."
              : "Confirmed Transactions!"
            : "Sending SOL..."}

          {result.signatures
            ? result.signatures.map((signature) => {
                return (
                  <a
                    href={`https://solscan.io/tx/${signature}`}
                    target="_blank"
                    className="font-bold text-green"
                    key={signature}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://solscan.io/tx/${signature}`,
                        "_blank"
                      );
                    }}
                  >
                    {shortenAddress(signature)}
                  </a>
                );
              })
            : null}
        </span>
        <div className="flex items-center gap-4">
          <button
            disabled={processing}
            delay={500}
            onClick={() => {
              hidePopup();
            }}
            className={
              `mt-3 h-9 w-40 rounded-xl font-semibold ` +
              (() => {
                if (processing) {
                  return "cursor-not-allowed bg-mute";
                }
                return "bg-green";
              })()
            }
          >
            Skip
          </button>
          <button
            disabled={processing}
            delay={500}
            onClick={() => {
              window.open(
                "https://twitter.com/intent/tweet?text=" +
                  encodeURIComponent(
                    `I just won ${formatToken(
                      result.payout,
                      roomQuery.data.token
                    )} on https://solanashuffle.com PvP coinflip! @immortalsSOL`
                  )
              );
              hidePopup();
            }}
            className={
              `mt-3 h-9 w-40 rounded-xl font-semibold ` +
              (() => {
                if (processing) {
                  return "cursor-not-allowed bg-mute";
                }
                return "bg-[#1DA1F2]";
              })()
            }
          >
            Tweet!
          </button>
        </div>
      </div>
    </Container>
  );
};
