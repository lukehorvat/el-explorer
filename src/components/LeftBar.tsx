import React, { ReactNode } from 'react';
import { Button, ButtonGroup, Form, Stack } from 'react-bootstrap';
import { useAtom, useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import { useAnimationFrames } from '../hooks/useAnimationFrames';
import './LeftBar.css';

export function LeftBar(): React.JSX.Element {
  return (
    <Stack className="LeftBar p-3" direction="vertical" gap={4}>
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
    <LeftBarSection title="Creature" icon="bi-person-fill">
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
        <NavigationButtons onNavigate={moveToActor} />
      </Stack>
    </LeftBarSection>
  );
}

function AppearanceSection(): React.JSX.Element {
  const [skinType, setSkinType] = useAtom(stateAtoms.skinType);
  const [showSkeleton, setShowSkeleton] = useAtom(stateAtoms.showSkeleton);
  const skinTypes: (typeof skinType)[] = [
    null,
    'texture',
    'wireframe',
    'vectors',
    'metal',
    'crystal',
    'silhouette',
  ];
  const moveToSkin = (direction: 'prev' | 'next'): void => {
    setSkinType(moveTo(skinType, skinTypes, direction));
  };

  return (
    <LeftBarSection title="Appearance" icon="bi-palette-fill">
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
          {skinTypes.map((type) => (
            <option value={type ?? ''} key={type}>
              {type ?? 'none'}
            </option>
          ))}
        </Form.Select>
        <NavigationButtons onNavigate={moveToSkin} />
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
  const [animationLoop, setAnimationLoop] = useAtom(stateAtoms.animationLoop);
  const [animationSpeed, setAnimationSpeed] = useAtom(
    stateAtoms.animationSpeed
  );
  const animationHandlers = useAtomValue(stateAtoms.animationHandlers);
  useAnimationFrames();

  const actorDef = assetCache.actorDefs.get(actorType)!;
  const animationTypes = [
    null,
    ...actorDef.animations.map((animation) => animation.type),
  ];
  const moveToAnimation = (direction: 'prev' | 'next'): void => {
    setAnimationType(moveTo(animationType, animationTypes, direction));
  };
  const animationSpeeds = [1.5, 1, 0.5, 0.1];
  const moveToSpeed = (direction: 'prev' | 'next'): void => {
    setAnimationSpeed(moveTo(animationSpeed, animationSpeeds, direction));
  };

  return (
    <LeftBarSection title="Animation" icon="bi-person-walking">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={animationType ?? ''}
          onChange={(event) => setAnimationType(event.target.value || null)}
        >
          {animationTypes.map((type) => (
            <option value={type ?? ''} key={type}>
              {type?.replace(/^CAL_/, '') ?? 'none'}
            </option>
          ))}
        </Form.Select>
        <NavigationButtons onNavigate={moveToAnimation} />
      </Stack>
      {animationType && (
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
            <NavigationButtons onNavigate={moveToSpeed} />
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
    </LeftBarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showGround, setShowGround] = useAtom(stateAtoms.showGround);
  const [showStats, setShowStats] = useAtom(stateAtoms.showStats);
  const [autoRotate, setAutoRotate] = useAtom(stateAtoms.autoRotate);

  return (
    <LeftBarSection title="Miscellaneous" icon="bi-gear-fill">
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
  icon: string;
  children?: ReactNode;
}): React.JSX.Element {
  return (
    <Stack className="flex-grow-0" direction="vertical" gap={1}>
      <Stack direction="horizontal" gap={2}>
        <i className={props.icon} />
        <span className="flex-grow-1 fw-bold">{props.title}</span>
      </Stack>
      <hr className="my-0" />
      <Stack className="mt-1" direction="vertical" gap={1}>
        {props.children}
      </Stack>
    </Stack>
  );
}

function NavigationButtons(props: {
  onNavigate: (direction: 'prev' | 'next') => void;
}): React.JSX.Element {
  return (
    <ButtonGroup className="NavigationButtons" size="sm">
      <Button onClick={() => props.onNavigate('prev')} title="Previous">
        <i className="bi-arrow-up" />
      </Button>
      <Button onClick={() => props.onNavigate('next')} title="Next">
        <i className="bi-arrow-down" />
      </Button>
    </ButtonGroup>
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
