import { useCallback, useContext, useEffect, useRef, useState } from "react";

import Divider from "../../components/Divider";
import { ReferIcon, CopyIcon } from "../../components/CustomIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatToken, shortenAddress, sleep, solToken } from "../../util/util";
import { useApp } from "../../contexts";
import Container from "../../components/Container";
import Button from "../../components/Button";
import axios from "axios";
import base58 from "bs58";
import SuccessPopup from "../../components/SuccessPopup";
import axiosInstance from "../../api/instance";
import ErrorPopup from "../../components/ErrorPopup";

const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const resetCopy = useRef();

  const onCopy = useCallback(() => {
    navigator.clipboard
      .writeText(ref.current.innerText)
      .then(() => setCopied(true));
  }, [ref]);

  useEffect(() => {
    if (copied) {
      resetCopy.current = setTimeout(() => setCopied(false), 3000);
    }

    return () => {
      clearTimeout(resetCopy.current);
    };
  }, [copied]);

  return { copied, ref, onCopy };
};

const CreateReferralPopup = () => {
  const { setPopup } = useApp();
  const queryClient = useQueryClient();
  const wallet = useWallet();

  const [myCode, setMyCode] = useState("");

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(myCode.length > 16 || myCode.length < 3);

    /*
    if (myCode.length > 16 || myCode.length < 3) {
      setDisabled(true);
      return;
    }
    setDisabled(false);
    */
  }, [myCode]);

  const create = async (code) => {
    if (!wallet.publicKey) {
      return;
    }

    const msg = `solanashuffle referral ${code} ${wallet.publicKey.toBase58()}`;
    const data = new TextEncoder().encode(msg);
    const signature = base58.encode(await wallet.signMessage(data));

    await axiosInstance.post(`${import.meta.env.VITE_REFERRALS_API}/create`, {
      publicKey: wallet.publicKey.toBase58(),
      signature,
      code,
    });

    setPopup({
      show: true,
      html: <SuccessPopup message="Successfully created your refferal link!" />,
    });

    queryClient.setQueryData(["user", wallet.publicKey], (oldData) => ({
      ...oldData,
      referral: {
        code,
        earned: 0,
        totalEarned: 0,
        volume: 0,
      },
    }));
  };

  return (
    <Container>
      <span className="text-2xl font-bold uppercase">Create your referral</span>
      <Divider className="my-3" />
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-1/2 flex-col items-start">
          <span className="flex w-full text-sm font-semibold text-mute">
            My referral code
            <span
              className={`ml-auto font-bold transition ${
                myCode.length > 16
                  ? "text-red"
                  : myCode.length < 3
                  ? "text-mute"
                  : "text-green"
              }`}
            >
              ({myCode.length}/16)
            </span>
          </span>
          <input
            style={{
              boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
            }}
            placeholder="My referral code"
            className="flex h-10 w-full flex-grow
            appearance-none rounded-lg bg-[#1C1B42] pl-3 text-sm font-semibold text-light placeholder-mute outline-none ring-mute focus:ring-2 "
            type="text"
            onChange={(e) => {
              setMyCode(e.target.value);
            }}
            value={myCode}
          />
        </div>
        <Button
          disabled={disabled}
          onClick={async () => {
            await create(myCode);
          }}
          text="Create referral"
        />
      </div>
    </Container>
  );
};

