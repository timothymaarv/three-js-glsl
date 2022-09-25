import "../style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphereVertex.glsl";
import atmosphereFragment from "./shaders/atmosphereFragment.glsl";
import gsap from "gsap";

const canvas = document.getElementById("webgl");

const width = innerWidth;
const height = innerHeight;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 15;
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.render(scene, camera);

const count = 10000;
const positions = [];

for (let i = 0; i < count; i += 3) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 2000;

  positions.push(x, y, z);
}

const stars = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true,
    color: 0xffffff,
  })
);

stars.geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);

scene.add(stars);

// sphere

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("/globe.jpeg"),
      },
    },
  })
);

// atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
); // effect
atmosphere.scale.set(1.1, 1.1, 1.1);

const group = new THREE.Group();

group.add(stars);
group.add(sphere);
scene.add(group);

scene.add(atmosphere);

const mouse = {
  x: null,
  y: null,
};

let frame;

function render() {
  frame += 0.3;

  controls.update();

  sphere.rotation.y += 0.003;

  gsap.to(group.rotation, {
    y: mouse.x * 0.5,
    x: -mouse.y * 0.3,
    duration: 2,
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

render();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
});
