function perspectiveTransform({src, canvas, points}) {
  const {width, height} = canvas;
  const finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height]);
  const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y]);
  const dsize = new cv.Size(width, height);
  const M = cv.getPerspectiveTransform(srcCoords, finalDestCoords);
  const dst = new cv.Mat();
  cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  finalDestCoords.delete();
  srcCoords.delete();
  M.delete();
  return {dst};
}

function erosion({src}) {
  const dst = new cv.Mat();
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.erode(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  M.delete();
  return {dst};
}

function dilation({src}) {
  const dst = new cv.Mat();
  const M = cv.Mat.ones(5, 5, cv.CV_8U);
  const anchor = new cv.Point(-1, -1);
  cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  M.delete();
  return {dst};
}

function opening({src}) {
  const dst = new cv.Mat();
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.morphologyEx(src, dst, cv.MORPH_OPEN, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  M.delete();
  return {dst};
}

function closing({src}) {
  const dst = new cv.Mat();
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(src, dst, cv.MORPH_CLOSE, M);
  M.delete();
  return {dst};
}

// number should be odd
function medianBlur({src, power}) {
  const dst = new cv.Mat();
  cv.medianBlur(src, dst, power);
  return {dst};
}

function blurVideo(canvas, number = 3) {
  const {id} = canvas;
  const pics = [cv.imread(id)];

  for (let i = 1; i < 10; i++) {
    const dst = new cv.Mat();
    cv.medianBlur(pics[i - 1], dst, number);
    pics.push(dst);
  }

  let i = 0;

  return setInterval(() => {
    console.log(i, pics[i]);
    cv.imshow(id, pics[i]);
    i += 1;
    if (i >= 10) i = 0;
  }, 100);
}

function bilinearMapX(height, width, points) {
  const mapX = [];
  const getLine = (a, b, size) => (k) => a + (b - a) * k / size;
  const getA = getLine(points[0].x, points[3].x, height);
  const getB = getLine(points[1].x, points[2].x, height);

  for (let i = 0; i < height; i++) {
    mapX[i] = [];
    const a = getA(i);
    const b = getB(i);
    const line = getLine(a, b, width);

    for (let j = 0; j < width; j++) {
      mapX[i][j] = 2 * j - line(j);
    }
  }

  return cv.matFromArray(height, width, cv.CV_32FC1, mapX.flat());
}

function bilinearMapY(height, width, points) {
  const mapY = [];
  const getLine = (a, b, size) => (k) => a + (b - a) * k / size;
  const getA = getLine(points[0].y, points[1].y, width);
  const getB = getLine(points[3].y, points[2].y, width);

  for (let i = 0; i < height; i++) {
    mapY[i] = [];
    const a = getA(i);
    const b = getB(i);
    const line = getLine(a, b, height);

    for (let j = 0; j < width; j++) {
      mapY[i][j] = i;
    }
  }

  return cv.matFromArray(height, width, cv.CV_32FC1, mapY.flat());
}

// TODO
function bilinearTransform({src, canvas, points}) {
  const {width, height} = canvas;
  const dst = new cv.Mat();
  const mapX = bilinearMapX(height, width, points);
  const mapY = bilinearMapY(height, width, points);

  cv.remap(src, dst, mapX, mapY, cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar());
  mapX.delete();
  mapY.delete();
  return {dst};
}

function grayImage({src}) {
  const dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
  const hist = getHist(dst);
  return {dst, hist};
}

function normilize({src}) {
  let dst = new cv.Mat();
  let none = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
  cv.normalize(dst, dst, 255, 0, cv.NORM_MINMAX, -1, none);
  none.delete();
  const hist = getHist(dst);
  return {dst, hist};
}

function equalize({src}) {
  const dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(dst, dst);
  const hist = getHist(dst);
  return {dst, hist};
}

function getHist(src) {
  let srcVec = new cv.MatVector();
  srcVec.push_back(src);
  let hist = new cv.Mat();
  let mask = new cv.Mat();
  let scale = 2;

  cv.calcHist(srcVec, [0], mask, hist, [256], [0, 255], false);

  const color = new cv.Scalar(255, 255, 255);
  let result = cv.minMaxLoc(hist, mask);
  let max = result.maxVal;
  let dst = new cv.Mat.zeros(src.rows, 256 * scale, cv.CV_8UC3);

  for (let i = 0; i < 256; i++) {
    let binVal = hist.data32F[i] * src.rows / max;
    let point1 = new cv.Point(i * scale, src.rows - 1);
    let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
    cv.rectangle(dst, point1, point2, color, cv.FILLED);
  }
  hist.delete();
  mask.delete();

  return dst;
}
