'use client';

import { useEffect, useState } from 'react';
import CameraPromptFlow from './flows/CameraPromptFlow';
import CameraCapture from './CameraCapture';

type PermissionState = 'loading' | 'granted' | 'prompt' | 'denied';

export default function FaceCaptureFlow({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	handleImageUpload,
}: {
	handleImageUpload: (dataUrl: string) => void;
}) {
	const [permissionState, setPermissionState] =
		useState<PermissionState>('loading');
	const [startCamera, setStartCamera] = useState(false);

	useEffect(() => {
		async function checkPermission() {
			try {
				const result = await navigator.permissions.query({
					name: 'camera' as PermissionName,
				});
				setPermissionState(result.state as PermissionState);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (err) {
				try {
					await navigator.mediaDevices.getUserMedia({ video: true });
					setPermissionState('granted');
				} catch {
					setPermissionState('denied');
				}
			}
		}

		checkPermission();
	}, []);

	if (permissionState === 'loading') {
		return <div className='text-center pt-32 text-gray-500'>Načítání…</div>;
	}

	if (permissionState === 'denied') {
		return <>ManualUploadFlow</>;
	}

	if (permissionState === 'prompt' && !startCamera) {
		return (
			<CameraPromptFlow
				onPermissionGranted={() => {
					setPermissionState('granted');
					setStartCamera(true);
				}}
				onPermissionDenied={() => setPermissionState('denied')}
			/>
		);
	}

	return <CameraCapture />;
}
