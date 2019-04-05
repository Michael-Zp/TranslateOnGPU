using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using OpenTK;
using OpenTK.Graphics.OpenGL;



namespace TranslageOnGPU
{
    [StructLayout(LayoutKind.Explicit)]
    struct ConvertBytes
    {
        [FieldOffset(0)] public float Float;
        [FieldOffset(0)] public int Int;
        [FieldOffset(0)] public byte Byte0;
        [FieldOffset(1)] public byte Byte1;
        [FieldOffset(2)] public byte Byte2;
        [FieldOffset(3)] public byte Byte3;
    }

    class WordsTextureMetaData
    {
        public int TexId;
        public string TexName;

        public WordsTextureMetaData(int texId, string texName)
        {
            TexId = texId;
            TexName = texName;
        }
    }

    class SortedWordsMetaData : WordsTextureMetaData
    {
        public static int AlphabetLength = 26;
        public int[] Offsets = new int[AlphabetLength];
        public int[] CountPerLetter = new int[AlphabetLength];
        public int SortedBy;
        public string OffsetsUniformName;
        public string CountUniformName;

        public SortedWordsMetaData(int texId, string texName, List<string> words, int sortedBy, string offsetUniformName, string countUniformName) : base(texId, texName)
        {
            OffsetsUniformName = offsetUniformName;
            CountUniformName = countUniformName;
            SortedBy = sortedBy;
            for (int i = 0; i < AlphabetLength; i++)
            {
                Offsets[i] = -1;
                CountPerLetter[i] = 0;
            }

            for (int i = 0; i < words.Count; i++)
            {
                int indexInAlphabet = words[i][sortedBy] - 'a';
                if (Offsets[indexInAlphabet] == -1)
                {
                    Offsets[indexInAlphabet] = i;
                }

                CountPerLetter[indexInAlphabet]++;
            }
        }
    }

    class MyWindow : GameWindow
    {
        private static int WindowWidth = 500;
        private static int WindowHeight = 500;
        private readonly int _shaderProgram;
        private readonly int _fbo;
        private readonly int _texOne;
        private readonly int _texTwo;
        private readonly int _texThree;
        private readonly List<WordsTextureMetaData> _wordsTextures = new List<WordsTextureMetaData>();

        public MyWindow() : base(WindowWidth, WindowHeight)
        {
            GL.ClearColor(Color.Blue);

            Console.WriteLine(GL.GetInteger(GetPName.MaxFragmentUniformComponents));

            string fragmentShader = "";

            using (StreamReader sr = new StreamReader(new FileStream(@"..\..\shader.frag", FileMode.Open)))
            {
                fragmentShader = sr.ReadToEnd();
            }

            var fragmentHandle = CreateShader(ShaderType.FragmentShader, fragmentShader);

            _shaderProgram = GL.CreateProgram();
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));
            Console.WriteLine(GL.GetError());

