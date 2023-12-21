import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProfileTab from "./ProfileTab";
import Tab from "./Tab";
import Divider from "../components/Divider";
import WalletButton from "../components/WalletButton";

import { useApp } from "../contexts";

import Logo from "./assets/logo.png";
import Podium from "./assets/podium.svg";
import Infinite from "./assets/infinite.svg";
import Shrimp from "./assets/shrimp.svg";
import Seaweed from "./assets/seaweed.png";
import Tower from "./assets/tower.svg";
import ArrowUp from "./assets/arrow-up-icon.svg";
import PointFiveSol from "./assets/0_5_sol.svg";
import FiveSol from "./assets/5_sol.svg";
import PointOneSol from "./assets/0_1_sol.svg";

import "./sidebar.css";

const dashboardTabs = [
  {
    path: "/leaderboards",
    name: "Leaderboards",
    icon: Podium,
  },
];

const otherGamesTabs = [
  {
    path: "/tower",
    name: "Moon Tower",
    icon: Tower,
  },
];

const jackpotTabs = [
  {
    path: `/jackpot/${import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_1}`,
    name: "Infinite Room",
    icon: Infinite,
    tokenTicker: "SOL",
    id: import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_1,
  },
  {
    path: `/jackpot/${import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_3}`,
    name: "Shrimp Room",
    icon: Shrimp,
    tokenTicker: "SOL",
    iconClassName: "pl-1",
    id: import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_3,
  },
  {
    path: `/jackpot/${import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_4}`,
    name: "Seaweed Room",
    icon: Seaweed,
    tokenTicker: "SOL",
    id: import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_4,
  },
];

const coinflipTabs = [
  {
    path: `/coinflip/${import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_4}`,
    name: "0.01 SOL Elim.",
    icon: PointOneSol,
    tokenTicker: "SOL",
    roomType: "elimination",
    id: import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_4,
  },
  {
    path: `/coinflip/${import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_3}`,
    name: "0.1 SOL Elim.",
    icon: PointOneSol,
    tokenTicker: "SOL",
    roomType: "elimination",
    id: import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_3,
  },
  {
    path: `/coinflip/${import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_2}`,
    name: "0.5 SOL Elim.",
    icon: PointFiveSol,
    tokenTicker: "SOL",
    roomType: "elimination",
    id: import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_2,
  },
  {
    path: `/coinflip/${import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_1}`,
    name: "5 SOL Elim.",
    icon: FiveSol,
    tokenTicker: "SOL",
    roomType: "elimination",
    id: import.meta.env.VITE_OFFICIAL_COINFLIP_ROOM_1,
  },
];

const additionalTabs = [
  {
    path: "https://twitter.com/ImmortalsSOL",
    name: "Twitter",
  },
  {
    path: "https://discord.gg/immortalssol",
    name: "Discord",
  },
];

const Sidebar = ({ cycleSidebarOpen }) => {
  const { setUserNum } = useApp();
  const [shuffleOpen, setShuffleOpen] = useState(true);
  const [shuflipOpen, setShuflipOpen] = useState(true);

  useEffect(() => {
    const websocket = new WebSocket(`${import.meta.env.VITE_WS}/stats`);
    websocket.onopen = () => {
      console.log("connected");
    };
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "stats":
          setUserNum(data.value.onlinePlayers);
      }
    };

    return () => {
      websocket.close();
    };
  }, []);

  return (
    <div className="flex h-screen w-[260px] flex-col overflow-y-auto bg-[#25244E] shadow-xl scrollbar-hide">
      <Link to="/" className="flex min-h-[80px] w-full items-center">
        <img src={Logo} alt="Solanashuffle logo" className="ml-2" />
        <span className="ml-2 text-lg font-black uppercase">Solanashuffle</span>
      </Link>
      <div className="flex flex-col px-6 py-3">
        <div className="flex flex-col gap-2">
          <ProfileTab />
          <WalletButton />
        </div>
        <Divider className="my-5" />
        <div className="flex flex-col">
          <span className="font-bold text-mute">House Games</span>
          <div className="mt-5 flex flex-col gap-4">
            {otherGamesTabs.map((data) => {
              return (
                <Tab
                  cycleSidebarOpen={cycleSidebarOpen}
                  {...data}
                  key={data.path}
                  type="otherGames"
                />
              );
            })}
          </div>
        </div>

        {/* ============= Jackpot for sidebar ============= */}
        <Divider className="my-5" />
        <div className="flex flex-col">
          <div
            className="flex cursor-pointer justify-between"
            onClick={() => setShuffleOpen((e) => !e)}
          >
            <span className="font-bold text-mute">Official Shuffle Rooms</span>
            <img
              src={ArrowUp}
              className={`h-5 w-5 ${
                shuffleOpen ? "-rotate-180" : "rotate-0"
              } cursor-pointer duration-300 hover:scale-150`}
            />
          </div>
          <div
            className="overflow-hidden duration-500"
            style={{
              height: shuffleOpen ? `${jackpotTabs.length * 65}px` : 0,
            }}
          >
            <div className="mt-5 flex flex-col gap-4 ">
              {jackpotTabs.map((data) => {
                return (
                  <Tab
                    cycleSidebarOpen={cycleSidebarOpen}
                    {...data}
                    key={data.path}
                    type="jackpot"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ============= Coinflip for sidebar ============= */}
        <Divider className="my-5" />
        <div className="flex flex-col">
          <div
            className="flex cursor-pointer justify-between"
            onClick={() => setShuflipOpen((e) => !e)}
          >
            <span className="font-bold text-mute">
              Official Duel Flip Rooms
            </span>
            <img
              src={ArrowUp}
              className={`h-5 w-5 ${
                shuflipOpen ? "-rotate-180" : "rotate-0"
              } cursor-pointer duration-300 hover:scale-150`}
            />
          </div>
          <div
            className="overflow-hidden duration-500"
            style={{
              height: shuflipOpen ? `${coinflipTabs.length * 66}px` : 0,
            }}
          >
            <div className="mt-5 flex flex-col gap-4 ">
              {coinflipTabs.map((data) => {
                return (
                  <Tab
                    cycleSidebarOpen={cycleSidebarOpen}
                    {...data}
                    key={data.path}
                    type="coinflip"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ============= Dashboard ============= */}
        <Divider className="my-5" />
        <div className="flex flex-col">
          {dashboardTabs.map((data) => {
            return (
              <Tab
                cycleSidebarOpen={cycleSidebarOpen}
                {...data}
                key={data.path}
                type="dashboard"
              />
            );
          })}
        </div>

        {/* ============= Additional Infomation ============= */}
        <Divider className="my-5" />
        <div className="flex flex-col">
          <span className="font-bold text-mute">Additional Information</span>
          <div className="mt-5 flex flex-col gap-4">
            {additionalTabs.map((data) => {
              return (
                <Tab
                  cycleSidebarOpen={cycleSidebarOpen}
                  {...data}
                  key={data.path}
                  type="additional"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
