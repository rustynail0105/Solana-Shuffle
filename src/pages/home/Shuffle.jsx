import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useContext, useEffect, useState } from "react";
import { getRooms } from "../../api/room";
import Skeleton from "../../components/Skeleton";
import Chat from "../../frame/Chat";
import { motion } from "framer-motion";
import Fire from "./assets/fire.svg";
import Create from "./assets/create.svg";
import BannerBg from "./assets/banner.png";
import CreateBg from "./assets/create-room.png";
import Room from "./ShuffleRoom";
import { useWallet } from "@solana/wallet-adapter-react";
import { PopupContext } from "../../Context";
import { CreateShuffleRoomPopup } from "../../frame/CreateRoomPopup";
import base58 from "bs58";
import axios from "axios";
import { ArrowCircleRight } from "../../components/CustomIcons";
import { useWindowSize } from "../../util/hooks";
import { useApp } from "../../contexts";
import axiosInstance from "../../api/instance";

const GameHome = () => {
  const wallet = useWallet();

  const { width, height } = useWindowSize();
  const { setPopup } = useApp();

  const perPage = useMemo(() => {
    if (width > 1780) {
      return 3;
    } else if (width > 1024 && width < 1780) {
      return 2;
    } else {
      return 1;
    }
  }, [width]);

  const roomsVolumeQuery = useQuery({
    queryKey: ["rooms", "volume"],
    queryFn: () => getRooms("todayVolume"),
  });

  const [roomsVolumePage, setRoomsVolumePage] = useState(0);

  const [myRooms, setMyRooms] = useState([]);

  const handleArrow = (type) => {
    let roomNum = roomsVolumePage;
    if (type === "inc") {
      if (roomNum < Math.ceil(20 / perPage)) {
        roomNum++;
        setRoomsVolumePage(roomNum);
      }
    }
    if (type === "dec") {
      if (roomNum > 0) {
        roomNum--;
        setRoomsVolumePage(roomNum);
      }
    }
  };

  useEffect(() => {
    if (!wallet.publicKey) {
      return;
    }
    (async () => {
      const key = `home-signature-${wallet.publicKey.toBase58()}`;
      let localSignature = localStorage.getItem(key);
      if (!localSignature) {
        try {
          const msg = `solanashuffle my rooms ${wallet.publicKey.toBase58()}`;
          const data = new TextEncoder().encode(msg);
          const signature = base58.encode(await wallet.signMessage(data));

          localSignature = signature;
          localStorage.setItem(key, localSignature);
        } catch (err) {
          console.log(err);
          return;
        }
      }

      const resp = await axiosInstance.get(
        `${
          import.meta.env.VITE_API
        }/rooms/creator/${wallet.publicKey.toBase58()}?signature=${localSignature}`
      );
      setMyRooms(resp.data);
    })();
  }, [wallet.publicKey]);
  return (
    <div className="relative flex w-full flex-row overflow-y-scroll bg-center p-6 lg:p-8">
      {/* <div className={`flex h-min w-[calc(100%-${roomsVolumeQuery.isSuccess ? 560 : 0}px)] flex-col`}> */}
      <div className={`flex h-min w-full flex-col `}>
        {/* Main banner beginning */}
        <div className="relative w-full pt-[130px] pb-14 md:pt-[67px] md:pb-[67px]">
          <img
            src={BannerBg}
            className="absolute left-0 right-0 top-0 md:left-auto md:-right-[200px] md:-top-20"
            alt=""
          />
          <div className="relative w-full">
            <div className="">
              <h1 className="md:leading-52px mb-[13px] text-[22px] font-extrabold uppercase leading-8 md:text-[36px]">
                Shuffle
              </h1>
              <p className="max-w-[320px] font-medium md:max-w-[500px]">
                Shuffle is a competitive PvP Jackpot game, where players place
                bets using NFTs or SOL to increase their chances of winning.
              </p>
            </div>

            <div className="relative mt-10 h-[420px] overflow-hidden md:-ml-6 md:h-[410px]">
              <div className="flex items-center justify-between md:ml-6">
                <h3 className="flex text-[22px] font-extrabold uppercase leading-8">
                  <img className="mr-3 w-5" src={Fire} alt="fire" />
                  Hot rooms today
                </h3>

                <div className="ml-auto mr-2 hidden items-center gap-2 sm:gap-3 md:flex">
                  <button
                    onClick={() => handleArrow("dec")}
                    disabled={roomsVolumePage === 0}
                  >
                    <ArrowCircleRight
                      className={`rotate-180 ${
                        roomsVolumePage !== 0 ? "opacity-100" : "opacity-50"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleArrow("inc")}
                    disabled={
                      roomsVolumePage === Math.ceil(20 / perPage / 2) - 1
                    }
                  >
                    <ArrowCircleRight
                      className={`${
                        roomsVolumePage !== Math.ceil(20 / perPage / 2) - 1
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="absolute h-[390px] w-full overflow-x-auto md:ml-0 md:h-[410px] md:overflow-hidden">
                <motion.div
                  animate={{
                    transform: `translateX(-${
                      roomsVolumePage * 382 * perPage
                    }px)`,
                  }}
                  className="mt-6 flex gap-5 md:ml-6"
                >
                  {roomsVolumeQuery.isSuccess
                    ? Array.from(
                        {
                          length: Math.ceil(roomsVolumeQuery.data.length / 2),
                        },
                        (_, i) => (
                          <div
                            key={i}
                            className="absolute flex w-full flex-col gap-5"
                            style={{
                              marginLeft: `${
                                width && width > 762 ? i * 382 : i * 352
                              }px`,
                            }}
                          >
                            {roomsVolumeQuery.data
                              .slice(i * 2, i * 2 + 2)
                              .map((room, j) => (
                                <Room {...room} key={j} />
                              ))}
                          </div>
                        )
                      )
                    : Array(3)
                        .fill("a")
                        .map((_, i) => {
                          return (
                            <div
                              key={i}
                              className={`inline-block w-1/2 px-1 sm:w-1/3 sm:px-2 lg:px-3 xl:w-1/3 2xl:w-1/3`}
                            >
                              <Skeleton className="h-40 w-full rounded-[25px] lg:h-40" />
                            </div>
                          );
                        })}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        {/* Main banner end */}

        <h2 className="flex items-center text-base font-extrabold uppercase sm:text-2xl ">
          <img className="mr-2 w-5 sm:mr-3" src={Create} alt="fire" />
          My Rooms
        </h2>
        <p className="my-2.5 font-bold text-mute">
          This section contains your created game rooms.
        </p>
        {myRooms.length > 0 ? (
          <div className="mb-20 flex flex-wrap gap-5">
            {myRooms.map((room) => {
              return (
                <Room
                  {...room}
                  key={room.id}
                  className={"!w-[calc(100%-20px)] md:!w-[362px] lg:!w-[362px]"}
                />
              );
            })}
            <div
              className="relative flex h-[163px]  !w-[calc(100%-20px)] rounded-3xl border-2 border-[#464689] bg-[#2F2E5F] bg-cover bg-bottom bg-no-repeat transition md:!w-[362px] lg:h-[163px] lg:!w-[362px]"
              style={{ background: `url(${CreateBg})` }}
            >
              <div className="absolute top-0 left-0 h-full w-full p-2">
                <div
                  className="flex h-full w-full flex-col
													items-center justify-center rounded-[22px] border-4 border-dashed border-[#393869]"
                >
                  <span className="text-center font-semibold text-mute">
                    Create more rooms!
                  </span>
                  <button
                    onClick={() => {
                      setPopup({
                        show: true,
                        html: <CreateShuffleRoomPopup />,
                      });
                    }}
                    className="mt-4 h-10 w-24 rounded-xl border-2 border-[#49487C] bg-[#393869] text-lg font-bold transition hover:bg-[#2F2E5F]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative mb-20 flex h-44 rounded-3xl border-2 border-[#464689] bg-[#2F2E5F] transition lg:h-60"
            style={{ background: `url(${CreateBg})` }}
          >
            <div className="absolute top-0 left-0 h-full w-full p-2">
              <div
                className="flex h-full w-full flex-col
														items-center justify-center rounded-[22px] border-4 border-dashed border-[#393869]"
              >
                <span className="text-center font-semibold text-mute">
                  You have not created <br />
                  any rooms yet!
                </span>
                <button
                  onClick={() => {
                    setPopup({
                      show: true,
                      html: <CreateShuffleRoomPopup />,
                    });
                  }}
                  className="mt-4 h-10 w-24 rounded-xl border-2 border-[#49487C] bg-[#393869] text-lg font-bold transition hover:bg-[#2F2E5F]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky right-0 top-0 z-10 ml-5 hidden h-full min-w-[288px] lg:ml-8 xl:flex">
        <Chat />
      </div>
    </div>
  );
};

export default GameHome;
