"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Temu Bhodbhar in 3D: a chibi viking in a tiny navy suit, shiny black shoes
 * and a gold watch, built from Three.js primitives (no model files).
 * Props drive the animation: walking (leg/arm swing + bounce), facing (-1 left,
 * 0 front, 1 right) and talking (little nods).
 */
export type Bhodbhar3DProps = {
  width: number;
  height: number;
  walking: boolean;
  facing: number;
  talking: boolean;
  /** Dead hang: arms up gripping an edge, body limp and swaying. */
  hang?: boolean;
  /** Mid-jump: arms thrown up, legs tucked. */
  air?: boolean;
  /** Head turn while hanging: -1 looks screen-left, 1 screen-right. */
  gaze?: number;
  /** Head pitch: -1 looks up, 1 looks down. */
  look?: number;
  onFail?: () => void;
};

const std = (color: string, rough = 0.6, metal = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

function buildHorn(mat: THREE.Material) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.3, 0.02, 0),
    new THREE.Vector3(0.58, 0.28, 0),
    new THREE.Vector3(0.66, 0.72, 0),
  ]);
  g.add(mesh(new THREE.TubeGeometry(curve, 24, 0.085, 12, false), mat));
  const tan = curve.getTangent(1).normalize();
  const tip = mesh(new THREE.ConeGeometry(0.085, 0.3, 14), mat);
  tip.position.copy(curve.getPoint(1)).addScaledVector(tan, 0.13);
  tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
  g.add(tip);
  return g;
}

