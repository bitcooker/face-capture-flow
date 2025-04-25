'use client';

import { useEffect, useState } from 'react';
import CameraPromptFlow from './flows/CameraPromptFlow';
import CameraCapture from './CameraCapture';
import ManualUploadFlow from './flows/ManualUploadFlow';
import UploadingScreen from './screens/UploadingScreen';

type View = 'loading' | 'prompt' | 'camera' | 'manual' | 'uploading';

export default function FaceCaptureFlow() {
	const [view, setView] = useState<View>('loading');
	const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(
		null
	);

	const handleImageCaptured = (imageDataUrl: string) => {
		setCapturedImageUrl(imageDataUrl);
		setView('uploading');
	};

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
			return <CameraCapture onCaptureComplete={handleImageCaptured} />;

		case 'manual':
			return <ManualUploadFlow onUpload={handleImageCaptured} />;

		case 'uploading':
			return capturedImageUrl ? (
				<UploadingScreen imageUrl={capturedImageUrl} />
			) : null;

		default:
			return null;
	}
}
