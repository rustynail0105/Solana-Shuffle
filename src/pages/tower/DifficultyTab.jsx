import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getTower } from "../../api/tower";
import { useLocalStorage } from "../../util/hooks";
import { localStorageKey } from "./Game";

const difficultyMap = {
	0: "Easy",
	1: "Medium",
	2: "Hard",
	3: "Extreme",
	4: "Master",
};

const DifficultyTab = ({ value, difficulty, setDifficulty }) => {
	const [id, _] = useLocalStorage(localStorageKey);

	const towerQuery = useQuery({
		queryKey: ["tower", id],
		queryFn: () => getTower(id),
		retry: false,
	});

	return (
		<button
			onClick={() => {
				setDifficulty(value);
			}}
			disabled={towerQuery.isSuccess && towerQuery.data.active}
			style={{
				boxShadow: "inset 0px 4.15399px 7.26947px rgba(0, 0, 0, 0.15)",
			}}
			className={`grid h-8 w-full place-content-center rounded-xl border-2 transition ${
				difficulty === value
					? "border-[#49487C] bg-[#393869] text-light"
					: "border-transparent bg-[#201F48] text-mute hover:text-light"
			} ${
				towerQuery.isSuccess &&
				towerQuery.data.active &&
				`cursor-not-allowed ${
					difficulty !== value && "hover:text-mute"
				}`
			}`}
		>
			<span className={`text-sm font-semibold`}>
				{difficultyMap[value]}
			</span>
		</button>
	);
};

export default DifficultyTab;
