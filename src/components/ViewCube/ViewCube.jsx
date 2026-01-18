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

        const scene = new THREE.Scene();

        // Using Orthographic camera because view cube is a tool and doesn't need to be distorted
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);

        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        const currentMount = mountRef.current;
        if (currentMount) {
            currentMount.appendChild(renderer.domElement);
        }

        // Create text textures for faces
        const createTextTexture = (text) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(0, 0, 128, 128);
            
            // Border
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, 126, 126);
            
            // Text
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        };

        // Materials for each face
        const materials = [
            new THREE.MeshBasicMaterial({ map: createTextTexture('R') }), // Right
            new THREE.MeshBasicMaterial({ map: createTextTexture('L') }), // Left
            new THREE.MeshBasicMaterial({ map: createTextTexture('T') }), // Top
            new THREE.MeshBasicMaterial({ map: createTextTexture('B') }), // Bottom
            new THREE.MeshBasicMaterial({ map: createTextTexture('F') }), // Front
            new THREE.MeshBasicMaterial({ map: createTextTexture('K') })  // Back
        ];

        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        cube.rotation.set(0, 0, 0);

        // Sync Logic
        const syncState = {
            position: new THREE.Vector3(0, 0, 10),
            up: new THREE.Vector3(0, 1, 0)
        };

        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // if (sourceId === 'CUBE') return; 

            const offset = new THREE.Vector3().copy(state.position).sub(state.target);

            // Normalize and scale to ViewCube distance (fixed at 10 units)
            offset.normalize().multiplyScalar(10);

            syncState.position.copy(offset);
            syncState.up.copy(state.up);
        });

        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            camera.position.copy(syncState.position);
            camera.up.copy(syncState.up);
            camera.lookAt(0, 0, 0); 

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
            materials.forEach(mat => {
                if (mat.map) mat.map.dispose();
                mat.dispose();
            });
            renderer.dispose();
        };
    }, []);

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