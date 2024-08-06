document.addEventListener("DOMContentLoaded", function() {
    const displayCanvas = document.getElementById('demoCanvas');
    const displayCtx = displayCanvas.getContext('2d');

    // Set up an offscreen canvas
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
    let scrollerSpeed = 100.0;  // Pixels per frame
    let copperSpeed = 2.0;      // Phase shift per frame
    let flashOpacity = 0;
    let activeDirection = Directions.NONE; // No active direction initially

    function update() {
        time += 0.05;
        if (flashOpacity > 0) {
            flashOpacity -= 0.01; // Gradually reduce the flash opacity
        } else {
            activeDirection = Directions.NONE; // Reset direction when opacity fades out
        }
    }

    function render() {
        update();
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height); // Clear offscreen canvas
        drawCopperBars();
        drawScrollingText();
        drawInstructions();

        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height); // Clear display canvas
        displayCtx.drawImage(offscreenCanvas, 0, 0, displayCanvas.width, displayCanvas.height); // Draw the offscreen canvas onto the display canvas, scaled
        drawActiveTriangle();
        requestAnimationFrame(render);
    }

    function drawScrollingText() {
        offscreenCtx.font = "32px 'Press Start 2P'";
        offscreenCtx.fillStyle = "white";
        let frequency = 0.05;
        let amplitude = 50;
        let x, y;
        for (let i = 0; i < text.length; i++) {
            x = offscreenCanvas.width - ((time * scrollerSpeed) % (text.length * 32 + offscreenCanvas.width)) + i * 32;
            y = (offscreenCanvas.height / 2) + Math.sin(x * frequency + time) * amplitude;
            offscreenCtx.fillText(text[i], x, y);
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

    function isPointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
        const b1 = sign(px, py, ax, ay, bx, by) < 0.0;
        const b2 = sign(px, py, bx, by, cx, cy) < 0.0;
        const b3 = sign(px, py, cx, cy, ax, ay) < 0.0;
        return ((b1 === b2) && (b2 === b3));
    }

    function sign(px, py, ax, ay, bx, by) {
        return (px - bx) * (ay - by) - (ax - bx) * (py - by);
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
        } else if (isPointInTriangle(x, y, cx, cy, displayCanvas.width, 0, displayCanvas.width, displayCanvas.height)) {
            activeDirection = Directions.RIGHT;
            scrollerSpeed = Math.max(10, scrollerSpeed - 10);
        } else {
            activeDirection = Directions.NONE;
        }
        flashOpacity = 0.5; // Reset flash opacity for visibility
    }

    displayCanvas.addEventListener('click', function(event) {
        const rect = displayCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        handleInteraction(x, y);
    });

    window.addEventListener('keydown', function(event) {
        const cx = displayCanvas.width / 2;
        const cy = displayCanvas.height / 2;
        switch (event.key) {
            case 'ArrowLeft':
                handleInteraction(1, cy); // Small offset to ensure inside triangle
                break;
            case 'ArrowRight':
                handleInteraction(displayCanvas.width - 1, cy); // Small offset to ensure inside triangle
                break;
            case 'ArrowUp':
                handleInteraction(cx, 1); // Small offset to ensure inside triangle
                break;
            case 'ArrowDown':
                handleInteraction(cx, displayCanvas.height - 1); // Small offset to ensure inside triangle
                break;
            default:
                return; // Ignore other keys
        }
    });

    render(); // Start the animation loop
});