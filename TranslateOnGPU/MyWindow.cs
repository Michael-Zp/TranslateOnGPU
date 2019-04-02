using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using OpenTK;
using OpenTK.Graphics.OpenGL;



namespace TranslageOnGPU
{
    [StructLayout(LayoutKind.Explicit)]
    struct FloatToByte
    {
        [FieldOffset(0)] public float Float;
        [FieldOffset(0)] public byte Byte0;
        [FieldOffset(1)] public byte Byte1;
        [FieldOffset(2)] public byte Byte2;
        [FieldOffset(3)] public byte Byte3;
    }

    class MyWindow : GameWindow
    {
        private static int WindowWidth = 500;
        private static int WindowHeight = 500;
        private readonly int _shaderProgram;
        private readonly int _fbo;
        private readonly int _texOne;
        private readonly int _texTwo;
        private readonly int _wordsTex;

        public MyWindow() : base(WindowWidth, WindowHeight)
        {
            GL.ClearColor(Color.Blue);

            string fragmentShader = "";

            using (StreamReader sr = new StreamReader(new FileStream(@"C:\Users\Admin\source\repos\TranslageOnGPU\TranslageOnGPU\shader.frag", FileMode.Open)))
            {
                fragmentShader = sr.ReadToEnd();
            }

            var a = GL.GetInteger(GetPName.MaxUniformBlockSize);
            a = GL.GetInteger(GetPName.MaxFragmentUniformBlocks);


            var fragmentHandle = CreateShader(ShaderType.FragmentShader, fragmentShader);

            _shaderProgram = GL.CreateProgram();
            Console.WriteLine(GL.GetError());

            GL.AttachShader(_shaderProgram, fragmentHandle);
            Console.WriteLine(GL.GetError());

            GL.LinkProgram(_shaderProgram);
            Console.WriteLine(GL.GetError());

            GL.DetachShader(_shaderProgram, fragmentHandle);
            Console.WriteLine(GL.GetError());


            _fbo = GL.GenFramebuffer();
            GL.BindFramebuffer(FramebufferTarget.Framebuffer, _fbo);
            _texOne = CreateTexture(PixelInternalFormat.Rgba32f, PixelFormat.Rgba, PixelType.Float, new Vector2(WindowWidth, WindowHeight));
            _texTwo = CreateTexture(PixelInternalFormat.R32f, PixelFormat.Red, PixelType.Float, new Vector2(WindowWidth, WindowHeight));

            GL.FramebufferTexture(FramebufferTarget.Framebuffer, FramebufferAttachment.ColorAttachment0, _texOne, 0);
            GL.FramebufferTexture(FramebufferTarget.Framebuffer, FramebufferAttachment.ColorAttachment1, _texTwo, 0);
            Console.WriteLine(GL.GetError());

            Console.WriteLine(GL.CheckFramebufferStatus(FramebufferTarget.Framebuffer));

            _wordsTex = InitializeWordsTexture();
        }

        private int InitializeWordsTexture()
        {
            string[] words = new string[50000];
            for (int i = 0; i < words.Length; i++)
            {
                words[i] = "gloom";
            }

            FloatToByte[] floatToByte = new FloatToByte[words.Length * 6];

            for (int i = 0; i < words.Length; i++)
            {
                for (int k = 0; k < 6; k++)
                {
                    if (words[i].Length > k)
                    {
                        floatToByte[i * 6 + k].Byte0 = (byte)words[i][k];
                    }
                    else
                    {
                        floatToByte[i * 6 + k].Byte0 = 0;
                    }
                }
            }

            float[,] wordsArray = new float[3072, 3072];
            for (int i = 0; i < words.Length; i++)
            {
                var col = (i * 6) % 3072;
                var row = (int)Math.Floor((i * 6) / 2048.0);
                for (int k = 0; k < 6; k++)
                {
                    wordsArray[col + k, row] = floatToByte[i * 6 + k].Float;
                }
            }

            return CreateTexture(PixelInternalFormat.R32f, PixelFormat.Red, PixelType.Float, new Vector2(3072f, 3072f), wordsArray);
        }

