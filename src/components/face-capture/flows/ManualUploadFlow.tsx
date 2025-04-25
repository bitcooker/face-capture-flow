'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, Check, X } from 'lucide-react';

interface Props {
	onUpload: (imageDataUrl: string) => void;
}

export default function ManualUploadFlow({ onUpload }: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				onUpload(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='min-h-screen flex flex-col bg-white px-5 text-center'>
			<div className='flex flex-col flex-grow items-center justify-center'>
				<h1 className='text-xl font-semibold mb-6'>
					Ukázka správné fotografie
				</h1>

				<div className='flex justify-center gap-6'>
					<div className='flex flex-col items-center'>
						<Image
							src='/images/good-photo.png'
							alt='Correct'
							width={100}
							height={160}
							className='rounded-xl shadow'
						/>
						<Check className='text-green-600 mt-2 text-xl' />
					</div>

					<div className='flex flex-col items-center'>
						<Image
							src='/images/bad-photo.png'
							alt='Incorrect'
							width={100}
							height={160}
							className='rounded-xl shadow'
						/>
						<X className='text-red-600 mt-2 text-xl' />
					</div>
				</div>
			</div>

			<div className='w-full max-w-xs mx-auto mb-6'>
				<button
					onClick={() => inputRef.current?.click()}
					className='w-full py-3 text-white text-base font-semibold rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500'
				>
					<Camera className='w-5 h-5' />
					Pořídit fotografii
				</button>

				<p className='text-sm text-gray-500 mt-3'>
					a ihned zjistit kvalitu mé pleti
				</p>
			</div>

			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				onChange={handleImageChange}
				className='hidden'
			/>
		</div>
	);
}
