'use client';

import { useEffect, useRef } from 'react';

interface Props {
	hasFace: boolean;
	isCentered: boolean;
}

export default function FaceFrameOverlay({ hasFace, isCentered }: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rectAlpha = useRef(0);
	const ovalAlpha = useRef(0);
	const animationFrame = useRef<number | null>(null);
	const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

	const draw = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = (canvas.width = window.innerWidth);
		const height = (canvas.height = window.innerHeight);

		ctx.clearRect(0, 0, width, height);

		if (rectAlpha.current > 0.01) {
			ctx.globalAlpha = rectAlpha.current;
			const rw = width * 0.7;
			const rh = width * 0.9;
			const rx = (width - rw) / 2;
			const ry = (height - rh) / 2;
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.roundRect(rx, ry, rw, rh, 24);
			ctx.stroke();
		}

		if (ovalAlpha.current > 0.01) {
			ctx.globalAlpha = ovalAlpha.current;

			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.fillRect(0, 0, width, height);

			ctx.globalCompositeOperation = 'destination-out';
			ctx.beginPath();
			ctx.ellipse(
				width / 2,
				height / 2,
				width * 0.4,
				width * 0.55,
				0,
				0,
				Math.PI * 2
			);
			ctx.fill();

			ctx.globalCompositeOperation = 'source-over';
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.ellipse(
				width / 2,
				height / 2,
				width * 0.4,
				width * 0.55,
				0,
				0,
				Math.PI * 2
			);
			ctx.stroke();
		}

		ctx.globalAlpha = 1;
		animationFrame.current = requestAnimationFrame(draw);
	};

	const animateAlpha = () => {
		const speedIn = 0.05;
		const speedOut = 0.2;

		const tick = () => {
			const targetRect = targetState.current === 'rectangle' ? 1 : 0;
			const targetOval = targetState.current === 'oval' ? 1 : 0;

			rectAlpha.current +=
				(targetRect - rectAlpha.current) *
				(rectAlpha.current > targetRect ? speedOut : speedIn);
			ovalAlpha.current +=
				(targetOval - ovalAlpha.current) *
				(ovalAlpha.current > targetOval ? speedOut : speedIn);

			animationFrame.current = requestAnimationFrame(tick);
		};

		tick();
	};

	const targetState = useRef<'none' | 'rectangle' | 'oval'>('none');

	useEffect(() => {
		if (!hasFace) {
			targetState.current = 'none';
			if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
			rectAlpha.current = 0;
			ovalAlpha.current = 0;
		} else if (isCentered) {
			targetState.current = 'none';
			rectAlpha.current = 1;
			ovalAlpha.current = 0;
			if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
			fadeTimeout.current = setTimeout(() => {
				targetState.current = 'oval';
			}, 180);
		} else {
			targetState.current = 'none';
			ovalAlpha.current = 1;
			rectAlpha.current = 0;
			if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
			fadeTimeout.current = setTimeout(() => {
				targetState.current = 'rectangle';
			}, 180);
		}
	}, [hasFace, isCentered]);

	useEffect(() => {
		animateAlpha();
		draw();
		return () => cancelAnimationFrame(animationFrame.current!);
	}, []);

	return (
		<>
			<canvas
				ref={canvasRef}
				className='absolute inset-0 z-10 pointer-events-none'
			/>
			{hasFace && (
				<div className='absolute bottom-24 w-full text-center px-4 z-20'>
					<p className='text-white text-lg font-semibold'>
						{isCentered
							? 'Posuňte se blíž'
							: 'Umístěte obličej do rámu'}
					</p>
				</div>
			)}
		</>
	);
}
