# AmigaStyleDemo
A classic [Amiga](https://en.wikipedia.org/wiki/Amiga)-style sine text scroller with [copper bars](https://en.wikipedia.org/wiki/Raster_bar) in C#.

All the code was generated using OpenAI's ChatGPT 4.0 classic model using an interactive chat. No code was ever manually edited.

*NOTE: The sine scroller suffers from a common issue with generated since scrollers i.e., the individual characters are not orientated the way one would expect them to be for the effect to be correct.*

### Summary of Major Steps in the Iterative Development Process

1. **Initial Implementation**:
   - **Goal**: Create a classic 80's style sine text scroller using C#.
   - **Implementation**: Developed the basic sine wave text scroller using `Console` for text output.

2. **Enhancement to Graphics Mode**:
   - **Goal**: Make the scroller more Amiga-like by using a graphics mode instead of text mode.
   - **Implementation**: Switched to using SFML.Net for graphical rendering.

3. **Copper Bars Addition**:
   - **Goal**: Add copper bars to mimic the classic Amiga demo style.
   - **Implementation**: Implemented copper bars moving up and down in a sine wave pattern.

4. **Animation and Speed Adjustments**:
   - **Goal**: Animate the copper bars in a more Amiga-like fashion and adjust the speed of both text and copper bars.
   - **Implementation**: Fine-tuned the animation speeds and added keyboard controls to adjust the speeds of the scroller text and copper bars.

5. **Side-to-Side Sine-Wave Motion for Instructions**:
   - **Goal**: Create a smooth side-to-side sine-wave motion for the instructions text to ensure continuous visibility.
   - **Implementation**: Adjusted the instructions text to move in a sine wave pattern horizontally at the bottom of the screen.

6. **Final Adjustments**:
   - **Goal**: Ensure correct speeds and smooth motion for both the sine scroller and the copper bars.
   - **Implementation**: Repeatedly tweaked the frequencies and amplitudes for optimal visual effects, ensuring a classic Amiga demo look.

7. **Documentation and Refinement**:
   - **Goal**: Add comprehensive comments and rename the class to reflect its purpose accurately.
   - **Implementation**: Included a header comment detailing the NuGet package requirements and the creation process, and renamed the class to `AmigaStyleDemo`.

These iterative steps, driven by feedback and refinement, resulted in a polished Amiga-style sine text scroller with animated copper bars, effectively replicating the nostalgic look and feel of classic Amiga demos.
