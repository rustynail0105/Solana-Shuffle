import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getTower } from "../../api/tower";
import { useLocalStorage } from "../../util/hooks";
import { localStorageKey } from "./Game";

import { AnimatePresence, motion } from "framer-motion";
import { useTower } from "../../contexts";

const lightsOff = [
  "off",
  "off",
  "off",
  "off",
  "off",
  "off",
  "off",
  "off",
  "off",
];

const colorMap = {
  off: "rgb(126, 255, 255)",
  pill: "rgb(126, 255, 255)",
  skull: "rgb(244, 94, 153)",
  pillGlow: "rgb(100, 204, 204)",
  skullGlow: "rgb(191, 75, 121)",
};

const Light = ({ status, i }) => {
  if (status === "off") {
    return null;
  }

  if (i === 0) {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.075,
        }}
        style={{
          filter: `drop-shadow(0 0 10px ${colorMap[`${status}Glow`]})`,
        }}
        className="relative mt-[11%] flex h-[12.5%] flex-col overflow-hidden rounded-md"
      >
        <div
          style={{
            boxShadow: `0 0 0 8px ${colorMap[status]}`,
          }}
          className="absolute -bottom-[20%] -left-[20%] h-[62%] w-[80.5%] rounded-xl"
        ></div>
        <div
          style={{
            background: colorMap[status],
          }}
          className="h-[58%] w-[70%] rounded-md"
        ></div>
        <div
          style={{
            background: colorMap[status],
          }}
          className="absolute right-[13%] h-full w-[26.5%] rounded-tr-xl"
        ></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.075,
      }}
      style={{
        background: colorMap[status],
        filter: `drop-shadow(0 0 10px ${colorMap[`${status}Glow`]})`,
      }}
      className={`relative rounded-md ${i !== 8 && "mt-[13%]"}  flex h-[9.5%]`}
    />
  );
};

const Lights = ({ difficulty }) => {
  const { testData, active } = useTower();
  const [id, _] = useLocalStorage(localStorageKey);
  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  const [lights, setLights] = useState(lightsOff);

  useEffect(() => {
    if (!towerQuery.isSuccess) {
      setLights(lightsOff);
      return;
    }

    if (
      towerQuery.data.difficulty !== difficulty ||
      towerQuery.data.cashoutResult.done
    ) {
      setLights(lightsOff);
      return;
    }

    let newLights = [];
    for (let i = 1; i <= 9; i++) {
      let light = "off";
      if (i < towerQuery.data.tower.level) {
        light = "pill";
      } else if (i === towerQuery.data.tower.level) {
        if (towerQuery.data.bust) {
          light = "skull";
        } else {
          light = "pill";
        }
      }

      newLights.push(light);
    }

    setLights(newLights);
  }, [towerQuery.data, difficulty]);

  useEffect(() => {
    if (active) {
      console.log("here");
      let newLights = [];
      for (let i = 1; i <= 9; i++) {
        let light = "off";
        if (i < testData.tower.level) {
          light = "pill";
        } else if (i === testData.tower.level) {
          if (testData.bust) {
            light = "skull";
          } else {
            light = "pill";
          }
        }

        newLights.push(light);
      }
      setLights(newLights);
    } else {
      setLights(lightsOff);
    }
  }, [active, testData]);

  return (
    <div className="flex h-full w-full flex-col-reverse">
      <AnimatePresence>
        {lights.map((status, i) => (
          <Light key={i} status={status} i={i} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Lights;
