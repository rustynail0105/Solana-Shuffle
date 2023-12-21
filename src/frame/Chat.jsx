import { useContext, useEffect, useRef, useState } from "react";
import { shortenAddress } from "../util/util";

import Emoji from "react-emoji-render";
import InputEmoji from "react-input-emoji";

import Union from "./assets/union.svg";
import DefaultAvatar from "../pages/profile/assets/defaultAvatar-low.png";

const Message = ({ value, publicKey, name, image, style, isMobile, level }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={style}
      className={`flex rounded-xl px-4 py-3 ${
        !isMobile ? "overflow-hidden" : ""
      }`}
    >
      <div
        style={{
          color: `${base58ToColor(publicKey).hex}`,
        }}
        className="mr-4"
      >
        {image && !imgError ? (
          <Avatar2
            onError={() => {
              setImgError(true);
            }}
            width={50}
            publickey={publicKey}
            src={image}
            level={level}
          />
        ) : (
          <Avatar2
            width={50}
            publickey={publicKey}
            src={DefaultAvatar}
            level={level}
          ></Avatar2>
        )}
      </div>
      <div className="flex flex-grow flex-col">
        <span
          style={{
            color: base58ToColor(publicKey).hex,
          }}
          className="text-sm font-semibold"
        >
          {name ? name : shortenAddress(publicKey)}
        </span>
        <Emoji className="mt-1 max-w-[184px] break-words text-sm font-medium text-mute">
          {value}
        </Emoji>
      </div>
    </div>
  );
};

import { ArrowLeft } from "../components/CustomIcons";

import { ChatContext } from "./ChatProvider";
import { useApp } from "../contexts";

import { base58ToColor } from "../util/color";

import People from "./assets/people.svg";
import "./sidebar.css";
import Avatar2 from "../components/Avatar2";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Chat = ({ className, isMobile, cycleChatOpen }) => {
  const { userNum } = useApp();
  const { messages, send } = useContext(ChatContext);

  const [myMessage, setMyMessage] = useState("");
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  const prevMessagesLength = usePrevious(messages.length);

  function handleTextChange(text) {
    setMyMessage(text);
  }

  useEffect(() => {
    if (
      bottomRef &&
      bottomRef.current &&
      scrollRef &&
      scrollRef.current &&
      (!prevMessagesLength || prevMessagesLength < messages.length)
    ) {
      // console.log("scrolling into view...", bottomRef.current.offsetTop);
      // Disable this as this is causing the whole window to scroll to the bottom on every message
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "start",
      });
    }
  }, [messages, bottomRef, scrollRef]);

  return (
    <div
      ref={scrollRef}
      className="relative flex max-h-full w-full flex-col overflow-y-scroll 
        scroll-smooth bg-[#25244E] transition scrollbar-hide lg:rounded-3xl
        xl:max-w-[288px] xl:shadow-lg"
    >
      <div
        style={{
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
        className="sticky left-0 top-0 z-10 flex min-h-[88px] w-full flex-row items-center justify-start
				border-b-2 border-[#393869] bg-[#201F48] bg-opacity-70 px-6 backdrop-blur-md xl:min-h-[96px] xl:flex-col xl:items-start xl:justify-center "
      >
        <div className="flex items-center">
          <div className="grid h-6 w-6 place-content-center">
            <img className="mb-auto h-[21px] w-[21px]" src={People} alt="" />
          </div>

          <span className="mb-0 ml-3 text-[16px] font-extrabold xl:mb-auto xl:text-sm">
            Chat Room
          </span>
        </div>
        <div className="flex items-center">
          <div className="ml-5 grid h-6 w-6 place-content-center xl:ml-0">
            <div className="greenGradient h-3 w-3 rounded-full"></div>
          </div>
          <span className="ml-3 text-sm font-semibold">
            {userNum ? userNum : 0} Players online
          </span>
        </div>
        {isMobile && (
          <button
            onClick={cycleChatOpen}
            className="absolute right-4 ml-auto grid h-11
                		w-11 place-content-center rounded-xl border-2 border-[#49487C] xl:hidden"
          >
            <ArrowLeft />
          </button>
        )}
      </div>
      <div className={`mt-auto px-2 py-2`}>
        <div className="flex flex-col gap-2">
          {messages.map((m, i) => {
            return (
              <Message
                {...m}
                key={m.value + m.publicKey + i}
                style={(() => {
                  if (i % 2 === 0) {
                    return {
                      background: "linear-gradient(0deg, #1D1C3F, #1D1C3F)",
                      boxShadow:
                        "inset 0px 4.15399px 7.26947px rgba(0, 0, 0, 0.15)",
                    };
                  }
                  return {};
                })()}
                isMobile={isMobile}
              />
            );
          })}
        </div>
      </div>
      <div
        className="sticky bottom-0 left-0 min-h-[60px] border-t-2
				border-[#2F2E5F] bg-[#25244E]"
      >
        <div className="flex h-[58px] w-full items-center bg-[#1D1C3F] bg-opacity-50 px-5">
          {/* <InputEmoji
            value={myMessage}
            onChange={handleTextChange}
            cleanOnEnter
            placeholder="Send a message..."
            keepOpened
            maxLength={1200}
            className="ring-none h-full appearance-none border-none	!bg-transparent font-semibold text-light placeholder-gray-500 outline-none"
          /> */}
          <input
            className="ring-none h-full appearance-none border-none	bg-transparent font-semibold text-light placeholder-gray-500 outline-none"
            type="text"
            placeholder="Send a message..."
            value={myMessage}
            onChange={(e) => {
              setMyMessage(e.target.value);
            }}
            onKeyDown={async (event) => {
              if (event.key === "Enter") {
                try {
                  send(myMessage);
                  setMyMessage("");
                } catch {}
              }
            }}
          />
          <button
            className="ml-auto"
            onClick={() => {
              try {
                send(myMessage);
                setMyMessage("");
              } catch {}
            }}
          >
            <img className="h-5 w-5" src={Union} alt="" />
          </button>
        </div>
      </div>
      <div ref={bottomRef}></div>
    </div>
  );
};

export default Chat;
