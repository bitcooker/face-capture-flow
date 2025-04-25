'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import '@tensorflow/tfjs-backend-webgl';

import LightingBar from './overlays/LightingBar';
import FaceFrameOverlay from './overlays/FaceFrameOverlay';
import CaptureCountdown from './overlays/CaptureCountdown';
import ScreenFlash from './overlays/ScreenFlash';

import {
	calculateBrightness,
	calculateFaceSpanNormalized,
	isFaceInsideFrame,
	isFaceVisible,
} from './utils/faceUtils';

interface Props {
	onCaptureComplete: (imageUrl: string) => void;
}

export default function CameraCapture({ onCaptureComplete }: Props) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const [hasFace, setHasFace] = useState(false);
	const [isFaceInFrameCentered, setIsFaceInFrameCentered] = useState(false);
	const [lightingLevel, setLightingLevel] = useState(0);
	const [zoomStatus, setZoomStatus] = useState<
		'too-close' | 'too-far' | 'perfect'
	>('too-far');
	const [dotPosition, setDotPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [isPerfectAlignment, setIsPerfectAlignment] = useState(false);

	const [countdown, setCountdown] = useState<number | null>(null);
	const [showFlash, setShowFlash] = useState(false);

	const countdownRef = useRef<NodeJS.Timeout | null>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const capturePhoto = () => {
		const video = videoRef.current;
		if (!video) return;

		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d');

		if (ctx) {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const imageDataUrl = canvas.toDataURL('image/jpeg');
			setShowFlash(true);
			setTimeout(() => {
				setShowFlash(false);
				onCaptureComplete(imageDataUrl);
			}, 300);
		}
	};

	useEffect(() => {
		if (
			isPerfectAlignment &&
			countdown === null &&
			!debounceTimeoutRef.current
		) {
			debounceTimeoutRef.current = setTimeout(() => {
				setCountdown(3);
				countdownRef.current = setInterval(() => {
					setCountdown((prev) => {
						if (prev === null) return null;
						if (prev === 1) {
							clearInterval(countdownRef.current!);
							countdownRef.current = null;
							setCountdown(null);
							capturePhoto();
							return null;
						}
						return prev - 1;
					});
				}, 1000);
			}, 500);
		}

		if (!isPerfectAlignment) {
			setCountdown(null);
			if (countdownRef.current) clearInterval(countdownRef.current);
			if (debounceTimeoutRef.current)
				clearTimeout(debounceTimeoutRef.current);
			countdownRef.current = null;
			debounceTimeoutRef.current = null;
		}

		return () => {
			if (countdownRef.current) clearInterval(countdownRef.current);
			if (debounceTimeoutRef.current)
				clearTimeout(debounceTimeoutRef.current);
		};
	}, [isPerfectAlignment]);

	useEffect(() => {
		const faceMesh = new FaceMesh({
			locateFile: (file) =>
				`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
		});

		faceMesh.setOptions({
			maxNumFaces: 1,
			refineLandmarks: true,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		faceMesh.onResults((results) => {
			const videoEl = videoRef.current;
			if (!videoEl) return;

			const canvasWidth = videoEl.videoWidth || 640;
			const canvasHeight = videoEl.videoHeight || 480;

			const isDetected = results.multiFaceLandmarks?.length > 0;
			setHasFace(isDetected);

			if (!isDetected) {
				setIsFaceInFrameCentered(false);
				setDotPosition(null);
				setIsPerfectAlignment(false);
				return;
			}

			const landmarks = results.multiFaceLandmarks[0];
			const spanPx = calculateFaceSpanNormalized(landmarks, canvasHeight);
			setZoomStatus(
				spanPx < 120
					? 'too-far'
					: spanPx > 170
					? 'too-close'
					: 'perfect'
			);

			const visible = isFaceVisible(landmarks, canvasWidth, canvasHeight);
			if (!visible) {
				setIsFaceInFrameCentered(false);
				setDotPosition(null);
				setIsPerfectAlignment(false);
				return;
			}

			const frame = {
				x: canvasWidth * 0.12,
				y: canvasHeight * 0.12,
				width: canvasWidth * 0.7,
				height: canvasHeight * 0.7,
			};
			const centered = isFaceInsideFrame(
				landmarks,
				canvasWidth,
				canvasHeight,
				frame
			);
			setIsFaceInFrameCentered(centered);

			setLightingLevel(calculateBrightness(results.image));

			if (centered && zoomStatus === 'perfect') {
				const nose = landmarks[1];
				const bounds = videoEl.getBoundingClientRect();
				const dotX = nose.x * bounds.width;
				const dotY = nose.y * bounds.height;
				setDotPosition({ x: dotX, y: dotY });

				const dx = nose.x * canvasWidth - canvasWidth / 2;
				const dy = nose.y * canvasHeight - canvasHeight / 2;
				const distance = Math.sqrt(dx * dx + dy * dy);
				setIsPerfectAlignment(distance < canvasWidth * 0.03);
			} else {
				setDotPosition(null);
				setIsPerfectAlignment(false);
			}
		});

		if (typeof window !== 'undefined' && videoRef.current) {
			const camera = new Camera(videoRef.current, {
				onFrame: async () => {
					await faceMesh.send({ image: videoRef.current! });
				},
				width: 640,
				height: 480,
			});
			camera.start();
		}
	}, [zoomStatus]);

	return (
		<div className='relative w-screen h-screen overflow-hidden bg-black'>
			{showFlash && <ScreenFlash />}
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className='absolute top-0 left-0 w-screen h-screen object-cover z-0'
			/>
			<FaceFrameOverlay
				hasFace={hasFace}
				isCentered={isFaceInFrameCentered}
				zoomStatus={zoomStatus}
				dotPosition={dotPosition}
				isPerfectAlignment={isPerfectAlignment}
			/>
			<LightingBar brightness={lightingLevel} />
			{countdown !== null && (
				<div className='absolute top-[15%] w-full z-30 flex justify-center pointer-events-none'>
					<CaptureCountdown count={countdown} />
				</div>
			)}
		</div>
	);
}
