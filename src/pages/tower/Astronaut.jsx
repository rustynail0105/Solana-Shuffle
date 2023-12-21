import React from "react";

import astronaut from "./assets/astronaut.png";
//import astronautAnimation3 from "./assets/spaceman3.gif";
//import astronautAnimation4 from "./assets/spaceman4.gif";
//import astronautAnimation5 from "./assets/astronaut5.gif";

const Astronaut = () => {
	return (
		<img
			src={astronaut}
			className="absolute -top-[1.7%] right-0 left-0 z-10 mx-auto hidden w-[33%] sm:block"
			alt=""
		/>
	);
};

export default Astronaut;
