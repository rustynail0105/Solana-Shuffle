import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import Container from "../../components/Container";
import AnimationedCat from "../../components/AnimationedCat";

import { getCoinflipRoom } from "../../api/coinflip";
import { shortenAddress } from "../../util/util";

import { useApp } from "../../contexts";

import { PoolAddress } from "../../config";
import { IResult } from "../../types";

import lose from "./assets/win.mp3";
import SolIcon from "./assets/solana.png";

const initial1 = {
  x: -400,
  y: -100,
  opacity: 1,
};

const initial2 = {
  x: -500,
  y: 100,
  opacity: 1,
};

const initial3 = {
  x: 300,
  y: -80,
  opacity: 1,
};

const initial4 = {
  x: 400,
  y: 150,
  opacity: 1,
};

const animate = { x: 0, y: 0, opacity: 0 };

const transition = {
  duration: 2,
};

const LosePopup = ({ result }: IResult) => {
  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const { hidePopup } = useApp();

  useEffect(() => {
    const loseClone = new Audio(lose);
    loseClone.volume = 0.4;
    loseClone.play();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      hidePopup();
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  if (!roomQuery.isSuccess || !result) {
    return null;
  } else {
    const container = {
      hidden: { opacity: 1, scale: 0 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          delayChildren: 0.3,
          staggerChildren: 0.2,
        },
      },
    };
    if (result.winner === PoolAddress)
      return (
        <>
          <div>
            <AnimatePresence>
              <motion.ul
                className=" m-0 grid gap-3 overflow-hidden "
                variants={container}
                initial="hidden"
                animate="visible"
              >
                <motion.li
                  initial={initial1}
                  animate={animate}
                  transition={transition}
                  className="absolute"
                >
                  <img src={SolIcon} alt="sol token" className="h-8 w-8" />
                </motion.li>
                <motion.li
                  initial={initial2}
                  animate={animate}
                  transition={transition}
                  className="absolute"
                >
                  <img src={SolIcon} alt="sol token" className="h-8 w-8" />
                </motion.li>
                <motion.li
                  initial={initial3}
                  animate={animate}
                  transition={transition}
                  className="absolute"
                >
                  <img src={SolIcon} alt="sol token" className="h-8 w-8" />
                </motion.li>
                <motion.li
                  initial={initial4}
                  animate={animate}
                  transition={transition}
                  className="absolute"
                >
                  <img src={SolIcon} alt="sol token" className="h-8 w-8" />
                </motion.li>
              </motion.ul>
            </AnimatePresence>
          </div>
          <Container className="max-w-[500px] duration-500">
            Pot is going to pool
          </Container>
        </>
      );
    else
      return (
        <>
          <AnimationedCat />
          <Container className="max-w-[500px] duration-500">
            <span className="text-3xl font-extrabold text-green">
              Winner is{" "}
              <span className="font-extrabold text-white">
                {shortenAddress(result.winner)}
              </span>
            </span>
            <span className="mt-2 text-2xl font-bold">
              You
              <span className="font-extrabold text-red"> lost</span>, please try
              again.
            </span>
          </Container>
        </>
      );
  }
};

export default LosePopup;
