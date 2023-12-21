import React from "react";
import Container from "./Container";
import SuccessIcon from "./SuccessIcon";
import Divider from "./Divider";
import Button from "./Button";
import { useApp } from "../contexts";

const SuccessPopup = ({ message, html }) => {
  const { hidePopup } = useApp();

  return (
    <Container>
      <span className="text-2xl font-bold uppercase">Success!</span>
      <Divider className="my-4" />
      <SuccessIcon className="mt-2 mb-6" />
      {html ? (
        <div className="max-w-[75%] text-lg font-semibold">{html}</div>
      ) : (
        <span className="max-w-[75%] text-lg font-semibold">{message}</span>
      )}
      <Button onClick={hidePopup} text="OK!" className="mt-4" width="w-1/4" />
    </Container>
  );
};

export default SuccessPopup;
