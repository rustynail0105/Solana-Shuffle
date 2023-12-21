import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTower } from "../../contexts";

import { getTower } from "../../api/tower";
import { useLocalStorage } from "../../util/hooks";
import { localStorageKey } from "./Game";

import pop from "../../components/assets/pop.mp3";
import Spinner from "../../components/Spinner";
import { initPath, InitTowerGame } from "../../types";

interface BetAmountProps {
  difficulty: number;
  setDifficulty: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

export default function TrialBetButton(props: BetAmountProps) {
  const { testData, setTestData, mode, setMode, active, setActive } =
    useTower();

  const [message, setMessage] = useState<string>("Free Play");
  const [processing, setProcessing] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setMode(active ? "cashout" : "bet");
    setDisabled(false);

    if (testData.tower.level === 9) {
      cashout();
    }

    setMessage(active ? `End Play` : "Free Play");
  }, [active, testData]);

  const [id, _] = useLocalStorage(localStorageKey);

  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  useEffect(() => {
    if (!towerQuery.isSuccess) {
      return;
    }

    if (towerQuery.data.active) {
      setDisabled(true);
    } else setDisabled(false);
  }, [towerQuery.data]);

  const bet = () => {
    const popClone = new Audio(pop);
    popClone.volume = 0.2;
    popClone.play();
    setActive(true);
  };

  const cashout = async () => {
    setProcessing(true);
    setTestData({
      ...InitTowerGame,
      tower: {
        ...InitTowerGame.tower,
        path: [...initPath],
      },
    });
    setActive(false);
    setMode("bet");
    setProcessing(false);
  };

  return (
    <button
      onClick={() => {
        if (mode === "cashout") {
          cashout();
        } else {
          bet();
        }
      }}
      disabled={disabled}
      style={{
        boxShadow: "0px 13.137px 21.895px rgba(0, 0, 0, 0.09)",
        background: disabled
          ? ""
          : mode === "cashout"
          ? "radial-gradient(191.08% 125.83% at 26.69% 10%, #56FFFA 2.08%, #00DFD9 26.92%, #00D0CB 46.85%, #00C278 91.62%)"
          : "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #900A33 0%, #AD45AA 33.87%, #590A33 91.62%)",
      }}
      className={`flex h-11 w-full items-center justify-center rounded-xl ${
        disabled && "cursor-not-allowed !bg-mute"
      }`}
    >
      <span
        style={{
          textShadow: "2px 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        className="text-sm font-semibold uppercase text-light"
      >
        {processing ? <Spinner height={23} width={undefined} /> : message}
      </span>
    </button>
  );
}
