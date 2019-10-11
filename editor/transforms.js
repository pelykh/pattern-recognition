function perspectiveTransform(points, canvas) {
  const { id, width, height } = canvas;
  const src = cv.imread(id);

  const finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height]);
  const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y]);
  const dsize = new cv.Size(width, height);
  const M = cv.getPerspectiveTransform(srcCoords, finalDestCoords);
  cv.warpPerspective(src, src, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  cv.imshow(id, src);

  finalDestCoords.delete();
  srcCoords.delete();
  M.delete();
  src.delete();
}

function bilinearTransform(points, canvas) {
  const { id, width, height } = canvas;
  const src = cv.imread(id);
  const dst = new cv.Mat();
  const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height]);
  const DestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y]);

  cv.remap(src, dst, srcCoords, DestCoords, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  cv.imshow(id, src);

  DestCoords.delete();
  srcCoords.delete();
  src.delete();
}

function erosion(canvas) {
  const { id } = canvas;
  const src = cv.imread(id);
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.erode(src, src, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.imshow(id, src);
  src.delete(); M.delete();
}

function dilation(canvas) {
  const { id } = canvas;
  const src = cv.imread(id);
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.dilate(src, src, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.imshow(id, src);
  src.delete(); M.delete();
}

function opening(canvas) {
  const { id } = canvas;
  const src = cv.imread(id);
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
  cv.morphologyEx(src, src, cv.MORPH_OPEN, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.imshow(id, src);
  src.delete(); M.delete();
}

function closing(canvas) {
  const { id } = canvas;
  const src = cv.imread(id);
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.morphologyEx(src, src, cv.MORPH_CLOSE, M);
  cv.imshow(id, src);
  src.delete(); M.delete();
}

function medianBlur(canvas, number=3) {
  const { id } = canvas;
  const src = cv.imread(id);
  const dst = new cv.Mat();

  cv.medianBlur(src, dst, number);
  cv.imshow(id, dst);
  src.delete(); dst.delete();
}

function blurVideo(canvas, number=3) {
  const { id } = canvas;
  const pics = [cv.imread(id)];

  for (let i = 1; i < 10; i++) {
    const dst = new cv.Mat();
    cv.medianBlur(pics[i-1], dst, number);
    pics.push(dst);
  }

  let i = 0;

  return setInterval(() => {
    console.log(i, pics[i]);
    cv.imshow(id, pics[i]);
    i+=1;
    if (i >= 10) i = 0;
  }, 100);
}
