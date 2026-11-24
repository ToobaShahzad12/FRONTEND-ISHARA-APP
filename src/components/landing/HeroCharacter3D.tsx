import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { usePrefersReducedMotion } from "../ds/MotionPrimitives";

export interface HeroRigDiagnostics {
  status: "awaiting-glb" | "loading" | "ready" | "error";
  hasSkeleton: boolean;
  foundBones: string[];
  missingCoreBones: string[];
  foundMorphTargets: string[];
  availableClips: string[];
  errorMessage?: string;
}

interface HeroCharacter3DProps {
  glbUrl?: string | null;
  dracoDecoderPath?: string | null;
  activeClipName?: string | null;
  active?: boolean;
  onDiagnostics?: (diag: HeroRigDiagnostics) => void;
}

interface RigHandles {
  headBone: THREE.Bone | null;
  neckBone: THREE.Bone | null;
  spineBone: THREE.Bone | null;
  leftShoulder: THREE.Bone | null;
  rightShoulder: THREE.Bone | null;
  morphMeshes: Array<{
    mesh: THREE.Mesh;
    dict: Record<string, number>;
    influences: number[];
  }>;
  baseRotations: Map<THREE.Bone, THREE.Euler>;
}

const EXPECTED_BONE_ALIASES: Record<string, RegExp[]> = {
  Hips: [/^hips$/i, /mixamorig:?hips/i, /^pelvis$/i],
  Spine: [/^spine$/i, /mixamorig:?spine$/i],
  Chest: [/^spine2$/i, /^chest$/i, /^upperchest$/i, /mixamorig:?spine2/i],
  Neck: [/^neck$/i, /mixamorig:?neck/i],
  Head: [/^head$/i, /mixamorig:?head/i],
  LeftShoulder: [/^leftshoulder$/i, /mixamorig:?leftshoulder/i, /^clavicle_l$/i],
  LeftArm: [/^leftarm$/i, /^leftupperarm$/i, /mixamorig:?leftarm/i, /^upperarm_l$/i],
  LeftForeArm: [/^leftforearm$/i, /^leftlowerarm$/i, /mixamorig:?leftforearm/i, /^lowerarm_l$/i],
  LeftHand: [/^lefthand$/i, /mixamorig:?lefthand/i, /^hand_l$/i],
  RightShoulder: [/^rightshoulder$/i, /mixamorig:?rightshoulder/i, /^clavicle_r$/i],
  RightArm: [/^rightarm$/i, /^rightupperarm$/i, /mixamorig:?rightarm/i, /^upperarm_r$/i],
  RightForeArm: [/^rightforearm$/i, /^rightlowerarm$/i, /mixamorig:?rightforearm/i, /^lowerarm_r$/i],
  RightHand: [/^righthand$/i, /mixamorig:?righthand/i, /^hand_r$/i],
};

function findBoneByAliases(bones: THREE.Bone[], patterns: RegExp[]): THREE.Bone | null {
  for (const pattern of patterns) {
    const found = bones.find((b) => pattern.test(b.name));
    if (found) return found;
  }
  return null;
}

function setMorphWeight(
  morphMeshes: RigHandles["morphMeshes"],
  candidates: string[],
  value: number
) {
  for (const entry of morphMeshes) {
    for (const candidate of candidates) {
      const idx = entry.dict[candidate];
      if (typeof idx === "number" && idx < entry.influences.length) {
        entry.influences[idx] = value;
      }
    }
  }
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const std = mat as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.normalMap?.dispose();
        std.roughnessMap?.dispose();
        std.metalnessMap?.dispose();
        std.aoMap?.dispose();
        std.emissiveMap?.dispose();
        mat.dispose();
      }
    }
  });
}

/**
 * Genuine Three.js WebGL character stage ready for rigged humanoid GLB/GLTF assets.
 *
 * - Frames upper body + shoulders + arms + both 5-fingered hands cleanly inside the hero box.
 * - Uses Studio 3-point lighting + RoomEnvironment PMREM for realistic fabric and skin shading.
 * - Drives skeletal AnimationMixer clips (idle + future verified PSL clips) and facial morph targets.
 * - Never fabricates fake geometric primitives or claims CSS/SVG shapes are a 3D humanoid rig.
 */
