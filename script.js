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

    let text = "Hello, this is a classic Amiga style sine text scroller with copper bars!";
    let instructions = "   Use Left/Right to control scroller speed, Up/Down to control copper speed.   ";
    let time = 0;
    let scrollerSpeed = 100.0;  // Pixels per frame
    let copperSpeed = 2.0;      // Phase shift per frame

    function update() {
        time += 0.05;
    }

    function render() {
        update();
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height); // Clear offscreen canvas
        drawCopperBars();
        drawScrollingText();
        drawInstructions();

        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height); // Clear display canvas
        displayCtx.drawImage(offscreenCanvas, 0, 0, displayCanvas.width, displayCanvas.height); // Draw the offscreen canvas onto the display canvas, scaled
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

    window.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "ArrowLeft":
                scrollerSpeed = Math.max(10, scrollerSpeed + 10);
                break;
            case "ArrowRight":
                scrollerSpeed = Math.max(10, scrollerSpeed - 10);
                break;
            case "ArrowUp":
                copperSpeed += 0.1;
                break;
            case "ArrowDown":
                copperSpeed = Math.max(0.1, copperSpeed - 0.1);
                break;
        }
    });

    render(); // Start the animation loop
});
