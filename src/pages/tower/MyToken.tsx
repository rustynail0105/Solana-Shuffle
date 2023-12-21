import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";

import { useTower } from "../../contexts";

import { getBalance } from "../../api/solana";
import { getTower } from "../../api/tower";

import SolanaInput from "../../components/SolanaInput";
import pop from "../../components/assets/pop.mp3";
import { useLocalStorage } from "../../util/hooks";
import { formatToken, solToken } from "../../util/util";
import { localStorageKey } from "./Game";
import { maxAmount, minAmount } from "../../types";

const betAmounts = [10_000_000, 100_000_000, 200_000_000, 500_000_000];

interface MyTokenProps {
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
}

const MyToken = ({ amount, setAmount }: MyTokenProps) => {
  const { active } = useTower();
  const [betInput, setBetInput] = useState("");
  const wallet = useWallet();
  const { connection } = useConnection();
  const [id, _] = useLocalStorage(localStorageKey);

  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  const balanceQuery = useQuery({
    queryKey: ["balance", wallet.publicKey],
    queryFn: () => getBalance(connection, wallet.publicKey),
    refetchInterval: 15_000,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!towerQuery.isSuccess) {
      return;
    }

    if (towerQuery.data.active) {
      setAmount(towerQuery.data.betAmount);
    }
  }, [towerQuery.data]);

  useEffect(() => {
    if (!amount || !balanceQuery.isSuccess) {
      setError("");
      return;
    }

    let err = "";
    if (amount < minAmount) {
      err = `Min. ${formatToken(minAmount, solToken)}`;
    } else if (amount > balanceQuery.data && balanceQuery.data > 0) {
      err = "Balance too low";
    }

    if (amount > maxAmount) {
      err = `Max. ${formatToken(maxAmount, solToken)}`;
    }

    setError(err);
  }, [amount]);

  return (
    <>
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
      </span>{" "}
      <div
        className={`flex items-center gap-2 ${
          ((towerQuery.isSuccess && towerQuery.data.active) || active) &&
          "cursor-not-allowed"
        }`}
      >
        <SolanaInput
          disabled={(towerQuery.isSuccess && towerQuery.data.active) || active}
          style={{
            boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            WebkitAppearance: "none",
            margin: 0,
            MozAppearance: "textfield",
            cursor: "inherit",
          }}
          placeholder={formatToken(100_000_000, solToken)}
          className="flex h-10 w-full
                    appearance-none bg-[#1C1B42] pl-3 text-sm font-semibold 
                    text-light placeholder-mute 
                    outline-none ring-mute focus:ring-2"
          setState={setAmount}
          state={amount}
          setInput={setBetInput}
          input={betInput}
        />
        <BetButton
          amount={
            (parseFloat(betInput.replace(",", ".")) / 2) *
            Math.pow(10, solToken.decimals)
          }
          setAmount={setAmount}
          setBetInput={setBetInput}
          label="1/2"
        />
        <BetButton
          amount={
            parseFloat(betInput.replace(",", ".")) *
            2 *
            Math.pow(10, solToken.decimals)
          }
          setAmount={setAmount}
          setBetInput={setBetInput}
          className="rounded-r-lg"
          label="2x"
        />
      </div>
      <div className="mt-0.5 flex items-center justify-between">
        {betAmounts.map((amount, idx) => (
          <BetButton
            key={idx}
            amount={amount}
            setAmount={setAmount}
            setBetInput={setBetInput}
            className={`${
              idx === 0 ? "rounded-l-lg" : idx === 3 ? "rounded-r-lg" : ""
            }
            w-[23%]`}
          />
        ))}
      </div>
      <div className="mt-0.5 flex items-center justify-between">
        <BetButton
          amount={minAmount}
          setAmount={setAmount}
          setBetInput={setBetInput}
          className="!w-[48%] rounded-l-lg"
          label="Min"
          isContain={true}
        />
        <BetButton
          amount={maxAmount}
          setAmount={setAmount}
          setBetInput={setBetInput}
          className="!w-[48%] rounded-r-lg"
          label="Max"
          isContain={true}
        />
      </div>
    </>
  );
};

export default MyToken;

interface BetButtonProps {
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  setBetInput: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  label?: string;
  isContain?: boolean;
}

const BetButton = (props: BetButtonProps) => {
  const { active } = useTower();
  const amt = props.amount / Math.pow(10, solToken.decimals);
  return (
    <button
      onClick={() => {
        const popClone = new Audio(pop);
        popClone.volume = 0.2;
        popClone.play();

        props.setBetInput(!Number.isNaN(amt) ? amt.toString() : "");
        props.setAmount(props.amount);
      }}
      disabled={active}
      style={{
        boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
      }}
      className={`h-10 min-w-[40px] bg-[#1C1B42] text-sm font-semibold text-mute ${
        props.className
      } ${active ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {props.label
        ? props.isContain
          ? `${props.label} (${amt})`
          : props.label
        : amt}
    </button>
  );
};
