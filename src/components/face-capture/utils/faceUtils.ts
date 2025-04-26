export function calculateBrightness(
	image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap
): number {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = image.width;
	canvas.height = image.height;

	ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

	const frame = ctx?.getImageData(0, 0, canvas.width, canvas.height);
	if (!frame) return 0;

	let total = 0;
	const data = frame.data;

	for (let i = 0; i < data.length; i += 4) {
		total += (data[i] + data[i + 1] + data[i + 2]) / 3;
	}

	const avg = total / (data.length / 4);
	return Math.min(avg / 255, 1);
}

export function isFaceInsideFrame(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	landmarks: any[],
	videoWidth: number,
	videoHeight: number,
	frame: { x: number; y: number; width: number; height: number }
): boolean {
	const xs = landmarks.map((p) => p.x * videoWidth);
	const ys = landmarks.map((p) => p.y * videoHeight);

	const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
	const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;

	const frameCenterX = frame.x + frame.width / 2;
	const frameCenterY = frame.y + frame.height / 2;

	const dx = centerX - frameCenterX;
	const dy = centerY - frameCenterY;
	const centerDistance = Math.sqrt(dx * dx + dy * dy);

	const tolerance = frame.width * 0.18;

	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	const relaxedMargin = frame.width * 0.4;

	const relaxedBoundingBoxInside =
		minX > frame.x - relaxedMargin &&
		maxX < frame.x + frame.width + relaxedMargin &&
		minY > frame.y - relaxedMargin &&
		maxY < frame.y + frame.height + relaxedMargin;

	return centerDistance < tolerance && relaxedBoundingBoxInside;
}

export function isFaceVisible(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	landmarks: any[],
	videoWidth: number,
	videoHeight: number
): boolean {
	const xs = landmarks.map((p) => p.x * videoWidth);
	const ys = landmarks.map((p) => p.y * videoHeight);

	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	const boxWidth = maxX - minX;
	const boxHeight = maxY - minY;

	const minWidth = videoWidth * 0.15;
	const minHeight = videoHeight * 0.15;

	const margin = 0.05;
	const isInsideScreen =
		minX >= -videoWidth * margin &&
		maxX <= videoWidth * (1 + margin) &&
		minY >= -videoHeight * margin &&
		maxY <= videoHeight * (1 + margin);

	return isInsideScreen && boxWidth >= minWidth && boxHeight >= minHeight;
}

export function calculateFaceSpanNormalized(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	landmarks: any[],
	videoHeight: number
): number {
	const chin = landmarks[152];
	const leftEye = landmarks[33];
	const rightEye = landmarks[263];

	const midEye = {
		x: (leftEye.x + rightEye.x) / 2,
		y: (leftEye.y + rightEye.y) / 2,
	};

	const dy = Math.abs(chin.y - midEye.y);
	return dy * videoHeight;
}
