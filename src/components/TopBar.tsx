import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';

export function TopBar(): React.JSX.Element {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
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