        private int CreateTexture(PixelInternalFormat pixelInternalFormat, PixelFormat pixelFormat, PixelType pixelType, Vector2 size, float[,] image = null)
        {
            var texture = GL.GenTexture();
            Console.WriteLine(GL.GetError());
            GL.BindTexture(TextureTarget.Texture2D, texture);
            Console.WriteLine(GL.GetError());
            if (image == null)
            {
                GL.TexImage2D(TextureTarget.Texture2D, 0, pixelInternalFormat, (int)size.X, (int)size.Y, 0, pixelFormat, pixelType, IntPtr.Zero);
            }
            else
            {
                GL.TexImage2D(TextureTarget.Texture2D, 0, pixelInternalFormat, (int)size.X, (int)size.Y, 0, pixelFormat, pixelType, image);
            }
            Console.WriteLine(GL.GetError());
            GL.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMinFilter, (int)TextureMinFilter.Nearest);
            Console.WriteLine(GL.GetError());
            GL.TexParameter(TextureTarget.Texture2D, TextureParameterName.TextureMagFilter, (int)TextureMagFilter.Nearest);
            Console.WriteLine(GL.GetError());
            GL.BindTexture(TextureTarget.Texture2D, 0);
            return texture;
        }

        private int CreateShader(ShaderType type, string code)
        {
            var handle = GL.CreateShader(type);
            Console.WriteLine(GL.GetError());

            GL.ShaderSource(handle, code);
            Console.WriteLine(GL.GetError());

            GL.CompileShader(handle);
            Console.WriteLine(GL.GetShaderInfoLog(handle));
            return handle;
        }

        protected override void OnRenderFrame(FrameEventArgs args)
        {
            base.OnRenderFrame(args);

            Console.WriteLine("Start");
            GL.Clear(ClearBufferMask.ColorBufferBit);
            Console.WriteLine(GL.GetError());

            GL.BindFramebuffer(FramebufferTarget.Framebuffer, _fbo);
            GL.UseProgram(_shaderProgram);
            GL.BindTexture(TextureTarget.Texture2D, _wordsTex);
            Console.WriteLine(GL.GetError());

            DrawBuffersEnum[] drawBuffers = new DrawBuffersEnum[2] { DrawBuffersEnum.ColorAttachment0, DrawBuffersEnum.ColorAttachment1 };
            GL.DrawBuffers(drawBuffers.Length, drawBuffers);

            GL.Begin(PrimitiveType.Quads);
            GL.Vertex2(-1, -1);
            GL.Vertex2(1, -1);
            GL.Vertex2(1, 1);
            GL.Vertex2(-1, 1);
            GL.End();
            Console.WriteLine(GL.GetError());


            GL.BindTexture(TextureTarget.Texture2D, 0);
            GL.UseProgram(0);
            Console.WriteLine(GL.GetError());

            SwapBuffers();


            GL.BindFramebuffer(FramebufferTarget.Framebuffer, 0);

            Rectangle rect = new Rectangle(0, 0, WindowWidth, WindowHeight);
            float[,] data = new float[rect.Width * 4, rect.Height * 4];
            float[,] dataTwo = new float[rect.Width, rect.Height];

            GL.BindTexture(TextureTarget.Texture2D, _texOne);
            GL.GetTexImage(TextureTarget.Texture2D, 0, PixelFormat.Rgba, PixelType.Float, data);
            GL.BindTexture(TextureTarget.Texture2D, 0);

            GL.BindTexture(TextureTarget.Texture2D, _texTwo);
            GL.GetTexImage(TextureTarget.Texture2D, 0, PixelFormat.Red, PixelType.Float, dataTwo);
            GL.BindTexture(TextureTarget.Texture2D, 0);


            FloatToByte[] floatToBytes = new FloatToByte[5];
            floatToBytes[0].Float = data[0, 0];
            floatToBytes[1].Float = data[0, 1];
            floatToBytes[2].Float = data[0, 2];
            floatToBytes[3].Float = data[0, 3];
            floatToBytes[4].Float = dataTwo[0, 0];

            foreach (var dataThing in floatToBytes)
            {
                Console.Write((char)dataThing.Byte3);
                Console.Write((char)dataThing.Byte2);
                Console.Write((char)dataThing.Byte1);
                Console.Write((char)dataThing.Byte0);
            }

            Console.Write("\n");

            Thread.Sleep(1000);
        }

        protected override void OnResize(EventArgs args)
        {
            base.OnResize(args);

        }

        protected override void OnUpdateFrame(FrameEventArgs args)
        {
            base.OnUpdateFrame(args);

        }
    }
}
