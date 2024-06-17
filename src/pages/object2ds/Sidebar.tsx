import React from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { assetCache } from '../../lib/asset-cache';
import { Object2dsPageState } from './page-state';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../../components/Sidebar';

export function Object2dsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <Object2dSection />
      <MiscSection />
    </Sidebar>
  );
}

function Object2dSection(): React.JSX.Element {
  const [object2dDefPath, setObject2dDefPath] = useAtom(
    Object2dsPageState.object2dDefPath
  );
  const sortedObject2dDefPaths = [...assetCache.object2dDefs.keys()].sort(
    (defPath1, defPath2) => defPath1.localeCompare(defPath2)
  );
  const moveToObject2d = (direction: 'prev' | 'next'): void => {
    setObject2dDefPath(
      navigateTo(object2dDefPath, sortedObject2dDefPaths, direction)
    );
  };

  return (
    <SidebarSection title="2D Object" icon="bi-image-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={object2dDefPath}
          onChange={(event) => setObject2dDefPath(event.target.value)}
        >
          {sortedObject2dDefPaths.map((defPath) => (
            <option value={defPath} key={defPath}>
              {defPath
                .replace(/^2dobjects\/ground\//, '') // Every 2D object is in `ground` dir so this is fine... 🤷‍♂️
                .replace(/\.2d0$/, '')}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToObject2d} />
      </Stack>
    </SidebarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showStats, setShowStats] = useAtom(Object2dsPageState.showStats);
  const [autoRotate, setAutoRotate] = useAtom(Object2dsPageState.autoRotate);

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
