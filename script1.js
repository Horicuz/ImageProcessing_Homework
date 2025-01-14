let selectedImage;

async function fetchRandomDogImage() {
  const startTime = performance.now(); // Start time for this step
  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    const imageUrl = data.message;

    selectedImage = await loadImage(imageUrl);
    displayImage(selectedImage);
  } catch (error) {
    console.error("Error fetching dog image:", error);
  }
  const endTime = performance.now(); // End time for this step
  logExecutionTime("Fetch Dog Image", endTime - startTime);
}

async function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = imageUrl;
  });
}

function displayImage(image) {
  const canvas = document.getElementById("image-canvas");
  const ctx = canvas.getContext("2d");
  const fixedWidth = 500;
  const fixedHeight = 500;

  // Set the canvas size to fixed dimensions
  canvas.width = fixedWidth;
  canvas.height = fixedHeight;

  // Calculate the aspect ratio of the image
  const aspectRatio = image.width / image.height;

  // Scale the image to fit within the 500x500 box while maintaining its aspect ratio
  let width, height;
  if (aspectRatio > 1) {
    // If the image is wider than it is tall
    width = fixedWidth;
    height = fixedWidth / aspectRatio;
  } else {
    // If the image is taller than it is wide
    height = fixedHeight;
    width = fixedHeight * aspectRatio;
  }

  // Center the image on the canvas
  const xOffset = (fixedWidth - width) / 2;
  const yOffset = (fixedHeight - height) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  ctx.drawImage(image, xOffset, yOffset, width, height); // Draw scaled image
}

async function mirrorImage() {
  const startTime = performance.now(); // Start time for this step

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = selectedImage.width;
  canvas.height = selectedImage.height;

  // Draw the original image to the canvas
  ctx.drawImage(selectedImage, 0, 0);

  // Get image data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Mirror the image pixel by pixel
  const width = canvas.width;
  const height = canvas.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {
      const leftIndex = (y * width + x) * 4;
      const rightIndex = (y * width + (width - 1 - x)) * 4;

      // Swap the left and right pixels (R, G, B, A channels)
      for (let i = 0; i < 4; i++) {
        const temp = data[leftIndex + i];
        data[leftIndex + i] = data[rightIndex + i];
        data[rightIndex + i] = temp;
      }
    }
  }

  // Put the modified image data back to the canvas
  ctx.putImageData(imageData, 0, 0);

  // Create a new image element to load the mirrored image
  const mirroredImage = new Image();
  mirroredImage.onload = () => {
    selectedImage = mirroredImage; // Update the selectedImage with the mirrored version
    displayImage(selectedImage); // Display the mirrored image
  };

  // Set the mirrored image source as the canvas data URL
  mirroredImage.src = canvas.toDataURL();

  const endTime = performance.now(); // End time for this step
  logExecutionTime("Mirror Image", endTime - startTime);
}

async function mirrorImagePixels(image) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0);

    const mirroredImage = new Image();
    mirroredImage.onload = () => resolve(mirroredImage);
    mirroredImage.src = canvas.toDataURL();
  });
}

function SobelOperator() {
  const startTime = performance.now(); // Start time for Sobel Operator
  const canvas = document.getElementById("image-canvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const width = imageData.width;
  const height = imageData.height;
  const sobelData = [];
  const grayscaleData = [];

  // Convert to grayscale
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    grayscaleData.push(avg, avg, avg, 255);
  }

  // Sobel operator kernels
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  // Apply Sobel operator
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelX =
        sobelX[0][0] * getPixel(grayscaleData, x - 1, y - 1, width) +
        sobelX[0][1] * getPixel(grayscaleData, x, y - 1, width) +
        sobelX[0][2] * getPixel(grayscaleData, x + 1, y - 1, width) +
        sobelX[1][0] * getPixel(grayscaleData, x - 1, y, width) +
        sobelX[1][1] * getPixel(grayscaleData, x, y, width) +
        sobelX[1][2] * getPixel(grayscaleData, x + 1, y, width) +
        sobelX[2][0] * getPixel(grayscaleData, x - 1, y + 1, width) +
        sobelX[2][1] * getPixel(grayscaleData, x, y + 1, width) +
        sobelX[2][2] * getPixel(grayscaleData, x + 1, y + 1, width);

      const pixelY =
        sobelY[0][0] * getPixel(grayscaleData, x - 1, y - 1, width) +
        sobelY[0][1] * getPixel(grayscaleData, x, y - 1, width) +
        sobelY[0][2] * getPixel(grayscaleData, x + 1, y - 1, width) +
        sobelY[1][0] * getPixel(grayscaleData, x - 1, y, width) +
        sobelY[1][1] * getPixel(grayscaleData, x, y, width) +
        sobelY[1][2] * getPixel(grayscaleData, x + 1, y, width) +
        sobelY[2][0] * getPixel(grayscaleData, x - 1, y + 1, width) +
        sobelY[2][1] * getPixel(grayscaleData, x, y + 1, width) +
        sobelY[2][2] * getPixel(grayscaleData, x + 1, y + 1, width);

      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY) >>> 0;

      sobelData.push(magnitude, magnitude, magnitude, 255);
    }
  }

  const newImageData = new ImageData(
    new Uint8ClampedArray(sobelData),
    width,
    height
  );
  ctx.putImageData(newImageData, 0, 0);

  const endTime = performance.now(); // End time for Sobel Operator
  logExecutionTime("Sobel Operator", endTime - startTime);

  function getPixel(data, x, y, width) {
    if (x < 0 || y < 0 || x >= width || y >= data.length / (4 * width)) {
      return 0;
    }
    return data[(y * width + x) * 4];
  }
}

