'use client';

interface Props {
	imageUrl: string;
	onRetake: () => void;
	onConfirm: () => void;
}

export default function CapturePreview({
	imageUrl,
	onRetake,
	onConfirm,
}: Props) {
	return (
		<div className='absolute inset-0 z-30 bg-black flex flex-col items-center justify-end text-center overflow-hidden'>
			<img
				src={imageUrl}
				alt='Captured'
				className='absolute inset-0 w-full h-full object-cover'
			/>

			<div className='absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-black/90 to-transparent z-10' />

			<div className='relative z-20 mb-6 text-white text-xl font-semibold'>
				Perfektní
			</div>

			<div className='relative z-20 mb-10 flex gap-4'>
				<button
					onClick={onRetake}
					className='bg-white text-black px-6 py-3 rounded-full text-lg font-medium min-w-[140px]'
				>
					Fotit znovu
				</button>
				<button
					onClick={onConfirm}
					className='bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full text-lg font-medium min-w-[140px]'
				>
					Hotovo
				</button>
			</div>

			<div className='relative z-20 mb-6 text-xs text-white/80 max-w-xs'>
				* S lepším světlem budete mít kvalitnější výsledky.
			</div>
		</div>
	);
}
