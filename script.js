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

    let text = "Hello, this is a classic Amiga-style sine text scroller with copper bars!";
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
    let characterBitmap = {};
    let instructionsWidth;
    let textStripCanvas, textStripCtx;
    let copperLightness;

    function x_to_index(x) {
        const total_width = offscreenCanvas.width + 2 * font_width;
        let index = Math.round(((x % total_width) + total_width) % total_width);
        return index;
    }

    function recalculateYOffset() {
        y_offset = new Array(offscreenCanvas.width + 2 * font_width);

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

    function restartDemo() {
        calculateFontDimensions();
        initializeCharacterBitmaps();
        recalculateYOffset();

        // Cache instructions text width — the string never changes
        offscreenCtx.font = "16px 'Press Start 2P'";
        instructionsWidth = offscreenCtx.measureText(instructions).width;

        // Intermediate canvas for the text scroller: characters are composited here
        // without distortion each frame, then blitted column-by-column with sine offsets.
        // This keeps Phase 2 reading from a single source texture throughout.
        textStripCanvas = document.createElement('canvas');
        textStripCanvas.width = offscreenCanvas.width;
        textStripCanvas.height = font_height;
        textStripCtx = textStripCanvas.getContext('2d');

        // Pre-compute per-row lightness values for copper bars.
        // The gradient shape (50% → 20% → 0% lightness) is fixed; only the hue rotates each frame.
        const barHeight = 15;
        copperLightness = new Array(barHeight);
        for (let r = 0; r < barHeight; r++) {
            const t = r / (barHeight - 1);
            copperLightness[r] = t <= 0.5 ? 50 - 60 * t : 40 - 40 * t;
        }
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

        requestAnimationFrame(render);
    }

    function drawScrollingText() {
        const totalWidth = text.length * (font_width + letter_spacing);
        const baseX = offscreenCanvas.width - ((time * scrollerSpeed) % (totalWidth + offscreenCanvas.width));
        const midY = (offscreenCanvas.height / 2) - baseline_offset;

        // Phase 1: composite all visible characters onto the text strip (no distortion).
        // One drawImage call per visible character — source texture switches here, not below.
        textStripCtx.clearRect(0, 0, textStripCanvas.width, textStripCanvas.height);
        for (let i = 0; i < text.length; i++) {
            const x = baseX + i * (font_width + letter_spacing);
            if (x + font_width >= 0 && x < offscreenCanvas.width) {
                textStripCtx.drawImage(characterBitmap[text[i]], x, 0);
            }
        }

        // Phase 2: blit one-pixel-wide columns from the strip to the offscreen canvas with
        // per-column sine offsets. The source is always textStripCanvas — no texture switching.
        for (let x = 0; x < offscreenCanvas.width; x++) {
            const yOffset = y_offset[x_to_index(x)];
            offscreenCtx.drawImage(textStripCanvas, x, 0, 1, font_height, x, midY + yOffset, 1, font_height);
        }
    }

    function drawInstructions() {
        offscreenCtx.fillStyle = "white";
        const sineAmplitude = (offscreenCanvas.width - instructionsWidth) / 2;
        const instructionX = (offscreenCanvas.width / 2) + Math.sin(time * 0.5) * sineAmplitude - instructionsWidth / 2;
        offscreenCtx.fillText(instructions, instructionX, offscreenCanvas.height - 30);
    }

    function drawCopperBars() {
        const barHeight = copperLightness.length;
        const numBars = 20;
        const barSpacing = 5;
        const barFrequency = 0.2;
        const barAmplitude = 40;
        const centerY = offscreenCanvas.height / 2 - (numBars * (barHeight + barSpacing) / 2);

        for (let i = 0; i < numBars; i++) {
            const yOffset = Math.sin((time + i * 0.2) * barFrequency + time * copperSpeed) * barAmplitude;
            const yPosition = centerY + i * (barHeight + barSpacing) + yOffset;
            const hue = (time * 10 + i * 5) % 360;
            // Draw one filled rectangle per row using pre-computed lightness values.
            // Avoids allocating a LinearGradient object on every frame.
            for (let r = 0; r < barHeight; r++) {
                offscreenCtx.fillStyle = `hsl(${hue}, 100%, ${copperLightness[r]}%)`;
                offscreenCtx.fillRect(0, yPosition + r, offscreenCanvas.width, 1);
            }
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

    function sign(px, py, x1, y1, x2, y2) {
        return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
    }

    function isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        const d1 = sign(px, py, x1, y1, x2, y2);
        const d2 = sign(px, py, x2, y2, x3, y3);
        const d3 = sign(px, py, x3, y3, x1, y1);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(hasNeg && hasPos);
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

    // Use FontFaceObserver to ensure the font is fully loaded
    const fontObserver = new FontFaceObserver('Press Start 2P');

    fontObserver.load().then(function () {
        restartDemo(); // Ensure the demo only starts after the font is loaded
        render(); // Start the render loop
    }).catch(function (error) {
        console.error('Font failed to load:', error);
        // Optionally handle fallback or retry logic here
    });
});
