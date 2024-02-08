import * as THREE from 'three';
import { gsap, Power2 } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { createGradientBackground } from './helpers/backgroundCreator';
import { CAMERA_POSITIONS, COLOR_DICTIONARY, COLOR_THEMES } from './helpers/constants';
import { updateCSSCustomProperty } from './helpers/updateCSSVar';
import { getLocal } from './helpers/getLocalStorage';
import {
	formatDate,
	formatHours,
	formatMinutes,
	formatMonths,
	formatSeconds,
	formatYear
} from './helpers/dateHelpers';
import { debounce } from './helpers/debounceHelper';

// Font loader
const fontLoader = new FontLoader();

const initGradientBackground = () => {
	const gradientBackground = createGradientBackground(
		COLOR_DICTIONARY[Store.colorTheme].background
	);
	scene.background = gradientBackground;
};

const toggleColorScheme = () => {
	const oldTheme = Store.colorTheme;
	const oldThemeIndex = COLOR_THEMES.indexOf(oldTheme);
	const newTheme =
		oldThemeIndex === COLOR_THEMES.length - 1 ? COLOR_THEMES[0] : COLOR_THEMES[oldThemeIndex + 1];
	localStorage.setItem('colorTheme', newTheme);

	const { meshColor, background, elementsBg } = COLOR_DICTIONARY[newTheme];

	updateCSSCustomProperty('--btn-color', elementsBg);

	const newColorMesh = new THREE.Color(meshColor);
	Store.textProps.textMaterial.color.set(newColorMesh);
	if (!Store.textProps.wireframeEnabled) {
		Store.textProps.textMaterial.emissive.set(newColorMesh);
	}
	pointLight_1.color.set(newColorMesh);
	pointLight_2.color.set(newColorMesh);
	pointLight_3.color.set(newColorMesh);

	scene.background = createGradientBackground(background);

	if (Store.lightsHelpersEnabled) {
		updatePointLightHelpers();
	}

	Store.colorTheme = newTheme;
};

// ALL HTML ELEMENTS
// Canvas
const canvas = document.querySelector('canvas.webgl');
const linksBox = document.querySelector('.links');
const btnLinksToggler = document.querySelector('.links-toggler');
const controlsBox = document.querySelector('.controls');
const btnControlsToggler = document.querySelector('.controls-toggler');
const btnThemeToggler = document.querySelector('.theme-toggler');
const btnWireframeToggler = document.querySelector('.wireframe-toggler');
const btnLightsToggler = document.querySelector('.lights-toggler');
const btnLightsHelpersToggler = document.querySelector('.light-helpers-toggler');
const btnCameraToggler = document.querySelector('.camera-anim-toggler');

/** * Sizes */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

// INIT CAMERA - improve with LOCAL STORAGE
const camera = new THREE.PerspectiveCamera(95, sizes.width / sizes.height, 0.1, 1000);
const initCameraPositionMode = () => getLocal('cameraPositionMode', CAMERA_POSITIONS[0], false);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Store initialization
const Store = {
	meshes: {},
	colorTheme: getLocal('colorTheme', COLOR_THEMES[0], false),
	animationCameraDuration: 7.5,
	cameraAnimationEnabled: true,
	camera: {
		currentCameraPositionMode: getLocal('cameraPositionMode', CAMERA_POSITIONS[0], false),
		cameraPositionParams_animated_1: {
			x: 5,
			y: -6,
			z: 7
		},
		cameraPositionParams_stable_1: {
			x: 0,
			y: 0,
			z: 9
		},
		cameraPositionParams_stable_2: {
			x: 0,
			y: 0,
			z: 12
		}
	},
	animationLightsDuration: 10,
	controlsOpened: getLocal('controlsOpened') ? getLocal('controlsOpened') : true,
	toggleControls: function () {
		if (this.controlsOpened) {
			this.controlsOpened = false;
			controlsBox.classList.remove('open');
			controlsBox.classList.add('close');
		} else {
			this.controlsOpened = true;
			controlsBox.classList.add('open');
			controlsBox.classList.remove('close');
		}
	},
	textProps: {
		textMaterial: {
			emissive: ''
		},
		metalness: 0,
		roughness: 0.75,
		reflectivity: 0.9,
		transparent: true,
		opacity: 0.8,
		wireframeEnabled: getLocal('wireframeEnabled', false, true),
		transmission: 0.8,
		fontGeometryProps: {
			size: 3,
			height: 1,
			curveSegments: 4,
			bevelEnabled: true,
			bevelThickness: 0.3,
			bevelSize: 0.05,
			bevelOffset: 0,
			bevelSegments: 4
		}
	},
	lightProps: {
		intensity: 300,
		distance: 300,
		decay: 1.25
	},
	dataCash: {
		date: '',
		months: '',
		year: '',
		minutes: ''
	},
	lightsEnabled: getLocal('lightsEnabled', true, true),
	toggleLights: function () {
		this.lightsEnabled = !this.lightsEnabled;
		if (this.lightsEnabled) {
			lightsTurnOn();
		} else {
			lightsTurnOff();
		}
	},
	lightsHelpersEnabled: getLocal('lightsHelpersEnabled', true, true),
	lightsHelpers: {},
	updateAll3DTextRequested: false
};

