import { useState } from "react";
import { ListIcon, ArrowCircleUp } from "../../components/CustomIcons";

export default function UserList() {
  const [listOpen, setListOpen] = useState<boolean>(false);
  return (
    <div className="flex w-full flex-col rounded-[25px] border-t-2 border-[#2F2E5F] bg-[#27264E] shadow-lg">
      <div className="flex h-20 items-center rounded-t-[25px] border-b-2 border-[#393869] bg-[#201F48] bg-opacity-70 p-6">
        <div className="flex items-center">
          <ListIcon color="" />
          <span className="ml-4 text-2xl font-extrabold uppercase">
            Refer a friend
          </span>
        </div>
        <div className="ml-auto flex gap-2">
          All Time
          <ArrowCircleUp
            className={`h-5 w-5 ${
              listOpen ? "rotate-0" : "-rotate-180"
            } cursor-pointer duration-300 hover:scale-150`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-6 py-4">
        <div className="flex h-8 items-center rounded-xl border-2 border-[#49487C] bg-[#393869] px-3 text-xs font-semibold	text-mute sm:px-6 xl:grid-cols-4">
          <span className="mr-auto w-[25%]">Player</span>
          <span className="mx-auto w-[10%] text-center">Game Played</span>
          <span className="mx-auto w-[10%] text-center">Registration Date</span>
          <span className="ml-auto w-[10%] text-center">Referral Income</span>
          <span className="ml-auto w-[10%] text-center">Status</span>
        </div>
        <div className="flex max-h-[312px] flex-col gap-2 overflow-y-scroll scrollbar-hide [&>*:nth-child(even)]:bg-[#201F48]"></div>
      </div>
    </div>
  );
}
