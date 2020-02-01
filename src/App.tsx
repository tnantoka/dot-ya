import React, { useState, CSSProperties } from 'react';
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
import { Stage, Layer, Rect } from 'react-konva';
import { fill } from 'lodash';
import { ChromePicker } from 'react-color'

import './App.css';
import { KonvaEventObject } from 'konva/types/Node';

const App = () => {
  const canvasSize = 300;
  const gridLength = 16;
  const gridSize = 300 / gridLength;

  const [dots, setDots] = useState(fill(Array(gridLength ** 2), 'red'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);
  const [color, setColor] = useState('#ff0000');

  const draw = (i: number) => {
    if (!isDrawing) {
      return;
    }
    const newDots = [...dots];
    newDots[i] = color;
    setDots(newDots);
  };

  const onMouseMove = (i: number, e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    draw(i);
  };

  const popoverStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 2,
  };

  const coverStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

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
          <Col>
            <div className="d-flex justify-content-center py-4" style={{ background: 'gray' }} onMouseMove={() => setIsDrawing(false)}>
              <Stage width={canvasSize} height={canvasSize}>
                <Layer>
                  {dots.map((dot, i) => (
                    <Rect
                      key={i}
                      x={i % gridLength * gridSize}
                      y={Math.floor(i / gridLength) * gridSize}
                      width={gridSize}
                      height={gridSize}
                      fill={dot}
                      stroke={'gray'}
                      onMouseDown={() => setIsDrawing(true)}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseMove={onMouseMove.bind(null, i)}
                    />
                  ))}
                </Layer>
            </Stage>
          </div>
          </Col>
          <Col>
            <div>
              <button style={{ background: color, height: '1rem' }} onClick={() => setIsShowColorPicker(!isShowColorPicker)} />
              { isShowColorPicker ? <div style={popoverStyle}>
                <div style={coverStyle} onClick={() => setIsShowColorPicker(false)}/>
                <ChromePicker
                  color={color}
                  onChange={(color) => setColor(color.hex)}
                />
              </div> : null }
            </div>          
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
