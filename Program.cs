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
    private static string instructions = "   Keys/click: Left/Right for scroller, Up/Down for copper.   ";
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
    private static float flashOpacity = 0;
    private static Directions activeDirection = Directions.NONE;

    private enum Directions
    {
        NONE,
        TOP,
        BOTTOM,
        LEFT,
        RIGHT
    }

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
        window.MouseButtonPressed += OnMousePressed;

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
        switch (e.Code)
        {
            case Keyboard.Key.Left:
                HandleInteraction(Directions.LEFT);
                break;
            case Keyboard.Key.Right:
                HandleInteraction(Directions.RIGHT);
                break;
            case Keyboard.Key.Up:
                HandleInteraction(Directions.TOP);
                break;
            case Keyboard.Key.Down:
                HandleInteraction(Directions.BOTTOM);
                break;
        }
    }

    private static void OnMousePressed(object sender, MouseButtonEventArgs e)
    {
        float x = e.X * (windowWidth / (float)window.Size.X);
        float y = e.Y * (windowHeight / (float)window.Size.Y);
        HandleMouseInteraction(x, y);
    }

    private static void HandleMouseInteraction(float x, float y)
    {
        float cx = windowWidth / 2;
        float cy = windowHeight / 2;

        if (IsPointInTriangle(x, y, cx, cy, 0, 0, windowWidth, 0))
        {
            HandleInteraction(Directions.TOP);
        }
        else if (IsPointInTriangle(x, y, cx, cy, 0, windowHeight, windowWidth, windowHeight))
        {
            HandleInteraction(Directions.BOTTOM);
        }
        else if (IsPointInTriangle(x, y, cx, cy, 0, 0, 0, windowHeight))
        {
            HandleInteraction(Directions.LEFT);
        }
        else if (IsPointInTriangle(x, y, cx, cy, windowWidth, 0, windowWidth, windowHeight))
        {
            HandleInteraction(Directions.RIGHT);
        }
    }

    private static void HandleInteraction(Directions direction)
    {
        activeDirection = direction;
        flashOpacity = 0.5f; // Reset flash opacity for visibility

        switch (direction)
        {
            case Directions.TOP:
                copperSpeed += 0.1f;
                break;
            case Directions.BOTTOM:
                copperSpeed = Math.Max(0.1f, copperSpeed - 0.1f);
                break;
            case Directions.LEFT:
                scrollerSpeed = Math.Max(10f, scrollerSpeed + 10f);
                break;
            case Directions.RIGHT:
                scrollerSpeed = Math.Max(10f, scrollerSpeed - 10f);
                break;
            default:
                break;
        }
    }

    private static void Update()
    {
        time += 0.05f;
        if (flashOpacity > 0)
        {
            flashOpacity -= 0.01f; // Gradually reduce the flash opacity
        }
        else
        {
            activeDirection = Directions.NONE; // Reset direction when opacity fades out
        }
    }

    private static void Render()
    {
        window.Clear(Color.Black);

        DrawCopperBars();
        DrawScrollingText();
        DrawInstructions();
        DrawActiveTriangle();

        window.Display();
    }

    private static void DrawScrollingText()
    {
        float frequency = 0.05f;
        float amplitude = 50.0f;

        for (int i = 0; i < text.Length; i++)
        {
            float x = windowWidth - ((time * scrollerSpeed) % (text.Length * 32 + windowWidth)) + i * 32;
            float y = (windowHeight / 2) + (float)(Math.Sin(x * frequency + time) * amplitude);

            sfmlText.DisplayedString = text[i].ToString();
            sfmlText.Position = new Vector2f(x, y);
            window.Draw(sfmlText);
        }
    }

    private static void DrawInstructions()
    {
        float instructionX = (windowWidth / 2) + (float)(Math.Sin(time * instructionFrequency) * instructionAmplitude);
        sfmlInstructions.Position = new Vector2f(instructionX - sfmlInstructions.GetLocalBounds().Width / 2, windowHeight - 30);
        window.Draw(sfmlInstructions);
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

    private static void DrawActiveTriangle()
    {
        if (flashOpacity > 0 && activeDirection != Directions.NONE)
        {
            float cx = windowWidth / 2;
            float cy = windowHeight / 2;

            VertexArray triangle = new VertexArray(PrimitiveType.Triangles, 3);

            switch (activeDirection)
            {
                case Directions.TOP:
                    triangle[0] = new Vertex(new Vector2f(cx, cy), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[1] = new Vertex(new Vector2f(0, 0), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[2] = new Vertex(new Vector2f(windowWidth, 0), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    break;
                case Directions.BOTTOM:
                    triangle[0] = new Vertex(new Vector2f(cx, cy), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[1] = new Vertex(new Vector2f(0, windowHeight), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[2] = new Vertex(new Vector2f(windowWidth, windowHeight), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    break;
                case Directions.LEFT:
                    triangle[0] = new Vertex(new Vector2f(cx, cy), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[1] = new Vertex(new Vector2f(0, 0), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[2] = new Vertex(new Vector2f(0, windowHeight), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    break;
                case Directions.RIGHT:
                    triangle[0] = new Vertex(new Vector2f(cx, cy), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[1] = new Vertex(new Vector2f(windowWidth, 0), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    triangle[2] = new Vertex(new Vector2f(windowWidth, windowHeight), new Color(255, 255, 255, (byte)(flashOpacity * 255)));
                    break;
                default:
                    break;
            }
            window.Draw(triangle);
        }
    }

    private static bool IsPointInTriangle(float px, float py, float ax, float ay, float bx, float by, float cx, float cy)
    {
        bool b1 = Sign(px, py, ax, ay, bx, by) < 0.0f;
        bool b2 = Sign(px, py, bx, by, cx, cy) < 0.0f;
        bool b3 = Sign(px, py, cx, cy, ax, ay) < 0.0f;
        return ((b1 == b2) && (b2 == b3));
    }

    private static float Sign(float px, float py, float ax, float ay, float bx, float by)
    {
        return (px - bx) * (ay - by) - (ax - bx) * (py - by);
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