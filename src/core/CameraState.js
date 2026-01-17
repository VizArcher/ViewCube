import * as THREE from 'three';

class CameraState {
    constructor() {
        this.state = {
            position: new THREE.Vector3(0, 0, 10), // Default start pos
            target: new THREE.Vector3(0, 0, 0), // Focal point
            up: new THREE.Vector3(0, 1, 0) // Up vector
        };

        this.listeners = [];
    }

    // Current camera state
    get() {
        return { ...this.state };
    }

    // Updating the new state
    set(newState, sourceID) {
        // Update internal state
        if (newState.position) this.state.position.copy(newState.position);
        if (newState.target) this.state.target.copy(newState.target);
        if (newState.up) this.state.up.copy(newState.up);

        // Notify listeners
        this.notify(sourceID);
    }

    // A callback to run when state changes
    subscribe(callback) {
        this.listeners.push(callback);
        // Return an unsubscribe function for cleanup
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notify(sourceId) {
        this.listeners.forEach(callback => callback(this.state, sourceId));
    }
}

export const cameraState = new CameraState();