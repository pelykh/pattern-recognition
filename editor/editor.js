class Editor {
  constructor(props) {
    this.canvas = props.canvas;
    this.histCanvas = props.histCanvas;
    this.history = [cv.imread(this.canvas.id)];
    this.historyIndex = 0;
  }

  addToHistory(src) {
    this.clearHistory(this.historyIndex);
    this.history.push(src);
    this.historyIndex = this.history.length - 1;
  }

  clearHistory(index=-1) {
    const removeHistory = this.history.slice(index+1);
    removeHistory.forEach((src) => src.delete());
    this.history = this.history.slice(0, index+1);
  }

  getCurrent() {
    return this.history[this.historyIndex];
  }

  showCurrent() {
    this.histCanvas.style.display = 'none';
    cv.imshow(this.canvas.id, this.getCurrent());
  }

  showHist(hist) {
    this.histCanvas.style.display = 'block';
    cv.imshow(this.histCanvas.id, hist);
  }

  undo() {
    this.historyIndex -= 1;
    if (this.historyIndex < 0) this.historyIndex = 0;
    this.showCurrent();
  }

  redo() {
    this.historyIndex += 1;
    const maxIndex = this.history.length - 1;
    if (this.historyIndex > maxIndex) this.historyIndex = maxIndex;
    this.showCurrent();
  }

  executeOperation(method, props) {
    const { dst, hist} = method({
      ...props,
      src: this.getCurrent(),
      canvas: this.canvas,
    });

    this.addToHistory(dst);
    this.showCurrent();

    if (hist) {
      this.showHist(hist);
    }
  }

  getCursorPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }
}

class Operation {
  constructor(props) {
    this.editor = props.editor;
    this.method = props.method;
    this.button = props.button;

    if (this.button) {
      this.button.addEventListener('click', () => this.onOperationButtonClick());
    }
  }

  onOperationButtonClick() {
    this.editor.executeOperation(this.method, {power: 3});
  }
}

class PickPointsOperation extends Operation {
  constructor(props) {
    super(props);
    this.number = props.number;
  }

  onOperationButtonClick() {
    const points = [];

    const pickPointsHandler = (event) => {
      points.push(this.editor.getCursorPosition(event));

      if (points.length >= this.number) {
        canvas.removeEventListener('click', pickPointsHandler);
        this.editor.executeOperation(this.method, {points});
      }
    };

    canvas.addEventListener('click', pickPointsHandler);
  }
}
