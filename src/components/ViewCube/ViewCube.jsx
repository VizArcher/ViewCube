import React, {useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cameraState } from '../../core/CameraState';
import { CubeInteraction } from './CubeInteraction';

const ViewCube = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Cube 2D size
        const width = 150;
        const height = 150;

        // Creating scene
        const scene = new THREE.Scene();

        // Using Orthographic camera because view cube is a tool and doesn't need to be distorted
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);

        // Renderer
        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.appendChild(renderer.domElement);
        }

        // Basic Cube
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Ensure cube is aligned with the world axes
        cube.rotation.set(0, 0, 0);

        // Sync Logic
        // We update a local target vector to keep the animation loop clean
        const syncState = {
            position: new THREE.Vector3(0, 0, 10),
            up: new THREE.Vector3(0, 1, 0)
        };

        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // if (sourceId === 'CUBE') return; 

            // Calculate relative offset from target (V_rel = P_main - T_main)
            const offset = new THREE.Vector3().copy(state.position).sub(state.target);

            // Normalize and scale to ViewCube distance (fixed at 10 units)
            offset.normalize().multiplyScalar(10);

            syncState.position.copy(offset);
            syncState.up.copy(state.up);
        });

        // Animate - FIXED: variable naming consistency
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // This makes the cube appear to rotate "inversely" to the scene
            camera.position.copy(syncState.position);
            camera.up.copy(syncState.up);
            camera.lookAt(0, 0, 0); // Always look at the center of the view cube scene

            // FIXED: was "renderer.renderer", now "renderer.render"
            renderer.render(scene, camera);
        };

        animate();

        // Interaction
        const interaction = new CubeInteraction(camera, scene, renderer);

        // Cleanup
        return () => {
            interaction.dispose();
            unsubscribe(); // Stop listening to state
            cancelAnimationFrame(animationId);
            if(currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    // Container CSS
    const style = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '150px',
        height: '150px',
        zIndex: 1000, // To ensure this sits on top of main viewer
        pointerEvents: 'auto'
    };

    return <div ref={mountRef} style={style} />;
};

export default ViewCube;