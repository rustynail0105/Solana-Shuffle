import React, { Component } from "react";

import FlipCountdown from "@rumess/react-flip-countdown";

const CountDown = (date) => {
  return (
    <div className="h-200 absolute top-5 w-full lg:top-10">
      <FlipCountdown
        hideYear
        hideMonth
        titlePosition="bottom" // Options (Default: top): top, bottom.
        size="small" // Options (Default: medium): large, medium, small, extra-small.
        endAt={date} // Date/Time
      />
    </div>
  );
};

export default CountDown;
