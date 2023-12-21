import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { IPopup, InitAmount, InitPopup, TAmount, TNft } from "../types";

export interface IApp {
  userNum: number;
  setUserNum: React.Dispatch<React.SetStateAction<number>>;
  assets: TNft[];
  setAssets: React.Dispatch<React.SetStateAction<TNft[]>>;
  popup: IPopup;
  setPopup: React.Dispatch<React.SetStateAction<IPopup>>;
  hidePopup: Function;
  winner: string;
  setWinner: React.Dispatch<React.SetStateAction<string>>;
  betAmount: number;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  potAmount: TAmount;
  setPotAmount: React.Dispatch<React.SetStateAction<TAmount>>;
  poolAmount: TAmount;
  setPoolAmount: React.Dispatch<React.SetStateAction<TAmount>>;
}

export const AppContext = createContext<IApp>({
  userNum: 0,
  setUserNum: () => {},
  assets: [],
  setAssets: () => {},
  popup: InitPopup,
  setPopup: () => {},
  hidePopup: () => {},
  winner: "",
  setWinner: () => {},
  betAmount: 0,
  setBetAmount: () => {},
  potAmount: InitAmount,
  setPotAmount: () => {},
  poolAmount: InitAmount,
  setPoolAmount: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userNum, setUserNum] = useState<number>(0);
  const [assets, setAssets] = useState<TNft[]>([]);
  const [popup, setPopup] = useState<IPopup>(InitPopup);
  const [winner, setWinner] = useState<string>("");
  const [betAmount, setBetAmount] = useState<number>(0);
  const [potAmount, setPotAmount] = useState<TAmount>(InitAmount);
  const [poolAmount, setPoolAmount] = useState<TAmount>(InitAmount);

  const hidePopup = useCallback(() => {
    let popupElement = document.getElementById("popup");
    let popupContent = document.getElementById("popup-content");
    let popupExit = document.getElementById("popup-exit");

    if (popupElement && popupContent) {
      popupElement.classList.add("popup-hide");
      popupContent.classList.add("popup-hide-scale");
      if (popupExit) {
        popupExit.classList.add("popup-hide-scale");
      }

      const timeoutId = setTimeout(() => {
        setPopup((prevState) => ({
          ...prevState,
          show: false,
        }));
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        userNum,
        setUserNum,
        assets,
        setAssets,
        popup,
        setPopup,
        hidePopup,
        winner,
        setWinner,
        betAmount,
        setBetAmount,
        potAmount,
        setPotAmount,
        poolAmount,
        setPoolAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): IApp => {
  return useContext(AppContext);
};
