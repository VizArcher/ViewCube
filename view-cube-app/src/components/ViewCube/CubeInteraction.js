/*import * as THREE from 'three';
import { cameraState } from '../../core/CameraState';

// Handles mouse interaction with the viewCube

export class CubeInteraction {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Animation state
        this.isAnimating = false;

        // Bind events
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        // Track drag vs click
        this.startMouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.addEventListener('pointerup', this.onMouseUp);
    }

    onMouseDown(event) {
        if (this.isAnimating) return; // Locks input during animation
        this.startMouse.set(event.clientX, event.clientY);
    }

    onMouseUp(event) {
        if (this.isAnimating) return;

        // Distinguish click vs drag
        const dist = this.startMouse.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
        if (dist > 5) return; // It was a drag, ignore

        // Raycast to find the clicked face
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            // We are at the cube
            const hit = intersects[0];
            // Face normal in local space
            this.animateToView(hit.face.normal);
        }
    }
    
    // Calculates the target position based on face normal and animates CameraState
    animateToView(normal) {
        const targetDistance = 10; // Or derived from current radius
        const targetPos = normal.clone().multiplyScalar(targetDistance);

        // Determine appropriate Up vector for the target view
        let targetUp = new THREE.Vector3(0, 1, 0);

        // If top or bottom, Y-axis is ambiguous. So, we use Z or -Z as up
        if (Math.abs(normal.y) > 0.9) {
            targetUp.set(0, 0, -1); 
        }
        
        // Current State
        const startState = cameraState.get();
        const startPos = startState.position.clone();
        const startUp = startState.up.clone();

        // Animation Loop (Simple Lerp)
        const duration = 400;
        const startTime = performance.now();

        this.isAnimating = true;

        const animateFrame = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: Quad Ease Out
            const ease = 1 - Math.pow(1 - progress, 2);

            // Interpolate Position
            // Spherical interpolation (slerp) is better for orbit, but lerp is fine for small moves
            const currentPos = new THREE.Vector3().lerpVectors(startPos, targetPos, ease);

            // Interpolate Up vector
            const currentUp = new THREE.Vector3().lerpVectors(startUp, targetUp, ease);

            // Update Global State
            cameraState.set({
                position: currentPos,
                up: currentUp
            }, 'CUBE');

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animateFrame);
    }

    dispose() {
        this.renderer.domElement.removeEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.removeEventListener('pointerup', this.onMouseUp);
    }
} */

/*
import * as THREE from 'three';
import { cameraState } from '../../core/CameraState';

export class CubeInteraction {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.startMouse = new THREE.Vector2();
        this.isAnimating = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.renderer.domElement.addEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.addEventListener('pointerup', this.onMouseUp);
    }

    onMouseDown(event) {
        if (this.isAnimating) return;
        this.startMouse.set(event.clientX, event.clientY);
    }

    onMouseUp(event) {
        if (this.isAnimating) return;

        // 1. Drag Check
        const dist = this.startMouse.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
        if (dist > 5) return; 

        // 2. Raycast
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // 3. SMART DETECTION: Where on the cube did we click?
            // Convert local point to a grid: -1 (Left), 0 (Center), 1 (Right)
            
            // We use a threshold relative to the cube size (1.5)
            // Range is -0.75 to +0.75. 
            // We define the "Center Zone" as roughly the middle 50%
            const threshold = 0.75 * 0.4; // 30% from center
            
            const vector = new THREE.Vector3(0, 0, 0);
            const localPoint = hit.point; // Since cube is at 0,0,0 world, point is local

            if (localPoint.x > threshold) vector.x = 1;
            else if (localPoint.x < -threshold) vector.x = -1;
            
            if (localPoint.y > threshold) vector.y = 1;
            else if (localPoint.y < -threshold) vector.y = -1;

            if (localPoint.z > threshold) vector.z = 1;
            else if (localPoint.z < -threshold) vector.z = -1;

            // Remove the case where we click exact center (0,0,0) - impossible on surface
            if (vector.lengthSq() === 0) return;

            console.log("🎯 CAD View Detected:", vector);
            this.animateToView(vector);
        }
    }

    animateToView(directionVector) {
        // Normalize to get a clean direction (unit vector)
        const normal = directionVector.clone().normalize();
        
        const targetDistance = 10;
        const targetPos = normal.clone().multiplyScalar(targetDistance);
        
        // --- UP VECTOR LOGIC ---
        // For corners (1,1,1) and edges, we need a stable "Up".
        // Simple rule: Y is Up (0,1,0) unless we are looking straight down/up.
        
        let targetUp = new THREE.Vector3(0, 1, 0);

        // If looking mostly vertical (Top/Bottom views), lock Z as up to prevent spinning
        if (Math.abs(normal.y) > 0.9) {
            targetUp.set(0, 0, -1);
        }

        const startState = cameraState.get();
        const startPos = startState.position.clone();
        const startUp = startState.up.clone();
        
        const duration = 400;
        const startTime = performance.now();
        this.isAnimating = true;

        const animateFrame = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 2); 

            // Interpolate
            const currentPos = new THREE.Vector3().lerpVectors(startPos, targetPos, ease);
            const currentUp = new THREE.Vector3().lerpVectors(startUp, targetUp, ease);

            cameraState.set({ position: currentPos, up: currentUp }, 'CUBE');

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isAnimating = false;
            }
        };
        requestAnimationFrame(animateFrame);
    }

    dispose() {
        this.renderer.domElement.removeEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.removeEventListener('pointerup', this.onMouseUp);
    }
}
*/

