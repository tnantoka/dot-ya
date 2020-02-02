import React, {
  useState,
  useRef,
  CSSProperties,
  RefObject,
  ChangeEvent,
} from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import {
  Navbar,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
} from 'reactstrap';
import { Stage, Layer, Rect } from 'react-konva';
import { fill, chunk, escapeRegExp } from 'lodash';
import { ChromePicker } from 'react-color';

import './App.css';
import { KonvaEventObject } from 'konva/types/Node';

const App = () => {
  const canvasSize = 300;
  const gridLength = 16;
  const gridSize = 300 / gridLength;

  const previewSize = gridLength * 2;
  const previewGridSize = previewSize / gridLength;

  const [dots, setDots] = useState(fill(Array(gridLength ** 2), ''));
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [history, setHistory] = useState([dots]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isShowGrid, setIsShowGrid] = useState(true);

  const [pattern, setPattern] = useState('');
  const [replacement, setReplacement] = useState('');

  const stageRef = useRef() as RefObject<Stage>;

  const draw = (i: number) => {
    if (dots[i] === color) {
      return;
    }
    const newDots = [...dots];
    newDots[i] = color;
    setDots(newDots);

    addHistory(newDots);
  };

  const addHistory = (newDots: string[]) => {
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
    loadHistory(historyStep - 1);
  };

  const redo = () => {
    if (historyStep > history.length - 2) {
      return;
    }
    loadHistory(historyStep + 1);
  };

  const loadHistory = (newStep: number) => {
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

  const onChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    changeText(e.target.value);
  };

  const changeText = (text: string) => {
    try {
      const newDots = JSON.parse(text);
      setDots(newDots);
      addHistory(newDots);
    } catch (e) {
      console.error(e);
    }
  };

  const text = `[\n${chunk(dots, gridLength)
    .map(chunkedDots => chunkedDots.map(dot => `"${dot}"`).join(','))
    .join(',\n')}\n]`;

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
              onMouseMove={() => setIsDrawing(false)}
            >
              <Stage
                width={canvasSize}
                height={canvasSize}
                className="bg-white border"
              >
                <Layer>
                  {dots.map((dot, i) => (
                    <Rect
                      key={i}
                      x={(i % gridLength) * gridSize}
                      y={Math.floor(i / gridLength) * gridSize}
                      width={gridSize}
                      height={gridSize}
                      fill={dot}
                      stroke={isShowGrid ? '#dee2e6' : ''}
                      strokeWidth={1}
                      onMouseDown={() => {
                        if (color === 'eyedropper' && dots[i] !== '') {
                          setColor(dots[i]);
                        } else {
                          setIsDrawing(true);
                          draw(i);
                        }
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
            <div className="d-flex justify-content-left">
              <Stage
                width={previewSize}
                height={previewSize}
                ref={stageRef}
                className="border"
              >
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
            </div>
            <Button color="primary" onClick={download}>
              Download
            </Button>
            <Button color="primary" onClick={undo}>
              <i className="fas fa-undo" />
            </Button>
            <Button color="primary" onClick={redo}>
              <i className="fas fa-redo" />
            </Button>
            <Button color="primary" onClick={() => setColor('')}>
              Erace
            </Button>
            <Button color="primary" onClick={() => setColor('eyedropper')}>
              Eyedropper
            </Button>
            <Button color="primary" onClick={() => setIsShowGrid(!isShowGrid)}>
              Grid
            </Button>
          </Col>
        </Row>
        <Row>
          <Input type="textarea" value={text} onChange={onChangeText} />
        </Row>
        <Row>
          <Input
            value={pattern}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPattern(e.target.value)
            }
          />
          <Input
            value={replacement}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setReplacement(e.target.value)
            }
          />
        </Row>
        <Button
          color="primary"
          onClick={() =>
            changeText(
              text.replace(new RegExp(escapeRegExp(pattern), 'g'), replacement)
            )
          }
        >
          Replace
        </Button>
      </Container>
    </>
  );
};

export default App;
