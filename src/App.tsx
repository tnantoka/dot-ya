import React, { useState, useRef, CSSProperties, RefObject } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
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
import { ChromePicker } from 'react-color';

import './App.css';
import { KonvaEventObject } from 'konva/types/Node';

const App = () => {
  const canvasSize = 300;
  const gridLength = 16;
  const gridSize = 300 / gridLength;

  const previewSize = gridLength * 2;
  const previewGridSize = previewSize / gridLength;

  const [dots, setDots] = useState(fill(Array(gridLength ** 2), '#ffffff'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState([dots]);
  const [historyStep, setHistoryStep] = useState(0);

  const stageRef = useRef() as RefObject<Stage>;

  const draw = (i: number) => {
    if (dots[i] === color) {
      return;
    }
    const newDots = [...dots];
    newDots[i] = color;
    setDots(newDots);

    const newHistory = history.slice(0, historyStep + 1).concat([newDots]);
    setHistory(newHistory);
    setHistoryStep(historyStep + 1);
  };

  const onMouseMove = (i: number, e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    if (!isDrawing) {
      return;
    }
    draw(i);
  };

  const download = () => {
    if (stageRef && stageRef.current) {
      const dataURL = (stageRef.current as any).toDataURL();
      const link = document.createElement('a');
      link.download = 'pixelart.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const undo = () => {
    if (historyStep < 1) {
      return;
    }
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    setDots(history[newStep]);
  };

  const redo = () => {
    if (historyStep > history.length - 2) {
      return;
    }
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    setDots(history[newStep]);
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
            <div
              className="d-flex justify-content-center py-4"
              style={{ background: 'gray' }}
              onMouseMove={() => setIsDrawing(false)}
            >
              <Stage width={canvasSize} height={canvasSize}>
                <Layer>
                  {dots.map((dot, i) => (
                    <Rect
                      key={i}
                      x={(i % gridLength) * gridSize}
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
              <button
                style={{ background: color, height: '1rem' }}
                onClick={() => setIsShowColorPicker(!isShowColorPicker)}
              />
              {isShowColorPicker ? (
                <div style={popoverStyle}>
                  <div
                    style={coverStyle}
                    onClick={() => setIsShowColorPicker(false)}
                  />
                  <ChromePicker
                    color={color}
                    onChange={color => setColor(color.hex)}
                  />
                </div>
              ) : null}
            </div>
            <Stage width={previewSize} height={previewSize} ref={stageRef}>
              <Layer>
                {dots.map((dot, i) => (
                  <Rect
                    key={i}
                    x={(i % gridLength) * previewGridSize}
                    y={Math.floor(i / gridLength) * previewGridSize}
                    width={previewGridSize}
                    height={previewGridSize}
                    fill={dot}
                  />
                ))}
              </Layer>
            </Stage>
            <Button color="primary" onClick={download}>
              Download
            </Button>
            <Button color="primary" onClick={undo}>
              <i className="fas fa-undo" />
            </Button>
            <Button color="primary" onClick={redo}>
              <i className="fas fa-redo" />
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default App;
