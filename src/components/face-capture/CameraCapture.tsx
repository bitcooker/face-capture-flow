'use client';

import { useEffect, useRef, useState } from 'react';
import LightingBar from './overlays/LightingBar';
import FaceFrameOverlay from './overlays/FaceFrameOverlay';

export default function CameraCapture() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [lightingLevel, setLightingLevel] = useState(0);
	const [isFaceInFrame, setIsFaceInFrame] = useState(false);

	useEffect(() => {
		const startCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (err) {
				console.error('Error starting camera:', err);
			}
		};

		startCamera();
	}, []);

	return (
		<div className='relative w-full h-screen overflow-hidden'>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className='absolute inset-0 w-full h-full object-cover z-0'
			/>

			<FaceFrameOverlay isFaceInFrame={isFaceInFrame} />

			<LightingBar brightness={lightingLevel} />
		</div>
	);
}
