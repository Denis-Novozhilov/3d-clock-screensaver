import { CanvasTexture } from 'three';

export const createGradientBackground = (backgroundSet) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const gradient = context.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		0,
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 2
	);

	gradient.addColorStop(0, backgroundSet[0]);
	gradient.addColorStop(0.5, backgroundSet[1]);
	gradient.addColorStop(1, backgroundSet[2]);

	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const texture = new CanvasTexture(canvas);
	return texture;
};
