import React from "react";
import { solToken } from "../util/util";

const SolanaInput = ({
	disabled,
	style,
	placeholder,
	className,
	state,
	setState,
	setInput,
	input,
}) => {
	const onChange = (e) => {
		let amt = parseFloat(e.target.value.replace(",", "."));

		amt = Math.round(amt * Math.pow(10, solToken.decimals));
		setState(amt);
		setInput(e.target.value);
	};

	return (
		<input
			disabled={disabled}
			style={style}
			placeholder={placeholder}
			className={className}
			type="text"
			onChange={onChange}  
			inputMode="decimal"
			pattern="\d*(\.\d{0,3})?"
			lang="en"
			value={input}
		/>
	);
};

export default SolanaInput;
