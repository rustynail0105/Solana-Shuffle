import { useCallback, useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

const canvasStyles = {
  position: "fixed",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
};

export default function Fireworks() {
  const refAnimationInstance = useRef(null);
  const [intervalId, setIntervalId] = useState();

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance;
  }, []);

  const nextTickAnimation = () => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount: 150,
        origin: {
          x: Math.random() * 0.2 + 0.1,
          y: Math.random() - 0.2,
        },
      });
      refAnimationInstance.current({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount: 150,
        origin: {
          x: Math.random() * 0.2 + 0.7,
          y: Math.random() - 0.2,
        },
      });
    }
  };

  const startAnimation = useCallback(() => {
    if (!intervalId) {
      setIntervalId(setInterval(nextTickAnimation, 400));
    }
  }, [intervalId, nextTickAnimation]);

  const pauseAnimation = useCallback(() => {
    clearInterval(intervalId);
    setIntervalId(null);
  }, [intervalId]);

  const stopAnimation = useCallback(() => {
    clearInterval(intervalId);
    setIntervalId(null);
    refAnimationInstance.current && refAnimationInstance.current.reset();
  }, [intervalId]);

  useEffect(() => {
    startAnimation();
    const timeout = setTimeout(() => {
      pauseAnimation();
      // stopAnimation();
    }, 2000);
    return () => clearTimeout(timeout);
  });

  return <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />;
}
