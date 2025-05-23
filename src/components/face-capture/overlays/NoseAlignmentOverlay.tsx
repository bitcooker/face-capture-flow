'use client';

import { Check } from 'lucide-react';

interface Props {
	isPerfectAlignment: boolean;
}

export default function NoseAlignmentOverlay({ isPerfectAlignment }: Props) {
	return (
		<>
			<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-30'>
				<div
					className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
						isPerfectAlignment
							? 'border-green-500 bg-green-500/20'
							: 'border-white bg-white/20'
					}`}
				>
					{isPerfectAlignment && (
						<Check size={16} className='text-white' />
					)}
				</div>
			</div>
		</>
	);
}
