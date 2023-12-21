import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import base58 from "bs58";

import ShuffleRoom from "./ShuffleRoom";
import ShuflipRoom from "./DuelflipRoom";
import Skeleton from "../../components/Skeleton";
import Chat from "../../frame/Chat";
import { getRooms } from "../../api/room";
import { useWindowSize } from "../../util/hooks";

import { ArrowCircleRight } from "../../components/CustomIcons";
import Fire from "./assets/fire.svg";
import BannerBg from "./assets/banner.png";
import CoinflipBannerBg from "./assets/banner-3.png";
import BannerBg2 from "./assets/banner-2.png";

import { getCoinflipRooms } from "../../api/coinflip";
import Ticker from "./Ticker";

const SHOW_TICKER = true;

const Home = () => {
  const wallet = useWallet();

  const { width, height } = useWindowSize();

  const [tickerOpen, setTickerOpen] = useState(SHOW_TICKER);

  const perPage = useMemo(() => {
    if (width > 1820) {
      return 3;
    } else if (width <= 1820 && width > 1080) {
      return 2;
    } else {
      return 1;
    }
  }, [width]);

  const roomsVolumeQuery = useQuery({
    queryKey: ["rooms", "volume"],
    queryFn: () => getRooms("todayVolume"),
  });

  const coinflipRoomsVolumeQuery = useQuery({
    queryKey: ["coinflipRooms", "volume"],
    queryFn: () => getCoinflipRooms("todayVolume"),
  });

  const [roomsVolumePage1, setRoomsVolumePage1] = useState(0);
  const [roomsVolumePage2, setRoomsVolumePage2] = useState(0);

  const handleArrowShuffle = (type) => {
    let roomNum = roomsVolumePage1;
    if (type === "inc") {
      if (roomNum < Math.ceil(20 / perPage) - 1) {
        roomNum++;
        setRoomsVolumePage1(roomNum);
      }
    }
    if (type === "dec") {
      if (roomNum > 0) {
        roomNum--;
        setRoomsVolumePage1(roomNum);
      }
    }
  };

  const handleArrowCoinflip = (type) => {
    if (!coinflipRoomsVolumeQuery.isSuccess) {
      return;
    }

    let roomNum = roomsVolumePage2;
    if (type === "inc") {
      if (
        roomNum <
        Math.ceil(coinflipRoomsVolumeQuery.data.length / perPage) - 1
      ) {
        roomNum++;
        setRoomsVolumePage2(roomNum);
      }
    }
    if (type === "dec") {
      if (roomNum > 0) {
        roomNum--;
        setRoomsVolumePage2(roomNum);
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
    })();
  }, [wallet.publicKey]);

  return (
    <div className="relative flex w-full flex-row overflow-y-scroll bg-center p-3 md:p-6 lg:p-8">
      {/* <div className={`flex h-min w-[calc(100%-${roomsVolumeQuery.isSuccess ? 560 : 0}px)] flex-col`}> */}
      <div className={`flex h-min w-full flex-col`}>
        {/* Main banner beginning */}

        {/* ======= Scroll Ticker ======= */}
        {tickerOpen && <Ticker />}

        {/* ======= Shuffle ======= */}
        <div className="relative mt-4 w-full rounded-3xl border-2 border-[#2F2E5F] bg-[#17163F] pt-[88px] pb-10 shadow-lg md:mt-8 md:pt-[67px] md:pb-8 md2:mt-0">
          <div className="absolute right-[1px] top-[1px] h-full w-full overflow-hidden  rounded-tr-3xl">
            <img
              src={BannerBg}
              className="absolute left-0 right-0 top-0 h-[340px] w-full object-cover md:left-auto md:-right-[200px] md:-top-20 md:h-auto md:w-auto"
              alt=""
            />
          </div>
          <div className="relative w-full ">
            <div className="pl-7 md:pl-[42px]">
              <h1 className="md:leading-52px mb-5 text-[22px] font-extrabold uppercase leading-8 md:mb-[13px] md:text-[36px]">
                Shuffle
              </h1>
              <p className="mb-[30px] max-w-[320px] font-medium drop-shadow-main md:max-w-[500px]">
                Shuffle is a competitive PvP Jackpot game, where players place
                bets using NFTs or SOL to increase their chances of winning.
              </p>
              <Link to={"/shuffle"} className="inline-block">
                <div className="grid h-11 w-[246px] place-content-center rounded-xl bg-btn-gradient font-bold uppercase">
                  Play
                </div>
              </Link>
            </div>

            <div className="relative mt-6 h-[225px] overflow-hidden pl-6 md:mt-12 md:pl-[42px]">
              <div className="flex items-center justify-between">
                <h3 className="flex text-[22px] font-extrabold uppercase leading-8">
                  <img className="mr-3 w-5" src={Fire} alt="fire" />
                  Hot rooms today
                </h3>

                <div className="ml-auto mr-2 hidden items-center gap-2 sm:gap-3 md:flex">
                  <button
                    onClick={() => handleArrowShuffle("dec")}
                    disabled={roomsVolumePage1 === 0}
                  >
                    <ArrowCircleRight
                      className={`rotate-180 ${
                        roomsVolumePage1 !== 0 ? "opacity-100" : "opacity-50"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleArrowShuffle("inc")}
                    disabled={roomsVolumePage1 >= Math.ceil(20 / perPage)}
                  >
                    <ArrowCircleRight
                      className={`${
                        roomsVolumePage1 < Math.ceil(20 / perPage) - 1
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="absolute -ml-5 h-[210px] w-full overflow-x-auto md:-ml-5 md:h-auto md:overflow-hidden">
                <motion.div
                  animate={{
                    transform: `translateX(-${
                      roomsVolumePage1 * 382 * perPage
                    }px)`,
                  }}
                  className="mt-6 ml-5 flex gap-5 md:ml-5"
                >
                  {roomsVolumeQuery.isSuccess ? (
                    <>
                      {roomsVolumeQuery.data.map((room, i) => (
                        <ShuffleRoom {...room} key={i} />
                      ))}
                    </>
                  ) : (
                    Array(3)
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
                      })
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ======= Shuflip ======= */}
        <div className="relative mt-4 w-full rounded-3xl border-2 border-[#2F2E5F] bg-[#17163F] pt-[88px] pb-10 shadow-lg md:mt-8 md:pt-[67px] md:pb-8">
          <div className="absolute left-[1px] top-[1px] h-full w-full overflow-hidden  rounded-tl-3xl">
            <img
              src={CoinflipBannerBg}
              className="absolute left-0 right-0 top-0 h-[340px] w-full object-cover md:right-auto md:-left-[200px] md:-top-20 md:h-auto md:w-auto"
              alt=""
            />
          </div>
          <div className="relative w-full ">
            <div className="flex flex-col items-end pr-7 md:pr-[42px]">
              <h1 className="md:leading-52px mb-5 text-end text-[22px] font-extrabold uppercase leading-8 md:mb-[13px] md:text-[36px]">
                Duel Flip
              </h1>
              <p
                className="mb-[30px] max-w-[320px] text-end font-medium drop-shadow-main md:max-w-[500px]"
                // style={{
                //   textShadow: "black 1px 1px 1px, blue 0px 0px 1px",
                // }}
              >
                Duel Flip is a competitive PvP Coinflip game, where players
                compete against each other by flipping coins to win or lose SOL.
              </p>

              {/* <Link to={"/duelflip"} className="inline-block">
                <div className="grid h-11 w-[246px] place-content-center rounded-xl bg-btn-gradient text-end font-bold uppercase">
                  Play
                </div>
              </Link> */}
            </div>

            <div className="relative mt-6 h-[225px] overflow-hidden pl-6 md:mt-12 md:pl-[42px]">
              <div className="flex items-center justify-between">
                <h3 className="flex text-[22px] font-extrabold uppercase leading-8">
                  <img className="mr-3 w-5" src={Fire} alt="fire" />
                  Hot rooms today
                </h3>

                <div className="ml-auto mr-2 hidden items-center gap-2 sm:gap-3 md:flex">
                  <button
                    onClick={() => handleArrowCoinflip("dec")}
                    disabled={roomsVolumePage2 === 0}
                  >
                    <ArrowCircleRight
                      className={`rotate-180 ${
                        roomsVolumePage2 !== 0 ? "opacity-100" : "opacity-50"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleArrowCoinflip("inc")}
                    disabled={roomsVolumePage2 >= Math.ceil(20 / perPage)}
                  >
                    <ArrowCircleRight
                      className={`${
                        roomsVolumePage2 < Math.ceil(20 / perPage) - 1
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="absolute -ml-5 h-[210px] w-full overflow-x-auto md:-ml-5 md:h-auto md:overflow-hidden">
                <motion.div
                  animate={{
                    transform: `translateX(-${
                      roomsVolumePage2 * 382 * perPage
                    }px)`,
                  }}
                  className="mt-6 ml-5 flex gap-5 md:ml-5"
                >
                  {coinflipRoomsVolumeQuery.isSuccess ? (
                    <>
                      {coinflipRoomsVolumeQuery.data
                        .filter((room) => room.name !== "dev desting")
                        .map((room, i) => (
                          <ShuflipRoom {...room} key={i} />
                        ))}
                    </>
                  ) : (
                    Array(3)
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
                      })
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ======= Moon Tower ======= */}
        <div className="relative mt-4 w-full overflow-hidden rounded-3xl border-2 border-[#2F2E5F] bg-[#17163F] pt-[88px] shadow-lg md:mt-8 md:pt-[67px] md:pb-[67px]">
          <img
            src={BannerBg2}
            className="absolute left-0 top-0 h-[250px] w-full object-cover md:h-full"
            alt=""
          />
          <div className="relative">
            <div className="pl-7 pb-10 md:pl-[42px]">
              <h1 className="md:leading-52px mb-[13px] text-[22px] font-extrabold uppercase leading-8 md:text-[36px]">
                Moon Tower
              </h1>
              <p className="mb-[30px] max-w-[320px] font-medium drop-shadow-main md:max-w-[500px]">
                Moon Tower is a thrilling tower game where players choose
                between bombs and safe slots to move up 10 levels, each with
                increasing difficulty and rewards.
              </p>
              <Link to={"/tower"} className="inline-block">
                <div className="grid h-11 w-[246px] place-content-center rounded-xl bg-btn-gradient font-bold uppercase">
                  Play
                </div>
              </Link>
            </div>
          </div>
        </div>
        {/* Main banner end */}
      </div>

      <div className="sticky right-0 top-0 z-10 ml-5 hidden h-full min-w-[288px] lg:ml-8 xl:flex">
        <Chat />
      </div>
    </div>
  );
};

export default Home;
