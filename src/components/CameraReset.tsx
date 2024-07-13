import React, { useCallback, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Center, OnCenterCallbackProps } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Component that centers its children and provides a convenient way to adjust
 * the camera position and camera controls target based on the computed center.
 *
 * Use React's intrinsic `key` prop to control when the reset should happen (by
 * remounting the component and its children).
 */
export function CameraReset({
  onReset,
  children,
  ...centerProps
}: {
  onReset: CameraResetListener;
} & React.ComponentProps<typeof Center>): React.JSX.Element {
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls
  ) as unknown as CameraControls | null;
  const [isCentered, setIsCentered] = useState(false);
  const onCentered = useCallback(
    ({ center }: OnCenterCallbackProps): void => {
      if (!controls) return;
      onReset(camera, controls, center);
      setIsCentered(true);
    },
    [camera, controls, onReset]
  );

  return (
    <Center
      {...centerProps}
      onCentered={onCentered}
      visible={isCentered} // Prevent rendering a brief flicker of uncentered children.
    >
      {children}
    </Center>
  );
}

export type CameraResetListener = (
  camera: THREE.Camera,
  controls: CameraControls,
  center: THREE.Vector3
) => void;

type CameraControls = { target: THREE.Vector3 };
