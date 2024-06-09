import React, { ReactNode } from 'react';
import { ButtonGroup, Stack } from 'react-bootstrap';
import './Sidebar.css';

export function Sidebar(props: { children?: ReactNode }): React.JSX.Element {
  return (
    <Stack className="Sidebar p-3" direction="vertical" gap={4}>
      {props.children}
    </Stack>
  );
}

export function SidebarSection(props: {
  title: string;
  icon: string;
  children?: ReactNode;
}): React.JSX.Element {
  return (
    <Stack className="SidebarSection flex-grow-0" direction="vertical" gap={1}>
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

export function SidebarNavButtons(props: {
  onNavigate: (direction: 'prev' | 'next') => void;
}): React.JSX.Element {
  return (
    <ButtonGroup className="SidebarNavButtons" size="sm">
      <button
        className="btn btn-primary"
        onClick={() => props.onNavigate('prev')}
        title="Previous"
      >
        <i className="bi-arrow-up" />
      </button>
      <button
        className="btn btn-primary"
        onClick={() => props.onNavigate('next')}
        title="Next"
      >
        <i className="bi-arrow-down" />
      </button>
    </ButtonGroup>
  );
}

export function navigateTo<T>(
  currentItem: T,
  items: T[],
  direction: 'prev' | 'next'
): T {
  const currentIndex = items.indexOf(currentItem);
  let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
  if (newIndex < 0) {
    newIndex = items.length - 1;
  } else if (newIndex >= items.length) {
    newIndex = 0;
  }
  return items[newIndex];
}
