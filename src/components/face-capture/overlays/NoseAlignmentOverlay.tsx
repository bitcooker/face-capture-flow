'use client';

import { Check } from 'lucide-react';

interface Props {
	dotPosition: { x: number; y: number } | null;
	isPerfectAlignment: boolean;
}

export default function NoseAlignmentOverlay({
	dotPosition,
	isPerfectAlignment,
}: Props) {
	if (!dotPosition) return null;

	const { x, y } = dotPosition;

	return (
		<>
			{/* 🎯 Target circle */}
			<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-30'>
				<div
					className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
						isPerfectAlignment
							? 'border-green-500 bg-green-500/20'
							: 'border-white bg-white/20'
					}`}
				>
					{isPerfectAlignment && (
						<Check size={20} className='text-white' />
					)}
				</div>
			</div>

			{/* 🟡 Tracking dot */}
			{!isPerfectAlignment && (
				<div
					className='absolute w-4 h-4 rounded-full bg-white pointer-events-none z-30'
					style={{
						left: `${x - 8}px`,
						top: `${y - 8}px`,
					}}
				/>
			)}
		</>
	);
}