// Scene
const scene = new THREE.Scene();
initGradientBackground();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Lights
// LIGHT 1
const light_1_Params = {
	x: 5.66,
	y: 5.66,
	z: 0,
	rotationX: 0,
	rotationY: 0,
	rotationZ: 0,
	intensity: Store.lightProps.intensity,
	distance: Store.lightProps.distance,
	decay: Store.lightProps.decay
};
// LIGHT 2
const light_2_Params = {
	x: 5.66,
	y: -5.66,
	z: 0,
	rotationX: 0,
	rotationY: 0,
	rotationZ: 0,
	intensity: Store.lightProps.intensity,
	distance: Store.lightProps.distance,
	decay: Store.lightProps.decay
};
// LIGHT 3
const light_3_Params = {
	x: -8,
	y: 0,
	z: 0,
	rotationX: 0,
	rotationY: 0,
	rotationZ: 0,
	intensity: Store.lightProps.intensity,
	distance: Store.lightProps.distance,
	decay: Store.lightProps.decay
};
const pointLight_1 = new THREE.PointLight(
	COLOR_DICTIONARY[Store.colorTheme].meshColor,
	light_1_Params.intensity,
	light_1_Params.distance,
	light_1_Params.decay
);
const pointLight_2 = new THREE.PointLight(
	COLOR_DICTIONARY[Store.colorTheme].meshColor,
	light_1_Params.intensity,
	light_1_Params.distance,
	light_1_Params.decay
);
const pointLight_3 = new THREE.PointLight(
	COLOR_DICTIONARY[Store.colorTheme].meshColor,
	light_1_Params.intensity,
	light_1_Params.distance,
	light_1_Params.decay
);
pointLight_1.position.set(light_1_Params.x, light_1_Params.y, light_1_Params.z);
pointLight_2.position.set(light_2_Params.x, light_2_Params.y, light_2_Params.z);
pointLight_3.position.set(light_3_Params.x, light_3_Params.y, light_3_Params.z);

// PIVOT LIGHT 1
const light_1_PivotParams = {
	position_X: 0,
	position_Y: 0,
	position_Z: 0,
	rotation_X: THREE.MathUtils.degToRad(-50),
	rotation_Y: THREE.MathUtils.degToRad(61),
	rotation_Z: 0
};
const light_2_PivotParams = {
	position_X: 0,
	position_Y: 0,
	position_Z: 0,
	rotation_X: THREE.MathUtils.degToRad(-50),
	rotation_Y: THREE.MathUtils.degToRad(-61),
	rotation_Z: 0
};
const light_3_PivotParams = {
	position_X: 0,
	position_Y: 0,
	position_Z: 0,
	rotation_X: 0,
	rotation_Y: 0,
	rotation_Z: 0
};

const light_1_Pivot = new THREE.Group();
const light_2_Pivot = new THREE.Group();
const light_3_Pivot = new THREE.Group();

light_1_Pivot.position.set(
	light_1_PivotParams.position_X,
	light_1_PivotParams.position_Y,
	light_1_PivotParams.position_Z
);
light_1_Pivot.rotation.set(
	light_1_PivotParams.rotation_X,
	light_1_PivotParams.rotation_Y,
	light_1_PivotParams.rotation_Z
);

light_2_Pivot.position.set(
	light_2_PivotParams.position_X,
	light_2_PivotParams.position_Y,
	light_2_PivotParams.position_Z
);
light_2_Pivot.rotation.set(
	light_2_PivotParams.rotation_X,
	light_2_PivotParams.rotation_Y,
	light_2_PivotParams.rotation_Z
);

