'use client';

import { useState } from 'react';
import CameraIntroScreen from '../screens/CameraIntroScreen';

interface Props {
	onPermissionGranted: () => void;
	onPermissionDenied: () => void;
}

export default function CameraPromptFlow({
	onPermissionGranted,
	onPermissionDenied,
}: Props) {
	const [isRequesting, setIsRequesting] = useState(false);

	const requestCameraAccess = async () => {
		try {
			setIsRequesting(true);
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			stream.getTracks().forEach((track) => track.stop());
			onPermissionGranted();
		} catch (error) {
			console.error('Camera access denied:', error);
			onPermissionDenied();
		} finally {
			setIsRequesting(false);
		}
	};

	return (
		<CameraIntroScreen
			onContinue={requestCameraAccess}
			loading={isRequesting}
		/>
	);
}
