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
            const threshold = 0.3; // 30% from center
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
        console.log(normal);
        const targetDistance = 10;
        const targetPos = normal.clone().multiplyScalar(targetDistance);
        
        // --- UP VECTOR LOGIC ---
        /*let targetUp = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.y) > 0.7) {
            targetUp.set(0, 0, -1);
        }*/

        // Up Vector logic
        let targetUp = new THREE.Vector3(0, 1, 0);
        
        // For top/bottom faces (pure Y-axis views)
        if (Math.abs(normal.y) > 0.7) {
            targetUp.set(0, 0, -1);
        } 
        
        console.log(targetUp);

        const startState = cameraState.get();
        console.log(startState);
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

            // We notify 'CUBE' (ourselves) so we don't ignore the update.
            // But we use a special ID 'ANIMATION' so both ViewCube.jsx and ThreeScene.jsx
            // know this is an active animation frame they MUST respect.
            
            console.log({ 
                position: currentPos, 
                up: currentUp 
            });

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