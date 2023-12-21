import Fire from "./assets/fire.svg";
import React from "react"

export default function BannerSlider({ className }) {
    return (
        <div className={`${className ? className : ""}`}>
            <h3 className="flex text-[22px] leading-8 font-extrabold uppercase">
                <img className="w-5 mr-3" src={Fire} alt="fire" />
                Hot rooms today
            </h3>

            <span className="flex items-center px-5 text-base font-extrabold uppercase sm:text-2xl">
                <img className="mr-2 w-5 sm:mr-3" src={Fire} alt="fire" />
                Hot rooms today
                <div className="ml-auto mr-2 flex items-center gap-2 sm:gap-3">
                    {Array.from(Array(5).keys()).map((i) => {
                        return (
                            <button
                                onClick={() => {
                                    setRoomsVolumePage(i);
                                }}
                                className={`font-semibold ${roomsVolumePage === i
                                        ? "text-base text-light"
                                        : "text-sm text-mute transition hover:text-light"
                                    }`}
                                key={i}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </span>
            <div className="w-full overflow-y-visible px-4 sm:px-3 lg:px-2">
                <div className="relative w-full overflow-x-hidden overflow-y-visible">
                    <motion.div
                        animate={{
                            transform: `translateX(-${roomsVolumePage * 100
                                }%)`,
                        }}
                        className="mt-6 overflow-y-visible whitespace-nowrap"
                    >
                        {roomsVolumeQuery.isSuccess
                            ? roomsVolumeQuery.data.map((room, i) => {
                                return (
                                    <div
                                        key={room.id}
                                        className={`inline-block w-1/2 px-1 sm:w-1/3 sm:px-2 lg:px-3 xl:w-1/3 2xl:w-1/4`}
                                    >
                                        <Room {...room} />
                                    </div>
                                );
                            })
                            : Array(4)
                                .fill("a")
                                .map((_, i) => {
                                    return (
                                        <div
                                            key={i}
                                            className={`inline-block w-1/2 px-1 sm:w-1/3 sm:px-2 lg:px-3 xl:w-1/3 2xl:w-1/4`}
                                        >
                                            <Skeleton className="h-44 w-full rounded-[25px] lg:h-60" />
                                        </div>
                                    );
                                })}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
