import React from "react";

import Logo from "./assets/logo.png";
import Menu from "./assets/menu.svg";
import { Link } from "react-router-dom";
import { CommentIcon } from "../components/CustomIcons";
import Chat from "./Chat";
import { AnimatePresence, useCycle, motion } from "framer-motion";

const Topbar = ({ cycleSidebarOpen }) => {
  const [chatOpen, cycleChatOpen] = useCycle(false, true);

  return (
    <>
      <div className="flex h-20 w-full items-center justify-between bg-[#35356B] md:hidden">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="Solanashuffle logo" className="ml-2 h-12" />
          <span className="ml-2 text-lg font-black uppercase">
            Solanashuffle
          </span>
        </Link>
        <div className="mr-4 flex gap-3">
          <button
            onClick={cycleChatOpen}
            className="ml-auto grid h-11
               			w-11 place-content-center rounded-xl border-2 border-[#49487C]"
          >
            <CommentIcon />
          </button>
          <button
            onClick={cycleSidebarOpen}
            className="ml-auto grid h-11
                		w-11 place-content-center rounded-xl border-2 border-[#49487C]"
          >
            <img className="h-4 w-4" src={Menu} alt="" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            className="absolute left-0 top-0 z-50 h-screen w-screen xl:hidden"
            initial={{
              transform: "translateX(100%)",
              transition: {
                duration: 0.2,
                ease: "linear",
              },
            }}
            animate={{
              transform: "translateX(0%)",
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            }}
            exit={{
              transform: "translateX(100%)",
              transition: {
                duration: 0.2,
                ease: "linear",
              },
            }}
          >
            <Chat
              className="bg-[#25244E]"
              isMobile
              cycleChatOpen={cycleChatOpen}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;
