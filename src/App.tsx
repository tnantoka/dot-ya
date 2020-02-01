import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import {
  Navbar,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import './App.css';

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Navbar color="light" light expand>
        <Container fluid>
          <NavbarBrand href="/">Pixel Art</NavbarBrand>
          <Nav className="ml-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                16 x 16
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag="a" href="#">
                  32 x 32
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
      <Container fluid>
        <Row>
          <Col>.col</Col>
          <Col>.col</Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
