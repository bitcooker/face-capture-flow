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
	const distance = Math.sqrt(dx * dx + dy * dy);

	const tolerance = frame.width * 0.2;
	return distance < tolerance;
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

	const minWidth = videoWidth * 0.25;
	const minHeight = videoHeight * 0.25;

	const isInsideScreen =
		minX >= 0 && maxX <= videoWidth && minY >= 0 && maxY <= videoHeight;

	return isInsideScreen && boxWidth >= minWidth && boxHeight >= minHeight;
}
