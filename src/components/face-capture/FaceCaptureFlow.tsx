'use client';

import { useEffect, useState } from 'react';
import CameraPromptFlow from './flows/CameraPromptFlow';
import ManualUploadFlow from './flows/ManualUploadFlow';
import CameraCapture from './CameraCapture';
import UploadingScreen from './screens/UploadingScreen';
import CapturePreview from './overlays/CapturePreview';

type View =
	| 'loading'
	| 'prompt'
	| 'camera'
	| 'manual'
	| 'preview'
	| 'uploading';

export default function FaceCaptureFlow() {
	const [view, setView] = useState<View>('loading');
	const [imageUrl, setImageUrl] = useState<string | null>(null);

	useEffect(() => {
		async function checkPermission() {
			try {
				const result = await navigator.permissions.query({
					name: 'camera' as PermissionName,
				});
				if (result.state === 'granted') {
					setView('camera');
				} else if (result.state === 'prompt') {
					setView('prompt');
				} else {
					setView('manual');
				}
			} catch {
				try {
					await navigator.mediaDevices.getUserMedia({ video: true });
					setView('camera');
				} catch {
					setView('manual');
				}
			}
		}

		checkPermission();
	}, []);

	const handleCaptureComplete = (dataUrl: string) => {
		setImageUrl(dataUrl);
		setView('preview');
	};

	const handleRetake = () => {
		setImageUrl(null);
		setView('camera');
	};

	const handleConfirm = () => {
		if (!imageUrl) return;
		setView('uploading');
	};

	switch (view) {
		case 'loading':
			return (
				<div className='text-center pt-32 text-gray-500'>Načítání…</div>
			);

		case 'prompt':
			return (
				<CameraPromptFlow
					onPermissionGranted={() => setView('camera')}
					onPermissionDenied={() => setView('manual')}
				/>
			);

		case 'camera':
			return <CameraCapture onCaptureComplete={handleCaptureComplete} />;

		case 'manual':
			return <ManualUploadFlow onUpload={handleCaptureComplete} />;

		case 'preview':
			return (
				<CapturePreview
					imageUrl={imageUrl!}
					onRetake={handleRetake}
					onConfirm={handleConfirm}
				/>
			);

		case 'uploading':
			return <UploadingScreen imageUrl={imageUrl!} />;

		default:
			return null;
	}
}
