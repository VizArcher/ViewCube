/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrameIframeApp } from '@kitware/trame-react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Slider,
  Switch,
} from '@patternfly/react-core';
import { cameraState } from '../../core/CameraState';

function debounce(func, wait) {
  let timeout;

  return function (...args) {
    const context = this;

    clearTimeout(timeout); // Clears the previous timeout
    timeout = setTimeout(() => func.apply(context, args), wait); // Sets a new timeout
  };
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  )
    return false;

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
  const trameStatekeys = Object.keys(trameState);

  for (let localKey of localStateKeys) {
    if (
      !trameStatekeys.includes(localKey) ||
      !deepEqual(localState[localKey], trameState[localKey])
    ) {
      return false;
    }
  }

  return true;
}

const Viewer = ({ viewerId, url }) => {
  const trameCommunicator = useRef(null);
  const synchronizeTrameState = useRef(null);

  const [viewerState, setViewerState] = useState({
    resolution: 20,
    interaction_mode: 'interact',
  });

  useEffect(() => {
    synchronizeTrameState.current = debounce((viewerState) => {
      if (!trameCommunicator.current) {
        return;
      }

      trameCommunicator.current.state.get().then((trame_state) => {
        if (!stateIsSync(viewerState, trame_state)) {
          trameCommunicator.current.state.update(viewerState);
        }
      });
    }, 25);
  }, []);

  useEffect(() => {
    synchronizeTrameState.current(viewerState);
  }, [viewerState]);

  const resetCamera = () => {
    console.debug('resetting camera');
    trameCommunicator.current.trigger('raise_error').catch((err) => {
      throw err;
    });
    trameCommunicator.current.trigger('reset_camera');
  };

  const resetResolution = () => {
    console.debug('resetting resolution');
    trameCommunicator.current.trigger('reset_resolution');
  };

  cameraState.subscribe((state, sourceId) => { 
        if(sourceId === 'VIEWER') return;

        const cameraData = {
          position: [state.position.x, state.position.y, state.position.z],
          target: [state.target.x, state.target.y, state.target.z],
          up: [state.up.x, state.up.y, state.up.z]
        };
        console.log(cameraData.position[0])
        trameCommunicator.current.trigger('reset_resolution', [cameraData.position, cameraData.target, cameraData.up]);
   });


  const onViewerReady = (comm) => {
    trameCommunicator.current = comm;

    trameCommunicator.current.state.onReady(() => {
      trameCommunicator.current.state.watch(
        ['interactor_settings'],
        (interactor_settings) => {
          console.log({ interactor_settings });
        }
      );

      trameCommunicator.current.state.watch(
        ['resolution', 'interaction_mode'],
        (resolution, interaction_mode) => {
          setViewerState((prevState) => ({
            ...prevState,
            resolution,
            interaction_mode,
          }));
        }
      );

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
    <div className="viewer"  style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar style={{ height: '10%' }}>
        <ToolbarContent>
          <ToolbarItem>
            <div style={{ minWidth : '200px' }}>
              <Slider
                min={3}
                max={60}
                step={1}
                inputLabel="resolution"
                value={viewerState.resolution}
                onChange={(e, res) => {
                  setViewerState((prevViewerState) => ({
                    ...prevViewerState,
                    resolution: res,
                  }));
                }}
              />
            </div>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary" onClick={resetCamera}>
              Reset Camera
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary" onClick={resetResolution}>
              Reset Resolution
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="primary"
              onClick={() =>
                trameCommunicator.current
                  .trigger('get_number_of_cells')
                  .then(console.log)
              }
            >
              Get Number Of Cells
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Switch
              label={viewerState.interaction_mode}
              isChecked={viewerState.interaction_mode === 'select'}
              onChange={(e, checked) => {
                setViewerState((prevViewerState) => ({
                  ...prevViewerState,
                  interaction_mode: checked ? 'select' : 'interact',
                }));
              }}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <TrameIframeApp
        style={{ height: '80%',}}
        iframeId={viewerId}
        url={url}
        onCommunicatorReady={onViewerReady}
      />
    </div>
  );
};

export default Viewer;
