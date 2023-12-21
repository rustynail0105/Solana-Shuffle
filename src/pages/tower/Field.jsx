import React, { useEffect, useState } from "react";

import questionMark from "./assets/questionMark.svg";
import pill from "./assets/pill.png";
import skull from "./assets/skull.png";
import skullAnimated from "./assets/skullAnimated.gif";

import "./field.css";
import { localStorageKey } from "./Game";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../../util/hooks";
import { useQuery } from "@tanstack/react-query";
import { getTower } from "../../api/tower";

const classes = (value) => {
	let classes = "";
	switch (value) {
		case 0:
			classes += "pill-not-clicked ";
			break;
		case 1:
			classes += "skull-not-clicked ";
			break;
		case 2:
			classes += "pill-clicked ";
			break;
		case 3:
			classes += "skull-clicked z-20 ";
			break;
		default:
			classes += "not-revealed ";
			break;
	}

	return classes;
};

const Field = ({ value, active, className, onClick, nextMultiplier }) => {
	if (value === 9) {
		return (
			<button
				disabled={!active}
				onClick={onClick}
				className={`not-revealed flex items-center justify-center rounded-lg transition-all ${className} ${
					active && "active"
				}`}
			>
				{active ? (
					<span
						style={{
							fontSize: "100%",
							background:
								"linear-gradient(180deg, #F7FAFF 0%, #9ABDF3 95.83%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							filter: "drop-shadow(0px 1.5px 0px #1A193B)",
						}}
						className="font-black"
					>
						{nextMultiplier.toFixed(2)}x
					</span>
				) : (
					<Icon value={value} />
				)}
			</button>
		);
	}

	return (
		<AnimatePresence>
			<motion.button
				disabled={true}
				onClick={onClick}
				className={`relative flex items-center justify-center rounded-lg transition-all
				${classes(value)} ${className}`}
			>
				<Icon value={value} />
			</motion.button>
		</AnimatePresence>
	);
};

const Icon = ({ value }) => {
	switch (value) {
		case 0: //revealed pill
			return (
				<motion.img
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 1,
					}}
					className="z-10 h-[95%]"
					src={pill}
					alt=""
				/>
			);
		case 2: //clicked pill
			return (
				<motion.img
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 1,
					}}
					className="z-10 h-[95%]"
					src={pill}
					alt=""
				/>
			);
		case 1: //revealed skull
			return (
				<motion.img
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 1,
					}}
					className="z-10 h-[100%]"
					src={skull}
					alt=""
				/>
			);
		case 3: //clicked skull
			return (
				<motion.img
					initial={{
						scale: 0,
					}}
					animate={{
						scale: 2.5,
					}}
					style={{
						filter: "drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.9)) drop-shadow(0px 0px 10px #FB2566)",
					}}
					className="z-10 h-[100%]"
					src={skullAnimated}
					alt=""
				/>
			);

		default:
			return <img className="z-10 h-[60%]" src={questionMark} alt="" />;
	}
};

export default Field;