export default function Referral() {
  const { setPopup } = useApp();
  const { ref, copied, onCopy } = useClipboard();
  const wallet = useWallet();

  const userQuery = useQuery({
    queryKey: ["user", wallet.publicKey],
  });

  const claim = async (amount) => {
    if (!wallet.publicKey) {
      return;
    }

    try {
      const msg = `solanashuffle claim earnings ${wallet.publicKey.toBase58()}`;
      const data = new TextEncoder().encode(msg);
      const signature = base58.encode(await wallet.signMessage(data));

      const resp = await axiosInstance.post(
        `${import.meta.env.VITE_REFERRALS_API}/claim`,
        {
          publicKey: wallet.publicKey.toBase58(),
          signature,
        }
      );

      setPopup({
        show: true,
        html: (
          <SuccessPopup
            html={
              <span className="text-lg">
                Successfully claimed{" "}
                <span className="text-green">
                  {formatToken(amount, solToken, 6)}
                </span>
                <br />
                <a
                  href={`https://solscan.io/tx/${resp.data.signature}`}
                  className="font-bold text-primary underline"
                >
                  {shortenAddress(resp.data.signature)}
                </a>
              </span>
            }
            message="Successfully created your referral link!"
          />
        ),
      });
    } catch (err) {
      setPopup;
      ({
        show: true,
        html: <ErrorPopup message={err.response.data.message} />,
      });
    }
  };

  if (!wallet.publicKey || !userQuery.isSuccess) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col rounded-[25px] border-t-2 border-[#2F2E5F] bg-[#27264E] shadow-lg">
      {userQuery.data.level.level < 10 && (
        <div
          className="absolute left-0 top-0 flex h-full w-full rounded-[25px]
         bg-[#201F48] bg-opacity-70 backdrop-blur-md"
        >
          <span className="m-auto text-2xl font-extrabold uppercase">
            Referrals are available once you reach{" "}
            <span className="font-bold text-green underline">Level 10</span>
          </span>
        </div>
      )}
      <div className="flex h-20 items-center rounded-t-[25px] border-b-2 border-[#393869] bg-[#201F48] bg-opacity-70 p-6">
        <ReferIcon color="" />
        <span className="ml-4 text-2xl font-extrabold uppercase">
          Refer a friend
        </span>
      </div>
      <div className="flex flex-col gap-4 py-4 px-6">
        <span className="w-full text-[18px] 2xl:w-[70%]">
          Refer a new user to Shuffle and earn{" "}
          <span className="font-bold text-green">0.25%</span> of their game
          volume for <span className="font-bold text-green">24 hours</span> when
          they click on your{" "}
          <span className="font-bold text-green">unique referral link</span>.
        </span>
        {!userQuery.data.referral.code ? (
          <div className="flex flex-col">
            <div className="text-lg">
              You have not set up your referral link yet! Choose your unique
              referral code by{" "}
              <button
                onClick={() => {
                  setPopup({
                    show: true,
                    html: <CreateReferralPopup />,
                  });
                }}
              >
                <span className="font-bold text-primary underline">
                  clicking here
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-7 2xl:flex-row">
              <div
                ref={ref}
                style={{
                  boxShadow:
                    "inset 0px 4.15399px 7.26947px rgba(0, 0, 0, 0.15)",
                }}
                className="flex w-full select-text items-center gap-4 rounded-xl bg-[#201F48] px-6 py-2 font-semibold text-[#6E6FA6] underline 2xl:w-[70%]"
              >
                {`https://www.solanashuffle.com?ref=${userQuery.data.referral.code}`}
              </div>
              <div className="w-full 2xl:w-[30%]">
                <button
                  onClick={onCopy}
                  style={{
                    boxShadow: "0px 13.137px 21.895px rgba(0, 0, 0, 0.09)",
                    background:
                      "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)",
                  }}
                  className={`flex h-11 w-full items-center justify-center rounded-xl `}
                >
                  <CopyIcon color="" />
                  <span
                    style={{
                      textShadow: "2px 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                    className="ml-4 text-sm font-semibold uppercase text-light"
                  >
                    {copied ? "copied!" : "copy the link"}
                  </span>
                </button>
              </div>
            </div>
            <Divider className="my-2" />
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-14">
              <div className="flex font-semibold text-mute">
                Total Referred Volume:{" "}
                <span className="ml-auto font-bold text-green lg:ml-1">
                  {formatToken(userQuery.data.referral.volume, solToken, 6)}
                </span>
              </div>
              <div className="flex font-semibold text-mute">
                Available To Claim:{" "}
                <span className="ml-auto font-bold text-green underline lg:ml-1">
                  {formatToken(userQuery.data.referral.earned, solToken, 6)}
                </span>
              </div>
              <Button
                disabled={userQuery.data.referral.earned == 0}
                onClick={async () => {
                  await claim(userQuery.data.referral.earned);
                }}
                text="Claim"
                background="green"
                className="text-base uppercase"
                width="w-full lg:w-28"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
