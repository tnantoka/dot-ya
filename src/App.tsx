import React, {
  useState,
  useRef,
  useCallback,
  CSSProperties,
  RefObject,
  ChangeEvent,
} from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Navbar,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  ButtonGroup,
  ButtonToolbar,
} from 'reactstrap';
import { Stage } from 'react-konva';
import { fill, chunk, escapeRegExp } from 'lodash';
import { SketchPicker } from 'react-color';
import { useDropzone } from 'react-dropzone';

import './App.css';
import { KonvaEventObject } from 'konva/types/Node';
import PixelArea from './components/PixelArea';

const App = () => {
  const canvasSize = 300;
  const gridLength = parseInt(window.location.search.slice(1)) || 16;
  const gridSize = 300 / gridLength;

  const [dots, setDots] = useState(fill(Array(gridLength ** 2), ''));
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);
  const [color, setColor] = useState('rgba(0,0,0,1)');
  const [history, setHistory] = useState([dots]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isShowGrid, setIsShowGrid] = useState(true);

  const [pattern, setPattern] = useState('');
  const [replacement, setReplacement] = useState('');
  const [previewSize, setPreviewSize] = useState(gridLength);
  const [mode, setMode] = useState('draw');

  const onDrop = useCallback(
    acceptedFiles => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const dataURL: any = reader.result;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = gridLength;
          canvas.height = gridLength;

          const context: any = canvas.getContext('2d');
          context.drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            0,
            0,
            gridLength,
            gridLength
          );
          const imageData = context.getImageData(0, 0, gridLength, gridLength);

          const newDots = [...dots];
          for (let y = 0; y < gridLength; y++) {
            for (let x = 0; x < gridLength; x++) {
              const dotI = y * gridLength + x;
              const dataI = dotI * 4;
              const r = imageData.data[dataI];
              const g = imageData.data[dataI + 1];
              const b = imageData.data[dataI + 2];
              const a = imageData.data[dataI + 2];
              newDots[dotI] = `rgba(${r},${g},${b},${a})`;
            }
          }
          setDots(newDots);
        };
        img.src = dataURL;
      };
      reader.readAsDataURL(acceptedFiles[0]);
    },
    [dots, gridLength]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const stageRef = useRef() as RefObject<Stage>;

  const previewGridSize = previewSize / gridLength;

  const draw = (i: number) => {
    if (dots[i] === color && mode === 'draw') {
      return;
    }
    const newDots = [...dots];
    newDots[i] = mode === 'eraser' ? '' : color;
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
        <Container>
          <NavbarBrand href="/" className="text-pixel ml-sm-2 ml-md-3">
            ドット屋
          </NavbarBrand>
          <Nav className="ml-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                {gridLength} x {gridLength}
              </DropdownToggle>
              <DropdownMenu right>
                {[16, 32].map(length => (
                  <DropdownItem
                    key={length}
                    tag="a"
                    href={length === 16 ? '.' : `/?${length}`}
                    active={gridLength === length}
                  >
                    {length} x {length}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col>
            <div
              className="d-flex justify-content-center justify-content-md-end py-4"
              onMouseMove={() => setIsDrawing(false)}
            >
              <PixelArea
                width={canvasSize}
                height={canvasSize}
                dots={dots}
                gridLength={gridLength}
                gridSize={gridSize}
                isShowGrid={isShowGrid}
                onMouseDown={(i: number) => {
                  if (mode === 'eyedropper') {
                    setColor(dots[i]);
                    setMode('draw');
                  } else {
                    setIsDrawing(true);
                    draw(i);
                  }
                }}
                onMouseUp={() => setIsDrawing(false)}
                onMouseMove={onMouseMove}
                stageRef={null}
              />
            </div>
          </Col>
          <Col>
            <div className="mt-4 mb-2">
              <button
                style={{ background: color, width: '1.5rem', height: '1.5rem' }}
                onClick={() => setIsShowColorPicker(!isShowColorPicker)}
                className="border"
              />
              {isShowColorPicker ? (
                <div style={popoverStyle}>
                  <div
                    style={coverStyle}
                    onClick={() => setIsShowColorPicker(false)}
                  />
                  <SketchPicker
                    color={color}
                    onChange={color =>
                      setColor(
                        `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
                      )
                    }
                    presetColors={[
                      '#F44336',
                      '#E91E63',
                      '#9C27B0',
                      '#673AB7',
                      '#3F51B5',
                      '#2196F3',
                      '#03A9F4',
                      '#00BCD4',
                      '#009688',
                      '#4CAF50',
                      '#8BC34A',
                      '#CDDC39',
                      '#FFEB3B',
                      '#FFC107',
                      '#FF9800',
                      '#FF5722',
                      '#795548',
                      '#9E9E9E',
                      '#607D8B',
                      '#000000',
                      '#FFFFFF',
                    ]}
                  />
                </div>
              ) : null}
            </div>
            <ButtonToolbar className="mb-3">
              <ButtonGroup>
                <Button
                  color="secondary"
                  onClick={undo}
                  size="sm"
                  className="rounded-0"
                >
                  <i className="fas fa-undo" />
                </Button>
                <Button
                  color="secondary"
                  onClick={redo}
                  size="sm"
                  className="rounded-0"
                >
                  <i className="fas fa-redo" />
                </Button>
                <Button
                  color="secondary"
                  onClick={() => setMode(mode === 'eraser' ? 'draw' : 'eraser')}
                  active={mode === 'eraser'}
                  size="sm"
                  className="rounded-0"
                >
                  <i className="fas fa-eraser" />
                </Button>
                <Button
                  color="secondary"
                  onClick={() =>
                    setMode(mode === 'eyedropper' ? 'draw' : 'eyedropper')
                  }
                  active={mode === 'eyedropper'}
                  size="sm"
                  className="rounded-0"
                >
                  <i className="fas fa-eye-dropper" />
                </Button>
                <Button
                  color="secondary"
                  onClick={() => setIsShowGrid(!isShowGrid)}
                  active={isShowGrid}
                  size="sm"
                  className="rounded-0"
                >
                  <i className="fas fa-border-all" />
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
            <div className="mb-3 d-flex">
              <Input
                type="number"
                min="16"
                value={previewSize.toString()}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPreviewSize(parseFloat(e.target.value) || previewSize)
                }
                className="mr-2 rounded-0 text-monospace"
                bsSize="sm"
                style={{ width: '4rem' }}
              />
              <Button color="primary" onClick={download} size="sm">
                <i className="fas fa-download" />
              </Button>
            </div>
            <div className="d-flex justify-content-start">
              <PixelArea
                width={previewSize}
                height={previewSize}
                dots={dots}
                gridLength={gridLength}
                gridSize={previewGridSize}
                isShowGrid={false}
                onMouseDown={() => {}}
                onMouseUp={() => {}}
                onMouseMove={() => {}}
                stageRef={stageRef}
              />
            </div>
            <div
              {...getRootProps()}
              className={`my-3 py-2 px-3 border rounded-0 text-pixel d-inline-block ${
                isDragActive ? 'text-light bg-secondary' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              <i className="fas fa-upload" /> アップロード
            </div>
          </Col>
        </Row>
        <div className="mb-3">
          <Input
            type="textarea"
            value={text}
            onChange={onChangeText}
            rows={gridLength + 2}
            className="rounded-0 text-monospace"
          />
        </div>
        <div className="mb-5 d-flex align-items-center">
          <Input
            value={pattern}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPattern(e.target.value)
            }
            bsSize="sm"
            className="rounded-0 text-monospace"
          />
          <i className="fas fa-arrow-right mx-2" />
          <Input
            value={replacement}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setReplacement(e.target.value)
            }
            bsSize="sm"
            className="rounded-0 text-monospace"
          />
          <Button
            color="secondary"
            onClick={() =>
              changeText(
                text.replace(
                  new RegExp(escapeRegExp(pattern), 'g'),
                  replacement
                )
              )
            }
            size="sm"
            className="ml-2 text-nowrap rounded-0 text-pixel"
          >
            置換
          </Button>
          <Button
            color="primary"
            onClick={() => {
              const blob = new Blob([text], { type: 'application/json' });
              const link = document.createElement('a');
              link.download = 'pixelart.json';
              link.href = window.URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            size="sm"
            className="ml-2 text-nowrap rounded-0 text-pixel"
          >
            <i className="fas fa-download" /> JSON
          </Button>
        </div>
      </Container>
    </>
  );
};

export default App;