light_3_Pivot.position.set(
	light_3_PivotParams.position_X,
	light_3_PivotParams.position_Y,
	light_3_PivotParams.position_Z
);
light_3_Pivot.rotation.set(
	light_3_PivotParams.rotation_X,
	light_3_PivotParams.rotation_Y,
	light_3_PivotParams.rotation_Z
);

light_1_Pivot.add(pointLight_1);
light_2_Pivot.add(pointLight_2);
light_3_Pivot.add(pointLight_3);

// //Helpers
const initPointLightHelpers = () => {
	const pointLight_1_Helper = new THREE.PointLightHelper(pointLight_1);
	const pointLight_2_Helper = new THREE.PointLightHelper(pointLight_2);
	const pointLight_3_Helper = new THREE.PointLightHelper(pointLight_3);
	scene.add(pointLight_1_Helper, pointLight_2_Helper, pointLight_3_Helper);
	Store.lightsHelpers = { pointLight_1_Helper, pointLight_2_Helper, pointLight_3_Helper };
};

// INIT LIGHT HELPERS
if (Store.lightsHelpersEnabled) {
	initPointLightHelpers();
}
const removePointLightHelpers = () => {
	scene.remove(
		Store.lightsHelpers.pointLight_1_Helper,
		Store.lightsHelpers.pointLight_2_Helper,
		Store.lightsHelpers.pointLight_3_Helper
	);
};
const updatePointLightHelpers = () => {
	removePointLightHelpers();
	initPointLightHelpers();
};

// LIGHTS ANIMATION
const light_1_animate = () => {
	gsap.to(light_1_Pivot.rotation, {
		duration: Store.animationLightsDuration,
		delay: 0,
		z: THREE.MathUtils.degToRad(360),
		ease: 'none',
		repeat: -1
	});
};
const light_2_animate = () => {
	gsap.to(light_2_Pivot.rotation, {
		duration: Store.animationLightsDuration,
		delay: 0,
		z: -THREE.MathUtils.degToRad(360),
		ease: 'none',
		repeat: -1
	});
};

const light_3_animate = () => {
	gsap.to(light_3_Pivot.rotation, {
		duration: Store.animationLightsDuration,
		delay: 0,
		x: THREE.MathUtils.degToRad(360),
		z: THREE.MathUtils.degToRad(360),
		ease: 'none',
		repeat: -1
	});
};
const lightsTurnOn = () => {
	pointLight_1.intensity = Store.lightProps.intensity;
	pointLight_2.intensity = Store.lightProps.intensity;
	pointLight_3.intensity = Store.lightProps.intensity;
};

light_1_animate();
light_2_animate();
light_3_animate();
scene.add(light_1_Pivot, light_2_Pivot, light_3_Pivot);

const lightsTurnOff = () => {
	pointLight_1.intensity = 0;
	pointLight_2.intensity = 0;
	pointLight_3.intensity = 0;
};

const update3DTextMeshes = () => {
	Store.updateAll3DTextRequested = true;
};

// TEXT MATERIAL INICIALIZATION
const textInitialize = () => {
	const matcapTexture = textureLoader.load('matcaps/1.png');
	matcapTexture.colorSpace = THREE.SRGBColorSpace;
	Store.textProps.textMaterial = Store.textProps.wireframeEnabled
		? new THREE.MeshBasicMaterial()
		: new THREE.MeshPhysicalMaterial();
	if (!Store.textProps.wireframeEnabled) {
		Store.textProps.textMaterial.emissive = new THREE.Color(
			COLOR_DICTIONARY[Store.colorTheme].meshColor
		);
		Store.textProps.textMaterial.metalness = Store.textProps.metalness;
		Store.textProps.textMaterial.roughness = Store.textProps.roughness;
		Store.textProps.textMaterial.reflectivity = Store.textProps.reflectivity;
		Store.textProps.textMaterial.transmission = Store.textProps.transmission;
	}
	Store.textProps.textMaterial.color.set(COLOR_DICTIONARY[Store.colorTheme].meshColor);
	Store.textProps.textMaterial.wireframe = Store.textProps.wireframeEnabled;
	Store.textProps.textMaterial.transparent = Store.textProps.transparent;
	Store.textProps.textMaterial.opacity = Store.textProps.opacity;

	updateCSSCustomProperty('--btn-color', COLOR_DICTIONARY[Store.colorTheme].elementsBg);
	update3DTextMeshes();
};
textInitialize();

