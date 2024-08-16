# AmigaStyleDemo
A classic [Amiga](https://en.wikipedia.org/wiki/Amiga)-style sine text scroller with [copper bars](https://en.wikipedia.org/wiki/Raster_bar) initially developed in C# and ported to HTML/JavaScript.

All the code was generated using OpenAI's ChatGPT 4.0 classic model using an interactive chat. No code was ever manually edited.

## Live Demo
Check out the live demo of the AmigaStyleDemo [here](https://mrandreastoth.github.io/AmigaStyleDemo/).

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

13. **README Update**:
    - **Goal**: Document the latest changes and updates in the README file.
    - **Implementation**: Updated the README to include the new control methods and reflect the latest project developments.

14. **Character Bending**:
    - **Goal**: Ensure that each character follows the sine wave naturally by bending them according to the curve.
    - **Implementation**: Adjusted the rendering logic to "bend" the characters along the sine wave for a more authentic visual effect.

15. **Character Spacing**:
    - **Goal**: Introduce a small gap between characters to avoid them flowing into each other.
    - **Implementation**: Added configurable character spacing, preventing overlap and improving readability.

16. **Dynamic Sizing of Pre-Calculated Image Data**:
    - **Goal**: Dynamically adjust the size of pre-calculated character image data based on their actual dimensions.
    - **Implementation**: Implemented dynamic sizing logic to ensure pre-calculated character data fits within calculated bounding boxes.

17. **Pre-Calculation of Sine Data**:
    - **Goal**: Improve performance by pre-calculating the sine wave offsets.
    - **Implementation**: Introduced a pre-calculation step for sine wave offsets, reducing the computation needed during rendering.

18. **Font Rendering Issue Detection and Recovery**:
    - **Goal**: Handle inconsistent font rendering in the web version that caused occasional incorrect font displays.
    - **Implementation**: Introduced a mechanism to detect font rendering issues by comparing pre-rendered character samples and automatically restarting the demo if discrepancies are found.

19. **README Update**:
    - **Goal**: Document the latest changes and updates in the README file, reflecting the newly added features.
    - **Implementation**: Updated the README to include the new improvements and reflect the latest project developments.

These iterative steps, driven by feedback and refinement, resulted in a polished Amiga-style sine text scroller with animated copper bars, effectively replicating the nostalgic look and feel of classic Amiga demos. The addition of an HTML/JavaScript version broadens accessibility and showcases the adaptability of the original design to modern web technologies.

**Note:** The C# version still needs to be updated with the latest advancements made in the JavaScript version.