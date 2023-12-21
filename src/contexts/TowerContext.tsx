import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  IPopup,
  InitAmount,
  InitPopup,
  TAmount,
  TNft,
  multipliers,
  initPath,
  ITowerGame,
  InitTowerGame,
} from "../types";
import { solToken } from "../util/util";

import pop from "../components/assets/pop.mp3";

export interface ITower {
  testData: ITowerGame;
  setTestData: React.Dispatch<React.SetStateAction<ITowerGame>>;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  difficulty: number;
  setDifficulty: React.Dispatch<React.SetStateAction<number>>;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TowerContext = createContext<ITower>({
  testData: InitTowerGame,
  setTestData: () => {},
  mode: "bet",
  setMode: () => {},
  difficulty: 0,
  setDifficulty: () => {},
  active: false,
  setActive: () => {},
});

export const TowerProvider = ({ children }: { children: ReactNode }) => {
  const [testData, setTestData] = useState<ITowerGame>(InitTowerGame);
  const [mode, setMode] = useState<string>("bet");
  const [difficulty, setDifficulty] = useState<number>(0);
  const [active, setActive] = useState<boolean>(false);

  return (
    <TowerContext.Provider
      value={{
        testData,
        setTestData,
        mode,
        setMode,
        difficulty,
        setDifficulty,
        active,
        setActive,
      }}
    >
      {children}
    </TowerContext.Provider>
  );
};

export const useTower = (): ITower => {
  return useContext(TowerContext);
};
