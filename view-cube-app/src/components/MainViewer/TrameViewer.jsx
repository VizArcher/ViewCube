/*
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrameIframeApp } from '@kitware/trame-react';
import { cameraState } from '../../core/CameraState';

const TrameViewer = () => {
    const communicatorRef = useRef(null);
    const isUpdatingFromTrame = useRef(false);

    const onCommunicatorReady = (communicator) => {
        console.log('Trame communicator ready');
        communicatorRef.current = communicator;

        // Wait for state to be ready
        communicator.state.onReady(() => {
            console.log('Trame state ready');

            // Watch for camera changes from Trame (user interaction)
            communicator.state.watch(
                ['camera_position', 'camera_target', 'camera_up'],
                (camera_position, camera_target, camera_up) => {
                    if (!camera_position || !camera_target || !camera_up) return;

                    console.log('Camera updated from Trame:', { 
                        camera_position, 
                        camera_target, 
                        camera_up 
                    });

                    // Prevent feedback loop
                    isUpdatingFromTrame.current = true;

                    cameraState.set({
                        position: new THREE.Vector3(...camera_position),
                        target: new THREE.Vector3(...camera_target),
                        up: new THREE.Vector3(...camera_up)
                    }, 'VIEWER');

                    isUpdatingFromTrame.current = false;
                }
            );
        });
    };

    useEffect(() => {
        // Subscribe to camera state changes from ViewCube
        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // Prevent feedback loop
            if (sourceId === 'VIEWER' || isUpdatingFromTrame.current) {
                return;
            }

            if (!communicatorRef.current) return;

            console.log('Sending camera update to Trame from:', sourceId);

            // Update Trame state using the update method
            communicatorRef.current.state.update({
                camera_position: [state.position.x, state.position.y, state.position.z],
                camera_target: [state.target.x, state.target.y, state.target.z],
                camera_up: [state.up.x, state.up.y, state.up.z]
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <TrameIframeApp
                iframeId="trame-viewer"
                url="http://localhost:8080"
                onCommunicatorReady={onCommunicatorReady}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
            />
        </div>
    );
};

export default TrameViewer;
*/

/*
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrameIframeApp } from '@kitware/trame-react';
import { cameraState } from '../../core/CameraState';

const TrameViewer = () => {
    const communicatorRef = useRef(null);
    const isUpdatingFromTrame = useRef(false);

    const onCommunicatorReady = (communicator) => {
        console.log('Trame communicator ready');
        communicatorRef.current = communicator;

        // Wait for state to be ready
        communicator.state.onReady(() => {
            console.log('Trame state ready');

            // Log initial state
            communicator.state.get().then(initialState => {
                console.log('Initial Trame state:', initialState);
            });

            // Watch for camera changes from Trame (user interaction)
            communicator.state.watch(
                ['camera_position', 'camera_target', 'camera_up', 'camera_source'],
                (camera_position, camera_target, camera_up, camera_source) => {
                    if (!camera_position || !camera_target || !camera_up) return;

                    console.log('Camera updated from Trame:', { 
                        camera_position, 
                        camera_target, 
                        camera_up,
                        camera_source 
                    });

                    // Only update if this came from VIEWER (user dragging in Trame)
                    if (camera_source !== 'VIEWER') {
                        return;
                    }

                    // Prevent feedback loop
                    isUpdatingFromTrame.current = true;

                    cameraState.set({
                        position: new THREE.Vector3(...camera_position),
                        target: new THREE.Vector3(...camera_target),
                        up: new THREE.Vector3(...camera_up)
                    }, 'VIEWER');

                    isUpdatingFromTrame.current = false;
                }
            );
        });
    };

    useEffect(() => {
        // Subscribe to camera state changes from ViewCube
        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // Prevent feedback loop
            if (sourceId === 'VIEWER' || isUpdatingFromTrame.current) {
                console.log('Skipping update to Trame - feedback loop prevention');
                return;
            }

            if (!communicatorRef.current) {
                console.log('Communicator not ready yet');
                return;
            }

            console.log('Sending camera update to Trame from:', sourceId, {
                position: [state.position.x, state.position.y, state.position.z],
                target: [state.target.x, state.target.y, state.target.z],
                up: [state.up.x, state.up.y, state.up.z]
            });

            // Update Trame state using the update method
            try {
                const result = communicatorRef.current.state.update({
                    camera_position: [state.position.x, state.position.y, state.position.z],
                    camera_target: [state.target.x, state.target.y, state.target.z],
                    camera_up: [state.up.x, state.up.y, state.up.z],
                    camera_source: sourceId
                });
                
                // Handle if result is a Promise
                if (result && typeof result.then === 'function') {
                    result.then(() => {
                        console.log('State update sent to Trame successfully');
                    }).catch(err => {
                        console.error('Error updating Trame state:', err);
                    });
                } else {
                    console.log('State update sent to Trame successfully (sync)');
                }
            } catch (err) {
                console.error('Error updating Trame state:', err);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <TrameIframeApp
                iframeId={communicator}
                url="http://localhost:8080"
                onCommunicatorReady={onCommunicatorReady}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
            />
        </div>
    );
};

export default TrameViewer;*/

