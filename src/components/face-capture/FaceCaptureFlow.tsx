'use client';

import { useEffect, useState } from 'react';

export type FlowType = 'camera-blocked' | 'camera-granted' | 'camera-prompt';

export default function FaceCaptureFlow() {
	const [flow, setFlow] = useState<FlowType | null>(null);
	const [showPermissionIntro, setShowPermissionIntro] = useState(false);

	useEffect(() => {
		async function detectPermission() {
			try {
				const result = await navigator.permissions.query({
					name: 'camera' as PermissionName,
				});
				if (result.state === 'granted') setFlow('camera-granted');
				else if (result.state === 'prompt') {
					setFlow('camera-prompt');
					setShowPermissionIntro(true);
				} else setFlow('camera-blocked');
			} catch (err) {
				try {
					await navigator.mediaDevices.getUserMedia({ video: true });
					setFlow('camera-granted');
				} catch (err) {
					setFlow('camera-blocked');
				}
			}
		}

		detectPermission();
	}, []);

	if (!flow) return <div className='text-center p-4'>Loading...</div>;

	if (flow === 'camera-prompt' && showPermissionIntro) {
		return <>PermissionIntro</>;
	}

	switch (flow) {
		case 'camera-granted':
			return <>DefaultAccessFlow</>;
		case 'camera-prompt':
			return <>CameraFlow</>;
		case 'camera-blocked':
			return <>UploadFallbackFlow</>;
	}
}
