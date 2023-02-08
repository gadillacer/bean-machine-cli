const fs = require("fs");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);

const { createCanvas, loadImage } = require("canvas");
const { format, preview_gif } = require(`${FOLDERS.sourceDir}/artwork_config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

const ArtGiffer = require(`${FOLDERS.modulesDir}/ArtGiffer.js`);
let artGiffer = null;

const loadImg = async (_img) => {
  return new Promise(async (resolve) => {
    const loadedImage = await loadImage(`${_img}`);
    resolve({ loadedImage: loadedImage });
  });
};

// read image paths
const imageList = [];
const rawdata = fs.readdirSync(FOLDERS.imagesDir).forEach((file) => {
  imageList.push(loadImg(`${FOLDERS.imagesDir}/${file}`));
});

const saveProjectPreviewGIF = async (_data) => {
  // Extract from preview config
  const { numberOfImages, order, repeat, quality, delay, imageName } =
    preview_gif;
  // Extract from format config
  const { width, height } = format;
  // Prepare canvas
  const previewCanvasWidth = width;
  const previewCanvasHeight = height;

  if (_data.length < numberOfImages) {
    console.log(
      `You do not have enough images to create a gif with ${numberOfImages} images.`
    );
  } else {
    // Shout from the mountain tops
    console.log(
      `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${_data.length} images.`
    );
    const previewPath = `${FOLDERS.buildDir}/${imageName}`;

    ctx.clearRect(0, 0, width, height);

    artGiffer = new ArtGiffer(
      canvas,
      ctx,
      `${previewPath}`,
      repeat,
      quality,
      delay
    );
    artGiffer.start();

    await Promise.all(_data).then((renderObjectArray) => {
      // Determin the order of the Images before creating the gif
      if (order == "ASC") {
        // Do nothing
      } else if (order == "DESC") {
        renderObjectArray.reverse();
      } else if (order == "MIXED") {
        renderObjectArray = renderObjectArray.sort(() => Math.random() - 0.5);
      }

      // Reduce the size of the array of Images to the desired amount
      if (parseInt(numberOfImages) > 0) {
        renderObjectArray = renderObjectArray.slice(0, numberOfImages);
      }

      renderObjectArray.forEach((renderObject, index) => {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(
          renderObject.loadedImage,
          0,
          0,
          previewCanvasWidth,
          previewCanvasHeight
        );
        artGiffer.add();
      });
    });
    artGiffer.stop();
  }
};

saveProjectPreviewGIF(imageList);
