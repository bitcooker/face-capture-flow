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
		<div className='absolute inset-0 z-30 bg-black flex flex-col items-center justify-end text-center'>
			<img
				src={imageUrl}
				className='absolute inset-0 w-full h-full object-cover'
			/>
			<div className='relative z-10 mb-32 text-white text-xl font-semibold'>
				Perfektní
			</div>
			<div className='relative z-10 mb-16 flex gap-4'>
				<button
					onClick={onRetake}
					className='bg-white text-black px-6 py-3 rounded-full text-lg font-medium'
				>
					Fotit znovu
				</button>
				<button
					onClick={onConfirm}
					className='bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-medium'
				>
					Hotovo
				</button>
			</div>
			<div className='relative z-10 mb-4 text-xs text-white/80'>
				* S lepším světlem budete mít kvalitnější výsledky.
			</div>
		</div>
	);
}
