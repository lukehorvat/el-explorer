import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  return (
    <Navbar className="TopBar py-2">
      <Container className="px-3" fluid>
        <Navbar.Brand>Creatures of Eternal Lands</Navbar.Brand>
        <Nav.Link
          href="https://github.com/lukehorvat/el-creatures"
          target="_blank"
        >
          GitHub
        </Nav.Link>
      </Container>
    </Navbar>
  );
}
