interface CardProps {
	img: string;
	title?: string;
	className?: string;
	overlay?: boolean;
}

export default function Card(props: CardProps) {
	return (
		<div className="relative">
			<img
				src={props.img}
				className={`rounded-[25px] border-8 border-[#2F2E5F] bg-[#27264E] shadow-[0px_0px_15px_15px_rgba(f,f,f,1)] ${props.className}`}
				style={{
					backgroundColor: "lighten(blue, 25%)",
					backgroundBlendMode: "multiply",
				}}
			/>
			{props.overlay && (
				<div
					className="absolute top-0 left-0 h-full w-full rounded-[25px]"
					style={{
						backgroundColor: "lighten(blue, 25%)",
					}}
				/>
			)}
			{props.title && (
				<div className="absolute bottom-0 z-[11] h-[25%] w-full rounded-b-[25px] bg-[#2F2E5F] py-4 px-6 text-[11px] font-bold opacity-80 ">
					{props.title}
				</div>
			)}
		</div>
	);
}