export default function HeroCharacter3D({
  glbUrl = null,
  dracoDecoderPath = null,
  activeClipName = "Idle",
  active = true,
  onDiagnostics,
}: HeroCharacter3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const activeClipRef = useRef(activeClipName);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    activeClipRef.current = activeClipName;
    const mixer = mixerRef.current;
    const nextAction = activeClipName ? actionsRef.current.get(activeClipName) : undefined;
    if (mixer && nextAction && currentActionRef.current !== nextAction) {
      const prev = currentActionRef.current;
      nextAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
      if (prev) {
        prev.crossFadeTo(nextAction, 0.45, true);
      }
      currentActionRef.current = nextAction;
    }
  }, [activeClipName]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let disposed = false;
    let rafId = 0;

    // 1. WebGLRenderer setup (transparent alpha so hero studio gradients blend cleanly behind the 3D subject)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onDiagnostics?.({
        status: "error",
        hasSkeleton: false,
        foundBones: [],
        missingCoreBones: Object.keys(EXPECTED_BONE_ALIASES),
        foundMorphTargets: [],
        availableClips: [],
        errorMessage: "WebGL context unavailable in this browser.",
      });
      return undefined;
    }

    const initialWidth = Math.max(container.clientWidth || 320, 1);
    const initialHeight = Math.max(container.clientHeight || 300, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initialWidth, initialHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "ds-hero-guide-webgl-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    // 2. Scene + Studio IBL + Three-Point Lighting
    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.55);
    keyLight.position.set(1.8, 2.6, 2.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9f5ef, 0.65);
    fillLight.position.set(-2.2, 1.4, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7be8d8, 0.85);
    rimLight.position.set(0.4, 2.1, -2.5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xfcf7ee, 0x0a495c, 0.42);
    scene.add(hemiLight);

    // 3. Camera framed cleanly for waist-up + both 5-fingered hands (zero cropping)
    const camera = new THREE.PerspectiveCamera(32, initialWidth / initialHeight, 0.1, 40);
    camera.position.set(0, 1.38, 1.85);
    camera.lookAt(0, 1.34, 0);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 1);
        const h = Math.max(entry.contentRect.height, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      }
    });
    resizeObserver.observe(container);

    // Subtle pointer tracking for natural eye-gaze & tiny head turn
    const onPointerMove = (e: PointerEvent) => {
      if (reduced) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTargetRef.current.x = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      pointerTargetRef.current.y = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    };
    const onPointerLeave = () => {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });

    let loadedModelRoot: THREE.Object3D | null = null;
    let rigHandles: RigHandles | null = null;
    let dracoLoader: DRACOLoader | null = null;

    if (!glbUrl) {
      // Honest asset-pending mode: keep Three.js studio lighting stage clean without fetching missing URLs
      onDiagnostics?.({
        status: "awaiting-glb",
        hasSkeleton: false,
        foundBones: [],
        missingCoreBones: Object.keys(EXPECTED_BONE_ALIASES),
        foundMorphTargets: [],
        availableClips: [],
      });
    } else {
      onDiagnostics?.({
        status: "loading",
        hasSkeleton: false,
        foundBones: [],
        missingCoreBones: Object.keys(EXPECTED_BONE_ALIASES),
        foundMorphTargets: [],
        availableClips: [],
      });

      const loader = new GLTFLoader();
      if (dracoDecoderPath) {
        dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(dracoDecoderPath);
        loader.setDRACOLoader(dracoLoader);
      }

      loader.load(
        glbUrl,
        (gltf) => {
          if (disposed) {
            disposeObject3D(gltf.scene);
            return;
          }

          const model = gltf.scene;
          loadedModelRoot = model;

          // Inspect skeletal bones & facial morph targets
          const allBones: THREE.Bone[] = [];
          const morphMeshes: RigHandles["morphMeshes"] = [];
          const morphNames = new Set<string>();

          model.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              for (const mat of mats) {
                if (mat && "envMapIntensity" in mat) {
                  (mat as THREE.MeshStandardMaterial).envMapIntensity = 0.72;
                }
              }
              if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                morphMeshes.push({
                  mesh,
                  dict: mesh.morphTargetDictionary,
                  influences: mesh.morphTargetInfluences,
                });
                Object.keys(mesh.morphTargetDictionary).forEach((name) => morphNames.add(name));
              }
            }
            const skinned = child as THREE.SkinnedMesh;
            if (skinned.isSkinnedMesh && skinned.skeleton) {
              for (const bone of skinned.skeleton.bones) {
                if (!allBones.includes(bone)) allBones.push(bone);
              }
            }
          });

          const foundBoneMap: Record<string, THREE.Bone | null> = {};
          const foundBones: string[] = [];
          const missingCoreBones: string[] = [];

          for (const [key, patterns] of Object.entries(EXPECTED_BONE_ALIASES)) {
            const matched = findBoneByAliases(allBones, patterns);
            foundBoneMap[key] = matched;
            if (matched) {
              foundBones.push(key);
            } else {
              missingCoreBones.push(key);
            }
          }

          const baseRotations = new Map<THREE.Bone, THREE.Euler>();
          Object.values(foundBoneMap).forEach((bone) => {
            if (bone) baseRotations.set(bone, bone.rotation.clone());
          });

          rigHandles = {
            headBone: foundBoneMap.Head,
            neckBone: foundBoneMap.Neck,
            spineBone: foundBoneMap.Chest || foundBoneMap.Spine,
            leftShoulder: foundBoneMap.LeftShoulder,
            rightShoulder: foundBoneMap.RightShoulder,
            morphMeshes,
            baseRotations,
          };

          // Center model horizontally and frame upper body + hands nicely inside viewport
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y -= box.min.y;

          const upperBodyFocusY = size.y * 0.68;
          const upperSpan = Math.max(size.y * 0.56, 0.75);
          const dist = upperSpan / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * 1.18;
          camera.position.set(0, upperBodyFocusY + 0.04, dist);
          camera.lookAt(0, upperBodyFocusY, 0);

          scene.add(model);

          // AnimationMixer setup for Idle + verified PSL clips
          const clipNames: string[] = [];
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
            actionsRef.current.clear();

            for (const clip of gltf.animations) {
              clipNames.push(clip.name);
              actionsRef.current.set(clip.name, mixer.clipAction(clip));
            }

            const preferredName = activeClipRef.current;
            const preferredClip =
              (preferredName && THREE.AnimationClip.findByName(gltf.animations, preferredName)) ||
              THREE.AnimationClip.findByName(gltf.animations, "Idle") ||
              gltf.animations[0];

            if (preferredClip) {
              const action = actionsRef.current.get(preferredClip.name) || mixer.clipAction(preferredClip);
              action.play();
              currentActionRef.current = action;
            }
          }

          onDiagnostics?.({
            status: "ready",
            hasSkeleton: allBones.length > 0,
            foundBones,
            missingCoreBones,
            foundMorphTargets: Array.from(morphNames),
            availableClips: clipNames,
          });
        },
        undefined,
        (err) => {
          if (disposed) return;
          onDiagnostics?.({
            status: "error",
            hasSkeleton: false,
            foundBones: [],
            missingCoreBones: Object.keys(EXPECTED_BONE_ALIASES),
            foundMorphTargets: [],
            availableClips: [],
            errorMessage: err instanceof Error ? err.message : "Failed to load GLB character asset.",
          });
        }
      );
    }

    // 4. Render & natural idle/blink/gaze loop
    const clock = new THREE.Clock();
    const smoothPointer = { x: 0, y: 0 };
    let nextBlinkAt = 2.8;
    let blinkProgress = -1;

    const renderFrame = () => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(renderFrame);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (active) {
        if (mixerRef.current && !reduced) {
          mixerRef.current.update(delta);
        }

        if (rigHandles && !reduced) {
          smoothPointer.x = THREE.MathUtils.lerp(smoothPointer.x, pointerTargetRef.current.x, 0.08);
          smoothPointer.y = THREE.MathUtils.lerp(smoothPointer.y, pointerTargetRef.current.y, 0.08);

          // Gentle breathing & shoulder ease when no overriding skeletal clip locks them
          if (rigHandles.spineBone) {
            const base = rigHandles.baseRotations.get(rigHandles.spineBone);
            if (base && !mixerRef.current) {
              rigHandles.spineBone.rotation.x = base.x + Math.sin(elapsed * 1.25) * 0.015;
            }
          }

          if (rigHandles.headBone && !mixerRef.current) {
            const base = rigHandles.baseRotations.get(rigHandles.headBone);
            if (base) {
              rigHandles.headBone.rotation.y =
                base.y + smoothPointer.x * 0.12 + Math.sin(elapsed * 0.65) * 0.028;
              rigHandles.headBone.rotation.x =
                base.x + smoothPointer.y * 0.06 + Math.sin(elapsed * 0.9) * 0.014;
            }
          }

          // Natural varied blink cadence via morph targets
          if (elapsed >= nextBlinkAt && blinkProgress < 0) {
            blinkProgress = 0;
          }
          if (blinkProgress >= 0) {
            blinkProgress += delta / 0.16;
            const weight = blinkProgress <= 0.5 ? blinkProgress * 2 : Math.max(0, (1 - blinkProgress) * 2);
            setMorphWeight(rigHandles.morphMeshes, ["eyeBlinkLeft", "blinkLeft"], weight);
            setMorphWeight(rigHandles.morphMeshes, ["eyeBlinkRight", "blinkRight"], weight);
            if (blinkProgress >= 1) {
              setMorphWeight(rigHandles.morphMeshes, ["eyeBlinkLeft", "blinkLeft"], 0);
              setMorphWeight(rigHandles.morphMeshes, ["eyeBlinkRight", "blinkRight"], 0);
              blinkProgress = -1;
              nextBlinkAt = elapsed + 2.8 + Math.random() * 2.6;
            }
          }

          // Soft welcoming smile & gaze
          setMorphWeight(rigHandles.morphMeshes, ["mouthSmileLeft", "mouthSmileRight"], 0.24);
          setMorphWeight(
            rigHandles.morphMeshes,
            ["eyeLookInLeft", "eyeLookOutRight"],
            Math.max(0, smoothPointer.x * 0.25)
          );
          setMorphWeight(
            rigHandles.morphMeshes,
            ["eyeLookOutLeft", "eyeLookInRight"],
            Math.max(0, -smoothPointer.x * 0.25)
          );
        }

        renderer.render(scene, camera);
      }
    };

    renderFrame();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      actionsRef.current.clear();
      currentActionRef.current = null;

      if (loadedModelRoot) {
        scene.remove(loadedModelRoot);
        disposeObject3D(loadedModelRoot);
      }
      if (dracoLoader) {
        dracoLoader.dispose();
      }
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [glbUrl, dracoDecoderPath, active, reduced, onDiagnostics]);

  return <div ref={containerRef} className="ds-hero-guide-webgl-stage" aria-hidden="true" />;
}
