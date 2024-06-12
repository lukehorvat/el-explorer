import React from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom, useAtomValue } from 'jotai';
import { actorsState } from './actors-state';
import { assetCache } from '../../lib/asset-cache';
import { useAnimationFrames } from '../../hooks/useAnimationFrames';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../shell/Sidebar';
import { ActorSkinType } from './Actor';

export function ActorsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <ActorSection />
      <AppearanceSection />
      <AnimationSection />
      <MiscSection />
    </Sidebar>
  );
}

function ActorSection(): React.JSX.Element {
  const [actorType, setActorType] = useAtom(actorsState.actorType);
  const sortedActorDefs = [...assetCache.actorDefs.values()].sort(
    (def1, def2) => def1.name.localeCompare(def2.name)
  );
  const moveToActor = (direction: 'prev' | 'next'): void => {
    const actorTypes = sortedActorDefs.map((def) => def.type);
    setActorType(navigateTo(actorType, actorTypes, direction));
  };

  return (
    <SidebarSection title="Actor" icon="bi-person-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={actorType}
          onChange={(event) => setActorType(Number(event.target.value))}
        >
          {sortedActorDefs.map((actorDef) => (
            <option value={actorDef.type} key={actorDef.type}>
              {actorDef.name}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToActor} />
      </Stack>
    </SidebarSection>
  );
}

function AppearanceSection(): React.JSX.Element {
  const [skinType, setSkinType] = useAtom(actorsState.skinType);
  const [showSkeleton, setShowSkeleton] = useAtom(actorsState.showSkeleton);
  const skinTypes = (Object.values(ActorSkinType) as ActorSkinType[]).filter(
    (value) => !isNaN(Number(value)) // TS enums... 🙈
  );
  const moveToSkin = (direction: 'prev' | 'next'): void => {
    setSkinType(navigateTo(skinType, skinTypes, direction));
  };

  return (
    <SidebarSection title="Appearance" icon="bi-palette-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Skin:
        </Form.Label>
        <Form.Select
          size="sm"
          value={skinType}
          onChange={(event) => {
            setSkinType(event.target.value as unknown as ActorSkinType);
          }}
        >
          {skinTypes.map((type) => (
            <option value={type} key={type}>
              {ActorSkinType[type].toLowerCase()}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToSkin} />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Skeleton:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showSkeleton}
          onChange={(event) => setShowSkeleton(event.target.checked)}
        />
      </Stack>
    </SidebarSection>
  );
}

function AnimationSection(): React.JSX.Element {
  const actorType = useAtomValue(actorsState.actorType);
  const [animationName, setAnimationName] = useAtom(actorsState.animationName);
  const [animationLoop, setAnimationLoop] = useAtom(actorsState.animationLoop);
  const [animationSpeed, setAnimationSpeed] = useAtom(
    actorsState.animationSpeed
  );
  const animationHandlers = useAtomValue(actorsState.animationHandlers);
  useAnimationFrames();

  const actorDef = assetCache.actorDefs.get(actorType)!;
  const animationNames = [
    null,
    ...actorDef.animations.map((animation) => animation.name),
  ];
  const moveToAnimation = (direction: 'prev' | 'next'): void => {
    setAnimationName(navigateTo(animationName, animationNames, direction));
  };
  const animationSpeeds = [1.5, 1, 0.5, 0.1];
  const moveToSpeed = (direction: 'prev' | 'next'): void => {
    setAnimationSpeed(navigateTo(animationSpeed, animationSpeeds, direction));
  };

  return (
    <SidebarSection title="Animation" icon="bi-person-walking">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={animationName ?? ''}
          onChange={(event) => setAnimationName(event.target.value || null)}
        >
          {animationNames.map((name) => (
            <option value={name ?? ''} key={name}>
              {name?.replace(/^CAL_/, '') ?? 'none'}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToAnimation} />
      </Stack>
      {animationName && (
        <>
          <Stack direction="horizontal" gap={2}>
            <Form.Label column="sm">Loop:</Form.Label>
            <Form.Check
              type="checkbox"
              checked={animationLoop}
              onChange={(event) => setAnimationLoop(event.target.checked)}
            />
          </Stack>
          <Stack direction="horizontal" gap={2}>
            <Form.Label column="sm" className="flex-grow-0">
              Speed:
            </Form.Label>
            <Form.Select
              size="sm"
              value={animationSpeed}
              onChange={(event) =>
                setAnimationSpeed(Number(event.target.value))
              }
            >
              {animationSpeeds.map((speed) => (
                <option value={`${speed}`} key={speed}>
                  {Math.round(speed * 100)}%
                </option>
              ))}
            </Form.Select>
            <SidebarNavButtons onNavigate={moveToSpeed} />
          </Stack>
          <Stack direction="horizontal" gap={2}>
            <Form.Label column="sm">Playback:</Form.Label>
            <Form.Range
              value={animationHandlers!.getAnimationTime()}
              max={1}
              onClick={() => {
                animationHandlers!.playAnimation();
              }}
              disabled={animationHandlers!.isAnimationPlaying()}
              title="Replay"
              readOnly
            />
          </Stack>
        </>
      )}
    </SidebarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showEnvironment, setShowEnvironment] = useAtom(
    actorsState.showEnvironment
  );
  const [showStats, setShowStats] = useAtom(actorsState.showStats);
  const [autoRotate, setAutoRotate] = useAtom(actorsState.autoRotate);

  return (
    <SidebarSection title="Miscellaneous" icon="bi-gear-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Environment:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showEnvironment}
          onChange={(event) => setShowEnvironment(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Auto rotate:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={autoRotate}
          onChange={(event) => setAutoRotate(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Stats:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showStats}
          onChange={(event) => setShowStats(event.target.checked)}
        />
      </Stack>
    </SidebarSection>
  );
}
