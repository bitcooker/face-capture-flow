'use client';

import Image from 'next/image';

export default function UploadingScreen({ imageUrl }: { imageUrl: string }) {
	return (
		<div className='flex flex-col items-center justify-center h-screen px-4 bg-white'>
			<div className='relative w-60 h-60 mb-6'>
				<svg
					viewBox='0 0 100 100'
					className='absolute inset-0 w-full h-full z-0'
				>
					<circle
						cx='50'
						cy='50'
						r='45'
						stroke='#e5e7eb'
						strokeWidth='6'
						fill='none'
					/>
				</svg>

				<div className='absolute inset-0 animate-spin-fast z-10'>
					<svg viewBox='0 0 100 100' className='w-full h-full'>
						<defs>
							<linearGradient
								id='arcGradient'
								x1='0%'
								y1='0%'
								x2='100%'
								y2='0%'
							>
								<stop offset='0%' stopColor='#f97316' />
								<stop offset='100%' stopColor='#fde047' />
							</linearGradient>
						</defs>

						<path
							d='M5,50 A45,45 0 1,1 95,50'
							fill='none'
							stroke='url(#arcGradient)'
							strokeWidth='6'
							strokeLinecap='round'
						/>
					</svg>
				</div>

				<div className='absolute inset-[24px] rounded-full overflow-hidden bg-white z-20'>
					<Image
						src={imageUrl}
						alt='Uploading'
						fill
						className='object-cover'
					/>
				</div>
			</div>

			<p className='text-lg font-medium text-black'>
				Probíhá diagnostika pleti
			</p>

			<style jsx>{`
				@keyframes spin-fast {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
				.animate-spin-fast {
					animation: spin-fast 1s linear infinite;
				}
			`}</style>
		</div>
	);
}
