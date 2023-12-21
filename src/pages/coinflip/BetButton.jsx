import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import axios from "axios";

import { StatusWaitingPlayers } from "./Session";
import WalletButton from "../../components/WalletButton";
import Spinner from "../../components/Spinner";
import pop from "../../components/assets/pop.mp3";

import { useApp } from "../../contexts";

import { getCoinflipRoom } from "../../api/coinflip";
import { formatToken, solToken } from "../../util/util";
import { isGameBanned } from "../../util/ban";
import mixpanel from "mixpanel-browser";
import axiosInstance from "../../api/instance";

// Used to disable bet during server updates
var disableAllBet = false;

const BetButton = ({ className }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setPotAmount, setBetAmount, betAmount } = useApp();

  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [message, setMessage] = useState("Bet");
  const [disabled, setDisabled] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
  }, [wallet]);

  useEffect(() => {
    if (!roomQuery.isSuccess || !wallet.publicKey) {
      return;
    }

    if (
      roomQuery.data.session.users.some(
        (user) => user.publicKey === wallet.publicKey.toBase58()
      )
    ) {
      setDisabled(true);
      setMessage("Already bet");
      return;
    }

    if (roomQuery.data.session.status === StatusWaitingPlayers) {
      setDisabled(false);
      setMessage(`Bet ${formatToken(roomQuery.data.betAmount, solToken)}`);
      setBetAmount(roomQuery.data.betAmount);
      return;
    }

    setDisabled(true);
    setMessage("Please wait");
  }, [roomQuery.data, wallet.publicKey]);

  const onClick = async () => {
    if (!roomQuery.isSuccess || !wallet.publicKey) {
      return;
    }

    const betAmount = roomQuery.data.betAmount;

    const popClone = new Audio(pop);
    popClone.volume = 0.2;
    popClone.play();

    setProcessing(true);

    const toWallet = new web3.PublicKey(import.meta.env.VITE_COIN);
    const toFeeWallet = new web3.PublicKey(import.meta.env.VITE_FEES);

    const houseFee = Math.round((betAmount * 300) / 10000);

    let instructions = [];

    instructions.push(
      web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: toWallet,
        lamports: betAmount,
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

      await join(signedTransaction);
      const joined_time = Date.now();
      mixpanel.track("DuelFlip Bet", {
        room: roomID,
        totalValue: betAmount / 1_000_000_000,
        signDelay: signed_time - start_time,
        joinDelay: joined_time - start_time,
      });
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
    }
  };

  const join = async (signedTransaction) => {
    try {
      const signature = await connection.sendTransaction(signedTransaction, {
        maxRetries: 5,
      });

      let resp = await axiosInstance.post(
        `${import.meta.env.VITE_COINFLIP_API}/${roomID}/join`,
        {
          signature,
        }
      );

      console.log(resp.data);
      setPotAmount({ isPlus: true, amount: betAmount });
    } catch (err) {
      console.log("err", err);
    }
  };

  if (!wallet.connected) {
    return <WalletButton className={`m-0 ${className}`} />;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={onClick}
        disabled={processing || disabled || disableAllBet}
        style={{
          background: `${
            disabled || disableAllBet
              ? ""
              : "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)"
          }`,
        }}
        className={`flex h-11 flex-grow items-center justify-center rounded-xl ${
          disabled || disableAllBet ? "cursor-not-allowed !bg-mute" : ""
        }`}
      >
        <span className="font-bold">
          {processing ? <Spinner height={24} /> : message}
        </span>
      </button>{" "}
    </div>
  );
};

export default BetButton;
