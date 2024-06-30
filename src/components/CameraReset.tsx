import React, { ReactNode, useCallback, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Center, OnCenterCallbackProps } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Component that centers its children and provides a convenient way to adjust
 * the camera position and orbit controls target based on the computed center.
 *
 * Use React's intrinsic `key` prop to control when the reset should happen (by
 * remounting the component and its children).
 */
export function CameraReset({
  onReset,
  children,
}: {
  onReset: CameraResetListener;
  children: ReactNode;
}): React.JSX.Element {
  const camera = useThree((state) => state.camera);
  const orbitControls = useThree(
    (state) => state.controls
  ) as unknown as OrbitControls | null;
  const [isCentered, setIsCentered] = useState(false);
  const onCentered = useCallback(
    ({ center }: OnCenterCallbackProps): void => {
      if (!orbitControls) return;
      onReset(camera, orbitControls, center);
      setIsCentered(true);
    },
    [camera, orbitControls, onReset]
  );

  return (
    <Center
      onCentered={onCentered}
      visible={isCentered} // Prevent rendering a brief flicker of uncentered children.
      disableY
    >
      {children}
    </Center>
  );
}

export type CameraResetListener = (
  camera: THREE.Camera,
  orbitControls: OrbitControls,
  center: THREE.Vector3
) => void;

type OrbitControls = { target: THREE.Vector3 };
