import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { useQuery } from "@tanstack/react-query";

import {
  StatusDrawing,
  StatusDrawn,
  StatusWaitingAction,
  StatusWaitingPlayers,
  StatusWaitingSolana,
} from "./Session";

import { useApp } from "../../contexts";

import { getCoinflipRoom } from "../../api/coinflip";

import headsToTails from "./assets/heads-tails.gif";
import headsToHeads from "./assets/heads-heads.gif";
import tailsToHeads from "./assets/tails-heads.gif";
import tailsToTails from "./assets/tails-tails.gif";

import tails from "./assets/tails.png";
import heads from "./assets/heads.png";

export const ANIMATION_DURATION = 6000;

const Coin = () => {
  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [src, setSrc] = useState<string>(tails);
  const [flipResult, setFlipResult] = useState<string>(
    sessionStorage.getItem("flipResult") ?? ""
  );

  useEffect(() => {
    if (!roomQuery.isSuccess) {
      return;
    }

    const session = roomQuery.data.session;

    switch (session.status) {
      case StatusWaitingPlayers ||
        StatusWaitingSolana ||
        StatusWaitingAction ||
        StatusDrawing:
        setSrc(tails);
        sessionStorage.removeItem("flipResult");
        return;
      case StatusDrawn:
        try {
          console.log(session.result);
          if (session.result) {
            return;
          }
        } catch {}
        if (flipResult) {
          if (flipResult === "tails") {
            setSrc(tails);
          } else {
            setSrc(heads);
          }
        } else {
          const flipValue = session.flipValues[session.round - 1];
          const previousFlipValue =
            session.flipValues.length > 1
              ? session.flipValues[session.round - 2]
              : "tails";
          sessionStorage.setItem("flipResult", flipValue);

          setTimeout(() => {
            if (flipValue === "tails") {
              setSrc(tails);
            } else {
              setSrc(heads);
            }
          }, ANIMATION_DURATION + 100);

          if (flipValue === "tails") {
            if (previousFlipValue === "tails") {
              setSrc(tailsToTails);
            } else {
              setSrc(headsToTails);
            }
          } else {
            if (previousFlipValue === "tails") {
              setSrc(tailsToHeads);
            } else {
              setSrc(headsToHeads);
            }
          }
          return;
        }
    }
  }, [roomQuery.data]);

  return (
    <div className="w-full max-w-[350px]">
      <AspectRatio.Root ratio={1 / 1}>
        <img src={src} alt="coinflip image" />
      </AspectRatio.Root>
    </div>
  );
};

export default Coin;
