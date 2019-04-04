#version 330 core 
#extension GL_EXT_gpu_shader4 : enable

uniform int[6] word0;
uniform int[6] word1;
uniform int[6] word2;
uniform int[6] word3;
uniform sampler2D words;

layout(location = 0) out ivec4 FragColor;
layout(location = 1) out ivec4 secondOut;
layout(location = 2) out ivec4 thirdOut;

int isInCoord(float x, float y)
{
	return int(step(x, gl_FragCoord.x) * step(gl_FragCoord.x, x + 1) * step(y, gl_FragCoord.y) * step(gl_FragCoord.y, y + 1 ));
}

int[2] wordToInt(int[6] word)
{
	int myOutput[2];

	myOutput[0] = (word[0] << 24) | (word[1] << 16) | (word[2] << 8) | word[3];
	myOutput[1] = (word[4] << 24) | (word[5] << 16) & 0xFFFF0000;

	return myOutput;
}

int[2] numbersToText(int[6] numbers)
{
	int[6] newNumbers;
	for(int i = 0; i < 6; i++)
	{
		newNumbers[i] = numbers[i] + 0x30; // + '0'
	}

	return wordToInt(newNumbers);
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


	FragColor = ivec4(0);
	secondOut = ivec4(0);
	thirdOut = ivec4(0);

	int isIn00 = isInCoord(0, 0);

	//Is in coord
	int currentWord = 0;
	int word[6];
	for(int i = 0; i < 6; i++)
	{
		int col = (currentWord * 6) % 3072;
		int row = int(floor((currentWord * 6) / 2048.0));
		word[i] = floatBitsToInt(texelFetch(words, ivec2(col, row + i), 0).r);
	}
    
    int[2] myOutput = wordToInt(word);
	
	FragColor += ivec4(0x68616C6C,0x6F5F7765,myOutput[0],myOutput[1]) * isIn00;

	int[2] myOutput20 = numbersToText(text[0]);
	int[2] myOutput21 = numbersToText(text[1]);
	int[2] myOutput22 = numbersToText(text[2]);
	int[2] myOutput23 = numbersToText(text[3]);

	secondOut += ivec4(myOutput20[0], myOutput20[1], myOutput21[0], myOutput21[1]) * isIn00;
	thirdOut += ivec4(myOutput22[0], myOutput22[1], myOutput23[0], myOutput23[1]) * isIn00;
	


	//Is not in coord
	FragColor += ivec4(1) * (1 - isIn00); 
	secondOut += ivec4(1) * (1 - isIn00);
	thirdOut += ivec4(1) * (1 - isIn00);
}