async function processImageInSlices() {
  const canvas = document.getElementById("image-canvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const width = imageData.width;
  const height = imageData.height;
  const sliceHeight = Math.ceil(height / 4); // Divide image into 4 slices
  const outputData = new Uint8ClampedArray(imageData.data);

  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  const startTime = performance.now(); // Start time for this step

  // Create a temporary canvas to manipulate the image without rendering immediately
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 4; i++) {
    const renderStartY = i * sliceHeight; // Start of region
    const renderEndY = Math.min(height, (i + 1) * sliceHeight); // End  region

    for (let y = renderStartY; y < renderEndY; y++) {
      for (let x = 0; x < width; x++) {
        let pixelX = 0;
        let pixelY = 0;

        // Apply Sobel filter
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const xk = x + kx;
            const yk = y + ky;
            if (xk >= 0 && xk < width && yk >= 0 && yk < height) {
              const kIndex = (yk * width + xk) * 4;
              const intensity =
                0.299 * imageData.data[kIndex] +
                0.587 * imageData.data[kIndex + 1] +
                0.114 * imageData.data[kIndex + 2]; // Weighted RGB -> Grayscale

              pixelX += intensity * sobelX[ky + 1][kx + 1];
              pixelY += intensity * sobelY[ky + 1][kx + 1];
            }
          }
        }

        // Calculate magnitude
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        const clampedMagnitude = Math.min(255, Math.max(0, magnitude)) >>> 0;

        const index = (y * width + x) * 4;
        outputData[index] = clampedMagnitude; // R
        outputData[index + 1] = clampedMagnitude; // G
        outputData[index + 2] = clampedMagnitude; // B
      }
    }

    for (let y = renderStartY; y < renderEndY; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        imageData.data[index] = outputData[index];
        imageData.data[index + 1] = outputData[index + 1];
        imageData.data[index + 2] = outputData[index + 2];
      }
    }

    // Render updated slice to the canvas
    ctx.putImageData(imageData, 0, 0);

    // Add a delay between processing slices
    if (i < 3) await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
  }

  const endTime = performance.now(); // End time for this step
  logExecutionTime("Process Image in Slices", endTime - startTime);
}

async function processImageInSlices2() {
  const canvas = document.getElementById("image-canvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const width = canvas.width;
  const height = canvas.height;
  const sliceHeight = Math.floor(height / 4); // Calculate base slice height (rounded down)

  const startTime = performance.now(); // Start time for this step

  // Create a temporary canvas to manipulate the image without rendering immediately
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 4; i++) {
    // Define slice range with no overlap
    const startY = i * sliceHeight;
    let endY = (i + 1) * sliceHeight;

    // Adjust the last slice to cover the rest of the image
    if (i === 3) {
      endY = height; // Ensure the last slice covers the entire remaining height
    }

    const sliceImageData = tempCtx.getImageData(
      0,
      startY,
      width,
      endY - startY
    );

    // Process the slice: mirror effect
    for (let y = 0; y < sliceImageData.height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftIndex = (y * width + x) * 4;
        const rightIndex = (y * width + (width - 1 - x)) * 4;

        // Swap the left and right pixels (R, G, B, A channels)
        for (let j = 0; j < 4; j++) {
          const temp = sliceImageData.data[leftIndex + j];
          sliceImageData.data[leftIndex + j] =
            sliceImageData.data[rightIndex + j];
          sliceImageData.data[rightIndex + j] = temp;
        }
      }
    }

    // Put the processed slice back to the temporary canvas
    tempCtx.putImageData(sliceImageData, 0, startY);

    // Now update the main canvas for the current slice
    ctx.putImageData(sliceImageData, 0, startY);

    // Add a delay between processing slices
    if (i < 3) await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
  }

  const endTime = performance.now(); // End time for this step
  logExecutionTime("Mirror Image in Slices", endTime - startTime);
}

// New logExecutionTime function
function logExecutionTime(operationName, duration) {
  const logContainer = document.getElementById("log-container");
  const logEntry = document.createElement("div");
  logEntry.textContent = `${operationName}: ${duration.toFixed(2)} ms`;
  logContainer.appendChild(logEntry);
}

// Initialize the process
setTimeout(fetchRandomDogImage, 1000); // Delay fetching image to allow the page to load
