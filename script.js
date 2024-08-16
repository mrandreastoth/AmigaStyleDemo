document.addEventListener("DOMContentLoaded", function () {
    const displayCanvas = document.getElementById('demoCanvas');
    const displayCtx = displayCanvas.getContext('2d');

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = 800; // Fixed dimension
    offscreenCanvas.height = 600; // Fixed dimension

    function resizeDisplayCanvas() {
        displayCanvas.width = window.innerWidth;
        displayCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeDisplayCanvas);
    resizeDisplayCanvas(); // Initialize canvas size on start

    const Directions = {
        NONE: 0,
        TOP: 1,
        BOTTOM: 2,
        LEFT: 3,
        RIGHT: 4
    };

    let text = "Hello, this is a classic Amiga style sine text scroller with copper bars!";
    let instructions = "   Keys/click: Left/Right for scroller, Up/Down for copper.   ";
    let time = 0;
    let scrollerSpeed = 60.0;
    let copperSpeed = 2.0;
    let flashOpacity = 0;
    let activeDirection = Directions.NONE;

    let font_width, font_height, baseline_offset;
    const fontSize = 48; // Consistent font size
    const letter_spacing = 4; // Configurable spacing between characters

    const frequency = 0.05;
    const amplitude = 50;

    let y_offset;
    let characterBitmap = {}; // Define the characterBitmap object here

    const checkFrequency = 30; // Check font every 30 frames
    let frameCount = 0;

    let fontTestReady = false;
    const fontTestCanvas1 = document.createElement('canvas');
    const fontTestCtx1 = fontTestCanvas1.getContext('2d');
    fontTestCanvas1.width = 50;
    fontTestCanvas1.height = 50;

    const fontTestCanvas2 = document.createElement('canvas');
    const fontTestCtx2 = fontTestCanvas2.getContext('2d');
    fontTestCanvas2.width = 50;
    fontTestCanvas2.height = 50;

    function x_to_index(x) {
        const total_width = offscreenCanvas.width + 2 * font_width;
        let index = Math.round(((x % total_width) + total_width) % total_width);
        return index;
    }

    function recalculateYOffset() {
        y_offset = new Array(offscreenCanvas.width + 2 * font_width); // Initialize y_offset array here

        for (let x = -font_width; x < offscreenCanvas.width + font_width; x++) {
            const index = x_to_index(x);
            y_offset[index] = Math.sin(x * frequency * (scrollerSpeed / 100)) * amplitude;
        }
    }

    function calculateFontDimensions() {
        let unionTop = 0;
        let unionBottom = 0;
        let unionRight = 0;

        const uniqueChars = [...new Set(text.split(''))];
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontSize}px 'Press Start 2P'`;

        uniqueChars.forEach(char => {
            const metrics = tempCtx.measureText(char);

            const boundingBox = {
                top: -metrics.actualBoundingBoxAscent,
                bottom: metrics.actualBoundingBoxDescent,
                right: Math.ceil(metrics.width)
            };

            unionTop = Math.max(unionTop, Math.abs(boundingBox.top));
            unionBottom = Math.max(unionBottom, boundingBox.bottom);
            unionRight = Math.max(unionRight, boundingBox.right);
        });

        font_width = unionRight + letter_spacing;
        font_height = unionTop + unionBottom;
        baseline_offset = unionTop;
    }

    function initializeCharacterBitmaps() {
        const uniqueChars = [...new Set(text.split(''))];
        uniqueChars.forEach(char => {
            const charCanvas = document.createElement('canvas');
            charCanvas.width = font_width;
            charCanvas.height = font_height;
            const charCtx = charCanvas.getContext('2d');
            charCtx.font = `${fontSize}px 'Press Start 2P'`;
            charCtx.fillStyle = "white";
            const textWidth = charCtx.measureText(char).width;
            const centeredX = (font_width - textWidth) / 2;
            charCtx.fillText(char, centeredX, baseline_offset);
            characterBitmap[char] = charCanvas;
        });
    }

    function sign(px, py, ax, ay, bx, by) {
        return (px - bx) * (ay - by) - (ax - bx) * (py - by);
    }

    function isPointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
        const b1 = sign(px, py, ax, ay, bx, by) < 0.0;
        const b2 = sign(px, py, bx, by, cx, cy) < 0.0;
        const b3 = sign(px, py, cx, cy, ax, ay) < 0.0;
        return ((b1 === b2) && (b2 === b3));
    }

    function renderStaticTestImage() {
        fontTestCtx1.clearRect(0, 0, fontTestCanvas1.width, fontTestCanvas1.height);
        fontTestCtx1.font = `${fontSize}px 'Press Start 2P'`;
        fontTestCtx1.fillText("M", 10, 30);
    }

    function renderDynamicTestImage() {
        fontTestCtx2.clearRect(0, 0, fontTestCanvas2.width, fontTestCanvas2.height);
        fontTestCtx2.font = `${fontSize}px 'Press Start 2P'`;
        fontTestCtx2.fillText("M", 10, 30);
    }

    function compareFontRendering() {
        renderDynamicTestImage();

        const data1 = fontTestCtx1.getImageData(0, 0, fontTestCanvas1.width, fontTestCanvas1.height).data;
        const data2 = fontTestCtx2.getImageData(0, 0, fontTestCanvas2.width, fontTestCanvas2.height).data;

        for (let i = 0; i < data1.length; i++) {
            if (data1[i] !== data2[i]) {
                console.log("Demo is resetting due to potential font rendering issue."); // Log line added here
                restartDemo();
                return;
            }
        }
        fontTestReady = true;
    }

    function restartDemo() {
        calculateFontDimensions();
        initializeCharacterBitmaps();
        recalculateYOffset();
        renderStaticTestImage();
        fontTestReady = false; // Ensure font test is reset after restarting
    }

    function update() {
        time += 0.05;
        if (flashOpacity > 0) {
            flashOpacity -= 0.01;
        } else {
            activeDirection = Directions.NONE;
        }
    }

    function render() {
        update();
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        drawCopperBars();
        drawScrollingText();
        drawInstructions();

        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        displayCtx.drawImage(offscreenCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
        drawActiveTriangle();

        frameCount++;
        if (frameCount % checkFrequency === 0 && !fontTestReady) {
            compareFontRendering();
        }

        requestAnimationFrame(render);
    }

    function drawScrollingText() {
        let baseX = offscreenCanvas.width - ((time * scrollerSpeed) % (text.length * (font_width + letter_spacing) + offscreenCanvas.width));

        for (let i = 0; i < text.length; i++) {
            let x = baseX + i * (font_width + letter_spacing);
            drawCharacterWithSineWave(x, text[i]);
        }
    }

    function drawCharacterWithSineWave(x, character) {
        for (let p = 0; p < font_width; p++) {
            let index = x_to_index(x + p);
            let yOffset = y_offset[index];

            offscreenCtx.drawImage(
                characterBitmap[character],
                p, 0, 1, font_height,
                x + p, (offscreenCanvas.height / 2) + yOffset - baseline_offset,
                1, font_height
            );
        }
    }

    function drawInstructions() {
        offscreenCtx.font = "16px 'Press Start 2P'";
        offscreenCtx.fillStyle = "white";
        let amplitude = (offscreenCanvas.width - offscreenCtx.measureText(instructions).width) / 2;
        let instructionX = (offscreenCanvas.width / 2) + Math.sin(time * 0.5) * amplitude;
        offscreenCtx.fillText(instructions, instructionX - offscreenCtx.measureText(instructions).width / 2, offscreenCanvas.height - 30);
    }

    function drawCopperBars() {
        let barHeight = 15;
        let numBars = 20;
        let barSpacing = 5;
        let barFrequency = 0.2;
        let barAmplitude = 40;
        let centerY = offscreenCanvas.height / 2 - (numBars * (barHeight + barSpacing) / 2);

        for (let i = 0; i < numBars; i++) {
            let yOffset = Math.sin((time + i * 0.2) * barFrequency + time * copperSpeed) * barAmplitude;
            let yPosition = centerY + i * (barHeight + barSpacing) + yOffset;
            let hue = (time * 10 + i * 5) % 360;
            let gradient = offscreenCtx.createLinearGradient(0, yPosition, 0, yPosition + barHeight);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
            gradient.addColorStop(0.5, `hsl(${hue}, 100%, 20%)`);
            gradient.addColorStop(1, `hsl(${hue}, 100%, 0%)`);
            offscreenCtx.fillStyle = gradient;
            offscreenCtx.fillRect(0, yPosition, offscreenCanvas.width, barHeight);
        }
    }

    function drawActiveTriangle() {
        if (flashOpacity > 0 && activeDirection !== Directions.NONE) {
            const cx = displayCanvas.width / 2;
            const cy = displayCanvas.height / 2;
            displayCtx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
            displayCtx.beginPath();
            switch (activeDirection) {
                case Directions.TOP:
                    displayCtx.moveTo(cx, cy);
                    displayCtx.lineTo(0, 0);
                    displayCtx.lineTo(displayCanvas.width, 0);
                    break;
                case Directions.BOTTOM:
                    displayCtx.moveTo(cx, cy);
                    displayCtx.lineTo(0, displayCanvas.height);
                    displayCtx.lineTo(displayCanvas.width, displayCanvas.height);
                    break;
                case Directions.LEFT:
                    displayCtx.moveTo(cx, cy);
                    displayCtx.lineTo(0, 0);
                    displayCtx.lineTo(0, displayCanvas.height);
                    break;
                case Directions.RIGHT:
                    displayCtx.moveTo(cx, cy);
                    displayCtx.lineTo(displayCanvas.width, 0);
                    displayCtx.lineTo(displayCanvas.width, displayCanvas.height);
                    break;
                default:
                    break;
            }
            displayCtx.closePath();
            displayCtx.fill();
        }
    }

    function handleInteraction(x, y) {
        const cx = displayCanvas.width / 2;
        const cy = displayCanvas.height / 2;

        if (isPointInTriangle(x, y, cx, cy, 0, 0, displayCanvas.width, 0)) {
            activeDirection = Directions.TOP;
            copperSpeed += 0.1;
        } else if (isPointInTriangle(x, y, cx, cy, 0, displayCanvas.height, displayCanvas.width, displayCanvas.height)) {
            activeDirection = Directions.BOTTOM;
            copperSpeed = Math.max(0.1, copperSpeed - 0.1);
        } else if (isPointInTriangle(x, y, cx, cy, 0, 0, 0, displayCanvas.height)) {
            activeDirection = Directions.LEFT;
            scrollerSpeed = Math.max(10, scrollerSpeed + 10);
            recalculateYOffset();
        } else if (isPointInTriangle(x, y, cx, cy, displayCanvas.width, 0, displayCanvas.width, displayCanvas.height)) {
            activeDirection = Directions.RIGHT;
            scrollerSpeed = Math.max(10, scrollerSpeed - 10);
            recalculateYOffset();
        } else {
            activeDirection = Directions.NONE;
        }
        flashOpacity = 0.5;
    }

    displayCanvas.addEventListener('click', function (event) {
        const rect = displayCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        handleInteraction(x, y);
    });

    window.addEventListener('keydown', function (event) {
        const cx = displayCanvas.width / 2;
        const cy = displayCanvas.height / 2;
        switch (event.key) {
            case 'ArrowLeft':
                handleInteraction(1, cy);
                break;
            case 'ArrowRight':
                handleInteraction(displayCanvas.width - 1, cy);
                break;
            case 'ArrowUp':
                handleInteraction(cx, 1);
                break;
            case 'ArrowDown':
                handleInteraction(cx, displayCanvas.height - 1);
                break;
            default:
                return;
        }
    });

    document.fonts.ready.then(function () {
        restartDemo(); // Calculate font dimensions, initialize bitmaps, and render
        render(); // Start the render loop
    });
});