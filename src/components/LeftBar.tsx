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
  const moveToActor = (direction: 'next' | 'previous'): void => {
    const currentIndex = sortedActorDefs.findIndex(
      (actorDef) => actorDef.type === actorType
    );

    let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) {
      newIndex = sortedActorDefs.length - 1;
    } else if (newIndex >= sortedActorDefs.length) {
      newIndex = 0;
    }

    setActorType(sortedActorDefs[newIndex].type);
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
          onClick={() => moveToActor('previous')}
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
          <option value="">None</option>
          <option value="texture">Texture</option>
          <option value="wireframe">Wireframe</option>
          <option value="vectors">Vectors</option>
          <option value="metal">Metal</option>
          <option value="crystal">Crystal</option>
          <option value="silhouette">Silhouette</option>
        </Form.Select>
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
  const moveToAnimation = (direction: 'next' | 'previous'): void => {
    const currentIndex =
      actorDef.animations.findIndex(
        (animation) => animation.type === animationType
      ) + 1;

    let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) {
      newIndex = actorDef.animations.length;
    } else if (newIndex > actorDef.animations.length) {
      newIndex = 0;
    }

    setAnimationType(
      newIndex > 0 ? actorDef.animations[newIndex - 1].type : null
    );
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
          <option value="">None</option>
          {actorDef.animations.map((animation) => (
            <option value={animation.type} key={animation.type}>
              {animation.type.replace(/^CAL_/, '')}
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
          onClick={() => moveToAnimation('previous')}
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
