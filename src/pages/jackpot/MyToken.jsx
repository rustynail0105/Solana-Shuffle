import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { web3 } from "@project-serum/anchor";
import { AnimatePresence, motion } from "framer-motion";

import pop from "../../components/assets/pop.mp3";

import { getRoom } from "../../api/room";
import { formatToken, solToken } from "../../util/util";

import Infinite from "./assets/infinite.svg";

const MyToken = ({ setState }) => {
  const wallet = useWallet();

  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["room", roomID],
    queryFn: () => getRoom(roomID),
  });

  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");
  const [betInput, setBetInput] = useState("");
  const { connection } = useConnection();

  useEffect(() => {
    if (!wallet.publicKey) {
      return;
    }

    if (!roomQuery.isSuccess) {
      return;
    }

    const token = roomQuery.data.token;

    if (!token.ticker) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        if (token.ticker === "SOL") {
          const resp = await connection.getBalance(wallet.publicKey);
          setBalance(parseInt(resp));
        } else {
          const fromTokenAccount = await getAssociatedTokenAddress(
            new web3.PublicKey(token.publicKey),
            wallet.publicKey
          );

          console.log(fromTokenAccount.toBase58());

          const resp = await connection.getTokenAccountBalance(
            fromTokenAccount
          );
          setBalance(parseInt(resp.value.amount));
        }
      } catch {}
    }, 500);

    return () => clearTimeout(timeout);
  }, [wallet.publicKey, roomQuery?.data?.token?.ticker]);

  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!amount) {
      setState(0);
      setError("");
      return;
    }

    if (!roomQuery.isSuccess) {
      return;
    }

    const token = roomQuery.data.token;

    let err = "";
    if (amount < Math.pow(10, token.decimals) / 1000) {
      err = `Min. ${formatToken(Math.pow(10, token.decimals) / 1000, token)}`;
    } else if (amount > balance) {
      err = "Balance too low";
    }
    if (
      roomQuery.data.config.maximumAmount > 0 &&
      amount > roomQuery.data.config.maximumAmount
    ) {
      err = `Max. ${formatToken(roomQuery.data.config.maximumAmount, token)}`;
    }
    if (
      roomQuery.data.config.minimumAmount > 0 &&
      amount < roomQuery.data.config.minimumAmount
    ) {
      err = `Min. ${formatToken(roomQuery.data.config.minimumAmount, token)}`;
    }
    setError(err);
    setState(amount);
  }, [amount, balance]);

  useEffect(() => {
    setAmount(0);
  }, [roomID]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <span className="mb-1 font-bold text-mute">
          Bet Amount:{" "}
          <AnimatePresence>
            {error && (
              <motion.span
                transition={{
                  duration: 0.1,
                }}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 100,
                }}
                exit={{
                  opacity: 0,
                }}
                className="font-semibold text-red"
              >
                {" "}
                - {error}!
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <div className="flex items-center gap-2">
          <input
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
              WebkitAppearance: "none",
              margin: 0,
              MozAppearance: "textfield",
            }}
            placeholder={
              roomQuery.isSuccess
                ? formatToken(1_00_000_000, roomQuery.data.token)
                : "..."
            }
            className="flex h-10 w-full
						appearance-none bg-[#1C1B42] pl-3 text-sm font-semibold text-light placeholder-mute outline-none ring-mute focus:ring-2 "
            type="text"
            inputMode="decimal"
            pattern="\d*(\.\d{0,3})?"
            disabled={!roomQuery.isSuccess}
            onChange={(e) => {
              let amt = parseFloat(e.target.value.replace(",", "."));

              const token = roomQuery.data.token;

              amt = Math.round(amt * Math.pow(10, token.decimals));

              setAmount(amt);
              setBetInput(e.target.value);
            }}
            value={betInput}
          />
          <button
            onClick={() => {
              const popClone = new Audio(pop);
              popClone.volume = 0.2;
              popClone.play();

              let amt = parseFloat(betInput.replace(",", "."));
              amt = amt / 2;
              setBetInput(amt.toString());

              const token = roomQuery.data.token;

              amt = Math.round(amt * Math.pow(10, token.decimals));
              setAmount(amt);
            }}
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
            }}
            className="h-10 min-w-[40px] bg-[#1C1B42] text-sm font-semibold text-mute"
          >
            1/2
          </button>
          <button
            onClick={() => {
              const popClone = new Audio(pop);
              popClone.volume = 0.2;
              popClone.play();

              let amt = parseFloat(betInput.replace(",", "."));
              amt = amt * 2;
              setBetInput(amt.toString());
              const token = roomQuery.data.token;

              amt = Math.round(amt * Math.pow(10, token.decimals));
              setAmount(amt);
            }}
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
            className="h-10 min-w-[40px] bg-[#1C1B42] text-sm font-semibold text-mute"
          >
            2x
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <button
            onClick={() => {
              const popClone = new Audio(pop);
              popClone.volume = 0.2;
              popClone.play();

              const amount =
                roomQuery.isSuccess || roomQuery.isSuccess
                  ? roomQuery.data.config.minimumAmount
                  : 0;

              const amt =
                roomQuery.isSuccess || roomQuery.isSuccess
                  ? roomQuery.data.config.minimumAmount /
                    10 ** roomQuery.data.token.decimals
                  : 0;

              setBetInput(amt.toString());

              setAmount(amount);
            }}
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
            }}
            className={`flex h-10 w-[48%] min-w-[40px] cursor-pointer items-center justify-center gap-1 rounded-l-lg bg-[#1C1B42] text-sm font-semibold text-mute`}
          >
            Min
            <span className="flex justify-center">
              (
              {roomQuery.isSuccess || roomQuery.isSuccess
                ? formatToken(
                    roomQuery.data.config.minimumAmount,
                    roomQuery.data.token
                  )
                : "..."}
              )
            </span>
          </button>
          <button
            onClick={() => {
              const popClone = new Audio(pop);
              popClone.volume = 0.2;
              popClone.play();

              const amount =
                roomQuery.isSuccess || roomQuery.isSuccess
                  ? roomQuery.data.config.maximumAmount === 0
                    ? Math.round(
                        (balance *
                          (97 - roomQuery.data.creatorFeeBasisPoints / 100)) /
                          100
                      )
                    : roomQuery.data.config.maximumAmount
                  : 0;

              const amt =
                roomQuery.isSuccess || roomQuery.isSuccess
                  ? roomQuery.data.config.maximumAmount === 0
                    ? (balance *
                        (97 - roomQuery.data.creatorFeeBasisPoints / 100)) /
                      100 /
                      10 ** roomQuery.data.token.decimals
                    : roomQuery.data.config.maximumAmount /
                      10 ** roomQuery.data.token.decimals
                  : 0;

              setBetInput(amt.toString());

              setAmount(amount);
            }}
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
            }}
            className={`flex h-10 w-[48%] min-w-[40px] cursor-pointer items-center justify-center gap-1 rounded-r-lg bg-[#1C1B42] text-sm font-semibold text-mute`}
          >
            Max
            <span className="flex justify-center">
              (
              {roomQuery.isSuccess ? (
                roomQuery.data.config.maximumAmount === 0 ? (
                  <img className="ml-1" src={Infinite} alt="Infinity" />
                ) : (
                  formatToken(
                    roomQuery.data.config.maximumAmount,
                    roomQuery.data.token
                  )
                )
              ) : (
                "..."
              )}
              )
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyToken;
