import { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper";
import "./ticker.scss";

export default function Ticker() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.activeIndex);
  };

  const renderSlide = (game: any, idx: number) => (
    <div
      className={`flex w-full flex-col-reverse items-center justify-between rounded-3xl border-2 border-[#2F2E5F] bg-[#17163F] shadow-lg  md2:flex-row md2:justify-center ${
        idx === activeIndex ? "absolute" : "relative"
      }`}
    >
      <div className="md2:flew-row z-[20] mt-6 flex w-full flex-col items-center gap-4 px-10 pb-10 md:pb-8 md:pl-[42px] md2:mt-0 md2:w-[60%] md2:items-start md2:gap-8 md2:pb-0 lg:w-[40%] lg:pl-[42px] xl:w-[45%] 1.5xl:py-5">
        <h1 className="md2:leading-52px text-center text-[22px] font-extrabold uppercase leading-8 md2:text-start md2:text-[36px]">
          {game.title}
        </h1>
        <p className="w-full text-center font-medium md:max-w-[500px] md2:text-start">
          {game.description}
        </p>
        {game.button && (
          <a
            href={game.url}
            target="_blank"
            className="flex justify-center md:inline-block"
          >
            <div className="grid h-11 w-[200px] place-content-center rounded-xl bg-btn-gradient font-bold uppercase">
              {game.button}
            </div>
          </a>
        )}
      </div>
      <div className="relative right-0 mx-auto flex h-full w-full items-center justify-center overflow-hidden rounded-t-3xl md2:justify-end md2:rounded-xl xl:rounded-r-3xl ">
        <img
          src={game.img}
          className="w-full rounded-xl object-cover md:h-[330px] md:w-[330px] md2:h-[540px] md2:w-[100vw]"
          alt={game.title}
        />
        <div
          className="absolute bottom-0 h-10 w-full md:hidden"
          style={{
            background:
              "linear-gradient(180deg,rgba(18,12,24,0) 1.75%, #17163f 37.01%)",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {Jackpots.length > 1 ? (
        <Swiper
          centeredSlides={true}
          autoplay={{
            delay: 15_000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          onSlideChange={handleSlideChange}
          loop={true}
          modules={[Autoplay, Pagination]}
        >
          {Jackpots.map((game, idx) => {
            return (
              <SwiperSlide key={idx}>{renderSlide(game, idx)}</SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <div className="relative w-full md:pb-8">
          {Jackpots.length === 1 && renderSlide(Jackpots[0], 1)}
        </div>
      )}
    </div>
  );
}

import Jackpot1 from "./assets/FRAKT.png";

const Jackpots = [
  {
    img: Jackpot1,
    title: "Free Plays for FRAKT & GNOMIES",
    description:
      "Receive a refund of up to .25 SOL for those who hold a FRAKT or GNOMIES. Open a ticket in our discord to receive your refund after your wager.",
    url: "https://discord.com/channels/1035006889324458004/1035022978267758642/1103510320124801204",
    button: "Learn More",
  },
];
