import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { StatusWaitingAction, StatusWaitingPlayers } from "./Session";

import { getCoinflipRoom } from "../../api/coinflip";

export const MAX_PLAYER = 30_000_000_000;
export const MAX_ACTION = 7_000_000_000;

const Countdown = () => {
  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!roomQuery.isSuccess) {
      return;
    }

    let max = 0;

    if (roomQuery.data.session.status === StatusWaitingPlayers) {
      max = MAX_PLAYER;
    } else if (roomQuery.data.session.status === StatusWaitingAction) {
      max = MAX_ACTION;
    }

    setPercentage(
      1 - roomQuery.data.session.countdown / max <= 1
        ? (1 - roomQuery.data.session.countdown / max) * 100
        : 1
    );
  }, [roomQuery.data]);

  return (
    <div className="flex flex-col items-center">
      <span className="font-bold text-mute">Countdown</span>
      <div
        style={{
          boxShadow: "inset 0px 5.0297px 3.77228px rgba(0, 0, 0, 0.24)",
        }}
        className="relative h-2 w-full rounded-full bg-[#1C1B42]"
      >
        <div
          style={{
            width: `${percentage}%`,
            background:
              "radial-gradient(191.08% 125.83% at 26.69% 10%, #56FFFA 2.08%, #00DFD9 26.92%, #00D0CB 46.85%, #00C278 91.62%)",
          }}
          className="absolute top-0 left-0 h-2 rounded-full border-t-2 border-[#86FFFC] transition-all"
        ></div>
      </div>
    </div>
  );
};

export default Countdown;