/*import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TrameIframeApp } from '@kitware/trame-react';
import { cameraState } from '../../core/CameraState';

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || 
        typeof obj2 !== 'object' || obj2 === null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}

function stateIsSync(localState, trameState) {
    const localStateKeys = Object.keys(localState);
    const trameStateKeys = Object.keys(trameState);

    for (let localKey of localStateKeys) {
        if (!trameStateKeys.includes(localKey) || 
            !deepEqual(localState[localKey], trameState[localKey])) {
            return false;
        }
    }
    return true;
}

const TrameViewer = () => {
    const communicatorRef = useRef(null);
    const synchronizeTrameState = useRef(null);
    //const isUpdatingFromTrame = useRef(false);

    const [localCameraState, setLocalCameraState] = useState({
        camera_position: [0, 0, 10],
        camera_target: [0, 0, 0],
        camera_up: [0, 1, 0],
        camera_source: 'INIT'
    });

    // Setup debounced synchronization function
    useEffect(() => {
        synchronizeTrameState.current = debounce((localCameraState) => {
            if (!communicatorRef.current) {
                return;
            }

            communicatorRef.current.state.get().then((trame_state) => {
                if (!stateIsSync(localCameraState, trame_state)) {
                    console.log('Syncing local state to Trame:', cameraState);
                    communicatorRef.current.state.update(localCameraState);
                }
            });
        }, 25);
    }, []);

    // Sync local state to Trame when it changes
    useEffect(() => {
        //if (!isUpdatingFromTrame.current) {
        //    synchronizeTrameState.current(localCameraState);
        //}
        synchronizeTrameState.current(localCameraState);
    }, [localCameraState]);

    const onCommunicatorReady = (communicator) => {
        console.log('Trame communicator ready');
        communicatorRef.current = communicator;

        communicatorRef.current.state.onReady(() => {
            console.log('Trame state ready');

            // Watch for camera changes from Trame (user interaction)
            communicatorRef.current.state.watch(
                ['camera_position', 'camera_target', 'camera_up', 'camera_source'],
                (camera_position, camera_target, camera_up, camera_source) => {
                    if (!camera_position || !camera_target || !camera_up) return;

                    console.log('Camera updated from Trame:', {
                        camera_position,
                        camera_target,
                        camera_up,
                        camera_source
                    });

                    // Only update if this came from VIEWER (user dragging in Trame)
                    if (camera_source === 'VIEWER') {
                        //isUpdatingFromTrame.current = true;

                        // Update local state
                        setLocalCameraState({
                            camera_position,
                            camera_target,
                            camera_up,
                            camera_source
                        });

                        // Update CameraState for ViewCube
                        cameraState.set({
                            position: new THREE.Vector3(...camera_position),
                            target: new THREE.Vector3(...camera_target),
                            up: new THREE.Vector3(...camera_up)
                        }, 'VIEWER');

                        //isUpdatingFromTrame.current = false;
                    }
                }
            );
        });
    };

    useEffect(() => {
        // Subscribe to camera state changes from ViewCube
        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // Prevent feedback loop
            if (sourceId === 'VIEWER') { //|| isUpdatingFromTrame.current) {
                console.log('Skipping update - feedback loop prevention');
                return;
            }

            console.log('Camera update from ViewCube:', sourceId);
            //console.log(state.position.z);

            // Update local state which will trigger sync to Trame
            setLocalCameraState({
                camera_position: [state.position.x, state.position.y, state.position.z],
                camera_target: [state.target.x, state.target.y, state.target.z],
                camera_up: [state.up.x, state.up.y, state.up.z],
                camera_source: sourceId
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <TrameIframeApp
                iframeId="trame-viewer"
                url="http://localhost:8080"
                onCommunicatorReady={onCommunicatorReady}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
            />
        </div>
    );
};

export default TrameViewer;*/

