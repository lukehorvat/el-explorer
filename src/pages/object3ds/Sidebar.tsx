import React from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { Object3dsPageState } from './page-state';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../../components/Sidebar';
import { Object3dSkinType } from '../../components/Object3d';

export function Object3dsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <Object3dSection />
      <AppearanceSection />
      <MiscSection />
    </Sidebar>
  );
}

function Object3dSection(): React.JSX.Element {
  const [object3dDefPath, setObject3dDefPath] = useAtom(
    Object3dsPageState.object3dDefPath
  );
  const sortedObject3dDefPaths = [...assetCache.object3dDefs.keys()].sort(
    (defPath1, defPath2) => defPath1.localeCompare(defPath2)
  );
  const moveToObject3d = (direction: 'prev' | 'next'): void => {
    setObject3dDefPath(
      navigateTo(object3dDefPath, sortedObject3dDefPaths, direction)
    );
  };

  return (
    <SidebarSection title="3D Object" icon="bi-box-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={object3dDefPath}
          onChange={(event) => setObject3dDefPath(event.target.value)}
        >
          {sortedObject3dDefPaths.map((defPath) => (
            <option value={defPath} key={defPath}>
              {defPath.replace(/^3dobjects\//, '').replace(/\.e3d$/, '')}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToObject3d} />
      </Stack>
    </SidebarSection>
  );
}

function AppearanceSection(): React.JSX.Element {
  const [skinType, setSkinType] = useAtom(Object3dsPageState.skinType);
  const skinTypes = (
    Object.values(Object3dSkinType) as Object3dSkinType[]
  ).filter(
    (type) => !isNaN(Number(type)) // TS enums... 🙈
  );
  const moveToSkin = (direction: 'prev' | 'next'): void => {
    setSkinType(navigateTo(skinType, skinTypes, direction));
  };
  const [showEnvironment, setShowEnvironment] = useAtom(
    Object3dsPageState.showEnvironment
  );

  return (
    <SidebarSection title="Appearance" icon="bi-palette-fill">
      <Stack className="mb-1" direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Skin:
        </Form.Label>
        <Form.Select
          size="sm"
          value={skinType}
          onChange={(event) => {
            setSkinType(Number(event.target.value));
          }}
        >
          {skinTypes.map((type) => (
            <option value={type} key={type}>
              {Object3dSkinType[type].toLowerCase()}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToSkin} />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Environment:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showEnvironment}
          onChange={(event) => setShowEnvironment(event.target.checked)}
        />
      </Stack>
    </SidebarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showStats, setShowStats] = useAtom(Object3dsPageState.showStats);
  const [autoRotate, setAutoRotate] = useAtom(Object3dsPageState.autoRotate);

  return (
    <SidebarSection title="Miscellaneous" icon="bi-gear-fill">
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
