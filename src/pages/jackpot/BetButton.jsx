import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import MyNFTsPopup from "./MyNFTsPopup";
import NFTLogo from "./assets/nftLogoLight.svg";

import { calculateAssetsValue, calculateUserValue } from "../../util/room";
import { getRoom } from "../../api/room";
import { web3 } from "@project-serum/anchor";
import axios from "axios";
import Spinner from "../../components/Spinner";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import Error from "../../components/Error";

import pop from "../../components/assets/pop.mp3";
import { useApp } from "../../contexts";
import { formatToken } from "../../util/util";
import { isGameBanned } from "../../util/ban";
import mixpanel from "mixpanel-browser";
import axiosInstance from "../../api/instance";

// Used to disable bet during server updates
var disableAllBet = false;

const BetButton = ({ className, includeNFTs }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setPopup, assets, setAssets } = useApp();

  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["room", roomID],
    queryFn: () => getRoom(roomID),
  });

  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [nftDisabled, setNftDisabled] = useState(true);

  const [message, setMessage] = useState("...");

  useEffect(() => {
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
    if (isGameBanned(wallet.publicKey?.toBase58())) {
      disableAllBet = true;
    }
  }, [wallet]);

  useEffect(() => {
    if (!roomQuery.isSuccess) {
      return;
    }

    if (roomQuery.data.session.countdown > 4_000_00) {
      const assetsValue = calculateAssetsValue(assets);
      const userValue = calculateUserValue(roomQuery.data, wallet.publicKey);

      if (
        roomQuery.data.config.maximumAmount !== 0 &&
        assetsValue + userValue > roomQuery.data.config.maximumAmount
      ) {
        setMessage("Bet too high!");
        setDisabled(true);
        setNftDisabled(false);
        return;
      }
      // Using only assetsValue here because there's a bug in backend that will fail to bet if assetsValue is less than minimumAmount
      if (
        (assetsValue < roomQuery.data.config.minimumAmount ||
          assetsValue + userValue < 1_000_000) &&
        assetsValue > 0
      ) {
        setMessage("Bet too low!");
        setDisabled(true);
        setNftDisabled(false);
        return;
      }

      if (assetsValue > 0) {
        setMessage(
          `Add ${formatToken(assetsValue, roomQuery.data.token)} to bet`
        );
        setDisabled(false);
        setNftDisabled(false);
        return;
      }

      if (assetsValue == 0) {
        setMessage("Enter a bet!");
        setDisabled(true);
        setNftDisabled(false);
        return;
      }

      setNftDisabled(false);
      setDisabled(true);
      setMessage(`Bet too low!`);
      return;
    } else if (roomQuery.data.session.countdown > 0) {
      setNftDisabled(true);
      setDisabled(true);
      setMessage("Room closing...");
      return;
    } else {
      setNftDisabled(true);
      setDisabled(true);
      setMessage("Waiting...");
      return;
    }
  }, [roomQuery, assets]);

  const onClick = async () => {
    if (!roomQuery.isSuccess) {
      return;
    }

    const popClone = new Audio(pop);
    popClone.volume = 0.2;
    popClone.play();

    setProcessing(true);

    /*
		let resp = await axiosInstance.post(
			`${import.meta.env.VITE_API}/room/${roomID}/intermediary`,
			{
				publicKey: wallet.publicKey.toBase58(),
			}
		);
		const intermediary = new web3.PublicKey(resp.data.intermediary);
		*/

    const toWallet = new web3.PublicKey(import.meta.env.VITE_SHFL);
    const toFeeWallet = new web3.PublicKey(import.meta.env.VITE_FEES);
    const toCreatorWallet = new web3.PublicKey(roomQuery.data.creator);

    const totalValue = calculateAssetsValue(assets);
    const houseFee = Math.round((totalValue * 300) / 10000);
    const creatorFee = Math.round(
      (totalValue * roomQuery.data.creatorFeeBasisPoints) / 10000
    );

    let instructions = [];
    for (const asset of assets) {
      if (asset.type === "Token") {
        if (roomQuery.data.token.ticker == "SOL") {
          instructions.push(
            web3.SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: toWallet,
              lamports: asset.price,
            })
          );
        } else {
          try {
            const mintPublicKey = new web3.PublicKey(
              roomQuery.data.token.publicKey
            );
            const fromWalletAta = await getAssociatedTokenAddress(
              mintPublicKey,
              wallet.publicKey
            );

            const toWalletAta = await getAssociatedTokenAddress(
              mintPublicKey,
              toWallet
            );

            const toWalletAtaAccount = await connection.getAccountInfo(
              toWalletAta
            );

            if (toWalletAtaAccount === null) {
              instructions.push(
                createAssociatedTokenAccountInstruction(
                  wallet.publicKey,
                  toWalletAta,
                  toWallet,
                  roomQuery.datatoken.publicKey
                )
              );
            }

            instructions.push(
              createTransferInstruction(
                fromWalletAta,
                toWalletAta,
                wallet.publicKey,
                totalValue
              )
            );

            if (houseFee > 0) {
              const toFeeWalletAta = await getAssociatedTokenAddress(
                mintPublicKey,
                toFeeWallet
              );

              const toFeeWalletAtaAccount = await connection.getAccountInfo(
                toFeeWalletAta
              );

              if (toFeeWalletAtaAccount === null) {
                instructions.push(
                  createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    toFeeWalletAta,
                    toFeeWallet,
                    mintPublicKey
                  )
                );
              }
              instructions.push(
                createTransferInstruction(
                  fromWalletAta,
                  toFeeWalletAta,
                  wallet.publicKey,
                  houseFee
                )
              );
            }

            if (creatorFee > 0) {
              const toCreatorWalletAta = await getAssociatedTokenAddress(
                mintPublicKey,
                toCreatorWallet
              );

              const toCreatorWalletAtaAccount = await connection.getAccountInfo(
                toCreatorWalletAta
              );

              if (toCreatorWalletAtaAccount === null) {
                instructions.push(
                  createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    toCreatorWalletAta,
                    toCreatorWallet,
                    mintPublicKey
                  )
                );
              }

              instructions.push(
                createTransferInstruction(
                  fromWalletAta,
                  toCreatorWalletAta,
                  wallet.publicKey,
                  creatorFee
                )
              );
            }
          } catch (err) {
            console.log(err);
            setProcessing(false);
            return;
          }
        }
      } else {
        const mint = new web3.PublicKey(asset.mint);

        const fromWalletAta = await getAssociatedTokenAddress(
          mint,
          wallet.publicKey
        );
        const toWalletAta = await getAssociatedTokenAddress(mint, toWallet);

        const toWalletAtaAccount = await connection.getAccountInfo(toWalletAta);

        if (toWalletAtaAccount === null) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              toWalletAta,
              toWallet,
              mint
            )
          );
        }

        instructions.push(
          createTransferInstruction(
            fromWalletAta,
            toWalletAta,
            wallet.publicKey,
            1
          )
        );
      }
    }

    if (roomQuery.data.token.ticker === "SOL") {
      if (houseFee > 0) {
        instructions.push(
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: toFeeWallet,
            lamports: houseFee,
          })
        );
      }

      if (creatorFee > 0) {
        instructions.push(
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: toCreatorWallet,
            lamports: creatorFee,
          })
        );
      }
    }

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
      mixpanel.track("Shuffle Bet", {
        room: roomID,
        totalValue: totalValue / 1_000_000_000,
        signDelay: signed_time - start_time,
        joinDelay: joined_time - start_time,
      });
      setProcessing(false);
    } catch (er) {
      setProcessing(false);
    }
  };

  const join = async (signedTransaction) => {
    try {
      let resp = await axiosInstance.get(
        `${import.meta.env.VITE_API}/room/${roomID}/opened`
      );

      if (!resp.data) {
        setPopup({
          show: true,
          html: (
            <Error>
              <span className="mt-3">
                Room is not open!
                <br />
                Your assets will not be sent and remain in your wallet.
              </span>
            </Error>
          ),
        });
      }

      const signature = await connection.sendTransaction(signedTransaction, {
        maxRetries: 5,
      });

      console.log(signature);

      await axiosInstance.post(
        `${import.meta.env.VITE_API}/room/${roomID}/join`,
        {
          signature: signature,
        }
      );
      setAssets([]);
    } catch (err) {
      console.log(err);
      let msg = "Please try again later.";
      if (err.response.data.message.startsWith("room not open")) {
        msg = "Room is not open! Assets being sent back.";
      }

      setPopup({
        show: true,
        html: (
          <Error>
            <span className="mt-3">{msg}</span>
          </Error>
        ),
      });
    }
    setProcessing(false);
  };

  return (
    <div className={`flex w-full items-center ${className}`}>
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
      </button>
      {includeNFTs && (
        <button
          style={{
            background: `${
              nftDisabled
                ? ""
                : "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)"
            }`,
          }}
          disabled={processing || nftDisabled || disableAllBet}
          className={`ml-2 flex h-11 w-11 items-center justify-center rounded-xl ${
            nftDisabled ? "cursor-not-allowed !bg-mute" : ""
          }`}
          onClick={() => {
            const popClone = new Audio(pop);
            popClone.volume = 0.2;
            popClone.play();
            setPopup({
              show: true,
              html: <MyNFTsPopup disabled={nftDisabled || disableAllBet} />,
            });
          }}
        >
          <img className="h-8 w-8 fill-white" src={NFTLogo} alt="" />
        </button>
      )}
    </div>
  );
};

export default BetButton;
