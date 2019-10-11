function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return {x, y};
}

const canvas = document.getElementById("editor-canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const loadImageFromFile = () => {
  const ctx = canvas.getContext("2d");
  const img = document.getElementById("pic");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

loadImageFromFile();


const perspectiveTransformButton = document.getElementById('perspective-transform-button');

// Pick points to perform perspective transformations
perspectiveTransformButton.addEventListener('click', () => {
  const points = [];

  const pickPointsHandler = (event) => {
    points.push(getCursorPosition(canvas, event));

    if (points.length >= 4) {
      canvas.removeEventListener('click', pickPointsHandler);
      perspectiveTransform(points, canvas);
    }
  };

  canvas.addEventListener('click', pickPointsHandler);
});

const bilinearTransformButton = document.getElementById('bilinear-transform-button');

// Pick points to perform biliniar transformations
bilinearTransformButton.addEventListener('click', () => {
  const points = [];

  const pickPointsHandler = (event) => {
    points.push(getCursorPosition(canvas, event));

    if (points.length >= 4) {
      canvas.removeEventListener('click', pickPointsHandler);
      bilinearTransform(points, canvas);
    }
  };

  canvas.addEventListener('click', pickPointsHandler);
});

document.getElementById('revert-button')
  .addEventListener('click', loadImageFromFile);

document.getElementById(('erosion-button'))
  .addEventListener('click', () => erosion(canvas));

document.getElementById(('dilation-button'))
  .addEventListener('click', () => dilation(canvas));

document.getElementById(('opening-button'))
  .addEventListener('click', () => opening(canvas));

document.getElementById(('closing-button'))
  .addEventListener('click', () => closing(canvas));

document.getElementById(('median-blur-button'))
  .addEventListener('click', () => medianBlur(canvas, 3));

document.getElementById(('blur-video-button'))
  .addEventListener('click', () => blurVideo(canvas, 11));