// font helpers
const initTextGeometry = (content, font, props) => new TextGeometry(content, { font, ...props });
const initTextMesh = (textGeometry, material) => new THREE.Mesh(textGeometry, material);
const create3DText = (content, font, props, material) => {
	const textGeometry1 = initTextGeometry(content, font, props);
	const resulted3DText = initTextMesh(textGeometry1, material);
	return resulted3DText;
};
// FONT INICIALIZATION
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
	Store.animation = () => {
		const date = new Date();

		const currentYear = formatYear(date);
		const currentDate = formatDate(date);
		const currentMonths = formatMonths(date);
		const currentHours = formatHours(date);
		const currentMinutes = formatMinutes(date);
		const currentSeconds = formatSeconds(date);

		// optional update Date and Months
		if (
			Store.dataCash.date !== currentDate ||
			Store.dataCash.months !== currentMonths ||
			Store.updateAll3DTextRequested
		) {
			scene.remove(Store.meshes.textMashDateAndMonth);

			const textMashDateAndMonth = create3DText(
				`${currentDate} ${currentMonths}`,
				font,
				{
					...Store.textProps.fontGeometryProps,
					curveSegments: Store.textProps.wireframeEnabled ? 4 : 32
				},
				Store.textProps.textMaterial
			);

			textMashDateAndMonth.geometry.center();
			textMashDateAndMonth.position.y += 5;
			textMashDateAndMonth.position.z -= 1;

			scene.add(textMashDateAndMonth);

			Store.dataCash.date = currentDate;
			Store.dataCash.months = currentMonths;
			Store.meshes.textMashDateAndMonth = textMashDateAndMonth;
		}

		// optional update Year
		if (Store.dataCash.year !== currentYear || Store.updateAll3DTextRequested) {
			scene.remove(Store.meshes.textMashYear);

			const textMashYear = create3DText(
				`${currentYear}`,
				font,
				{
					...Store.textProps.fontGeometryProps,
					curveSegments: Store.textProps.wireframeEnabled ? 4 : 32
				},
				Store.textProps.textMaterial
			);

			textMashYear.geometry.center();
			textMashYear.position.z -= 0.5;

			scene.add(textMashYear);

			Store.dataCash.year = currentYear;
			Store.meshes.textMashYear = textMashYear;
		}

		if (Store.dataCash.hours !== currentHours || Store.updateAll3DTextRequested) {
			scene.remove(Store.meshes.textMashHours);

			const textMashHours = create3DText(
				`${currentHours}:`,
				font,
				{
					...Store.textProps.fontGeometryProps,
					curveSegments: Store.textProps.wireframeEnabled ? 4 : 32
				},
				Store.textProps.textMaterial
			);

			textMashHours.position.x = -2.4 * 3 - 0.2 * 2;
			textMashHours.position.y = -6.5;

			scene.add(textMashHours);

			Store.dataCash.hours = currentHours;
			Store.meshes.textMashHours = textMashHours;
		}
		// optional update Minutes
		if (Store.dataCash.minutes !== currentMinutes || Store.updateAll3DTextRequested) {
			scene.remove(Store.meshes.textMashMinutes);

			const textMashMinutes = create3DText(
				`${currentMinutes}:`,
				font,
				{
					...Store.textProps.fontGeometryProps,
					curveSegments: Store.textProps.wireframeEnabled ? 4 : 32
				},
				Store.textProps.textMaterial
			);

			textMashMinutes.position.x = -2.4;
			textMashMinutes.position.y = -6.5;
			scene.add(textMashMinutes);

			Store.dataCash.minutes = currentMinutes;
			Store.meshes.textMashMinutes = textMashMinutes;
		}

		// optional update Seconds
		if (Store.dataCash.seconds !== currentSeconds || Store.updateAll3DTextRequested) {
			scene.remove(Store.meshes.textMashSeconds);

			const textMashSeconds = create3DText(
				`${currentSeconds}`,
				font,
				{
					...Store.textProps.fontGeometryProps,
					curveSegments: Store.textProps.wireframeEnabled ? 4 : 32
				},
				Store.textProps.textMaterial
			);
			textMashSeconds.position.x = 2.4 + 0.4;
			textMashSeconds.position.y = -6.5;
			scene.add(textMashSeconds);

			Store.dataCash.seconds = currentSeconds;
			Store.meshes.textMashSeconds = textMashSeconds;
		}
		if (Store.updateAll3DTextRequested) {
			Store.updateAll3DTextRequested = false;
		}
	};
});

