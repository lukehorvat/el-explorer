import React, { useCallback, useLayoutEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAtom, useAtomValue } from 'jotai';
import { ActorsPageState } from './page-state';
import { Scene } from '../../components/Scene';
import { GameMap } from '../../components/Map';
import { Actor } from '../../components/Actor';
import { CameraReset, CameraResetListener } from '../../components/CameraReset';
import { AssetCache } from '../../lib/asset-cache';
import { TILE_SIZE } from '../../io/map-defs';
import './Scene.css';

export function ActorsScene(): React.JSX.Element {
  const actorType = useAtomValue(ActorsPageState.actorType);
  const skinType = useAtomValue(ActorsPageState.skinType);
  const showSkeleton = useAtomValue(ActorsPageState.showSkeleton);
  const showEnvironment = useAtomValue(ActorsPageState.showEnvironment);
  const showStats = useAtomValue(ActorsPageState.showStats);
  const autoRotate = useAtomValue(ActorsPageState.autoRotate);
  const animationName = useAtomValue(ActorsPageState.animationName);
  const animationLoop = useAtomValue(ActorsPageState.animationLoop);
  const animationSpeed = useAtomValue(ActorsPageState.animationSpeed);
  const [animationController, setAnimationController] = useAtom(
    ActorsPageState.animationController
  );
  const mapDef = AssetCache.mapDefs.get('maps/newcharactermap.elm.gz')!;
  const tileMapCenterX = (mapDef.tileMap.width * TILE_SIZE) / 2;
  const tileMapCenterY = (mapDef.tileMap.height * TILE_SIZE) / 2;

  useLayoutEffect(() => {
    animationController?.play(animationName, animationLoop, animationSpeed);
  }, [animationController, animationName, animationLoop, animationSpeed]);

  const onActorTypeChange: CameraResetListener = useCallback(
    (camera, orbitControls, center) => {
      camera.position.set(
        tileMapCenterX,
        center.y + 1.1, // Slightly above actor's center so we're looking down on it.
        -tileMapCenterY + 4 // A reasonable distance away for most actor meshes...
      );
      orbitControls.target.set(
        tileMapCenterX,
        center.y, // Orbit actor's vertical center.
        -tileMapCenterY
      );
    },
    [tileMapCenterX, tileMapCenterY]
  );

  return (
    <Scene className="ActorsScene" showStats={showStats}>
      <PerspectiveCamera fov={45} near={0.1} far={1000} makeDefault />
      <ambientLight intensity={0.5} />
      <directionalLight
        intensity={1}
        position={[10, 10, -5]}
        castShadow
        shadow-mapSize={[4096, 4096]}
      />
      <GameMap
        defPath="maps/newcharactermap.elm.gz"
        showObject3ds
        showObject2ds
        showTiles
        showTileExtensions
        showSkybox
        visible={showEnvironment}
      />
      <OrbitControls
        autoRotateSpeed={3}
        enableDamping
        enableZoom
        enablePan={false}
        minDistance={1}
        maxDistance={40}
        autoRotate={autoRotate}
        makeDefault
      />
      <CameraReset
        key={actorType} // Reset camera whenever actor type changes.
        onReset={onActorTypeChange}
        position-x={tileMapCenterX}
        position-y={0}
        position-z={-tileMapCenterY}
        disableY
      >
        <Actor
          actorType={actorType}
          skinType={skinType}
          showSkeleton={showSkeleton}
          getAnimationController={setAnimationController}
        />
      </CameraReset>
    </Scene>
  );
}
