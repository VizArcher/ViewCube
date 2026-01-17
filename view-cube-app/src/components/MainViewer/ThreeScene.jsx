/*import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cameraState } from '../../core/CameraState';

const ThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222); // Dark grey background

        // Perspective Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

        // Initialize with state defaults
        const initialState = cameraState.get();
        camera.position.copy(initialState.position);
        camera.up.copy(initialState.up);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.appendChild(renderer.domElement);
        }

        // Placeholder object - TorusKnot to make rotation obvious
        const geometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16);
        const material = new THREE.MeshStandardMaterial({color: 0x66ccff, roughness: 0.1});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; 
        controls.target.copy(initialState.target);

        // Flag to prevent feedback loops
        let isUpdatingFromState = false;

        // Listen: Handle updates coming from the view cube 
        const unsubscribeState = cameraState.subscribe((state, sourceId) => { 
            console.log(`ThreeScene received update from: ${sourceId}`); // Debugging
            
            if(sourceId === 'VIEWER') return; // Ignore our own updates
            
            console.log(`Applying new camera position: ${state.position}`); // Debugging

            isUpdatingFromState = true;

            // Apply state to camera
            camera.position.copy(state.position);
            camera.up.copy(state.up);
            controls.target.copy(state.target);

            // 3. FORCE Controls to accept the new camera position
            // (Sometimes damping makes it ignore sudden jumps unless we reset)
            controls.object.position.copy(state.position); 
            controls.object.up.copy(state.up);

            controls.update(); // Sync controls internal state

            isUpdatingFromState = false;
        });

        // Publish: Send updates to the State when user orbits
        controls.addEventListener('change', () => {
            if (isUpdatingFromState) return;

            cameraState.set({
                position: camera.position.clone(),
                target: controls.target.clone(),
                up: camera.up.clone()
            }, 'VIEWER'); 
        });

        // Added resize handler function
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            
            controls.update(); // Update controls with damping
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            unsubscribeState();
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            controls.dispose();
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', display: 'block'}} />;
};

export default ThreeScene; */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// CHANGE 1: Import ArcballControls instead of OrbitControls
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { cameraState } from '../../core/CameraState';

const ThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

        // Initialize with state defaults
        const initialState = cameraState.get();
        camera.position.copy(initialState.position);
        camera.up.copy(initialState.up);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.appendChild(renderer.domElement);
        }

        // Object
        const geometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16);
        const material = new THREE.MeshStandardMaterial({color: 0x66ccff, roughness: 0.1});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // --- CHANGE 2: SETUP ARCBALL CONTROLS ---
        // Arcball allows free tumbling (no "Up" vector restriction)
        // Note: We pass 'scene' as the 3rd argument (required for Arcball)
        const controls = new ArcballControls(camera, renderer.domElement, scene);
        
        // Hide the Arcball "Gizmo" circles (visual clutter) if you want a clean view
        controls.setGizmosVisible(false); 
        
        controls.enableDamping = true; 
        controls.target.copy(initialState.target);

        // Sync Logic
        let isUpdatingFromState = false;

        const unsubscribeState = cameraState.subscribe((state, sourceId) => { 
            if(sourceId === 'VIEWER') return;

            isUpdatingFromState = true;

            camera.position.copy(state.position);
            camera.up.copy(state.up);
            controls.target.copy(state.target);

            controls.update(); 
            isUpdatingFromState = false;
        });

        controls.addEventListener('change', () => {
            if (isUpdatingFromState) return;

            cameraState.set({
                position: camera.position.clone(),
                target: controls.target.clone(),
                up: camera.up.clone() // Arcball changes 'up' frequently, so this is critical
            }, 'VIEWER'); 
        });

        // Resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            unsubscribeState();
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (currentMount) currentMount.removeChild(renderer.domElement);
            controls.dispose();
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', display: 'block'}} />;
};

export default ThreeScene;