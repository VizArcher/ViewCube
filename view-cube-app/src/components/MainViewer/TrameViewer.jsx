/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrameIframeApp } from '@kitware/trame-react';
import { cameraState } from '../../core/CameraState';

const Viewer = ({ viewerId, url }) => {
  const trameCommunicator = useRef(null);

  cameraState.subscribe((state, sourceId) => { 
        if(sourceId === 'VIEWER') return;

        const cameraData = {
          position: [state.position.x, state.position.y, state.position.z],
          target: [state.target.x, state.target.y, state.target.z],
          up: [state.up.x, state.up.y, state.up.z]
        };
        console.log(cameraData.position[0])
        trameCommunicator.current.trigger('viewCube_to_trame', [cameraData.position, cameraData.target, cameraData.up]);
   });

  const onViewerReady = (comm) => {
    trameCommunicator.current = comm;

    trameCommunicator.current.state.onReady(() => {
      trameCommunicator.current.trigger('reset_to_initial_state')
      .then(() => console.log('Viewer reset to initial state'))
      .catch(err => console.error('Failed to reset initial state:', err));

      trameCommunicator.current.state.watch(
        ['camera_position', 'camera_target', 'camera_up'],
        (camera_position, camera_target, camera_up) => {
            console.log({camera_position, camera_target, camera_up});
            cameraState.set({
                position: new THREE.Vector3(camera_position[0], camera_position[1], camera_position[2]),
                target: new THREE.Vector3(camera_target[0], camera_target[1], camera_target[2]),
                up: new THREE.Vector3(camera_up[0], camera_up[1], camera_up[2])
            }, 'VIEWER');
        }
      );
    });
  };

  return (
    <div className="viewer" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TrameIframeApp
        style={{ height: '100%',}}
        iframeId={viewerId}
        url={url}
        onCommunicatorReady={onViewerReady}
      />
    </div>
  );
};

export default Viewer;
