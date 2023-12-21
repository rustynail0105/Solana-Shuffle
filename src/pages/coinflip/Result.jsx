import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCoinflipRoom } from "../../api/coinflip";
import { base58ToColor } from "../../util/color";
import { shortenAddress } from "../../util/util";
import { PoolAddress } from "../../config";

const Result = () => {
  const { roomID } = useParams();
  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  if (!roomQuery.isSuccess) {
    return null;
  }

  if (roomQuery.data.session.result.winner === PoolAddress) {
    return (
      <div className="relative flex flex-col items-center">
        <span className="font-bold text-mute">Everyone was eliminated!</span>
        <span className="font-bold text-mute">
          The pot is going to the room's{" "}
          <span className="text-green">Funding Pool</span>.
        </span>
      </div>
    );
  }

  const user = roomQuery.data.session.users.find((user) => {
    return user.publicKey === roomQuery.data.session.result.winner;
  });

  return (
    <div className="relative flex flex-col items-center">
      <span className="font-bold text-mute">
        Winner:{" "}
        <span
          style={{
            color: base58ToColor(roomQuery.data.session.result.winner).hex,
          }}
        >
          {user.profile.name
            ? user.profile.name
            : shortenAddress(user.publicKey)}
        </span>
      </span>
    </div>
  );
};

export default Result;
