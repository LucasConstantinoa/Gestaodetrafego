'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

// Helper to create a glowing circle texture for soft blurred particles
const createParticleTexture = () => {
	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext('2d');
	if (context) {
		const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
		gradient.addColorStop(0, 'rgba(255,255,255,1)');
		gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
		gradient.addColorStop(0.8, 'rgba(255,255,255,0.1)');
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = gradient;
		context.fillRect(0, 0, 32, 32);
	}
	return new THREE.CanvasTexture(canvas);
};

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mouseRef = useRef({ x: 0, y: 0 });
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points;
		animationId: number;
		velocities: number[];
		windOffsets: number[];
	} | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const PARTICLE_COUNT = 1200; 
		const BOUND_X = 4000;
		const BOUND_Y = 3000;
		const BOUND_Z = 2000;

		// Scene setup
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 0, 800);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0);
		
		// Add a cinematic global blur to simulate depth of field (some sparks sharp, some blurry)
		renderer.domElement.style.filter = 'blur(1px)';

		containerRef.current.appendChild(renderer.domElement);

		// Create spark particles
		const positions: number[] = [];
		const colors: number[] = [];
		const sizes: number[] = [];
		const velocities: number[] = [];
		const windOffsets: number[] = [];

		const geometry = new THREE.BufferGeometry();
		const particleTexture = createParticleTexture();

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const x = (Math.random() - 0.5) * BOUND_X;
			const y = (Math.random() - 0.5) * BOUND_Y * 2; 
			const z = (Math.random() - 0.5) * BOUND_Z;

			positions.push(x, y, z);
			
			// Fire ember green colors (varied from deep emerald to bright neon)
			const intensity = 0.4 + Math.random() * 0.6;
			const r = 0.05 + (Math.random() * 0.05); // slight yellow/red mix for fire
			const g = 0.8 * intensity + 0.1; // strong green
			const b = 0.4 * intensity; // low blue
			
			colors.push(r, g, b);
			
			// Sizes vary dramatically to create "blur" illusion for big ones close to camera
			const isLarge = Math.random() > 0.85;
			sizes.push(isLarge ? 12 + Math.random() * 20 : 3 + Math.random() * 8);
			
			// Velocity (Fire thermal drift - organic speeds)
			velocities.push(1.0 + Math.random() * 3.5);
			
			// Wind offset for individual organic swaying
			windOffsets.push(Math.random() * Math.PI * 2);
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

		const material = new THREE.PointsMaterial({
			size: 15,
			vertexColors: true,
			transparent: true,
			opacity: 0.6,
			sizeAttenuation: true,
			blending: THREE.AdditiveBlending, // Fire glow mode
			depthWrite: false, 
			map: particleTexture // Soft circular shape instead of sharp squares
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let animationId: number;
		let time = 0;

		const handleMouseMove = (e: MouseEvent) => {
			mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
			mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', handleMouseMove);

		// Initialize sceneRef immediately so we can store animationId directly to it
		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: points,
			animationId: 0,
			velocities,
			windOffsets
		};

		const animate = () => {
			if (!sceneRef.current) return;
			sceneRef.current.animationId = requestAnimationFrame(animate);
			time += 0.005;

			const posAttribute = geometry.attributes.position;
			const colAttribute = geometry.attributes.color;
			const posArray = posAttribute.array as Float32Array;
			const colArray = colAttribute.array as Float32Array;

			const mx = mouseRef.current.x;
			const my = mouseRef.current.y;

			// Update particles like fire embers
			for (let i = 0; i < PARTICLE_COUNT; i++) {
				const i3 = i * 3;

				// Thermal up-draft
				posArray[i3 + 1] += velocities[i];

				// Organic wind sway (using sine waves and their unique offset)
				const windX = Math.sin(time + windOffsets[i]) * 1.5;
				const windZ = Math.cos(time * 0.8 + windOffsets[i]) * 1.0;
				
				posArray[i3] += windX;
				posArray[i3 + 2] += windZ;

				// If spark goes too high, reset to bottom like a new ember
				if (posArray[i3 + 1] > BOUND_Y) {
					posArray[i3 + 1] = -BOUND_Y;
					posArray[i3] = (Math.random() - 0.5) * BOUND_X;
					posArray[i3 + 2] = (Math.random() - 0.5) * BOUND_Z;
				}

				// Ember flicker (gentle glowing pulse)
				const flicker = 0.5 + Math.abs(Math.sin(time * 3 + windOffsets[i])) * 0.5;
				const baseIntensity = 0.5 + (i % 5) * 0.15; 
				colArray[i3] = 0.05 * flicker * baseIntensity;
				colArray[i3 + 1] = 0.8 * flicker * baseIntensity;
				colArray[i3 + 2] = 0.3 * flicker * baseIntensity;
			}

			posAttribute.needsUpdate = true;
			colAttribute.needsUpdate = true;

			// Camera sways slightly like moving around a campfire
			camera.position.x += (mx * 150 - camera.position.x) * 0.02;
			camera.position.y += (my * 100 - camera.position.y) * 0.02;
			camera.lookAt(0, 0, 0);

			renderer.render(scene, camera);
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		animate();

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);

			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);

				sceneRef.current.scene.traverse((object) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((mat) => mat.dispose());
						} else {
							object.material.dispose();
						}
					}
				});

				particleTexture.dispose();
				sceneRef.current.renderer.dispose();

				if (containerRef.current && sceneRef.current.renderer.domElement) {
					containerRef.current.removeChild(sceneRef.current.renderer.domElement);
				}
			}
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed top-0 left-0 w-screen h-screen overflow-hidden z-[-1] bg-[#050505]', className)}
			{...props}
		/>
	);
}
