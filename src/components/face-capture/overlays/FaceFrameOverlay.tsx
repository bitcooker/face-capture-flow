interface Props {
	isFaceInFrame: boolean;
}

export default function FaceFrameOverlay({ isFaceInFrame }: Props) {
	return (
		<div className='absolute inset-0 z-10 pointer-events-none'>
			<div
				className='absolute top-1/2 left-1/2 w-[70vw] h-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[32px]'
				style={{
					boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
				}}
			/>

			<div className='absolute top-1/2 left-1/2 w-[70vw] h-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border-4 border-white' />

			{!isFaceInFrame && (
				<div className='absolute bottom-20 w-full text-white font-semibold text-lg text-center px-4'>
					Umístěte obličej do rámu
				</div>
			)}
		</div>
	);
}
