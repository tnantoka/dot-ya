import React, { useState, useEffect, useRef, CSSProperties, RefObject } from 'react';
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

  const previewSize = gridLength * 2;
  const previewGridSize = previewSize / gridLength;


  const [dots, setDots] = useState(fill(Array(gridLength ** 2), 'red'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);
  const [color, setColor] = useState('#ff0000');
  // const [dataURL, setDataURL] = useState('');

  const stageRef = useRef() as RefObject<Stage>;

  // useEffect(() => {
  //   if(stageRef && stageRef.current) {
  //     setDataURL((stageRef.current as any).toDataURL());
  //   }
  // }, [dots]);

  const draw = (i: number) => {
    const newDots = [...dots];
    newDots[i] = color;
    setDots(newDots);
  };

  const onMouseMove = (i: number, e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    if (!isDrawing) {
      return;
    }
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
                      strokeWidth={1}
                      onMouseDown={() => {
                        setIsDrawing(true);
                        draw(i);
                      }}
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
            <Stage width={previewSize} height={previewSize} ref={stageRef}>
              <Layer>
                {dots.map((dot, i) => (
                  <Rect
                    key={i}
                    x={i % gridLength * previewGridSize}
                    y={Math.floor(i / gridLength) * previewGridSize}
                    width={previewGridSize}
                    height={previewGridSize}
                    fill={dot}
                  />
                ))}
              </Layer>
            </Stage>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
