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
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [hasFace, setHasFace] = useState(false);
	const [isFaceInFrameCentered, setIsFaceInFrameCentered] = useState(false);
	const [lightingLevel, setLightingLevel] = useState(0);
	const [zoomStatus, setZoomStatus] = useState<
		'too-close' | 'too-far' | 'perfect'
	>('too-far');
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
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);

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

	const drawNoseDot = (
		ctx: CanvasRenderingContext2D,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		landmarks: any[],
		width: number,
		height: number,
		isPerfectAlignment: boolean,
		shouldDrawNoseDot: boolean
	) => {
		if (!shouldDrawNoseDot || isPerfectAlignment) {
			return;
		}

		const nose = landmarks[1];
		const noseX = nose.x * width;
		const noseY = nose.y * height;

		ctx.beginPath();
		ctx.arc(noseX, noseY, 6, 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();
	};

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
			const canvasEl = canvasRef.current;
			if (!videoEl || !canvasEl) return;

			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;

			canvasEl.width = videoEl.videoWidth;
			canvasEl.height = videoEl.videoHeight;

			ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

			const isDetected = results.multiFaceLandmarks?.length > 0;

			let faceVisible = false;
			let faceCentered = false;
			let zoom = 'too-far' as 'too-close' | 'too-far' | 'perfect';
			let perfectAlignmentNow = false;

			if (isDetected) {
				const landmarks = results.multiFaceLandmarks[0];

				const flippedLandmarks = landmarks.map((landmark) => ({
					...landmark,
					x: 1 - landmark.x,
				}));

				const spanPx = calculateFaceSpanNormalized(
					flippedLandmarks,
					canvasEl.height
				);

				zoom =
					spanPx < 180
						? 'too-far'
						: spanPx > 210
						? 'too-close'
						: 'perfect';

				faceVisible = isFaceVisible(
					flippedLandmarks,
					canvasEl.width,
					canvasEl.height
				);

				const frame = {
					x: canvasEl.width * 0.12,
					y: canvasEl.height * 0.12,
					width: canvasEl.width * 0.7,
					height: canvasEl.height * 0.7,
				};

				faceCentered = isFaceInsideFrame(
					flippedLandmarks,
					canvasEl.width,
					canvasEl.height,
					frame
				);

				if (faceCentered && zoom === 'perfect') {
					const nose = flippedLandmarks[1];
					const dotX = nose.x * canvasEl.width;
					const dotY = nose.y * canvasEl.height;

					const dx = dotX - canvasEl.width / 2;
					const dy = dotY - canvasEl.height / 2;
					const distance = Math.sqrt(dx * dx + dy * dy);

					perfectAlignmentNow = distance < canvasEl.width * 0.03;
				}

				drawNoseDot(
					ctx,
					flippedLandmarks,
					canvasEl.width,
					canvasEl.height,
					perfectAlignmentNow,
					faceVisible && faceCentered && zoom === 'perfect'
				);
			}

			setHasFace(isDetected);
			setIsFaceInFrameCentered(faceCentered);
			setZoomStatus(zoom);
			setIsPerfectAlignment(perfectAlignmentNow);

			if (!isDetected || !faceVisible) {
				setLightingLevel(0);
			} else {
				setLightingLevel(calculateBrightness(results.image));
			}
		});

		if (typeof window !== 'undefined' && videoRef.current) {
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			const camera = new Camera(videoRef.current, {
				onFrame: async () => {
					await faceMesh.send({ image: videoRef.current! });
				},
				width: screenWidth,
				height: screenHeight,
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
				className='absolute top-0 left-0 w-full h-full object-cover z-0'
				style={{ transform: 'scaleX(-1)' }}
			/>
			<canvas
				ref={canvasRef}
				className='absolute top-0 left-0 w-full h-full z-10 pointer-events-none'
			/>
			<FaceFrameOverlay
				hasFace={hasFace}
				isCentered={isFaceInFrameCentered}
				zoomStatus={zoomStatus}
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
