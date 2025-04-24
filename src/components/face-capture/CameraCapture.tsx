'use client';

import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import '@tensorflow/tfjs-backend-webgl';

import LightingBar from './overlays/LightingBar';
import {
	calculateBrightness,
	isFaceInsideFrame,
	isFaceVisible,
} from './utils/faceUtils';
import FaceFrameOverlay from './overlays/FaceFrameOverlay';

interface Props {
	handleImageUpload: (image: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CameraCapture({ handleImageUpload }: Props) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [hasFace, setHasFace] = useState(false);
	const [isFaceInFrameCentered, setIsFaceInFrameCentered] = useState(false);
	const [lightingLevel, setLightingLevel] = useState(0);

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
			const canvasWidth = videoRef.current?.videoWidth || 640;
			const canvasHeight = videoRef.current?.videoHeight || 480;

			if (
				results.multiFaceLandmarks &&
				results.multiFaceLandmarks.length > 0
			) {
				const landmarks = results.multiFaceLandmarks[0];

				const visible = isFaceVisible(
					landmarks,
					canvasWidth,
					canvasHeight
				);
				setHasFace(visible);

				if (visible) {
					const frame = {
						x: canvasWidth * 0.15,
						y: canvasHeight * 0.15,
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

					const brightness = calculateBrightness(results.image);
					setLightingLevel(brightness);
				} else {
					setIsFaceInFrameCentered(false);
				}
			} else {
				setHasFace(false);
				setIsFaceInFrameCentered(false);
			}
		});

		if (
			typeof window !== 'undefined' &&
			videoRef.current &&
			videoRef.current instanceof HTMLVideoElement
		) {
			const camera = new Camera(videoRef.current, {
				onFrame: async () => {
					await faceMesh.send({ image: videoRef.current! });
				},
				width: 640,
				height: 480,
			});
			camera.start();
		}
	}, []);

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
			/>
			<LightingBar brightness={lightingLevel} />
		</div>
	);
}
