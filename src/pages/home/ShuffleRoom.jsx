import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { getRoomsActivity } from "../../api/room";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { PeopleIcon } from "../../components/CustomIcons";
import TokenLogo from "../../components/TokenLogo";
import { currentFormatTime, formatToken } from "../../util/util";
import InfinityRommIcon from "./assets/infinity-room.svg";
import SeaweedRommIcon from "./assets/seaweed-room.svg";
import ShrimpRommIcon from "./assets/shrimp-room.svg";
import "./custom.scss";

export default function ShuffleRoom(props) {
  // console.log("????", props.stats.volumes);
  const roomsActivity = useQuery({
    queryKey: ["roomsActivity"],
    queryFn: () => getRoomsActivity(),
  });

  const navigate = useNavigate();
  const officialRooms = [
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_1,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_2,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_3,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_4,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_BONK,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_USDC,
    import.meta.env.VITE_OFFICIAL_SHUFFLE_ROOM_USDC,
  ];
  const symbolImage = useMemo(() => {
    const name = props.name.toLowerCase();
    if (name.indexOf("infinite room") !== -1) {
      return (
        <img
          src={InfinityRommIcon}
          className="absolute -left-2.5 top-2.5"
          alt=""
        />
      );
    } else if (name.toLowerCase().indexOf("seaweed room") !== -1) {
      return (
        <img
          src={SeaweedRommIcon}
          className="absolute left-2.5 -top-10"
          alt=""
        />
      );
    } else if (name.toLowerCase().indexOf("shrimp room") !== -1) {
      return (
        <img
          src={ShrimpRommIcon}
          className="absolute -left-2.5 top-2.5"
          alt=""
        />
      );
    } else {
      return (
        <img
          src={props.coverImage}
          className="absolute left-[18px] h-[80px] w-[80px] rounded-3xl object-cover xl:h-[105px] xl:w-[105px]"
          alt=""
        />
      );
    }
  }, [props]);

  const [activePlayer, setActivePlayer] = useState(0);

  useEffect(() => {
    if (roomsActivity.isSuccess) {
      if (roomsActivity.data) {
        const count = roomsActivity.data.find(
          (item) => item._id === props.id
        )?.count;
        if (count && count !== 0) {
          setActivePlayer(count);
        }
      }
    }
  }, [roomsActivity]);
  return (
    <div
      onClick={() => {
        navigate(`/jackpot/${props.id}`);
      }}
      className={`relative z-10
            flex h-[167px] 
			w-[332px] cursor-pointer rounded-3xl border-[3px] border-[#49487C4D] bg-room-card
			py-7 backdrop-blur lg:w-[362px] xl:w-[362px] 1.5xl:w-[362px] 2xl:w-[362px] 
			3xl:w-[362px]
			 ${props.className ? props.className : ""}`}
    >
      {officialRooms.indexOf(props.id) !== -1 && (
        <div
          className="offical-cover absolute -right-[3px] -top-[3px] h-7 w-[53px] pt-1.5 pl-[11px] text-[9px] font-bold uppercase leading-[13px]"
          style={{
            background:
              " linear-gradient(177.88deg, #EAAC3E 1.79%, #C95700 89.57%)",
          }}
        >
          Official
        </div>
      )}
      <div className="relative w-[110px] xl:w-[142px]">{symbolImage}</div>
      <div className="flex h-[105px] w-[222px] flex-col items-start overflow-hidden xl:w-[220px]">
        <h5 className="mb-2  whitespace-nowrap font-bold uppercase leading-[23px]">
          {props.name}
        </h5>
        <div className="flex items-center font-medium leading-[12px] text-[#9596E0]">
          Token:&nbsp;
          <span className="font-semibold text-light">
            {props.token.ticker}
          </span>{" "}
          <TokenLogo className="ml-1.5 w-5" ticker={props.token.ticker} />
        </div>
        <div className="flex items-center  whitespace-nowrap font-medium leading-[12px] text-[#9596E0]">
          Today Volume:&nbsp;
          <span className="whitespace-nowrap font-semibold text-light">
            {formatToken(props.stats.volumes[currentFormatTime()], props.token)}
          </span>
        </div>
        {activePlayer !== 0 ? (
          <div className="mt-2 flex items-center rounded-3xl bg-[#1AECC633] py-1 px-2 text-[10px] font-semibold uppercase leading-[14px] text-[#1AECC6]">
            {" "}
            <PeopleIcon className="mr-1" /> {activePlayer} active players
          </div>
        ) : (
          <div className="mt-2 flex items-center rounded-3xl bg-[#FFDB7533] py-1 px-2 text-[10px] font-semibold uppercase leading-[14px] text-[#FFDB75]">
            {" "}
            <PeopleIcon className="mr-1" color={"#FFDB75"} />
            ready to stake
          </div>
        )}
      </div>
    </div>
  );
}