/*
import React, { useEffect, useRef, useState } from 'react';
import { TrameIframeApp } from '@kitware/trame-react';
import { cameraState } from '../../core/CameraState';

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || 
        typeof obj2 !== 'object' || obj2 === null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}

function stateIsSync(localState, trameState) {
    const localStateKeys = Object.keys(localState);
    const trameStateKeys = Object.keys(trameState);

    for (let localKey of localStateKeys) {
        if (!trameStateKeys.includes(localKey) || 
            !deepEqual(localState[localKey], trameState[localKey])) {
            return false;
        }
    }
    return true;
}

const TrameViewer = () => {
    const communicatorRef = useRef(null);
    const synchronizeTrameState = useRef(null);
    const isUpdatingFromTrame = useRef(false);

    const [localCameraState, setLocalCameraState] = useState({
        camera_position: [0, 0, 10],
        camera_target: [0, 0, 0],
        camera_up: [0, 1, 0],
        camera_source: 'INIT'
    });

    // Setup debounced synchronization function
    useEffect(() => {
        synchronizeTrameState.current = debounce((localCameraState) => {
            if (!communicatorRef.current) {
                return;
            }

            communicatorRef.current.state.get().then((trame_state) => {
                if (!stateIsSync(localCameraState, trame_state)) {
                    console.log('Syncing local state to Trame:', cameraState);
                    communicatorRef.current.state.update(localCameraState);
                }
            });
        }, 25);
    }, []);

    // Sync local state to Trame when it changes
    useEffect(() => {
        if (!isUpdatingFromTrame.current) {
            synchronizeTrameState.current(localCameraState);
        }
    }, [localCameraState]);
                                               
    const onCommunicatorReady = (communicator) => {
        console.log('Trame communicator ready');
        communicatorRef.current = communicator;

        communicatorRef.current.state.onReady(() => {
            console.log('Trame state ready');

            communicatorRef.current.state.watch(
                ['camera'],
                (camera) => {
                    console.log("Camera updated", camera);
                }
            )

            // Watch for camera changes from Trame (user interaction)
            communicatorRef.current.state.watch(
                ['camera_position', 'camera_target', 'camera_up', 'camera_source'],
                (camera_position, camera_target, camera_up, camera_source) => {
                    if (!camera_position || !camera_target || !camera_up) return;

                    console.log('Camera updated from Trame:', {
                        camera_position,
                        camera_target,
                        camera_up,
                        camera_source
                    });

                    // Only update if this came from VIEWER (user dragging in Trame)
                    if (camera_source === 'VIEWER') {
                        //isUpdatingFromTrame.current = true;

                        // Update local state
                        setLocalCameraState({
                            camera_position,
                            camera_target,
                            camera_up,
                            camera_source
                        });

                        // Update CameraState for ViewCube
                        cameraState.set({
                            position: new THREE.Vector3(...camera_position),
                            target: new THREE.Vector3(...camera_target),
                            up: new THREE.Vector3(...camera_up)
                        }, 'VIEWER');

                        //isUpdatingFromTrame.current = false;
                    }
                }
            );
        });
    };

    useEffect(() => {
        // Subscribe to camera state changes from ViewCube
        const unsubscribe = cameraState.subscribe((state, sourceId) => {
            // Prevent feedback loop
            if (sourceId === 'VIEWER') { //|| isUpdatingFromTrame.current) {
                console.log('Skipping update - feedback loop prevention');
                return;
            }

            console.log('Camera update from ViewCube:', sourceId);
            //console.log(state.position.z);

            // Update local state which will trigger sync to Trame
            setLocalCameraState({
                camera_position: [state.position.x, state.position.y, state.position.z],
                camera_target: [state.target.x, state.target.y, state.target.z],
                camera_up: [state.up.x, state.up.y, state.up.z],
                camera_source: sourceId
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <TrameIframeApp
                iframeId="trame-viewer"
                url="http://localhost:8080"
                onCommunicatorReady={onCommunicatorReady}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
            />
        </div>
    );
};

export default TrameViewer; */

import { useEffect, useRef } from "react";
import { TrameIframeApp } from "@kitware/trame-react";

export default function TrameViewer() {
  const communicatorRef = useRef(null);

  const onCommunicatorReady = (communicator) => {
    communicatorRef.current = communicator;

    communicator.state.onReady(() => {
      console.log("[React] Trame state ready");

      communicator.state.watch(["camera"], (camera) => {
        if (!camera) return;
        console.log("[React] Camera updated:", camera);
      });
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <TrameIframeApp
            iframeId="trame-viewer"
            url="http://localhost:8080"
            onCommunicatorReady={onCommunicatorReady}
            style={{
                width: '100%',
                height: '100%',
                border: 'none'
            }}
        />
    </div>
  );
}
