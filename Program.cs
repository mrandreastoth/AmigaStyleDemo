using System.Net;
using SFML.Graphics;
using SFML.System;
using SFML.Window;

/*
 * This code was AI generated using ChatGPT 4.0 classic
 * from a chat by Andreas Toth.
 *
 * NuGet Package Requirements:
 * - SFML.Net (https://www.nuget.org/packages/SFML.Net/)
 */

namespace AmigaStyleDemo;

class AmigaStyleDemo
{
    private static RenderWindow window;
    private static string text = "Hello, this is a classic Amiga style sine text scroller with copper bars!";
    private static string instructions = "   Use Left/Right to control scroller speed, Up/Down to control copper speed.   ";
    private static Font font;
    private static Text sfmlText;
    private static Text sfmlInstructions;
    private static float time;
    private static float scrollerSpeed = 100.0f;
    private static float copperSpeed = 2.0f;
    private static float instructionAmplitude;
    private static float instructionFrequency = 0.5f; // Increased frequency for faster motion
    private static int windowWidth = 800;
    private static int windowHeight = 600;
    private static string fontUrl = "https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf";
    private static string fontPath = "PressStart2P-Regular.ttf";

    static void Main()
    {
        // Download the font if it does not exist
        if (!File.Exists(fontPath))
        {
            using (WebClient client = new WebClient())
            {
                client.DownloadFile(fontUrl, fontPath);
            }
        }

        window = new RenderWindow(new VideoMode((uint)windowWidth, (uint)windowHeight), "Amiga Style Demo");
        window.SetFramerateLimit(60);
        window.Closed += (sender, e) => window.Close();
        window.KeyPressed += OnKeyPressed;

        font = new Font(fontPath); // Ensure you have a valid font file path here
        sfmlText = new Text(text, font, 32)
        {
            FillColor = Color.White
        };

        sfmlInstructions = new Text(instructions, font, 16)
        {
            FillColor = Color.White
        };

        // Calculate the amplitude to ensure the text can move fully from left to right
        instructionAmplitude = (windowWidth - sfmlInstructions.GetLocalBounds().Width) / 2;

        while (window.IsOpen)
        {
            window.DispatchEvents();

            Update();
            Render();
        }
    }

    private static void OnKeyPressed(object sender, KeyEventArgs e)
    {
        if (e.Code == Keyboard.Key.Left)
        {
            scrollerSpeed += 10.0f;
        }
        else if (e.Code == Keyboard.Key.Right)
        {
            scrollerSpeed -= 10.0f;
            if (scrollerSpeed < 10.0f) scrollerSpeed = 10.0f; // Prevent negative or too slow speed
        }
        else if (e.Code == Keyboard.Key.Up)
        {
            copperSpeed += 0.5f;
        }
        else if (e.Code == Keyboard.Key.Down)
        {
            copperSpeed -= 0.5f;
            if (copperSpeed < 0.5f) copperSpeed = 0.5f; // Prevent negative or too slow speed
        }
    }

    private static void Update()
    {
        time += 0.05f;
    }

    private static void Render()
    {
        window.Clear(Color.Black);

        DrawCopperBars();

        float frequency = 0.05f;
        float amplitude = 50.0f;

        // Draw scrolling main text
        for (int i = 0; i < text.Length; i++)
        {
            float x = windowWidth - ((time * scrollerSpeed) % (text.Length * 32 + windowWidth)) + i * 32;
            float y = (windowHeight / 2) + (float)(Math.Sin(x * frequency + time) * amplitude);

            sfmlText.DisplayedString = text[i].ToString();
            sfmlText.Position = new Vector2f(x, y);
            window.Draw(sfmlText);
        }

        // Draw side-to-side sine-wave motion instructions
        float instructionX = (windowWidth / 2) + (float)(Math.Sin(time * instructionFrequency) * instructionAmplitude);
        sfmlInstructions.Position = new Vector2f(instructionX - sfmlInstructions.GetLocalBounds().Width / 2, windowHeight - 30);
        window.Draw(sfmlInstructions);

        window.Display();
    }

    private static void DrawCopperBars()
    {
        float barHeight = 20.0f;
        int numBars = 20;
        float barFrequency = 0.2f;
        float barAmplitude = 40.0f;
        float centerY = windowHeight / 2;

        for (int i = 0; i < numBars; i++)
        {
            float phase = time + i * 0.2f;
            float yOffset = (float)(Math.Sin(phase * barFrequency + time * copperSpeed) * barAmplitude);

            float yPosition = centerY + yOffset + (i - numBars / 2) * barHeight;
            Color barColor = ColorFromHue((time * 10 + i * 5) % 360);

            DrawGradientRectangle(0, yPosition, windowWidth, barHeight, barColor);
        }
    }

    private static void DrawGradientRectangle(float x, float y, float width, float height, Color color)
    {
        Vertex[] gradientRectangle = new Vertex[4];

        gradientRectangle[0] = new Vertex(new Vector2f(x, y), color);
        gradientRectangle[1] = new Vertex(new Vector2f(x + width, y), color);
        gradientRectangle[2] = new Vertex(new Vector2f(x + width, y + height), new Color(0, 0, 0, 0));
        gradientRectangle[3] = new Vertex(new Vector2f(x, y + height), new Color(0, 0, 0, 0));

        window.Draw(gradientRectangle, PrimitiveType.Quads);
    }

    private static Color ColorFromHue(float hue)
    {
        int h = (int)(hue / 60) % 6;
        float f = hue / 60 - h;
        float v = 1;
        float p = 0;
        float q = 1 - f;
        float t = f;

        switch (h)
        {
            case 0:
                return new Color((byte)(v * 255), (byte)(t * 255), (byte)(p * 255));
            case 1:
                return new Color((byte)(q * 255), (byte)(v * 255), (byte)(p * 255));
            case 2:
                return new Color((byte)(p * 255), (byte)(v * 255), (byte)(t * 255));
            case 3:
                return new Color((byte)(p * 255), (byte)(q * 255), (byte)(v * 255));
            case 4:
                return new Color((byte)(t * 255), (byte)(p * 255), (byte)(v * 255));
            case 5:
                return new Color((byte)(v * 255), (byte)(p * 255), (byte)(q * 255));
            default:
                return new Color(255, 255, 255);
        }
    }
}