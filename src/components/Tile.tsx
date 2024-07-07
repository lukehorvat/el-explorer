import React, { useLayoutEffect, useRef } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { AssetCache } from '../lib/asset-cache';
import { TILE_SIZE } from '../io/map-defs';

/**
 * An EL map tile as a Three.js mesh!
 */
export function Tile({
  tileId,
  ...meshProps
}: { tileId: number } & ThreeElements['mesh']): React.JSX.Element {
  return (
    <mesh {...meshProps} receiveShadow>
      <TileGeometry />
      <TileMaterial tileId={tileId} />
    </mesh>
  );
}

export function TileGeometry(): React.JSX.Element {
  const planeRef = useRef<THREE.PlaneGeometry>(null!);

  useLayoutEffect(() => {
    planeRef.current.rotateX(THREE.MathUtils.degToRad(-90)); // ground parallel
  }, []);

  return <planeGeometry args={[TILE_SIZE, TILE_SIZE]} ref={planeRef} />;
}

export function TileMaterial({
  tileId,
}: {
  tileId: number;
}): React.JSX.Element {
  const texture = AssetCache.ddsTextures.get(`3dobjects/tile${tileId}.dds`)!;
  return <meshBasicMaterial map={texture} side={THREE.FrontSide} />;
}
