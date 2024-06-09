import React from 'react';
import { Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { stateAtoms } from '../../lib/state';
import './Navbar.css';

export function Navbar(): React.JSX.Element {
  const [page, setPage] = useAtom(stateAtoms.page);

  return (
    <BsNavbar className="Navbar py-2">
      <Container className="px-3" fluid>
        <BsNavbar.Brand href="#" onClick={() => setPage('home')}>
          Eternal Lands Explorer
        </BsNavbar.Brand>
        {page !== 'loading' && page !== 'home' && (
          <BsNavbar.Text className="me-auto fs-5">
            <i className="bi-arrow-right me-3 fs-6" />
            Actors
          </BsNavbar.Text>
        )}
        <Nav.Link
          href="https://github.com/lukehorvat/el-explorer"
          target="_blank"
          title="View on GitHub"
        >
          <i className="bi-github fs-4" />
        </Nav.Link>
      </Container>
    </BsNavbar>
  );
}
