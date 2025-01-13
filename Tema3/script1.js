let selectedImage;
let editedImage;
let currentRotation = 0;

async function fetchRandomDogImage() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await response.json();
        const imageUrl = data.message;

        selectedImage = await loadImage(imageUrl);
        displayImage(selectedImage);
        editedImage = selectedImage;
    } catch (error) {
        console.error('Error fetching dog image:', error);
    }
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
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    editedImage = cloneImage(image);
}

function cloneImage(originalImage) {
    const newImage = new Image();
    newImage.src = originalImage.src;
    return newImage;
}

function mirrorImagePixels(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const mirroredData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const mirroredIndex = (y * canvas.width + (canvas.width - x - 1)) * 4;
            mirroredData[index] = data[mirroredIndex];
            mirroredData[index + 1] = data[mirroredIndex + 1];
            mirroredData[index + 2] = data[mirroredIndex + 2];
            mirroredData[index + 3] = data[mirroredIndex + 3];
        }
    }

    const mirroredImageData = new ImageData(mirroredData, canvas.width, canvas.height);
    ctx.putImageData(mirroredImageData, 0, 0);
    const mirroredImage = new Image();
    mirroredImage.src = canvas.toDataURL();
    return mirroredImage;
}

function mirrorImage() {
    editedImage = mirrorImagePixels(editedImage);
    displayImage(editedImage);
}


function rotateImage() {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    currentRotation += 90;
    if (currentRotation === 360) {
        currentRotation = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.PI / 180) * currentRotation);
    ctx.drawImage(editedImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.rotate(-(Math.PI / 180) * currentRotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

function SobelOperator() { 
   
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const width = imageData.width;
const height = imageData.height;
const sobelData = [];
const grayscaleData = [];

// Convert to grayscale
for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    grayscaleData.push(avg, avg, avg, 255);
}

// Sobel operator kernels
const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];

const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];

// Apply Sobel operator
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const pixelX = (
            (sobelX[0][0] * getPixel(grayscaleData, x - 1, y - 1, width)) +
            (sobelX[0][1] * getPixel(grayscaleData, x, y - 1, width)) +
            (sobelX[0][2] * getPixel(grayscaleData, x + 1, y - 1, width)) +
            (sobelX[1][0] * getPixel(grayscaleData, x - 1, y, width)) +
            (sobelX[1][1] * getPixel(grayscaleData, x, y, width)) +
            (sobelX[1][2] * getPixel(grayscaleData, x + 1, y, width)) +
            (sobelX[2][0] * getPixel(grayscaleData, x - 1, y + 1, width)) +
            (sobelX[2][1] * getPixel(grayscaleData, x, y + 1, width)) +
            (sobelX[2][2] * getPixel(grayscaleData, x + 1, y + 1, width))
        );

        const pixelY = (
            (sobelY[0][0] * getPixel(grayscaleData, x - 1, y - 1, width)) +
            (sobelY[0][1] * getPixel(grayscaleData, x, y - 1, width)) +
            (sobelY[0][2] * getPixel(grayscaleData, x + 1, y - 1, width)) +
            (sobelY[1][0] * getPixel(grayscaleData, x - 1, y, width)) +
            (sobelY[1][1] * getPixel(grayscaleData, x, y, width)) +
            (sobelY[1][2] * getPixel(grayscaleData, x + 1, y, width)) +
            (sobelY[2][0] * getPixel(grayscaleData, x - 1, y + 1, width)) +
            (sobelY[2][1] * getPixel(grayscaleData, x, y + 1, width)) +
            (sobelY[2][2] * getPixel(grayscaleData, x + 1, y + 1, width))
        );

        const magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;

        sobelData.push(magnitude, magnitude, magnitude, 255);
    }
}

const newImageData = new ImageData(new Uint8ClampedArray(sobelData), width, height);
ctx.putImageData(newImageData, 0, 0);

function getPixel(data, x, y, width) {
if (x < 0 || y < 0 || x >= width || y >= height) {
    return 0;
}
return data[(y * width + x) * 4];
}

}

// function showLoadingMessage() {
//     const canvas = document.getElementById('preview-canvas');
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.font = '40px Arial';
//     ctx.fillStyle = 'black';
//     ctx.textAlign = 'center';
//     ctx.fillText('Loading image, please wait...', canvas.width / 2, canvas.height / 2);
// }

// showLoadingMessage();
setTimeout(fetchRandomDogImage, 1000); // Delay fetching image to allow the page to load

// window.addEventListener('load', fetchRandomDogImage);