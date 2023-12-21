import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import TokenLogo from "../../components/TokenLogo";
import TrialBetButton from "./TrialBetButton";
import BetButton from "./BetButton";
import DifficultyTab from "./DifficultyTab";
import MyToken from "./MyToken";

import { useTower } from "../../contexts";

import { localStorageKey } from "./Game";
import { getTower } from "../../api/tower";
import { useLocalStorage } from "../../util/hooks";
import { formatToken, solToken } from "../../util/util";

const bombsPerRow = {
  0: 1,
  1: 1,
  2: 1,
  3: 2,
  4: 3,
};

const BetAmount = ({ difficulty, setDifficulty, className }) => {
  const [amount, setAmount] = useState(0);
  const { active, testData } = useTower();
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
      setDifficulty(towerQuery.data.difficulty);
    }
  }, [towerQuery.data]);

  const currentPayout =
    towerQuery.isSuccess && towerQuery.data.active
      ? towerQuery.data.betAmount * towerQuery.data.multiplier
      : 0;

  return (
    <div
      className={`flex flex-col rounded-3xl bg-[#25244E] shadow-2xl ${className} max-h-full`}
    >
      <div
        style={{
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
        className="flex min-h-[80px] items-center border-b-2 border-[#2F2E5F] bg-[#201F48] bg-opacity-70 px-4"
      >
        <div className="flex w-1/2 flex-col">
          <span className="text-xs font-semibold text-mute">
            Current Payout
          </span>
          <span className="flex items-center text-xl font-bold text-green">
            {formatToken(currentPayout, solToken, 5)}
          </span>
        </div>
        <div className="flex w-1/2 flex-col">
          <span className="text-xs font-semibold text-mute">
            Current Multiplier
          </span>
          <span className="text-xl font-bold text-light">
            {towerQuery.isSuccess && towerQuery.data.active
              ? `${
                  towerQuery.data.multiplier >= 0
                    ? towerQuery.data.multiplier.toFixed(2)
                    : 0
                }x`
              : active
              ? `${testData.multiplier}x`
              : "1x"}
          </span>
        </div>{" "}
      </div>
      <div className="flex flex-col py-4 px-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-mute">
            <span className="">Difficulty | </span>
            <span className="">Bombs per row: {bombsPerRow[difficulty]}</span>
          </span>
          <div className="flex flex-row gap-2.5">
            <DifficultyTab
              value={0}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
            <DifficultyTab
              value={1}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
            <DifficultyTab
              value={2}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          </div>
          <div className="flex flex-row gap-2.5">
            <DifficultyTab
              value={3}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
            <DifficultyTab
              value={4}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <MyToken setAmount={setAmount} amount={amount} />
        </div>
        <div className="mt-4">
          <BetButton amount={amount} difficulty={difficulty} />
        </div>
        <div className="mt-4">
          <TrialBetButton />
        </div>
        <span className="mx-auto mt-1 text-xs font-semibold text-mute">
          Max Payout: {formatToken(50_000_000_000, solToken)}
        </span>
      </div>
    </div>
  );
};

export default BetAmount;
