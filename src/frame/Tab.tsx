import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCoinflipRoom } from "../api/coinflip";
import { getRoom } from "../api/room";

import TokenLogo from "../components/TokenLogo";
import Elimination from "./assets/elimination.svg";
import Speed from "./assets/speed.svg";

interface RoomTypeIcon {
  [key: string]: string;
  elimination: string;
  speed: string;
}

const roomTypeIcon: RoomTypeIcon = {
  elimination: Elimination,
  speed: Speed,
};

interface TabProps {
  path: string;
  name: string;
  type: string;
  icon: string;
  onClick: Function;
  tokenTicker: string;
  iconClassName: string;
  roomType: string;
  id?: string;
}

const Tab = ({
  path,
  name,
  type,
  icon,
  onClick,
  tokenTicker,
  iconClassName,
  roomType,
  id,
}: TabProps) => {
  const location = useLocation();
  const [selected, setSelected] = useState(false);

  const [active, setActive] = useState(false);

  useEffect(() => {
    setSelected(location.pathname === path);
  }, [location.pathname]);

  switch (type) {
    case "dashboard":
      return (
        <Link to={path} className="flex items-center ">
          <span className="w-7">
            <img src={icon} />
          </span>
          <span className="ml-2 font-semibold">{name}</span>
        </Link>
      );
    case "otherGames":
      return (
        <Link
          to={path}
          className={
            `flex items-center rounded-lg border-[2.6px] border-[#49487C]
						bg-[#393869] px-2 py-2  transition
						` +
            (() => {
              if (selected) {
                return "border-opacity-100 bg-opacity-100";
              }
              return "border-opacity-30 bg-opacity-30 hover:border-opacity-50 hover:bg-opacity-70";
            })()
          }
        >
          <span className={`w-7 ${iconClassName}`}>
            <img src={icon} className="w-6" />
          </span>
          <span className="ml-1 font-semibold">{name}</span>
          <TokenLogo ticker="SOL" className="ml-auto h-5 w-5" />
        </Link>
      );
    case "coinflip":
      const coinflipQuery = useQuery({
        queryKey: ["coinflipRoom", id],
        queryFn: () => getCoinflipRoom(id),
      });

      useEffect(() => {
        if (!coinflipQuery.isSuccess) {
          return;
        }

        if (coinflipQuery.data.session.users.length > 0) {
          setActive(true);
        } else {
          setActive(false);
        }
      }, [coinflipQuery.data, id]);
      return (
        <Link
          to={path}
          onClick={(e) => {
            if (name === "Create Room") {
              e.preventDefault();
              onClick();
            }
          }}
          className={
            `relative flex items-center rounded-lg border-[2.6px] border-[#49487C]
                        bg-[#393869] px-2 py-2  antialiased transition
                    ` +
            (() => {
              if (selected) {
                return "border-opacity-100 bg-opacity-100";
              }
              return "border-opacity-30 bg-opacity-30 hover:border-opacity-50 hover:bg-opacity-70";
            })()
          }
        >
          <span className={`w-7 ${iconClassName}`}>
            <img src={icon} />
          </span>
          <span className="ml-1 font-semibold">{name}</span>
          {roomType ? (
            <img className="ml-auto h-5 w-5" src={roomTypeIcon[roomType]}></img>
          ) : (
            <TokenLogo ticker={tokenTicker} className="ml-auto h-5 w-5" />
          )}
          {active && (
            <span className="absolute right-0 top-0 inline-block whitespace-nowrap rounded-lg bg-cyan-200 p-[5px] text-center align-baseline text-[0.5em] font-bold leading-none text-cyan-600">
              ACTIVE
            </span>
          )}
        </Link>
      );
    case "jackpot":
      const jackpotQuery = useQuery({
        queryKey: ["room", id],
        queryFn: () => getRoom(id),
      });

      useEffect(() => {
        if (!jackpotQuery.isSuccess) {
          return;
        }

        if (jackpotQuery.data.session.users.length > 0) {
          setActive(true);
        } else {
          setActive(false);
        }
      }, [jackpotQuery.data, id]);
      return (
        <Link
          to={path}
          onClick={(e) => {
            if (name === "Create Room") {
              e.preventDefault();
              onClick();
            }
          }}
          className={
            `relative flex items-center rounded-lg border-[2.6px] border-[#49487C] bg-[#393869]
                        px-2 py-2 antialiased  transition
                    ` +
            (() => {
              if (selected) {
                return "border-opacity-100 bg-opacity-100";
              }
              return "border-opacity-30 bg-opacity-30 hover:border-opacity-50 hover:bg-opacity-70";
            })()
          }
        >
          <span className={`w-7 ${iconClassName}`}>
            <img src={icon} />
          </span>
          <span className="ml-1 font-semibold">{name}</span>
          {roomType ? (
            <img className="ml-auto h-5 w-5" src={roomTypeIcon[roomType]}></img>
          ) : (
            <TokenLogo ticker={tokenTicker} className="ml-auto h-5 w-5" />
          )}
          {active && (
            <span className="absolute right-0 top-0 inline-block whitespace-nowrap rounded-lg bg-cyan-200 p-[5px] text-center align-baseline text-[0.5em] font-bold leading-none text-cyan-600">
              ACTIVE
            </span>
          )}
        </Link>
      );
    case "additional":
      return (
        <a href={path} className="flex items-center" target="_blank">
          <span className="font-semibold">{name}</span>
        </a>
      );
  }

  return null;
};

export default Tab;
