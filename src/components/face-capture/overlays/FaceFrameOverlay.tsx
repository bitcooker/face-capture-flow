'use client';

import { useEffect, useState } from 'react';
import NoseAlignmentOverlay from './NoseAlignmentOverlay';

interface Props {
	hasFace: boolean;
	isCentered: boolean;
	zoomStatus: 'too-close' | 'too-far' | 'perfect';
	dotPosition: { x: number; y: number } | null;
	isPerfectAlignment: boolean;
}

export default function FaceFrameOverlay({
	hasFace,
	isCentered,
	zoomStatus,
	dotPosition,
	isPerfectAlignment,
}: Props) {
	const showOval = hasFace && isCentered;
	const showRectangle = hasFace && !isCentered;

	const [frameSize, setFrameSize] = useState({ width: 320, height: 420 });

	useEffect(() => {
		const updateFrameSize = () => {
			const vw = window.innerWidth;
			const minWidth = 250;
			const maxWidth = 420;
			const minHeight = 320;
			const maxHeight = 540;

			const width = Math.min(Math.max(minWidth, vw * 0.7), maxWidth);
			const height = Math.min(Math.max(minHeight, vw * 0.9), maxHeight);
			setFrameSize({ width, height });
		};

		updateFrameSize();
		window.addEventListener('resize', updateFrameSize);
		return () => window.removeEventListener('resize', updateFrameSize);
	}, []);

	const getText = () => {
		if (!hasFace) return null;
		if (!isCentered) return 'Umístěte obličej do rámu';
		if (zoomStatus === 'too-far') return 'Posuňte se blíž';
		if (zoomStatus === 'too-close') return 'Oddalte se';
		if (!isPerfectAlignment)
			return 'Upravte polohu obličeje, ať je tečka uprostřed.';
		return 'Perfektní!';
	};

	return (
		<>
			<div
				className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity ${
					showRectangle
						? 'opacity-100 duration-500 delay-100'
						: 'opacity-0 duration-200'
				}`}
			>
				<div
					className='border-4 border-white rounded-3xl'
					style={{
						width: `${frameSize.width}px`,
						height: `${frameSize.height}px`,
					}}
				/>
			</div>

			<div
				className={`absolute inset-0 z-10 pointer-events-none transition-opacity ${
					showOval
						? 'opacity-100 duration-500 delay-100'
						: 'opacity-0 duration-200'
				}`}
			>
				<svg width='100%' height='100%' className='absolute inset-0'>
					<defs>
						<mask id='oval-mask'>
							<rect width='100%' height='100%' fill='white' />
							<ellipse
								cx={window.innerWidth / 2}
								cy={window.innerHeight / 2}
								rx={frameSize.width / 2}
								ry={frameSize.height / 2}
								fill='black'
							/>
						</mask>
					</defs>

					<rect
						width='100%'
						height='100%'
						fill='black'
						opacity='0.7'
						mask='url(#oval-mask)'
					/>

					<ellipse
						cx={window.innerWidth / 2}
						cy={window.innerHeight / 2}
						rx={frameSize.width / 2}
						ry={frameSize.height / 2}
						fill='none'
						stroke={isPerfectAlignment ? '#00FF00' : 'white'}
						strokeWidth='2.5'
					/>
				</svg>
			</div>

			{hasFace && isCentered && zoomStatus === 'perfect' && (
				<NoseAlignmentOverlay
					dotPosition={dotPosition}
					isPerfectAlignment={isPerfectAlignment}
				/>
			)}

			{hasFace && (
				<div className='absolute bottom-24 w-full text-center px-4 z-20 transition-opacity duration-300'>
					<p className='text-white text-lg font-semibold'>
						{getText()}
					</p>
				</div>
			)}
		</>
	);
}
