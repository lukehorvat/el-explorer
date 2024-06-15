import React from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { Object3dsPageState } from './page-state';
import { assetCache } from '../../lib/asset-cache';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../../components/Sidebar';

export function Object3dsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <Object3dSection />
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