            GL.AttachShader(_shaderProgram, fragmentHandle);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));
            Console.WriteLine(GL.GetError());

            GL.LinkProgram(_shaderProgram);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));
            Console.WriteLine(GL.GetError());

            GL.DetachShader(_shaderProgram, fragmentHandle);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));
            Console.WriteLine(GL.GetError());

            GL.ValidateProgram(_shaderProgram);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));

            _fbo = GL.GenFramebuffer();


            _texOne = CreateTexture(PixelInternalFormat.Rgba32i, PixelFormat.RgbaInteger, PixelType.Int, new Vector2(WindowWidth, WindowHeight));
            _texTwo = CreateTexture(PixelInternalFormat.Rgba32i, PixelFormat.RgbaInteger, PixelType.Int, new Vector2(WindowWidth, WindowHeight));
            _texThree = CreateTexture(PixelInternalFormat.Rgba32i, PixelFormat.RgbaInteger, PixelType.Int, new Vector2(WindowWidth, WindowHeight));

            AddTextureToFramebuffer(_fbo, _texOne, 0);
            AddTextureToFramebuffer(_fbo, _texTwo, 1);
            AddTextureToFramebuffer(_fbo, _texThree, 2);
            Console.WriteLine(GL.GetError());


            GL.BindFramebuffer(FramebufferTarget.Framebuffer, _fbo);

            DrawBuffersEnum[] drawBuffers = new DrawBuffersEnum[3] { DrawBuffersEnum.ColorAttachment0, DrawBuffersEnum.ColorAttachment1, DrawBuffersEnum.ColorAttachment2 };
            GL.DrawBuffers(drawBuffers.Length, drawBuffers);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));
            Console.WriteLine(GL.GetError());

            GL.BindFramebuffer(FramebufferTarget.Framebuffer, 0);

            InitializeWordsTexture();
            InitializeTextUniform();
        }

        private void AddTextureToFramebuffer(int fb, int tex, int number)
        {
            GL.BindFramebuffer(FramebufferTarget.Framebuffer, fb);
            GL.FramebufferTexture(FramebufferTarget.Framebuffer, FramebufferAttachment.ColorAttachment0 + number, tex, 0);
            Console.WriteLine(GL.GetError());
            Console.WriteLine(GL.CheckFramebufferStatus(FramebufferTarget.Framebuffer));
            GL.BindFramebuffer(FramebufferTarget.Framebuffer, 0);
        }

        private void InitializeTextUniform()
        {
            int[][] text = new int[4][];
            text[0] = new int[] { 4 }; //_ -> a
            text[1] = new int[] { 4, 7 }; //a_ -> at
            text[2] = new int[] { 1, 2 }; //__ -> no
            text[3] = new int[] { 4, 3, 2, 1, 0 }; //a_o__ -> amore

            GL.UseProgram(_shaderProgram);
            for (int i = 0; i < text.Length; i++)
            {
                int[] word = new int[6];
                for (int k = 0; k < word.Length; k++)
                {
                    if (k < text[i].Length)
                    {
                        word[k] = text[i][k];
                    }
                    else
                    {
                        word[k] = 0;
                    }
                }
                var loc = GL.GetUniformLocation(_shaderProgram, "word" + i);
                if (loc != -1)
                {
                    GL.Uniform1(loc, word.Length, word);
                }
            }
            GL.UseProgram(0);
        }

        private void InitializeWordsTexture()
        {

            List<string> allWords = new List<string>();
            List<string>[] wordsByLength = new List<string>[6]
            {
                new List<string>(),
                new List<string>(),
                new List<string>(),
                new List<string>(),
                new List<string>(),
                new List<string>(),
            };



            using (StreamReader sr = new StreamReader(new FileStream(@"..\..\AllAllWords.txt", FileMode.Open)))
            {
                while (!sr.EndOfStream)
                {
                    var line = sr.ReadLine().ToLower();

                    if (line.Length > 6)
                    {
                        continue;
                    }

                    bool wordFits = true;
                    foreach (char c in line)
                    {
                        if (c < 'a' || c > 'z')
                        {
                            wordFits = false;
                        }
                    }

                    if (!wordFits)
                    {
                        continue;
                    }

                    allWords.Add(line);
                    wordsByLength[line.Length - 1].Add(line);
                }
            }

            _wordsTextures.Add(new WordsTextureMetaData(WordListToTexture(allWords), "allWords"));

            for (int i = 0; i < wordsByLength.Length; i++)
            {
                for(int k = i; k < wordsByLength.Length; k++)
                {

                    List<string> sortedList = wordsByLength[k].OrderBy(w => w[i]).Distinct().ToList();


                    if (sortedList.Contains("babied"))
                    {
                        Console.WriteLine(i + "; " + k + "; " + sortedList.IndexOf("babied"));
                    }

                    string texName = "wordsSortedByLetter" + i + "_Length" + (k + 1);
                    string offsetsUniformName = "offsetsSortedByLetter" + i + "_Length" + (k + 1);
                    string countUniformName = "numberOfWordsSortedByLetter" + i + "_Length" + (k + 1);
                    _wordsTextures.Add(new SortedWordsMetaData(WordListToTexture(wordsByLength[i]), texName, sortedList, i, offsetsUniformName, countUniformName));

                }

                {
                    string texName = "words_Length" + (i + 1);
                    string offsetsUniformName = "offsetOfWordsLength" + (i + 1);
                    string countUniformName = "numberOfWordsLength" + (i + 1);
                    List<string> sortedList = wordsByLength[i].OrderBy(w => w[i]).Distinct().ToList();
                    _wordsTextures.Add(new SortedWordsMetaData(WordListToTexture(wordsByLength[i]), texName, sortedList, i, offsetsUniformName, countUniformName));
                }
            }

            GL.UseProgram(_shaderProgram);
            int index = 0;
            foreach (var tex in _wordsTextures)
            {
                if (tex is SortedWordsMetaData sortedTex)
                {
                    var locOffsets = GL.GetUniformLocation(_shaderProgram, sortedTex.OffsetsUniformName);
                    var locCount = GL.GetUniformLocation(_shaderProgram, sortedTex.CountUniformName);
                    GL.Uniform1(locOffsets, SortedWordsMetaData.AlphabetLength, sortedTex.Offsets);
                    GL.Uniform1(locCount, SortedWordsMetaData.AlphabetLength, sortedTex.CountPerLetter);
                    index++;
                }
            }

            GL.UseProgram(0);
        }

        private int WordListToTexture(List<string> words)
        {
            ConvertBytes[] floatToByte = new ConvertBytes[words.Count * 6];

            for (int i = 0; i < words.Count; i++)
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
            for (int i = 0; i < words.Count; i++)
            {
                var col = (i * 6) % 3072;
                var row = (int)Math.Floor((i * 6) / 3072.0);
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

            EnableStuff();


            GL.Begin(PrimitiveType.Quads);
            GL.Vertex2(-1, -1);
            GL.Vertex2(1, -1);
            GL.Vertex2(1, 1);
            GL.Vertex2(-1, 1);
            GL.End();
            Console.WriteLine(GL.GetError());

            DisableStuff();

            SwapBuffers();

            Console.WriteLine(GL.GetError());

            WriteOutput(_texOne, "One");
            WriteOutput(_texTwo, "Two");
            WriteOutput(_texThree, "Three");

            Thread.Sleep(1000);
        }

        private void EnableStuff()
        {
            GL.BindFramebuffer(FramebufferTarget.Framebuffer, _fbo);
            Console.WriteLine(GL.GetError());

            GL.ValidateProgram(_shaderProgram);
            GL.GetProgram(_shaderProgram, GetProgramParameterName.ValidateStatus, out int state);
            Console.WriteLine(GL.GetProgramInfoLog(_shaderProgram));

            GL.UseProgram(_shaderProgram);
            Console.WriteLine(GL.GetError());


            for (int i = 0; i < _wordsTextures.Count; i++)
            {
                var loc = GL.GetUniformLocation(_shaderProgram, _wordsTextures[i].TexName);
                Console.WriteLine(GL.GetError());
                GL.ActiveTexture(TextureUnit.Texture0 + i);
                Console.WriteLine(GL.GetError());
                GL.BindTexture(TextureTarget.Texture2D, _wordsTextures[i].TexId);
                Console.WriteLine(GL.GetError());
                GL.Uniform1(loc, i);
                Console.WriteLine(GL.GetError());
            }
        }

        private void DisableStuff()
        {
            for (int i = 0; i < _wordsTextures.Count; i++)
            {
                GL.ActiveTexture(TextureUnit.Texture0 + i);
                Console.WriteLine(GL.GetError());
                GL.BindTexture(TextureTarget.Texture2D, 0);
                Console.WriteLine(GL.GetError());
            }

            GL.UseProgram(0);
            Console.WriteLine(GL.GetError());

            GL.BindFramebuffer(FramebufferTarget.Framebuffer, 0);
            Console.WriteLine(GL.GetError());
        }

        private void WriteOutput(int tex, string texName)
        {
            int[,] data = new int[WindowWidth * 4, WindowHeight * 4];

            GL.BindTexture(TextureTarget.Texture2D, tex);
            GL.GetTexImage(TextureTarget.Texture2D, 0, PixelFormat.RgbaInteger, PixelType.Int, data);
            GL.BindTexture(TextureTarget.Texture2D, 0);

            ConvertBytes[] intToByte = new ConvertBytes[4];
            intToByte[0].Int = data[0, 0];
            intToByte[1].Int = data[0, 1];
            intToByte[2].Int = data[0, 2];
            intToByte[3].Int = data[0, 3];

            Console.Write("Output of tex " + texName + " :");
            
            foreach (var dataThing in intToByte)
            {
                Console.Write((char)dataThing.Byte3);
                Console.Write((char)dataThing.Byte2);
                Console.Write((char)dataThing.Byte1);
                Console.Write((char)dataThing.Byte0);
            }

            Console.Write("\n");
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