function buildModel() {
  const skin = std("#f2ad8e", 0.7);
  const blond = std("#e2e88c", 0.75);
  const blondLight = std("#f0f4ac", 0.75);
  const navy = std("#1f2a44", 0.65);
  const navyLight = std("#2c3b5e", 0.65);
  const white = std("#ffffff", 0.6);
  const teal = std("#27d9b8", 0.4, 0, { emissive: new THREE.Color("#0b8a74"), emissiveIntensity: 0.5 });
  const gold = std("#f4c542", 0.18, 1);
  const hornMat = std("#5c5648", 0.55);
  const shoeMat = std("#0a0a0c", 0.1, 0.55);
  const ink = std("#1a1608", 0.7);

  const root = new THREE.Group();

  // --- ground shadow
  const shadow = mesh(
    new THREE.CircleGeometry(0.7, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }),
    0,
    0.01,
    0.05
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.55, 1);
  root.add(shadow);

  // --- legs (pivot at hips) with shiny shoes
  const makeLeg = (x: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0.74, 0);
    g.add(mesh(new THREE.CapsuleGeometry(0.15, 0.3, 6, 14), navy, 0, -0.27, 0));
    const shoe = mesh(new THREE.SphereGeometry(0.2, 24, 16), shoeMat, 0, -0.63, 0.1);
    shoe.scale.set(0.95, 0.55, 1.55);
    g.add(shoe);
    return g;
  };
  const legL = makeLeg(-0.2);
  const legR = makeLeg(0.2);
  root.add(legL, legR);

  // --- torso: suit jacket, shirt, tie
  const torso = new THREE.Group();
  torso.position.set(0, 1.05, 0);
  const jacket = mesh(new THREE.CapsuleGeometry(0.4, 0.4, 8, 18), navy);
  jacket.scale.set(1, 1, 0.78);
  torso.add(jacket);
  const shirt = mesh(new THREE.BoxGeometry(0.2, 0.55, 0.02), white, 0, 0.1, 0.315);
  torso.add(shirt);
  const tie = mesh(new THREE.BoxGeometry(0.085, 0.42, 0.02), teal, 0, 0.02, 0.33);
  const knot = mesh(new THREE.BoxGeometry(0.11, 0.09, 0.025), teal, 0, 0.27, 0.33);
  torso.add(tie, knot);
  const lapelL = mesh(new THREE.BoxGeometry(0.11, 0.5, 0.025), navyLight, -0.17, 0.1, 0.32);
  lapelL.rotation.z = 0.28;
  const lapelR = mesh(new THREE.BoxGeometry(0.11, 0.5, 0.025), navyLight, 0.17, 0.1, 0.32);
  lapelR.rotation.z = -0.28;
  torso.add(lapelL, lapelR);
  torso.add(mesh(new THREE.BoxGeometry(0.14, 0.09, 0.02), white, 0.22, 0.14, 0.325));
  torso.add(mesh(new THREE.SphereGeometry(0.035, 12, 10), gold, 0, -0.18, 0.33));
  root.add(torso);

  // --- arms (pivot at shoulders). Watch on the character's right wrist (viewer's left).
  const makeArm = (side: 1 | -1) => {
    const g = new THREE.Group();
    g.position.set(side * 0.54, 1.3, 0);
    g.add(mesh(new THREE.CapsuleGeometry(0.125, 0.4, 6, 14), navy, 0, -0.3, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.06, 16), white, 0, -0.56, 0));
    g.add(mesh(new THREE.SphereGeometry(0.135, 16, 14), skin, 0, -0.68, 0));
    if (side === -1) {
      const band = mesh(new THREE.TorusGeometry(0.128, 0.03, 10, 24), gold, 0, -0.5, 0);
      band.rotation.x = Math.PI / 2;
      const bezel = mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 20), gold, -0.135, -0.5, 0);
      bezel.rotation.z = Math.PI / 2;
      const face = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.056, 20), std("#fffbe6", 0.3), -0.138, -0.5, 0);
      face.rotation.z = Math.PI / 2;
      g.add(band, bezel, face);
    }
    return g;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);
  root.add(armL, armR);

  // --- head
  const head = new THREE.Group();
  head.position.set(0, 1.95, 0);
  const skull = mesh(new THREE.SphereGeometry(0.6, 36, 28), skin);
  skull.scale.set(1, 0.95, 0.96);
  head.add(skull);

  // hair cap + fringe
  const hair = mesh(new THREE.SphereGeometry(0.645, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), blond, 0, 0.03, -0.02);
  hair.rotation.x = -0.18;
  head.add(hair);
  const fringe = mesh(new THREE.SphereGeometry(0.3, 20, 14), blondLight, -0.14, 0.5, 0.36);
  fringe.scale.set(1.5, 0.5, 0.9);
  fringe.rotation.z = 0.28;
  head.add(fringe);

  // ears
  head.add(mesh(new THREE.SphereGeometry(0.12, 14, 12), skin, -0.6, -0.04, 0));
  head.add(mesh(new THREE.SphereGeometry(0.12, 14, 12), skin, 0.6, -0.04, 0));

  // headband + gem
  const band = mesh(new THREE.TorusGeometry(0.55, 0.075, 14, 48), gold, 0, 0.3, 0);
  band.rotation.x = Math.PI / 2;
  head.add(band);
  const gem = mesh(new THREE.OctahedronGeometry(0.11), teal, 0, 0.31, 0.57);
  gem.scale.set(0.85, 1.25, 0.6);
  head.add(gem);

  // eyes (blink group), angry brows
  const eyes = new THREE.Group();
  for (const x of [-0.22, 0.22]) {
    const w = mesh(new THREE.SphereGeometry(0.135, 20, 16), white, x, 0.0, 0.5);
    w.scale.set(1, 1.1, 0.55);
    const p = mesh(new THREE.SphereGeometry(0.068, 16, 12), ink, x + (x < 0 ? 0.012 : -0.012), 0.0, 0.575);
    const s = mesh(new THREE.SphereGeometry(0.022, 8, 8), white, x + 0.03, 0.035, 0.635);
    eyes.add(w, p, s);
  }
  head.add(eyes);
  const browL = mesh(new THREE.BoxGeometry(0.28, 0.065, 0.06), std("#7a6a22", 0.8), -0.22, 0.15, 0.53);
  browL.rotation.z = -0.36;
  const browR = mesh(new THREE.BoxGeometry(0.28, 0.065, 0.06), std("#7a6a22", 0.8), 0.22, 0.15, 0.53);
  browR.rotation.z = 0.36;
  head.add(browL, browR);

  // nose, moustache, beard, braids
  head.add(mesh(new THREE.SphereGeometry(0.095, 16, 12), std("#e98c78", 0.6), 0, -0.14, 0.58));
  for (const s of [-1, 1]) {
    const m = mesh(new THREE.SphereGeometry(0.2, 20, 14), blond, s * 0.2, -0.27, 0.5);
    m.scale.set(1.5, 0.55, 0.8);
    m.rotation.z = s * -0.3;
    const curl = mesh(new THREE.SphereGeometry(0.09, 12, 10), blond, s * 0.44, -0.2, 0.43);
    head.add(m, curl);
    const braid = mesh(new THREE.SphereGeometry(0.12, 14, 12), blond, s * 0.56, -0.5, 0.05);
    braid.scale.set(1, 1.5, 1);
    const tieBand = mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16), teal, s * 0.56, -0.4, 0.05);
    tieBand.rotation.x = Math.PI / 2;
    head.add(braid, tieBand);
  }
  const beard = mesh(new THREE.SphereGeometry(0.36, 24, 18), blond, 0, -0.5, 0.26);
  beard.scale.set(1, 0.9, 0.8);
  head.add(beard);
  head.add(mesh(new THREE.SphereGeometry(0.06, 12, 8), std("#e98c78", 0.6), 0, -0.4, 0.58));

  // horns
  const hornL = buildHorn(hornMat);
  hornL.position.set(-0.5, 0.42, 0);
  hornL.scale.x = -1;
  hornL.rotation.z = 0.15;
  const hornR = buildHorn(hornMat);
  hornR.position.set(0.5, 0.42, 0);
  hornR.rotation.z = -0.15;
  head.add(hornL, hornR);

  root.add(head);
  return { root, head, torso, legL, legR, armL, armR, eyes };
}

