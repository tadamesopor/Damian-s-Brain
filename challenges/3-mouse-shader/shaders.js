import {
    simulationvertexshader,
    simulationfragmentshader,
    rendervertexshader,
    renderfragmentshader
} from "./shaders.js";

document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const simscene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer({
        antialias: true
        alpha: true
        preserveDrawingBuffer: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mouse = new THREE.Vector2();
let frame = 0;

const width = window.innerwidth * window.devicePixelRatio;
const height = window.innerHeight * window.devicePixelRatio;
const options = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.linearFilter,
    magfilter: THREE.linearFilter,
    stencilbuffer: false,
    depthbuffer: false
};
let rtA = new THREE.WebGLRenderTarget(width, height, options);
let rtB = new THREE.WebGLRenderTarget(width, height, options);

const simmaterial = new THREE.ShaderMaterial({
    uniforms: {
        textureA: { value: null },
        mouse: {value: mouse},
        resolution: { value: new THREE.Vector2(width, height) }
        time: { value: 0 },
        frame: { value: 0 }
    },
    vertexShader: simulationvertexshader,
    fragmentshader: simulationfragmentshader,
});

