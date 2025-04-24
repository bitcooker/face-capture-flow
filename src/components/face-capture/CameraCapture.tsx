'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import '@tensorflow/tfjs-backend-webgl';

import LightingBar from './overlays/LightingBar';
import FaceFrameOverlay from './overlays/FaceFrameOverlay';

import {
	calculateBrightness,
	calculateFaceSpanNormalized,
	isFaceInsideFrame,
	isFaceVisible,
} from './utils/faceUtils';

export default function CameraCapture() {
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

			// Zoom check
			const spanPx = calculateFaceSpanNormalized(landmarks, canvasHeight);
			if (spanPx < 120) {
				setZoomStatus('too-far');
			} else if (spanPx > 170) {
				setZoomStatus('too-close');
			} else {
				setZoomStatus('perfect');
			}

			// Face visibility
			const visible = isFaceVisible(landmarks, canvasWidth, canvasHeight);
			if (!visible) {
				setIsFaceInFrameCentered(false);
				setDotPosition(null);
				setIsPerfectAlignment(false);
				return;
			}

			// Centering check
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

			// Brightness
			const brightness = calculateBrightness(results.image);
			setLightingLevel(brightness);

			// Nose alignment
			if (visible && centered && zoomStatus === 'perfect') {
				const nose = landmarks[1];

				// Screen-space dot for overlay
				const bounds = videoEl.getBoundingClientRect();
				const dotX = nose.x * bounds.width;
				const dotY = nose.y * bounds.height;
				setDotPosition({ x: dotX, y: dotY });

				// Native-res alignment for accuracy
				const targetX = canvasWidth / 2;
				const targetY = canvasHeight / 2;
				const actualX = nose.x * canvasWidth;
				const actualY = nose.y * canvasHeight;

				const radius = canvasWidth * 0.035; // tighter radius
				const dx = actualX - targetX;
				const dy = actualY - targetY;
				const distance = Math.sqrt(dx * dx + dy * dy);
				setIsPerfectAlignment(distance < radius);
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
		</div>
	);
}
