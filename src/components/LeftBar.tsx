import React, { ReactNode } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { useAtom, useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import { useAnimationFrames } from '../hooks/useAnimationFrames';
import './LeftBar.css';

export function LeftBar(): React.JSX.Element {
  return (
    <Stack className="LeftBar p-3" direction="vertical" gap={3}>
      <CreatureSection />
      <AppearanceSection />
      <AnimationSection />
      <MiscSection />
    </Stack>
  );
}

function CreatureSection(): React.JSX.Element {
  const [actorType, setActorType] = useAtom(stateAtoms.actorType);
  const sortedActorDefs = [...assetCache.actorDefs.values()].sort(
    (def1, def2) => def1.name.localeCompare(def2.name)
  );
  const moveToActor = (direction: 'prev' | 'next'): void => {
    const actorTypes = sortedActorDefs.map((def) => def.type);
    setActorType(moveTo(actorType, actorTypes, direction));
  };

  return (
    <LeftBarSection title="Creature">
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
      </Stack>
      <Stack
        direction="horizontal"
        gap={2}
        className="justify-content-end my-1"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToActor('prev')}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToActor('next')}
        >
          Next
        </Button>
      </Stack>
    </LeftBarSection>
  );
}

function AppearanceSection(): React.JSX.Element {
  const [skinType, setSkinType] = useAtom(stateAtoms.skinType);
  const [showSkeleton, setShowSkeleton] = useAtom(stateAtoms.showSkeleton);
  const skins = [
    { type: null, name: 'None' },
    { type: 'texture', name: 'Texture' },
    { type: 'wireframe', name: 'Wireframe' },
    { type: 'vectors', name: 'Vectors' },
    { type: 'metal', name: 'Metal' },
    { type: 'crystal', name: 'Crystal' },
    { type: 'silhouette', name: 'Silhouette' },
  ];
  const moveToSkin = (direction: 'prev' | 'next'): void => {
    const skinTypes = skins.map((skin) => skin.type);
    setSkinType(moveTo(skinType, skinTypes, direction) as typeof skinType);
  };

  return (
    <LeftBarSection title="Appearance">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Skin:
        </Form.Label>
        <Form.Select
          size="sm"
          value={skinType ?? ''}
          onChange={(event) => {
            setSkinType((event.target.value || null) as typeof skinType);
          }}
        >
          {skins.map((skin) => (
            <option value={skin.type ?? ''} key={skin.type}>
              {skin.name}
            </option>
          ))}
        </Form.Select>
      </Stack>
      <Stack
        direction="horizontal"
        gap={2}
        className="justify-content-end my-1"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToSkin('prev')}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToSkin('next')}
        >
          Next
        </Button>
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Skeleton:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showSkeleton}
          onChange={(event) => setShowSkeleton(event.target.checked)}
        />
      </Stack>
    </LeftBarSection>
  );
}

function AnimationSection(): React.JSX.Element {
  const actorType = useAtomValue(stateAtoms.actorType);
  const [animationType, setAnimationType] = useAtom(stateAtoms.animationType);
  const [loopAnimation, setLoopAnimation] = useAtom(stateAtoms.loopAnimation);
  // const animationHandlers = useAtomValue(stateAtoms.animationHandlers);
  useAnimationFrames(true);

  const actorDef = assetCache.actorDefs.get(actorType)!;
  const animations = [{ type: null }, ...actorDef.animations];
  const moveToAnimation = (direction: 'prev' | 'next'): void => {
    const animationTypes = animations.map((animation) => animation.type);
    setAnimationType(moveTo(animationType, animationTypes, direction));
  };

  return (
    <LeftBarSection title="Animation">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={animationType ?? ''}
          onChange={(event) => setAnimationType(event.target.value || null)}
        >
          {animations.map((animation) => (
            <option value={animation.type ?? ''} key={animation.type}>
              {animation.type?.replace(/^CAL_/, '') ?? 'None'}
            </option>
          ))}
        </Form.Select>
      </Stack>
      <Stack
        direction="horizontal"
        gap={2}
        className="justify-content-end my-1"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToAnimation('prev')}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => moveToAnimation('next')}
        >
          Next
        </Button>
      </Stack>
      {animationType && (
        <>
          <Stack direction="horizontal" gap={2}>
            <Form.Label column="sm">Playback:</Form.Label>
            <Form.Range
              // value={Math.round(animationHandlers!.getAnimationTime())}
              onChange={(event) => {
                // animationHandlers!.setAnimationTime(Number(event.target.value));
              }}
            />
          </Stack>
          <Stack direction="horizontal" gap={2}>
            <Form.Label column="sm">Loop:</Form.Label>
            <Form.Check
              type="checkbox"
              checked={loopAnimation}
              onChange={(event) => setLoopAnimation(event.target.checked)}
            />
          </Stack>
        </>
      )}
    </LeftBarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showGround, setShowGround] = useAtom(stateAtoms.showGround);
  const [showStats, setShowStats] = useAtom(stateAtoms.showStats);
  const [autoRotate, setAutoRotate] = useAtom(stateAtoms.autoRotate);

  return (
    <LeftBarSection title="Miscellaneous">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Ground:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showGround}
          onChange={(event) => setShowGround(event.target.checked)}
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
    </LeftBarSection>
  );
}

function LeftBarSection(props: {
  title: string;
  children?: ReactNode;
}): React.JSX.Element {
  return (
    <Stack className="flex-grow-0" direction="vertical" gap={1}>
      <div className="fw-bold mb-1">{props.title}</div>
      {props.children}
    </Stack>
  );
}

function moveTo<T>(currentItem: T, items: T[], direction: 'prev' | 'next'): T {
  const currentIndex = items.indexOf(currentItem);
  let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
  if (newIndex < 0) {
    newIndex = items.length - 1;
  } else if (newIndex >= items.length) {
    newIndex = 0;
  }
  return items[newIndex];
}
