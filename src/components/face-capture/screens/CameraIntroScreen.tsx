'use client';

import Image from 'next/image';

interface Props {
	onContinue: () => void;
	loading?: boolean;
}

export default function CameraIntroScreen({ onContinue, loading }: Props) {
	return (
		<div className='min-h-screen flex flex-col bg-white px-5 text-center'>
			<div className='flex flex-col flex-grow items-center justify-center'>
				<div className='w-full max-w-xs sm:max-w-sm'>
					<h1 className='text-[22px] sm:text-2xl font-semibold leading-snug mb-4'>
						Podrobná AI diagnostika pleti{' '}
						<span className='underline font-bold'>zdarma</span>
					</h1>

					<div className='rounded-2xl overflow-hidden shadow-sm mb-3'>
						<Image
							src='/images/facecam-guide.png'
							alt='Permission Guide'
							width={400}
							height={220}
							className='w-full h-auto object-contain'
							priority
						/>
					</div>

					<p className='text-sm sm:text-base text-gray-500'>
						Povolte v následujícím kroku přístup k fotoaparátu.
					</p>
				</div>
			</div>

			<div className='w-full max-w-xs sm:max-w-sm mx-auto mt-8 mb-6'>
				<button
					onClick={onContinue}
					disabled={loading}
					className={`w-full py-3 text-white text-base sm:text-lg font-semibold rounded-full transition-all duration-200 ${
						loading
							? 'opacity-50 cursor-not-allowed'
							: 'hover:opacity-90'
					}`}
					style={{
						background:
							'linear-gradient(to right, #FFD600, #FF6B00)',
					}}
				>
					Rozumím, pokračovat
				</button>

				<p className='text-sm text-gray-700 mt-3'>
					Chci zjistit kvalitu mé pleti
				</p>
			</div>
		</div>
	);
}
