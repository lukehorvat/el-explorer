import React from 'react';
import { Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { AppState, pages } from '../app-state';
import './Navbar.css';

export function Navbar(): React.JSX.Element {
  const [page, setPage] = useAtom(AppState.page);

  return (
    <BsNavbar className="Navbar py-2">
      <Container className="px-3" fluid>
        <BsNavbar.Brand href="#" onClick={() => setPage('home')}>
          Eternal Lands Explorer
        </BsNavbar.Brand>
        {page !== 'home' && (
          <BsNavbar.Text className="me-auto fs-5">
            <i className="bi-arrow-right me-3 fs-6" />
            {pages[page].name}
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