// Camera animation helpers
const resetCameraAnimation = (x = 0, y = 0, z = 10) => {
	return new Promise((resolve) => {
		gsap.to(camera.position, {
			duration: 2,
			delay: 0,
			x,
			y,
			z,
			ease: Power2.easeInOut,
			onComplete: resolve
		});
	});
};
const cameraAnimation_1_TurnOn = async () => {
	const { x, y, z } = Store.camera.cameraPositionParams_animated_1;
	camera.rotation.set(0, 0, 0);
	controls.reset();
	await resetCameraAnimation(x, y, z);
	cameraAnimate_1();
};
const cameraAnimationTurnOff = () => {
	gsap.killTweensOf(camera.position);
};

const switchCameraPosition = (position) => {
	switch (position) {
		case 'animated_1':
			Store.cameraAnimationEnabled = true;
			camera.lookAt(0, 0, 0);
			cameraAnimation_1_TurnOn();
			break;
		case 'controlled':
			Store.cameraAnimationEnabled = false;
			cameraAnimationTurnOff();
			break;
		case 'stable_1':
			Store.cameraAnimationEnabled = false;
			cameraAnimationTurnOff();
			let { x: x_1, y: y_1, z: z_1 } = Store.camera.cameraPositionParams_stable_1;
			camera.position.set(x_1, y_1, z_1);
			camera.rotation.set(0, 0, 0);
			break;
		case 'stable_2':
			Store.cameraAnimationEnabled = false;
			cameraAnimationTurnOff();
			let { x: x_2, y: y_2, z: z_2 } = Store.camera.cameraPositionParams_stable_2;
			camera.position.set(x_2, y_2, z_2);
			camera.rotation.set(0, 0, 0);
			break;

		default:
			Store.cameraAnimationEnabled = true;
			cameraAnimation_1_TurnOn();
			break;
	}
};

