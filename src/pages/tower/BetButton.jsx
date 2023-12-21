import { useState, useEffect } from "react";
import { web3 } from "@project-serum/anchor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useApp, useTower } from "../../contexts";

import { cashoutTower, createTower, getTower } from "../../api/tower";
import { localStorageKey } from "./Game";

import CashoutPopup from "./CashoutPopup";
import WalletButton from "../../components/WalletButton";
import pop from "../../components/assets/pop.mp3";
import Spinner from "../../components/Spinner";

import { useLocalStorage } from "../../util/hooks";
import { formatToken, solToken } from "../../util/util";
import { isGameBanned } from "../../util/ban";
import mixpanel from "mixpanel-browser";
import { maxAmount, minAmount } from "../../types";
let disableAllBet = false;

export default function BetButton({ amount, difficulty }) {
  const queryClient = useQueryClient();
  const { setPopup } = useApp();
  const { active } = useTower();

  const wallet = useWallet();
  const { connection } = useConnection();
  const [id, setId] = useLocalStorage(localStorageKey);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("Place Bet");
  const [mode, setMode] = useState("bet");

  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
  }, [wallet]);

  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  useEffect(() => {
    // Disable bet button if backend is down
    if (towerQuery.error) {
      // This is the only error we want to ignore, because it means there is no tower for this id
      if (
        towerQuery.error.response?.data?.message !=
        "mongo: no documents in result"
      ) {
        setMode("bet");
        setMessage("Connection error");
        setDisabled(true);
        return;
      }
    }
    if (!towerQuery.isSuccess || !towerQuery.data.active) {
      setMode("bet");
      if (amount > maxAmount) {
        setDisabled(true);
        setMessage("Bet too high!");
      } else if (amount < minAmount) {
        setDisabled(true);
        setMessage("Bet too low!");
      } else {
        setMessage("Place bet");
        setDisabled(false);
      }

      return;
    }

    setMode("cashout");
    const cashoutAmount =
      towerQuery.data.multiplier * towerQuery.data.betAmount;
    setMessage(`Cash out ${formatToken(cashoutAmount, solToken, 5)}`);
    setDisabled(false);

    if (towerQuery.data.tower.level === 9 || cashoutAmount >= 50_000_000_000) {
      cashout();
    }
  }, [towerQuery.isSuccess, towerQuery.data, amount]);

  const bet = async (amount, difficulty) => {
    const popClone = new Audio(pop);
    popClone.volume = 0.2;
    popClone.play();
    setProcessing(true);
    const toWallet = new web3.PublicKey(import.meta.env.VITE_TWR);
    const toFeeWallet = new web3.PublicKey(import.meta.env.VITE_FEES);

    const houseFee = Math.round((amount * 300) / 10000);

    let instructions = [];
    instructions.push(
      web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: toWallet,
        lamports: amount,
      })
    );
    instructions.push(
      web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: toFeeWallet,
        lamports: houseFee,
      })
    );

    try {
      const start_time = Date.now();
      const messageV0 = new web3.TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new web3.VersionedTransaction(messageV0);
      const signedTransaction = await wallet.signTransaction(transaction);
      const signed_time = Date.now();

      const signature = await connection.sendTransaction(signedTransaction, {
        maxRetries: 5,
      });

      const data = await createTower(signature, difficulty);
      setId(data.id);
      const joined_time = Date.now();
      mixpanel.track("Tower Bet", {
        totalValue: amount / 1_000_000_000,
        signDelay: signed_time - start_time,
        joinDelay: joined_time - start_time,
      });
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
    }
  };

  const cashout = async () => {
    setProcessing(true);

    try {
      const data = await cashoutTower(id);
      queryClient.setQueryData(["tower", id], () => {
        return data;
      });
      setPopup({
        show: true,
        html: <CashoutPopup />,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setProcessing(false);
    }
  };

  if (mode === "bet" && !wallet.connected) {
    return <WalletButton className="m-0" />;
  }

  return (
    <button
      onClick={() => {
        if (mode === "cashout") {
          cashout();
        } else {
          bet(amount, difficulty);
        }
      }}
      disabled={disabled || disableAllBet || active}
      style={{
        boxShadow: "0px 13.137px 21.895px rgba(0, 0, 0, 0.09)",
        background:
          disabled || disableAllBet || active
            ? ""
            : mode === "cashout"
            ? "radial-gradient(191.08% 125.83% at 26.69% 10%, #56FFFA 2.08%, #00DFD9 26.92%, #00D0CB 46.85%, #00C278 91.62%)"
            : "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)",
      }}
      className={`flex h-11 w-full items-center justify-center rounded-xl ${
        (disabled || disableAllBet || active) && "cursor-not-allowed !bg-mute"
      }`}
    >
      <span
        style={{
          textShadow: "2px 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        className="text-sm font-semibold uppercase text-light"
      >
        {processing ? <Spinner height={23} /> : message}
      </span>
    </button>
  );
}