import * as THREE from 'three';
import { cameraState } from '../../core/CameraState';

export class CubeInteraction {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.startMouse = new THREE.Vector2();
        this.isAnimating = false;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.renderer.domElement.addEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.addEventListener('pointerup', this.onMouseUp);
    }

    onMouseDown(event) {
        if (this.isAnimating) return;
        this.startMouse.set(event.clientX, event.clientY);
    }

    onMouseUp(event) {
        if (this.isAnimating) return;

        // 1. Drag Check
        const dist = this.startMouse.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
        if (dist > 5) return; 

        // 2. Raycast
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // 3. SMART DETECTION (CAD Style)
            // Map the click point to a 3x3x3 grid (-1, 0, 1)
            const threshold = 0.75 * 0.4; // 30% from center
            const vector = new THREE.Vector3(0, 0, 0);
            const localPoint = hit.point;

            if (localPoint.x > threshold) vector.x = 1;
            else if (localPoint.x < -threshold) vector.x = -1;
            
            if (localPoint.y > threshold) vector.y = 1;
            else if (localPoint.y < -threshold) vector.y = -1;

            if (localPoint.z > threshold) vector.z = 1;
            else if (localPoint.z < -threshold) vector.z = -1;

            if (vector.lengthSq() === 0) return; // Clicked internal/center

            this.animateToView(vector);
        }
    }

    animateToView(directionVector) {
        const normal = directionVector.clone().normalize();
        const targetDistance = 10;
        const targetPos = normal.clone().multiplyScalar(targetDistance);
        
        // --- UP VECTOR LOGIC ---
        let targetUp = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.y) > 0.9) {
            targetUp.set(0, 0, -1);
        }

        const startState = cameraState.get();
        const startPos = startState.position.clone();
        const startUp = startState.up.clone();
        
        const duration = 400;
        const startTime = performance.now();
        this.isAnimating = true;

        const animateFrame = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: Quad Ease Out
            const ease = 1 - Math.pow(1 - progress, 2); 

            // Interpolate
            const currentPos = new THREE.Vector3().lerpVectors(startPos, targetPos, ease);
            const currentUp = new THREE.Vector3().lerpVectors(startUp, targetUp, ease);

            // --- CRITICAL FIX ---
            // We notify 'CUBE' (ourselves) so we don't ignore the update.
            // But we use a special ID 'ANIMATION' so both ViewCube.jsx and ThreeScene.jsx
            // know this is an active animation frame they MUST respect.
            cameraState.set({ 
                position: currentPos, 
                up: currentUp 
            }, 'ANIMATION'); 

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isAnimating = false;
                // Final snap to ensure precision
                cameraState.set({ 
                    position: targetPos, 
                    up: targetUp 
                }, 'ANIMATION');
            }
        };
        requestAnimationFrame(animateFrame);
    }

    dispose() {
        this.renderer.domElement.removeEventListener('pointerdown', this.onMouseDown);
        this.renderer.domElement.removeEventListener('pointerup', this.onMouseUp);
    }
}