const toggleCameraPosition = () => {
	const oldCameraPosition = Store.camera.currentCameraPositionMode;

	const oldCameraPositionIndex = CAMERA_POSITIONS.indexOf(oldCameraPosition);
	const newCameraPosition =
		oldCameraPositionIndex === CAMERA_POSITIONS.length - 1
			? CAMERA_POSITIONS[0]
			: CAMERA_POSITIONS[oldCameraPositionIndex + 1];

	Store.camera.currentCameraPositionMode = newCameraPosition;

	localStorage.setItem('cameraPositionMode', newCameraPosition);

	switchCameraPosition(newCameraPosition);
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Set a minimum width of 278px
	const minWidth = 278;
	const minHeight = 208;
	if (sizes.width < minWidth) {
		sizes.width = minWidth;
	}
	if (sizes.height < minHeight) {
		sizes.height = minHeight;
	}

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let lastCameraPositionMode = localStorage.getItem('cameraPositionMode');
let lastCameraPosition = localStorage.getItem('cameraPosition');
let lastCameraRotation = localStorage.getItem('cameraRotation');

if (
	lastCameraPositionMode &&
	lastCameraPositionMode !== 'animated_1' &&
	lastCameraPosition &&
	lastCameraRotation
) {
	let { x, y, z } = JSON.parse(lastCameraPosition);
	camera.position.set(x, y, z);
	let { x: _x, y: _y, z: _z } = JSON.parse(lastCameraRotation);
	camera.rotation.set(x, y, z);
} else {
	switchCameraPosition(initCameraPositionMode());
}

scene.add(camera);

// CAMERA ANIMATION functions
const cameraAnimate_4 = () => {
	gsap.to(camera.position, {
		duration: Store.animationCameraDuration,
		delay: 0,
		x: 5,
		y: -6,
		z: 7.5,
		ease: Power2.easeInOut,
		onComplete: cameraAnimate_1
	});
};
const cameraAnimate_3 = () => {
	gsap.to(camera.position, {
		duration: Store.animationCameraDuration,
		delay: 0,
		x: 9,
		y: 6,
		z: 9,
		ease: Power2.easeInOut,
		onComplete: cameraAnimate_4
	});
};
const cameraAnimate_2 = () => {
	gsap.to(camera.position, {
		duration: Store.animationCameraDuration,
		delay: 0,
		x: -9,
		y: 6,
		z: 9,
		ease: Power2.easeInOut,
		onComplete: cameraAnimate_3
	});
};
const cameraAnimate_1 = () => {
	gsap.to(camera.position, {
		duration: Store.animationCameraDuration,
		delay: 0,
		x: -5,
		y: -6,
		z: 7.5,
		ease: Power2.easeInOut,
		onComplete: cameraAnimate_2
	});
};

/*** Renderer */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/*** Animate */
const clock = new THREE.Clock();

const toggleWireframe = () => {
	Store.textProps.wireframeEnabled = !Store.textProps.wireframeEnabled;
	Store.textProps.textMaterial.dispose();
	textInitialize();
};

const toggleLightsHelpers = () => {
	Store.lightsHelpersEnabled = !Store.lightsHelpersEnabled;
	if (Store.lightsHelpersEnabled) {
		initPointLightHelpers();
	} else {
		removePointLightHelpers();
	}
};

const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();

setInterval(() => {
	Store.animation();
}, 1000);

const shouldSkipEventHandling = (target) => {
	return (
		target.parentNode === 'svg' ||
		target.nodeName === 'svg' ||
		target.nodeName === 'path' ||
		target.nodeName === 'circle' ||
		target.classList.contains('link') ||
		target.classList.contains('links') ||
		target.classList.contains('controls__btn') ||
		target.classList.contains('controls')
	);
};

const disturbAnumation = (target) => {
	if (shouldSkipEventHandling(target)) {
		return;
	}

	if (Store.cameraAnimationEnabled) {
		Store.cameraAnimationEnabled = false;
	}

	gsap.killTweensOf(camera.position);

	if (Store.camera.currentCameraPositionMode === 'animated_1') {
		Store.camera.currentCameraPositionMode = 'controlled';
	}
};
// activate changing camera position by user - stop gsap camera animation
window.addEventListener('mousedown', (event) => {
	debounce(disturbAnumation(event.target), 300);
});
window.addEventListener('touchstart', (event) => {
	debounce(disturbAnumation(event.target), 300);
});

// run camera animation with doubleclick
window.addEventListener('dblclick', (event) => {
	if (shouldSkipEventHandling(event.target)) {
		return;
	} else {
		if (!Store.cameraAnimationEnabled) {
			Store.cameraAnimationEnabled = true;
			Store.camera.currentCameraPositionMode = 'animated_1';
			cameraAnimation_1_TurnOn();
		}
	}
});

// RELOAD webpage handler
window.addEventListener('beforeunload', function () {
	let { x, y, z } = camera.position;
	let { _x, _y, _z } = camera.rotation;
	// save camera props and camera mode
	localStorage.setItem('cameraPositionMode', Store.camera.currentCameraPositionMode);
	localStorage.setItem('cameraPosition', JSON.stringify({ x, y, z }));
	localStorage.setItem('cameraRotation', JSON.stringify({ _x, _y, _z }));

	// save controls box opened or closed condition
	localStorage.setItem('controlsOpened', Store.controlsOpened);
	localStorage.setItem('wireframeEnabled', Store.textProps.wireframeEnabled);
	localStorage.setItem('lightsEnabled', Store.lightsEnabled);
	localStorage.setItem('lightsHelpersEnabled', Store.lightsHelpersEnabled);
});

const toggleLinks = () => {
	linksBox.classList.toggle('open');
};

btnLinksToggler.addEventListener('click', debounce(toggleLinks, 300));
btnControlsToggler.addEventListener('click', debounce(Store.toggleControls.bind(Store), 300));
btnThemeToggler.addEventListener('click', debounce(toggleColorScheme, 300));
btnWireframeToggler.addEventListener('click', debounce(toggleWireframe, 300));
btnLightsToggler.addEventListener('click', debounce(Store.toggleLights.bind(Store), 300));
btnLightsHelpersToggler.addEventListener('click', debounce(toggleLightsHelpers, 300));
btnCameraToggler.addEventListener('click', debounce(toggleCameraPosition, 300));
controlsBox.addEventListener(
	'click',
	debounce(() => {
		if (Store.controlsOpened) {
			Store.toggleControls.bind(Store)();
		}
	}, 20000)
);

// reset camera if after reload it was so far or in the world center
if (camera.position.length() > 100 || camera.position.length() < 5) {
	cameraAnimation_1_TurnOn();
}

// INIT Box controls
if (Store.controlsOpened) {
	controlsBox.classList.add('open');
	controlsBox.classList.remove('close');
} else {
	controlsBox.classList.remove('open');
	controlsBox.classList.add('close');
}

// INIT LIGHT
scene.add(light_1_Pivot, light_2_Pivot, light_3_Pivot);
if (Store.lightsEnabled) {
	lightsTurnOn();
} else {
	lightsTurnOff();
}
