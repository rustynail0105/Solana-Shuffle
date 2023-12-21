import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AvatarLevelIcon from "./assets/profile-level.png";
import DefaultAvatar from "../pages/profile/assets/defaultAvatar-low.png";

import "./avatar.scss";

const Outer = ({ link, to, children, className }) => {
  if (link) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
};

const Avatar2 = ({
  src,
  level,
  publicKey,
  className,
  width,
  onError,
  link,
}) => {
  if (!src) {
    src = DefaultAvatar;
  } else {
    src = `${src}?size=128`;
  }

  const [levelDegrees, setLevelDegrees] = useState(0);

  useEffect(() => {
    if (!level) {
      return;
    }

    const percentage = level.xpGatheredNextLevel / level.xpRequiredNextLevel;
    setLevelDegrees(1000 * percentage);
  }, [level]);

  const levelWidth = width > 50 ? (width < 100 ? width * 1.2 : width) : 70;

  return (
    <Outer
      to={`/profile/${publicKey}`}
      className={`${className ? className : ""} ${
        !link && "pointer-events-none shadow-xl"
      }`}
    >
      <div
        style={{
          width,
        }}
        className="profile-avatar relative"
      >
        <div className="image-out relative blur-sm">
          <div
            style={{
              width,
              height: width * 0.885,
              background: `conic-gradient(#3C38F9 0deg, #9865FF ${levelDegrees}deg, transparent ${levelDegrees}deg 0)`,
            }}
            className="absolute left-0 top-0 rotate-180 bg-red opacity-100"
          ></div>
          <img
            style={{
              width,
              height: width * 0.885,
            }}
            onError={onError}
            src={src}
            alt=""
            className="object-cover"
          />
        </div>
        <img
          style={{
            width: width * 0.885,
            height: width * 0.885 * 0.885,
          }}
          src={src}
          onError={onError}
          className="image-inner absolute bottom-0 left-0 right-0 top-0 m-auto object-cover"
          alt=""
        />
        {level && (
          <div
            style={{
              width: levelWidth * 0.76,
              height: levelWidth * 0.76 * 0.85,
              bottom: -levelWidth * 0.316,
            }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <img src={AvatarLevelIcon} alt="" />
            <span
              style={{
                marginTop: -levelWidth * 0.02817,
                fontSize: levelWidth * 0.14,
                lineHeight: levelWidth * 0.19,
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white"
            >
              {level.level}
            </span>
          </div>
        )}
      </div>
    </Outer>
  );
};

export default Avatar2;
