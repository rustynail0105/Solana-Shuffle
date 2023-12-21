import { useParams } from "react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import Chat from "../../frame/Chat";
import Main from "./Main";
import Wagered from "./Wagered";
import History from "./History";
import Level from "./Level";
import UserList from "./UserList";

import { getUser } from "../../api/user";

import Background from "./assets/background.png";
import Referral from "./Referral";

const Profile = () => {
  const wallet = useWallet();
  const { publicKey } = useParams();

  const userQuery = useQuery({
    queryKey: ["user", publicKey],
    queryFn: () => getUser(publicKey),
  });

  return (
    <div
      style={{
        backgroundImage: `url(${Background})`,
      }}
      className="relative flex w-full flex-row overflow-y-scroll bg-center py-5 lg:p-8"
    >
      <div className="flex h-min flex-col gap-5 lg:gap-8">
        <div className="flex w-full flex-col gap-5 px-5 lg:gap-8">
          <Main />
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
            <div className="w-full lg:w-1/3">
              <Wagered />
            </div>
            <div className="w-full lg:w-2/3">
              <History />
            </div>
          </div>
        </div>

        {wallet.publicKey && wallet.publicKey.toBase58() == publicKey && (
          <div className="flex w-full flex-col gap-5 px-5 lg:gap-8">
            <Referral />
          </div>
        )}
      </div>

      <div className="sticky right-0 top-0 z-20 ml-5 hidden h-full min-w-[288px] lg:ml-8 xl:flex">
        <Chat
          className={undefined}
          isMobile={undefined}
          cycleChatOpen={undefined}
        />
      </div>
    </div>
  );
};

export default Profile;