export default function Bhodbhar3D({ width, height, walking, facing, talking, hang = false, air = false, gaze = 0, look = 0, onFail }: Bhodbhar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ walking, facing, talking, hang, air, gaze, look });
  propsRef.current = { walking, facing, talking, hang, air, gaze, look };
  const apiRef = useRef<{ resize: (w: number, h: number) => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      onFail?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 50);
    camera.position.set(0, 1.55, 9.4);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38d6e0, 1.6);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    const m = buildModel();
    scene.add(m.root);

    apiRef.current = {
      resize: (w, h) => {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let t = 0;
    let phase = 0;
    let amp = 0;
    let rotY = 0;
    let hangK = 0;
    let airK = 0;
    let headYaw = 0;
    let headPitch = 0;
    let nextBlink = 2.5;
    let blinkT = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = propsRef.current;
      // idle ticks at ~30fps to stay light; walking/talking run at full rate
      acc += dt;
      if (!p.walking && !p.talking && !p.hang && !p.air && acc < 1 / 30) return;
      const step = acc;
      acc = 0;
      t += step;

      amp += ((p.walking ? 1 : 0) - amp) * Math.min(1, step * 9);
      hangK += ((p.hang ? 1 : 0) - hangK) * Math.min(1, step * 10);
      airK += ((p.air ? 1 : 0) - airK) * Math.min(1, step * 12);
      const up = Math.max(hangK, airK); // arms overhead
      phase += step * 10 * (0.3 + amp);
      const swing = Math.sin(phase) * amp * (1 - up);
      // legs: walk swing, a slow dangle while hanging, tucked in mid-jump
      const dangle = Math.sin(t * 1.7) * 0.14 * hangK;
      m.legL.rotation.x = swing * 0.75 + dangle - 0.55 * airK;
      m.legR.rotation.x = -swing * 0.75 - dangle * 0.8 - 0.55 * airK;
      // arms: walk swing, or thrown up and out (the grip)
      m.armL.rotation.x = -swing * 0.65;
      m.armR.rotation.x = swing * 0.65;
      m.armL.rotation.z = -2.75 * up;
      m.armR.rotation.z = 2.75 * up;
      m.root.position.y = Math.abs(Math.sin(phase)) * 0.1 * amp;
      m.root.rotation.z = Math.sin(t * 1.3) * 0.05 * hangK;

      // turn toward travel direction; slight turn toward viewer's reading side when talking
      const targetRot = p.walking ? p.facing * 0.95 : p.talking ? 0.12 : 0;
      rotY += (targetRot - rotY) * Math.min(1, step * 8);
      m.root.rotation.y = rotY;

      // idle life: breathing, head bob, nods while talking, a slow look-around when standing
      const standing = !p.walking && !p.talking && hangK < 0.05 && airK < 0.05;
      const wander = standing ? Math.sin(t * 0.55) * Math.sin(t * 0.21) * 0.45 : 0;
      const nod = p.talking && !p.walking ? Math.sin(t * 9) * 0.05 : 0;
      headYaw += (p.gaze * 0.8 * hangK + wander - headYaw) * Math.min(1, step * 6);
      headPitch += (p.look * 0.4 + nod - headPitch) * Math.min(1, step * 6);
      m.torso.scale.y = 1 + Math.sin(t * 2) * 0.014;
      m.head.position.y = 1.95 + Math.sin(t * 2.2) * 0.018 + (p.talking && !p.walking ? Math.sin(t * 9) * 0.02 : 0);
      m.head.rotation.x = headPitch;
      m.head.rotation.y = headYaw;

      // blink
      if (blinkT < 0 && t > nextBlink) blinkT = 0;
      if (blinkT >= 0) {
        blinkT += step;
        const k = blinkT < 0.07 ? blinkT / 0.07 : blinkT < 0.14 ? 1 - (blinkT - 0.07) / 0.07 : 0;
        m.eyes.scale.y = 1 - 0.9 * k;
        if (blinkT >= 0.14) {
          blinkT = -1;
          m.eyes.scale.y = 1;
          nextBlink = t + 2.5 + Math.random() * 3;
        }
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      apiRef.current = null;
      scene.traverse((o) => {
        const mm = o as THREE.Mesh;
        if (mm.geometry) mm.geometry.dispose();
        const mat = mm.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current?.resize(width, height);
  }, [width, height]);

  return <canvas ref={canvasRef} className="b3d-canvas" style={{ width, height, display: "block" }} aria-hidden />;
}
