import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { stateAtoms } from '../lib/state';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  const [page, setPage] = useAtom(stateAtoms.page);

  return (
    <Navbar className="TopBar py-2">
      <Container className="px-3" fluid>
        <Navbar.Brand href="#" onClick={() => setPage('home')}>
          Eternal Lands Explorer
        </Navbar.Brand>
        {page !== 'loading' && page !== 'home' && (
          <Navbar.Text className="me-auto fs-5">
            <i className="bi-arrow-right me-3 fs-6" />
            Actors
          </Navbar.Text>
        )}
        <Nav.Link
          href="https://github.com/lukehorvat/el-explorer"
          target="_blank"
          title="View on GitHub"
        >
          <i className="bi-github fs-4" />
        </Nav.Link>
      </Container>
    </Navbar>
  );
}
