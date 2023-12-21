import { useState } from "react";
import { useWindowSize } from "../../util/hooks";

import Chat from "../../frame/Chat";
import BetAmount from "./BetAmount";
import Game from "./Game";

import background from "./assets/background2.png";

export const towerSignatureKey = (publicKey) => {
  `tower-signature-${publicKey.toBase58()}`;
};

const Tower = () => {
  const { width } = useWindowSize();
  const [difficulty, setDifficulty] = useState(0);

  return (
    <div className="relative h-full w-full max-w-full">
      <div className="absolute top-0 left-0 h-full w-full">
        <img className="h-full w-full object-cover" src={background} alt="" />
      </div>
      <div className="relative flex h-full w-full max-w-full flex-row overflow-y-scroll px-2 md:p-4 lg:p-2">
        {width >= 1024 && (
          <div className="sticky top-0 left-0 ml-auto hidden h-full flex-col gap-2 p-4 lg:flex">
            <BetAmount
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              className="my-auto w-[298px]"
            />
          </div>
        )}
        <div
          className="glex-col z-10 my-auto mx-auto flex h-min w-full flex-col items-center p-1 
                	pb-3 lg:w-auto lg:flex-row lg:items-start lg:p-4"
        >
          <div className="my-auto flex w-full">
            <Game difficulty={difficulty} setDifficulty={setDifficulty} />
          </div>
          <div className="my-auto w-full max-w-[500px] md:max-w-none lg:hidden">
            <BetAmount difficulty={difficulty} setDifficulty={setDifficulty} />
          </div>
        </div>
        {width >= 1348 ? (
          <div className="sticky right-0 top-0 z-10 hidden h-full min-w-[320px] p-4 1.5xl:flex">
            <Chat />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Tower;
