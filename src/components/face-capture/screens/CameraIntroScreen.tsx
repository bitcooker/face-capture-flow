import Image from 'next/image';

interface Props {
	onContinue: () => void;
	loading?: boolean;
}

export default function CameraIntroScreen({ onContinue, loading }: Props) {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-white px-4 sm:px-6 pt-12 sm:pt-16 text-center'>
			<h1 className='text-xl sm:text-2xl font-bold leading-tight mb-2'>
				Podrobná diagnostika pleti zdarma
			</h1>
			<p className='text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8'>
				Povolte v následujícím kroku přístup k fotoaparátu.
			</p>

			<div className='mb-10 sm:mb-12 w-full max-w-xs sm:max-w-sm'>
				<Image
					src='/images/facecam-guide.png'
					alt='Camera permission guide'
					width={300}
					height={200}
					className='mx-auto'
					priority
				/>
			</div>

			<div className='w-full max-w-xs sm:max-w-sm'>
				<button
					className={`w-full py-3 sm:py-3.5 text-white text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200 ${
						loading
							? 'bg-gray-400'
							: 'bg-blue-600 hover:bg-blue-700'
					}`}
					onClick={onContinue}
					disabled={loading}
				>
					Rozumím, pokračovat
				</button>
			</div>
		</div>
	);
}
