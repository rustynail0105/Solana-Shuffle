import { useEffect, useCallback } from "react";
import Confetti from "react-confetti";

import Container from "../../components/Container";
import Divider from "../../components/Divider";

import { useApp, useTower } from "../../contexts";

import { useWindowSize } from "../../util/hooks";

import { initPath, InitTowerGame, multipliers } from "../../types";
import { formatToken, solToken } from "../../util/util";

import win from "../jackpot/assets/win.mp3";

const CashoutPopup = () => {
  const { hidePopup } = useApp();
  const { testData, setTestData, setActive, setMode } = useTower();

  const { width, height } = useWindowSize();

  useEffect(() => {
    const winClone = new Audio(win);
    winClone.volume = 0.4;
    winClone.play();
  }, []);

  const handleClick = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTestData({
      ...InitTowerGame,
      tower: {
        ...InitTowerGame.tower,
        path: [...initPath], // Create a new array with the same values as initPath
      },
    });
    setActive(false);
    setMode("bet");
    await hidePopup();
  }, []);

  return (
    <Container className="max-w-[500px]">
      <Confetti
        tweenDuration={7000}
        recycle={false}
        numberOfPieces={1000}
        width={width}
        height={height}
      />
      <span className="text-2xl font-bold">
        You won{" "}
        <span className="font-extrabold text-green">
          {formatToken(testData.cashoutResult.amount, solToken, 5)}
        </span>
        !
      </span>
      <Divider className="my-3" />
      <div className="flex flex-col items-center overflow-hidden text-light">
        <div className="flex items-center gap-4">
          <button
            onClick={handleClick}
            className={`mt-3 h-9 w-40 rounded-xl bg-green font-semibold`}
          >
            Confirm
          </button>
        </div>
      </div>
    </Container>
  );
};

export default CashoutPopup;
