import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useApp } from "../contexts";
import AnimationedCat from "./AnimationedCat";
import Container from "./Container";
import { formatToken, shortenAddress, solToken } from "../util/util";
import { PoolAddress } from "../config";
import { useWallet } from "@solana/wallet-adapter-react";

export function CatAnimation() {
  const wallet = useWallet();

  const { winner, setWinner } = useApp();
  const animationControls = useAnimation();

  async function sequence() {
    await animationControls.start({ x: 0, y: 0 });
    await animationControls.start({
      x: 0,
      y: 200,
      transition: {
        ease: "easeInOut",
        duration: 0.5,
      },
    });
    animationControls.start({
      x: 2000,
      y: 200,
      transition: {
        ease: "easeInOut",
        duration: 6,
      },
    });
  }

  useEffect(() => {
    sequence();
    const timeout = setTimeout(() => {
      setWinner("");
    }, 7000);
    return () => clearTimeout(timeout);
  }, [winner]);

  if (!winner) return null;
  else if (winner === PoolAddress) return null;
  else if (winner === wallet.publicKey?.toBase58()) return null;
  else
    return (
      <motion.div
        animate={animationControls}
        className="absolute z-[9999] flex items-end"
      >
        <AnimationedCat />
        <Container className="max-w-[500px] shadow-[0px_0px_50px_25px_rgba(255,255,255,.2)] duration-500">
          <span className="text-3xl font-extrabold text-green">
            Winner is{" "}
            <span className="font-extrabold text-white">
              {shortenAddress(winner)}
            </span>
          </span>
          <span className="mt-2 text-2xl font-bold">
            You
            <span className="font-extrabold text-red"> lost</span>, please try
            again.
          </span>
        </Container>
      </motion.div>
    );
}

export function PlusAnimation() {
  const animationControls = useAnimation();
  const { poolAmount, setPoolAmount } = useApp();

  async function sequence() {
    await animationControls.start({ rotate: -12 });
    await animationControls.start({
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 3,
      },
    });
  }

  useEffect(() => {
    if (poolAmount.isVisible) {
      sequence();
      const timeout = setTimeout(() => {
        setPoolAmount({ ...poolAmount, isVisible: false });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [poolAmount]);
  if (poolAmount.isVisible)
    return (
      <motion.span
        animate={animationControls}
        className="absolute -top-6 right-0 flex -rotate-12 justify-between text-sm font-semibold text-white"
      >
        {poolAmount.isPlus ? "+" : "-"}{" "}
        {formatToken(poolAmount.amount, solToken)}
      </motion.span>
    );
  else return null;
}

export function PlusPotAnimation() {
  const animationControls = useAnimation();
  const { potAmount, setPotAmount } = useApp();

  async function sequence() {
    await animationControls.start({ rotate: -12 });
    await animationControls.start({
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 3,
      },
    });
  }

  useEffect(() => {
    if (potAmount) {
      sequence();
      const timeout = setTimeout(() => {
        setPotAmount({ ...potAmount, amount: 0 });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [potAmount]);

  if (potAmount.amount)
    return (
      <motion.span
        animate={animationControls}
        className="absolute top-[25%] left-[55%] flex -rotate-12 justify-between text-sm font-semibold text-green"
      >
        {potAmount.isPlus ? "+" : "-"} {formatToken(potAmount.amount, solToken)}
      </motion.span>
    );
  else return null;
}
