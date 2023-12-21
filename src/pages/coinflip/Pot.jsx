import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { StatusDrawing, StatusDrawn } from "./Session";
import { ANIMATION_DURATION } from "./Coin";

import { getCoinflipRoom } from "../../api/coinflip";
import { formatToken, shortenAddress, solToken } from "../../util/util";
import { base58ToColor } from "../../util/color";

import DefaultAvatar from "../profile/assets/defaultAvatar-low.png";
import heads from "./assets/heads.png";
import tails from "./assets/tails.png";

const User = ({
  publicKey,
  asset,
  profile,
  eliminated,
  eliminationRound,
  actionValues,
  round,
  status,
}) => {
  const color = base58ToColor(publicKey).hex;
  const [imgError, setImgError] = useState(false);

  const displayCoin = status === StatusDrawn || status === StatusDrawing;

  const [eliminatedAnimation, setEliminatedAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setEliminatedAnimation(eliminated);
    }, 0);
  }, [eliminated]);

  return (
    <div
      style={{
        boxShadow: "inset 0px 4.50668px 7.88669px rgba(0, 0, 0, 0.15)",
      }}
      className={`relative flex h-9 items-center rounded-full bg-[#201F48] p-0.5`}
    >
      {eliminatedAnimation && (
        <div
          className="absolute flex h-full w-full rounded-full bg-mute bg-opacity-30 ring-4 ring-red ring-opacity-50 backdrop-blur-[1px]
					transition-all"
        >
          <div className=" my-auto flex h-1 w-full bg-red bg-opacity-50"></div>
        </div>
      )}

      <img
        onError={() => {
          setImgError(true);
        }}
        className="h-7 w-7 rounded-full"
        src={profile.image && !imgError ? profile.image : DefaultAvatar}
        alt=""
      />
      <span
        style={{
          color,
        }}
        className="ml-1.5 text-sm font-medium"
      >
        {profile.name ? profile.name : shortenAddress(publicKey)}
      </span>
      <span className="ml-auto mr-4 flex items-center text-sm font-semibold">
        <div className="mr-2">
          {displayCoin ? (
            actionValues[actionValues.length - 1] === "heads" ? (
              <img src={heads} className="h-10 w-10" alt="" />
            ) : (
              <img src={tails} className="h-10 w-10" alt="" />
            )
          ) : (
            <div className="grid h-7 w-7 place-content-center rounded-full border-2 border-primary border-opacity-50 bg-black bg-opacity-30">
              <span className="text-lg font-bold text-white">?</span>
            </div>
          )}
        </div>

        {formatToken(asset.lamports, solToken)}
      </span>
    </div>
  );
};

const Pot = () => {
  const { roomID } = useParams();

  const roomQuery = useQuery({
    queryKey: ["coinflipRoom", roomID],
    queryFn: () => getCoinflipRoom(roomID),
  });

  const [sortedUserArray, setSortedUserArray] = useState([]);

  useEffect(() => {
    if (!roomQuery.isSuccess) {
      return;
    }

    if (!roomQuery.data.session.users.some((user) => user.eliminated)) {
      setSortedUserArray(roomQuery.data.session.users);
      return;
    }

    setSortedUserArray((prevData) => {
      let clone = [...prevData];
      clone = clone.map((user) => {
        const foundUser = roomQuery.data.session.users.find(
          (user2) => user2.publicKey === user.publicKey
        );

        user.actionValues = foundUser.actionValues;

        return user;
      });

      return clone;
    });

    const timeout = setTimeout(() => {
      setSortedUserArray(
        roomQuery.data.session.users
          // sort --> non-eliminated first
          .sort(function (x, y) {
            return x.eliminated === y.eliminated ? 0 : x.eliminated ? 1 : -1;
          })
      );
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(timeout);
    };
  }, [roomQuery.data]);

  if (!roomQuery.isSuccess || roomQuery.data.session.users.length === 0) {
    return (
      <div className="flex w-full rounded-3xl border-2 border-[#2F2E5F] bg-[#25244E] p-4">
        <span className="m-auto text-sm font-semibold text-mute sm:text-base">
          Noone has entered this room yet... Be the first! :{")"}
        </span>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-x-8 gap-y-4 rounded-3xl border-2 border-[#2F2E5F] bg-[#25244E] p-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {roomQuery.isSuccess &&
        sortedUserArray.map((user, idx) => {
          return (
            <User
              {...user}
              key={idx}
              round={roomQuery.data.session.round}
              status={roomQuery.data.session.status}
            />
          );
        })}
    </div>
  );
};

export default Pot;
