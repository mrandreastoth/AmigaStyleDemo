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
    resizeDisplayCanvas();

    const Directions = {
        NONE: 0,
        TOP: 1,
        BOTTOM: 2,
        LEFT: 3,
        RIGHT: 4
    };

    let text = "Hello, this is a classic Amiga-style sine text scroller with copper bars!";
    const instructions  = "   Keys/click: Left/Right for scroller, Up/Down for copper.   ";
    const instructions2 = "   Press i to toggle info   ";

    // Animation state
    let time = 0;
    let scrollerSpeed = 60.0;
    let copperSpeed = 2.0;
    let flashOpacity = 0;
    let activeDirection = Directions.NONE;

    // Defaults (used by reset)
    const DEFAULT_SCROLLER_SPEED = 60.0;
    const DEFAULT_COPPER_SPEED   = 2.0;
    const DEFAULT_CAP_FPS        = 60;

    // Frame cap and info panel
    let showInfo     = false;
    let capEnabled   = false;
    let capFPS       = DEFAULT_CAP_FPS;
    let lastRenderTime = 0;
    let fpsSmoothed  = 60;

    // Full-screen flash on reset (-1 = inactive, >=0 = seconds elapsed since triggered)
    let resetFlashT = -1;

    // Font / layout
    let font_width, font_height, baseline_offset;
    const fontSize       = 48;
    const letter_spacing = 4;
    const frequency      = 0.05;
    const amplitude      = 50;

    let y_offset;
    let characterBitmap    = {};
    let instructionsWidth;
    let instructions2Width;
    let textStripCanvas, textStripCtx;
    let copperLightness;
    let infoPanelWidth;

    function x_to_index(x) {
        const total_width = offscreenCanvas.width + 2 * font_width;
        return Math.round(((x % total_width) + total_width) % total_width);
    }

    function recalculateYOffset() {
        y_offset = new Array(offscreenCanvas.width + 2 * font_width);
        for (let x = -font_width; x < offscreenCanvas.width + font_width; x++) {
            const index = x_to_index(x);
            y_offset[index] = Math.sin(x * frequency * (scrollerSpeed / 100)) * amplitude;
        }
    }

    function calculateFontDimensions() {
        let unionTop = 0, unionBottom = 0, unionRight = 0;
        const uniqueChars = [...new Set(text.split(''))];
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontSize}px 'Press Start 2P'`;
        uniqueChars.forEach(char => {
            const metrics = tempCtx.measureText(char);
            unionTop    = Math.max(unionTop,    metrics.actualBoundingBoxAscent);
            unionBottom = Math.max(unionBottom, metrics.actualBoundingBoxDescent);
            unionRight  = Math.max(unionRight,  Math.ceil(metrics.width));
        });
        font_width      = unionRight + letter_spacing;
        font_height     = unionTop + unionBottom;
        baseline_offset = unionTop;
    }

    function initializeCharacterBitmaps() {
        const uniqueChars = [...new Set(text.split(''))];
        uniqueChars.forEach(char => {
            const charCanvas = document.createElement('canvas');
            charCanvas.width  = font_width;
            charCanvas.height = font_height;
            const charCtx = charCanvas.getContext('2d');
            charCtx.font      = `${fontSize}px 'Press Start 2P'`;
            charCtx.fillStyle = "white";
            const textWidth   = charCtx.measureText(char).width;
            charCtx.fillText(char, (font_width - textWidth) / 2, baseline_offset);
            characterBitmap[char] = charCanvas;
        });
    }

    function restartDemo() {
        calculateFontDimensions();
        initializeCharacterBitmaps();
        recalculateYOffset();

        // Cache both instruction line widths
        offscreenCtx.font = "16px 'Press Start 2P'";
        instructionsWidth  = offscreenCtx.measureText(instructions).width;
        instructions2Width = offscreenCtx.measureText(instructions2).width;

        // Intermediate text strip canvas for the scroller
        textStripCanvas        = document.createElement('canvas');
        textStripCanvas.width  = offscreenCanvas.width;
        textStripCanvas.height = font_height;
        textStripCtx           = textStripCanvas.getContext('2d');

        // Pre-compute per-row lightness values for copper bars
        const barHeight = 15;
        copperLightness = new Array(barHeight);
        for (let r = 0; r < barHeight; r++) {
            const t = r / (barHeight - 1);
            copperLightness[r] = t <= 0.5 ? 50 - 60 * t : 40 - 40 * t;
        }

        // Pre-compute info panel width from its widest possible line
        const tempCanvas = document.createElement('canvas');
        const tempCtx    = tempCanvas.getContext('2d');
        tempCtx.font     = "16px 'Press Start 2P'";
        const infoLines  = [
            'FPS:    000', 'CAP:    ON / 240',
            'SCROLL: 000', 'COPPER: 0.0',
            'i: HIDE INFO', 'c: TOGGLE CAP',
            '+/-: ADJUST CAP', 'r: RESET ALL',
        ];
        infoPanelWidth = Math.max(...infoLines.map(l => tempCtx.measureText(l).width));
    }

    function resetSettings() {
        scrollerSpeed = DEFAULT_SCROLLER_SPEED;
        copperSpeed   = DEFAULT_COPPER_SPEED;
        capFPS        = DEFAULT_CAP_FPS;
        capEnabled    = false;
        resetFlashT   = 0;
        recalculateYOffset();
    }

    function update(delta) {
        // Delta-time-based advancement: 0.003 per ms = 0.05 per frame at 60fps
        time += delta * 0.003;
        if (flashOpacity > 0) {
            flashOpacity -= 0.6 * (delta / 1000); // decays to 0 in ~0.83s regardless of frame rate
            if (flashOpacity <= 0) {
                flashOpacity = 0;
                activeDirection = Directions.NONE;
            }
        }
        if (resetFlashT >= 0) {
            resetFlashT += Math.min(delta, 50) / 1000; // clamp so a frame hitch can't skip past the flash
            if (resetFlashT > 1.5) resetFlashT = -1;
        }
    }

    function render(timestamp) {
        // Frame cap: return early if insufficient time has elapsed
        if (capEnabled && lastRenderTime > 0) {
            if (timestamp - lastRenderTime < 1000 / capFPS) {
                requestAnimationFrame(render);
                return;
            }
        }

        // Delta time and exponential moving average FPS
        const delta = lastRenderTime > 0 ? timestamp - lastRenderTime : 1000 / 60;
        if (lastRenderTime > 0) {
            fpsSmoothed = fpsSmoothed * 0.9 + (1000 / delta) * 0.1;
        }
        lastRenderTime = timestamp;

        update(delta);

        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        drawCopperBars();
        drawScrollingText();
        drawInstructions();

        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        displayCtx.drawImage(offscreenCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
        drawActiveTriangle();
        if (showInfo) drawInfo();
        if (resetFlashT >= 0) {
            // Damped heartbeat pulse: strong initial flash (lub), secondary pulse (dub),
            // then a fading echo. e^(-3t) × cos²(3πt) — peaks at t=0 (1.0), t=0.33 (0.37), t=0.67 (0.14).
            const flashOp = Math.exp(-3 * resetFlashT) * Math.cos(3 * Math.PI * resetFlashT) ** 2;
            if (flashOp > 0.005) {
                displayCtx.fillStyle = `rgba(255, 255, 255, ${flashOp})`;
                displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
            }
        }

        requestAnimationFrame(render);
    }

    function drawScrollingText() {
        const totalWidth = text.length * (font_width + letter_spacing);
        const baseX = offscreenCanvas.width - ((time * scrollerSpeed) % (totalWidth + offscreenCanvas.width));
        const midY  = (offscreenCanvas.height / 2) - baseline_offset;

        // Phase 1: composite visible characters onto the strip (no distortion, one call per char)
        textStripCtx.clearRect(0, 0, textStripCanvas.width, textStripCanvas.height);
        for (let i = 0; i < text.length; i++) {
            const x = baseX + i * (font_width + letter_spacing);
            if (x + font_width >= 0 && x < offscreenCanvas.width) {
                textStripCtx.drawImage(characterBitmap[text[i]], x, 0);
            }
        }

        // Phase 2: blit columns from the strip with per-column sine offsets (single source texture)
        for (let x = 0; x < offscreenCanvas.width; x++) {
            const yOffset = y_offset[x_to_index(x)];
            offscreenCtx.drawImage(textStripCanvas, x, 0, 1, font_height, x, midY + yOffset, 1, font_height);
        }
    }

    function drawInstructions() {
        offscreenCtx.fillStyle = "white";

        // Line 1: control hints — oscillates left to right
        const amp1 = (offscreenCanvas.width - instructionsWidth) / 2;
        const x1   = (offscreenCanvas.width / 2) + Math.sin(time * 0.5) * amp1 - instructionsWidth / 2;
        offscreenCtx.fillText(instructions, x1, offscreenCanvas.height - 30);

        // Line 2: info hint — oscillates in opposite phase
        const amp2 = (offscreenCanvas.width - instructions2Width) / 2;
        const x2   = (offscreenCanvas.width / 2) - Math.sin(time * 0.5) * amp2 - instructions2Width / 2;
        offscreenCtx.fillText(instructions2, x2, offscreenCanvas.height - 56);
    }

    function drawInfo() {
        const padding    = 10;
        const lineHeight = 24;
        const lines = [
            `FPS:    ${Math.round(fpsSmoothed)}`,
            `CAP:    ${capEnabled ? `ON / ${capFPS}` : 'OFF'}`,
            `SCROLL: ${Math.round(scrollerSpeed)}`,
            `COPPER: ${copperSpeed.toFixed(1)}`,
            '',
            'i: HIDE INFO',
            'c: TOGGLE CAP',
            '+/-: ADJUST CAP',
            'r: RESET ALL',
        ];

        const panelW = infoPanelWidth + padding * 2;
        const panelH = lines.length * lineHeight + padding * 2;

        displayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        displayCtx.fillRect(padding, padding, panelW, panelH);

        displayCtx.font      = "16px 'Press Start 2P'";
        displayCtx.fillStyle = 'white';
        lines.forEach((line, i) => {
            if (line) {
                displayCtx.fillText(line, padding * 2, padding + (i + 1) * lineHeight);
            }
        });
    }

    function drawCopperBars() {
        const barHeight   = copperLightness.length;
        const numBars     = 20;
        const barSpacing  = 5;
        const barFrequency = 0.2;
        const barAmplitude = 40;
        const centerY     = offscreenCanvas.height / 2 - (numBars * (barHeight + barSpacing) / 2);

        for (let i = 0; i < numBars; i++) {
            const yOffset   = Math.sin((time + i * 0.2) * barFrequency + time * copperSpeed) * barAmplitude;
            const yPosition = centerY + i * (barHeight + barSpacing) + yOffset;
            const hue       = (time * 10 + i * 5) % 360;
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
        handleInteraction(event.clientX - rect.left, event.clientY - rect.top);
    });

    window.addEventListener('keydown', function (event) {
        const cx = displayCanvas.width / 2;
        const cy = displayCanvas.height / 2;
        switch (event.key) {
            case 'ArrowLeft':  handleInteraction(1, cy);                           break;
            case 'ArrowRight': handleInteraction(displayCanvas.width - 1, cy);     break;
            case 'ArrowUp':    handleInteraction(cx, 1);                           break;
            case 'ArrowDown':  handleInteraction(cx, displayCanvas.height - 1);    break;
            case 'i': showInfo   = !showInfo;                                      break;
            case 'c': capEnabled = !capEnabled;                                    break;
            case '+': capFPS = Math.min(240, capFPS + 1);                          break;
            case '-': capFPS = Math.max(1,   capFPS - 1);                          break;
            case 'r': resetSettings();                                             break;
            default: return; // don't preventDefault for unhandled keys
        }
        event.preventDefault();
    });

    // Use FontFaceObserver to ensure the font is fully loaded
    const fontObserver = new FontFaceObserver('Press Start 2P');

    fontObserver.load().then(function () {
        restartDemo();
        requestAnimationFrame(render);
    }).catch(function (error) {
        console.error('Font failed to load:', error);
    });
});
