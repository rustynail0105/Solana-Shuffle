import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";

const BANNED_WALLETS = ["9PE6YqxYT6ctnAaNitkd2z7k2ZKBNK9yabZtkkJVUGSk"];

const Ban = ({ children }) => {
  const wallet = useWallet();
  const [banned, setBanned] = useState(false);

  useEffect(() => {
    if (!wallet.publicKey) {
      return;
    }
    setBanned(BANNED_WALLETS.includes(wallet.publicKey.toBase58()));
  }, [wallet.publicKey]);

  if (banned) {
    return (
      <div className="grid h-screen w-screen place-content-center bg-[#171649] text-light">
        <span className="text-4xl font-bold">
          You have been banned from playing.
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

export default Ban;
