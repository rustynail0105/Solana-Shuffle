import { useEffect, useRef } from "react";

export const solToken = {
  ticker: "SOL",
  publicKey: "So11111111111111111111111111111111111111112",
  decimals: 9,
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const shortenAddress = (address, chars = 4) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const countDecimals = (amount) => {
  if (Math.floor(amount.valueOf()) === amount.valueOf()) return 0;
  return amount.toString().split(".")[1].length || 0;
};

export const formatToken = (amount, token, maxFractionDigits = 3) => {
  if (token === undefined) {
    return "...";
  }

  if (isNaN(amount) || amount == undefined || amount == null) {
    amount = 0;
  }
  return `${readableToken(amount, token, maxFractionDigits)} ${token.ticker}`;
};

export const readableToken = (fractions, token, maxFractionDigits = 3) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: maxFractionDigits,
  }).format(
    Math.round(
      (fractions / Math.pow(10, token.decimals) + Number.EPSILON) *
        10 ** maxFractionDigits
    ) /
      10 ** maxFractionDigits
  );
};

export const currentFormatTime = () => {
  return formatTime(new Date());
};

export const formatTime = (date) => date.toISOString().split("T")[0];

const SET_TIMEOUT_MAX_SAFE_INTERVAL = 2147483647;
export function getSafeTimeoutInterval(interval) {
  return Math.min(interval, SET_TIMEOUT_MAX_SAFE_INTERVAL);
}

// 0.3% of the wheel
const MIN_WINNER_PERCENTAGE_TO_SHOW = 0.3 * 100;
// Adjust the spin value to avoid landing on the line.
export function adjustSpinValue(users, value, spinValue) {
  let lastPercentage = 0;
  for (const user of users) {
    const userPercentage = Math.ceil((user.value * 10000) / value);
    lastPercentage = lastPercentage + userPercentage;
    // Try to adjust the arrow place to avoid landing on the line.
    // If the current user is the winner.
    if (lastPercentage >= spinValue) {
      if (userPercentage >= MIN_WINNER_PERCENTAGE_TO_SHOW * 2) {
        // If too close to the next user, move it back a bit.
        if (lastPercentage - spinValue < MIN_WINNER_PERCENTAGE_TO_SHOW) {
          spinValue = lastPercentage - MIN_WINNER_PERCENTAGE_TO_SHOW;
        }
        // If too close to the previous user, move it forward a bit.
        if (
          spinValue - (lastPercentage - userPercentage) <
          MIN_WINNER_PERCENTAGE_TO_SHOW
        ) {
          spinValue =
            lastPercentage - userPercentage + MIN_WINNER_PERCENTAGE_TO_SHOW;
        }
      } else {
        // Land on the middle of the user if it's too small.
        spinValue = lastPercentage - userPercentage / 2;
      }
      break;
    }
  }
  return spinValue;
}

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}
