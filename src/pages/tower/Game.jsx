import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Astronaut from "./Astronaut";
import Lights from "./Lights";
import Field from "./Field";

import { useTower } from "../../contexts";
import { useLocalStorage } from "../../util/hooks";

import { actionTower, getTower } from "../../api/tower";
import { initPath, multipliers, trialBetAmount } from "../../types";

import towerBackground from "./assets/tower-bg-low.png";
import igniteAudio from "./assets/ignite.mp3";
import levelAudio from "./assets/level.mp3";
import astronaut from "./assets/astronaut.png";
import astronautAnimation3 from "./assets/spaceman3.gif";
import astronautAnimation4 from "./assets/spaceman4.gif";

export const localStorageKey = "tower-id";

const sizes = [
  [4, 9],
  [3, 9],
  [2, 9],
  [3, 9],
  [4, 9],
];

const emptyTower = (difficulty) => {
  const width = sizes[difficulty][0];
  const height = sizes[difficulty][1];

  var matrix = [];
  for (var i = 0; i < height; i++) {
    matrix[i] = [];
    for (var j = 0; j < width; j++) {
      matrix[i][j] = 9;
    }
  }

  return matrix;
};

const Game = ({ difficulty }) => {
  const { active, testData, setTestData } = useTower();
  const queryClient = useQueryClient();

  console.log(
    "track: ========================\r",
    "\r test is ",
    testData.tower.path
  );
  const [id, setId] = useLocalStorage(localStorageKey);

  const towerQuery = useQuery({
    queryKey: ["tower", id],
    queryFn: () => getTower(id),
    retry: false,
  });

  const onFieldClick = async (level, tile) => {
    const data = await actionTower(id, level, tile);

    if (data.bust) {
      const igniteClone = new Audio(igniteAudio);
      igniteClone.volume = 0.4;
      igniteClone.play();
    } else {
      const levelClone = new Audio(levelAudio);
      levelClone.volume = 0.4;
      levelClone.play();
    }

    queryClient.setQueryData(["tower", id], () => {
      return data;
    });
  };

  const onTrialFieldClick = (level, tile) => {
    const skull = Math.floor(Math.random() * 4);
    const bust = skull === tile;

    const newPath = [0, 0, 0, 0];
    newPath[tile] = bust ? 0 : 2;
    newPath[skull] = bust ? 3 : 1;
    const path = testData.tower.path;
    path[level - 1] = newPath;

    setTestData((prevData) => ({
      ...prevData,
      bust,
      multiplier: multipliers[level],
      nextMultiplier: multipliers[level + 1],
      tower: {
        ...prevData.tower,
        level,
        path,
      },
    }));

    const audioClip = bust ? igniteAudio : levelAudio;
    const audioClone = new Audio(audioClip);
    audioClone.volume = 0.4;
    audioClone.play();
  };

  return (
    <div className="flex w-full">
      <div className="relative mx-auto w-full max-w-[500px] lg:max-w-[750px]">
        <Astronaut />
        <img
          className="hidden w-full object-cover drop-shadow-xl sm:block"
          src={towerBackground}
        />
        <div className="mt-4 mb-3 h-[400px] w-full rounded-xl bg-[#25244E] p-2 sm:hidden">
          <div
            className={`${
              difficulty === 0 || difficulty === 4
                ? "grid-cols-4"
                : difficulty === 1 || difficulty === 3
                ? "grid-cols-3"
                : difficulty === 2 && "grid-cols-2"
            } grid h-full w-full grid-rows-9 gap-1 lg:gap-2.5`}
          >
            {active
              ? testData.difficulty === difficulty
                ? testData.tower.path
                    .map((row, i) => {
                      const rowLevel = i + 1;
                      const active =
                        rowLevel === testData.tower.level + 1 && !testData.bust;

                      return row.map((value, tile) => {
                        return (
                          <Field
                            key={`row-${rowLevel} tile-${tile}`}
                            onClick={() => onTrialFieldClick(rowLevel, tile)}
                            value={value}
                            active={active}
                            nextMultiplier={testData.nextMultiplier}
                          />
                        );
                      });
                    })
                    .reverse()
                : emptyTower(difficulty).map((row, i) => {
                    const rowLevel = i + 1;

                    return row.map((value, tile) => {
                      return (
                        <Field
                          key={`${row - rowLevel} tile=${tile}`}
                          value={value}
                        />
                      );
                    });
                  })
              : towerQuery.isSuccess
              ? towerQuery.data.difficulty === difficulty
                ? towerQuery.data.tower.path
                    .map((row, i) => {
                      const rowLevel = i + 1;
                      const active =
                        rowLevel === towerQuery.data.tower.level + 1 &&
                        !towerQuery.data.bust;

                      return row.map((value, tile) => {
                        return (
                          <Field
                            key={`row-${rowLevel} tile-${tile}`}
                            onClick={() => onFieldClick(rowLevel, tile)}
                            value={value}
                            active={active}
                            nextMultiplier={towerQuery.data.nextMultiplier}
                          />
                        );
                      });
                    })
                    .reverse()
                : emptyTower(difficulty).map((row, i) => {
                    const rowLevel = i + 1;

                    return row.map((value, tile) => {
                      return (
                        <Field
                          key={`${row - rowLevel} tile=${tile}`}
                          value={value}
                        />
                      );
                    });
                  })
              : null}
          </div>
        </div>
        <div className="absolute top-0 left-0 hidden h-full w-full sm:flex">
          <div className="relative h-full w-full">
            <div className="absolute left-[0.5%] top-[16.9%] h-[77.5%] w-[11.3%]">
              <Lights difficulty={difficulty} />
            </div>
            <div
              style={{
                transform: "scale(-1, 1)", // mirror
              }}
              className="absolute right-[0.5%] top-[16.9%] h-[77.5%] w-[11.3%]"
            >
              <Lights difficulty={difficulty} />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 hidden h-full w-full sm:flex">
          <div className="m-auto h-[51%] w-[55%] bg-transparent pb-[2.5%] pr-[0.5%] lg:w-[53%]">
            <div
              className={`${
                difficulty === 0 || difficulty === 4
                  ? "grid-cols-4"
                  : difficulty === 1 || difficulty === 3
                  ? "grid-cols-3"
                  : difficulty === 2 && "grid-cols-2"
              } grid h-full w-full grid-rows-9 gap-1 lg:gap-2.5`}
            >
              {active
                ? testData.difficulty === difficulty
                  ? testData.tower.path
                      .map((row, i) => {
                        const rowLevel = i + 1;
                        const active =
                          rowLevel === testData.tower.level + 1 &&
                          !testData.bust;

                        return row.map((value, tile) => {
                          return (
                            <Field
                              key={`row-${rowLevel} tile-${tile}`}
                              onClick={() => onTrialFieldClick(rowLevel, tile)}
                              value={value}
                              active={active}
                              nextMultiplier={testData.nextMultiplier}
                            />
                          );
                        });
                      })
                      .reverse()
                  : emptyTower(difficulty).map((row, i) => {
                      const rowLevel = i + 1;

                      return row.map((value, tile) => {
                        return (
                          <Field
                            key={`${row - rowLevel} tile=${tile}`}
                            value={value}
                          />
                        );
                      });
                    })
                : towerQuery.isSuccess
                ? towerQuery.data.difficulty === difficulty &&
                  !towerQuery.data.cashoutResult.done
                  ? towerQuery.data.tower.path
                      .map((row, i) => {
                        const rowLevel = i + 1;
                        const active =
                          rowLevel === towerQuery.data.tower.level + 1 &&
                          !towerQuery.data.bust;

                        return row.map((value, tile) => {
                          return (
                            <Field
                              key={`row-${rowLevel} tile-${tile}`}
                              onClick={() => onFieldClick(rowLevel, tile)}
                              value={value}
                              active={active}
                              nextMultiplier={towerQuery.data.nextMultiplier}
                            />
                          );
                        });
                      })
                      .reverse()
                  : emptyTower(difficulty).map((row, i) => {
                      const rowLevel = i + 1;

                      return row.map((value, tile) => {
                        return (
                          <Field
                            key={`${row - rowLevel} tile=${tile}`}
                            value={value}
                          />
                        );
                      });
                    })
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
