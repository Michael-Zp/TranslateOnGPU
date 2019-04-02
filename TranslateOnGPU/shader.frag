#version 330 core 
#extension GL_EXT_gpu_shader4 : enable

uniform int[6] word0;
uniform int[6] word1;
uniform int[6] word2;
uniform int[6] word3;
uniform sampler2D words;

layout(location = 0) out vec4 FragColor; 
layout(location = 1) out float secondOut;

float isInCoord(float x, float y)
{
	return step(x, gl_FragCoord.x) * step(gl_FragCoord.x, x + 1) * step(y, gl_FragCoord.y) * step(gl_FragCoord.y, y + 1 );
}

float[2] wordToFloats(int[6] word)
{
	float myOutput[2];

	myOutput[0] = (intBitsToFloat((word[0] << 24) | (word[1] << 16) | (word[2] << 8) | word[3]));
	myOutput[1] = (intBitsToFloat((word[4] << 24) | word[5] << 16 & 0xFFFF0000));

	return myOutput;
}

float[2] intsToTextInFloats(int[6] word)
{
	int[6] newWord;
	for(int i = 0; i < 6; i++)
	{
		newWord[i] = word[i];// + 0x30;
	}

	float myOutput[2];

	myOutput[0] = (intBitsToFloat((newWord[0] << 24) | (newWord[1] << 16) | (newWord[2] << 8) | newWord[3]));
	myOutput[1] = (intBitsToFloat((newWord[4] << 24) | newWord[5] << 16 & 0xFFFF0000));

	return myOutput;
}

void main() 
{
	int[4][6] text;
	text[0] = word0;
	text[1] = word1;
	text[2] = word2;
	text[3] = word3;


	FragColor = vec4(0);
	secondOut = 0;

	float isIn00 = isInCoord(0, 0);

	//Is in coord
	int currentWord = 0;
	int word[6];
	for(int i = 0; i < 6; i++)
	{
		int col = (currentWord * 6) % 3072;
		int row = int(floor((currentWord * 6) / 2048.0));
		word[i] = floatBitsToInt(texelFetch(words, ivec2(col, row + i), 0).r);
	}
    
    float[2] myOutput = wordToFloats(word);

	FragColor += vec4(intBitsToFloat(0x68616C6C),intBitsToFloat(0x6F5F7765),myOutput[0],myOutput[1]) * isIn00;
	
	float[2] myOutput20 = intsToTextInFloats(word0);
	float[2] myOutput21 = intsToTextInFloats(word1);
	float[2] myOutput22 = intsToTextInFloats(word2);
	float[2] myOutput23 = intsToTextInFloats(word3);
	//myOutput2[0] = intBitsToFloat(0x30313233);
	
	if(word1[0] == 54 && word1[1] == 54)
	{
		myOutput21[0] = intBitsToFloat(0x62616161);
	}
	else
	{
		myOutput21[0] = intBitsToFloat(0x68686868);
	}


	secondOut += myOutput21[0] * isIn00;

	//Is not in coord
	FragColor += vec4(1.0) * (1 - isIn00); 
	secondOut += 1.0 * (1 - isIn00);
}