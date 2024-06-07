import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  return (
    <Navbar className="TopBar py-2">
      <Container className="px-3" fluid>
        <Navbar.Brand>Eternal Lands Explorer</Navbar.Brand>
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
