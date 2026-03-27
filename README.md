# Amiga-Style Demo
A classic [Amiga](https://en.wikipedia.org/wiki/Amiga)-style sine text scroller with [copper bars](https://en.wikipedia.org/wiki/Raster_bar) initially developed in C# and ported to HTML/JavaScript.

All the code was generated using OpenAI's ChatGPT 4.0 classic model using an interactive chat. No code was ever manually edited.

## Live Demo
Check out the live demo of the Amiga-Style Demo [here](https://mrandreastoth.github.io/AmigaStyleDemo/).

**Best viewed in landscape mode. The speed of the scroll text and the copper bars are individually controllable using both cursor keys or click/taps on the appropriate region of the screen.**

### Summary of Major Steps in the Iterative Development Process

1. **Initial Implementation**:
   - **Goal**: Create a classic 80's style sine text scroller using C#.
   - **Implementation**: Developed the basic sine wave text scroller using `Console` for text output.

2. **Enhancement to Graphics Mode**:
   - **Goal**: Make the scroller more Amiga-like by using a graphics mode instead of text mode.
   - **Implementation**: Switched to using SFML.Net for graphical rendering.

3. **Dynamic Font Download**:
   - **Goal**: Use a font that suits the classic style and download it dynamically.
   - **Implementation**: Selected the "Press Start 2P" font from Google Fonts, and implemented logic to download and use the font dynamically if it is not already present.

4. **Copper Bars Addition**:
   - **Goal**: Add copper bars to mimic the classic Amiga demo style.
   - **Implementation**: Implemented copper bars moving up and down in a sine wave pattern.

5. **Animation and Speed Adjustments**:
   - **Goal**: Animate the copper bars in a more Amiga-like fashion and adjust the speed of both text and copper bars.
   - **Implementation**: Fine-tuned the animation speeds and added keyboard controls to adjust the speeds of the scroller text and copper bars.

6. **Side-to-Side Sine-Wave Motion for Instructions**:
   - **Goal**: Create a smooth side-to-side sine-wave motion for the instructions text to ensure continuous visibility.
   - **Implementation**: Adjusted the instructions text to move in a sine wave pattern horizontally at the bottom of the screen.

7. **Porting to HTML/JavaScript**:
   - **Goal**: Replicate the demo in a web environment to make it accessible online.
   - **Implementation**: Ported the application to use HTML5 Canvas for rendering. The animation logic was adapted to JavaScript to maintain performance and visual fidelity.

8. **Final Adjustments and Hosting**:
   - **Goal**: Ensure correct speeds and smooth motion for both the sine scroller and the copper bars in the web version.
   - **Implementation**: Repeatedly tweaked the frequencies and amplitudes for optimal visual effects in the browser. Hosted the demo using GitHub Pages to allow live interaction.

9. **Documentation and Refinement**:
   - **Goal**: Add comprehensive comments and rename the class to reflect its purpose accurately.
   - **Implementation**: Included a header comment detailing the NuGet package requirements and the creation process, and renamed the class to `AmigaStyleDemo`. Provided detailed documentation for the JavaScript version, including how to run it locally and its web hosting.

10. **Interactive Controls for Web Version**:
    - **Goal**: Implement click/tap support for controlling the speeds of the scroller and copper bars in the web version.
    - **Implementation**: Added logic to handle clicks/taps on the screen, dividing the screen into regions corresponding to the cursor keys for speed control.

11. **Porting Interactive Controls to C# Version**:
    - **Goal**: Implement the same interactive controls in the C# version as in the web version.
    - **Implementation**: Updated the C# version to include click/tap support for speed control, ensuring feature parity between the web and desktop versions.

12. **Instructions Update**:
    - **Goal**: Update the instructions to reflect the new control methods in both the web and C# versions.
    - **Implementation**: Revised the instructions text to mention both keyboard and click/tap controls.

13. **Character Bending**:
    - **Goal**: Ensure that each character follows the sine wave naturally by bending them according to the curve.
    - **Implementation**: Adjusted the rendering logic to "bend" the characters along the sine wave for a more authentic visual effect.

14. **Character Spacing**:
    - **Goal**: Introduce a small gap between characters to avoid them flowing into each other.
    - **Implementation**: Added configurable character spacing, preventing overlap and improving readability.

15. **Dynamic Sizing of Pre-Calculated Image Data**:
    - **Goal**: Dynamically adjust the size of pre-calculated character image data based on their actual dimensions.
    - **Implementation**: Implemented dynamic sizing logic to ensure pre-calculated character data fits within calculated bounding boxes.

16. **Pre-Calculation of Sine Data**:
    - **Goal**: Improve performance by pre-calculating the sine wave offsets.
    - **Implementation**: Introduced a pre-calculation step for sine wave offsets, reducing the computation needed during rendering.

17. **Font Rendering Issue Detection and Recovery**:
    - **Goal**: Handle inconsistent font rendering in the web version that caused occasional incorrect font displays.
    - **Implementation**: Introduced a mechanism to detect font rendering issues by comparing pre-rendered character samples and automatically restarting the demo if discrepancies are found.

18. **Replacement of Font Rendering Detection with FontFaceObserver**:
    - **Goal**: Replace the previous font rendering issue detection mechanism with a more robust method.
    - **Implementation**: Integrated the `FontFaceObserver` library, ensuring that the correct font is loaded before any rendering starts, replacing the older technique.

19. **Minor String Changes**:
    - **Goal**: Hyphenate "Amiga-style" in the demo and adjust other minor text for clarity.
    - **Implementation**: Updated the demo text to "Amiga-style" and reflected this change in the relevant files.

20. **README Update**:
    - **Goal**: Document the latest changes and updates in the README file, reflecting the newly added features.
    - **Implementation**: Updated the README to include the new improvements and reflect the latest project developments.

These iterative steps, driven by feedback and refinement, resulted in a polished Amiga-style sine text scroller with animated copper bars, effectively replicating the nostalgic look and feel of classic Amiga demos. The addition of an HTML/JavaScript version broadens accessibility and showcases the adaptability of the original design to modern web technologies.

**Note:** The C# version still needs to be updated with the latest advancements made in the JavaScript version.

---

## Chapter 2: Claude Code Takes Over (March 2026)

More than a year after the original ChatGPT-driven development, the demo had been silently broken for months. The animation rendered fine, but every attempt to interact with it — clicking to change speed, pressing arrow keys — did nothing. The controls were completely dead.

During the original development sessions with ChatGPT 4.0, iterating on the demo was a slow, painful process. Hours were spent prompting, reviewing, copy-pasting code, testing in the browser, and going back and forth trying to get things right. The AI would sometimes introduce regressions while fixing other things, and tracking down the cause of a bug required careful manual inspection of the generated code.

In March 2026, [Claude Code](https://claude.ai/claude-code) (Anthropic's agentic AI coding tool) was pointed at the repository with a simple instruction: *read the README, figure out what's wrong, and fix it.*

Claude Code cloned the repo, read all the source files, and identified the root cause in one pass:

**The bug:** ChatGPT had generated four call sites to a function called `isPointInTriangle()` — used to determine which triangular screen region the user clicked or tapped — but had never actually generated the function body. The function simply did not exist anywhere in the codebase. Every interaction triggered a `ReferenceError` at runtime, silently swallowing all keyboard and click input.

**The fix:** A standard cross-product point-in-triangle implementation, added in under a minute:

```javascript
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
```

The contrast is stark. What previously required hours of iterative back-and-forth — prompting, copy-pasting, manually testing, re-prompting — was diagnosed and resolved in a single session. No copy-pasting, no switching between windows, no manual code inspection. Just: *here's the repo, what's broken?*

**A note on honesty:** The paragraph above was written prematurely. After implementing the fix, Claude updated this README and declared the demo fully working — without actually testing the live demo. The user had to come back and report that the click/tap overlay triangles were still not appearing on screen. Claude had fixed the controls (speeds now changed correctly) but had not verified that the visual feedback was also working.

What followed was a round of debugging that Claude should not have needed the user to initiate. Only after the user pushed back — *"So yes, you fixed one issue but not both"* — did further investigation confirm that the overlay rendering was actually correct all along, and the user was eventually able to confirm that everything worked as expected.

So the real story of this session is a more nuanced one: Claude correctly identified the root cause and implemented a sound fix, but then got ahead of itself. The user had to do what any good tester does — actually verify the result and hold the AI accountable when the triumphant announcement didn't match reality.

AI tooling has come a long way. Appropriate skepticism still has a role to play.

---

## Chapter 3: Performance Optimisation (March 2026)

With the demo working correctly, attention turned to CPU efficiency. Modern displays run at 120Hz or 144Hz, meaning the render loop fires twice as often as on a 60Hz screen — and every inefficiency compounds accordingly.

Claude Code analysed the render loop and identified four meaningful optimisation opportunities:

**a) Cached font metrics and font state** — `drawInstructions()` was calling `measureText()` twice per frame on a string that never changes, and reassigning `offscreenCtx.font` on every frame despite it never varying. Both are now set once at initialisation.

**b) Copper bar palette pre-computation** — The copper bar renderer was allocating a new `LinearGradient` object on every frame for each of the 20 bars — 20 GPU resource allocations per frame, per second, indefinitely. The gradient shape (lightness from 50% at the top, through 20% at the midpoint, to 0% at the bottom) is fixed; only the hue rotates each frame. The per-row lightness values are now pre-computed once into an array, and each bar is drawn as a series of 1-pixel-tall solid `fillRect` calls with only the hue varying. This is also more faithful to how the Amiga copper chip actually worked: it changed a colour register on each raster scanline, producing exactly this kind of hard-edged per-line colour transition.

**d) Intermediate canvas for the text scroller** — The sine wave scroller worked by drawing one-pixel-wide vertical slices of each character bitmap at a vertically offset position. The GPU source texture switched on every character boundary — roughly every 50 columns. The fix introduces an intermediate "text strip" canvas. In Phase 1, all visible characters are composited onto the strip (one `drawImage` call per character, no distortion). In Phase 2, one-pixel columns are blitted from the strip to the offscreen canvas with sine offsets applied. The source texture never changes during Phase 2, allowing the GPU to cache it efficiently across all 800 column reads.

**Frame rate capping — considered and deliberately rejected.** Capping to 60fps would have halved CPU usage on 120Hz/144Hz displays at no visible cost, and was seriously considered. But the original Amiga hardware ran its demos at a fixed, limited frame rate determined by PAL/NTSC raster timing. Running uncapped on modern hardware — potentially exceeding 144fps — is a genuine demonstration of how far the platform has come. The cap was left out intentionally: the excess frames are the point.

---

## Future Plans

The following features have been designed but not yet implemented:

- **Frame rate cap** — toggleable with `c`, adjustable with `+` and `-`. Would allow capping the render loop to a chosen target (e.g. 60fps) to reduce CPU load on high-refresh-rate displays, while keeping uncapped as the default.
- **Frame rate display** — toggleable with `f`. Would overlay the current FPS in a corner of the canvas for diagnostic use.

---

## C# Version

The original C# version (using SFML.Net) has not been kept in sync with the JavaScript version since early in the project's history. It is missing all improvements made from step 7 onwards: the HTML5 port, interactive controls, character bending, spacing, pre-computation, font loading fixes, the `isPointInTriangle` bug fix, and the render loop optimisations documented in Chapter 3. It remains in the repository as a historical artefact.