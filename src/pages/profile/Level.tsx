import { useEffect, useRef, useState } from "react";

import ImageCard from "../../components/Card";
import { RewardsIcon } from "../../components/CustomIcons";

import Bonus1 from "./assets/bonus1.png";
import Bonus2 from "./assets/bonus2.png";
import Bonus3 from "./assets/bonus3.png";
import Bonus4 from "./assets/bonus4.png";

interface LevelProps {
  value: number;
}
export default function Level(props: LevelProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState<string>("0%");
  const [width, setWidth] = useState<string>("0%");

  useEffect(() => {
    const handleResize = () => {
      const barWidth = barRef.current?.getBoundingClientRect().width;
      const targetWidth = targetRef.current?.getBoundingClientRect().width;
      if (!targetWidth || !barWidth) return;
      setLength(
        `${((barWidth - targetWidth) * props.value) / 100}px`
        // `calc((${props.value}% - ${targetWidth * (props.value / 100)}px))`
      );
      setWidth(`${(barWidth * props.value) / 100}px`);
    };

    handleResize(); // Call immediately to calculate initial length

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [props, targetRef, setLength]);

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="flex h-20 items-center">
        <RewardsIcon color="" />
        <span className="ml-4 text-2xl font-extrabold uppercase">
          Level rewards
        </span>
      </div>
      <div className="mb-20 flex flex-col gap-5 lg:gap-8">
        <div className="flex items-end justify-between gap-5 lg:gap-8">
          <ImageCard
            img={Bonus1}
            title="Bonuses"
            className="w-full lg:w-[222px]"
          />
          <ImageCard
            img={Bonus2}
            title="Bonuses"
            className="w-full lg:w-[222px]"
          />
          <ImageCard
            img={Bonus3}
            title="Bonuses"
            className="w-full lg:w-[194px]"
            overlay={true}
          />
          <ImageCard
            img={Bonus4}
            title="Bonuses"
            className="w-full lg:w-[194px]"
            overlay={true}
          />
        </div>
        <div
          ref={barRef}
          className="relative flex h-[26px] w-full items-center justify-between gap-6 rounded-full border-2 border-solid border-[rgba(73,72,124,1)] bg-[rgba(57,56,105,1)] bg-[url('pages/profile/assets/line2.svg')] bg-repeat lg:gap-16"
        >
          <div className="z-[11] flex w-full justify-center 2xl:w-[222px]">
            <div
              className={`h-2 w-2 rounded-full lg:h-[18px] lg:w-[18px] ${
                props.value > 10
                  ? "bg-[rgb(169,255,241)]"
                  : "bg-[rgb(73,72,124)]"
              }`}
            />
          </div>
          <div className="z-[11] flex w-full justify-center 2xl:w-[222px]">
            <div
              className={`h-2 w-2 rounded-full lg:h-[18px] lg:w-[18px] ${
                props.value > 35
                  ? "bg-[rgb(169,255,241)]"
                  : "bg-[rgb(73,72,124)]"
              }`}
            />
          </div>
          <div className="z-[11] flex w-full justify-center 2xl:w-[194px]">
            <div
              className={`h-2 w-2 rounded-full lg:h-[18px] lg:w-[18px] ${
                props.value > 60
                  ? "bg-[rgb(169,255,241)]"
                  : "bg-[rgb(73,72,124)]"
              }`}
            />
          </div>
          <div className="z-[11] flex w-full justify-center 2xl:w-[194px]">
            <div
              className={`h-2 w-2 rounded-full lg:h-[18px] lg:w-[18px] ${
                props.value > 85
                  ? "bg-[rgb(169,255,241)]"
                  : "bg-[rgb(73,72,124)]"
              }`}
            />
          </div>
          <div
            className="absolute left-0 z-10 h-[26px] rounded-full border-t border-[rgba(131,255,251,1)] bg-gradient-to-br from-[rgba(86,255,250,1)] to-[rgba(0,194,120,1)]"
            style={{ width: width }}
          />

          <div
            ref={targetRef}
            className="absolute z-20 h-6 w-6 rounded-full bg-[rgba(238,238,254,1)] lg:h-[52px] lg:w-[52px]"
            style={{ left: length }}
          />
          <div
            className="absolute left-0 top-0 z-[20] h-full bg-[url('pages/profile/assets/line.svg')] bg-repeat"
            style={{ width: length }}
          />
        </div>
        <div className="relative flex h-[23px] w-full items-center justify-between gap-6 px-[2px] lg:gap-16">
          <div className="flex w-full justify-center uppercase 2xl:w-[222px]">
            <p className="text-[10px] md:text-[16px]">level 1</p>
          </div>
          <div className="flex w-full justify-center uppercase 2xl:w-[222px]">
            <p className="text-[10px] md:text-[16px]">level 10</p>
          </div>
          <div className="flex w-full justify-center uppercase 2xl:w-[194px]">
            <p className="text-[10px] md:text-[16px]">level 20</p>
          </div>
          <div className="flex w-full justify-center uppercase 2xl:w-[194px]">
            <p className="text-[10px] md:text-[16px]">level 30</p>
          </div>
        </div>
      </div>
    </div>
  );
}
