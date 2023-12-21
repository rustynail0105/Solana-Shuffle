export interface IResult {
  result: {
    payout: number;
    signatures: string[];
    winner: string;
  };
}

export enum ERepeatType {
  reverse = "reverse",
  loop = "loop",
  mirror = "mirror",
}

export interface IStats {
  games: any;
  totalGames: number;
  totalLoss: number;
  totalVolume: number;
  totalWin: number;
  volumes: any;
}

export type TNft = {
  type: string;
  price: number;
  mint: string;
  metadataURL: string;
  collectionSymbol: string;
  hadeswapMarket: string;
};

export interface IPopup {
  show: boolean;
  lock?: boolean;
  html?: JSX.Element;
}

export const InitPopup: IPopup = {
  show: false,
};

export interface TAmount {
  isPlus: boolean;
  amount: number;
  isVisible?: boolean;
}

export const InitAmount: TAmount = {
  isPlus: true,
  amount: 0,
  isVisible: false,
};

export interface IToken {
  decimals: number;
  publickKey: string;
  ticker: string;
}

export const minAmount = 1_000_000;
export const maxAmount = 750_000_000;

export const trialBetAmount = 1000_000_000;

export const multipliers = [
  1, 1.3, 1.74, 2.32, 3.09, 4.12, 5.5, 7.34, 9.78, 13.05,
];

export const initPath = [
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
  [9, 9, 9, 9],
];

export interface ITowerGame {
  bust: boolean;
  cashoutResult: {
    amount: number;
    done: boolean;
  };
  creationTime: number;
  difficulty: number;
  feeAmount: number;
  id: string;
  multiplier: number;
  nextMultiplier: number;
  tower: { path: number[][]; level: number; difficulty: number };
}

export const InitTowerGame: ITowerGame = {
  bust: false,
  cashoutResult: {
    amount: 0,
    done: false,
  },
  creationTime: 0,
  difficulty: 0,
  feeAmount: 0,
  id: "0",
  multiplier: multipliers[0],
  nextMultiplier: multipliers[1],
  tower: {
    path: [...initPath],
    level: 0,
    difficulty: 0,
  },
};
