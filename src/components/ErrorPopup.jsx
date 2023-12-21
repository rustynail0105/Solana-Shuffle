import React from "react";
import Container from "./Container";
import ErrorIcon from "./ErrorIcon";
import Divider from "./Divider";
import Button from "./Button";
import { useApp } from "../contexts";

const ErrorPopup = ({ message }) => {
  const { hidePopup } = useApp();

  return (
    <Container>
      <span className="text-2xl font-bold uppercase">Error!</span>
      <Divider className="my-4" />
      <ErrorIcon className="mt-2 mb-6" />
      <span className="max-w-[75%] text-lg font-semibold">{message}</span>
      <Button onClick={hidePopup} text="OK!" className="mt-4" width="w-1/4" />
    </Container>
  );
};

export default ErrorPopup;
