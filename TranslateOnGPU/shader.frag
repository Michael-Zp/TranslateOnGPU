#version 330 core 
#extension GL_EXT_gpu_shader4 : enable

int[16][6] text;
uniform int[6] word0;
uniform int[6] word1;
uniform int[6] word2;
uniform int[6] word3;
uniform int[6] word4;
uniform int[6] word5;
uniform int[6] word6;
uniform int[6] word7;
uniform int[6] word8;
uniform int[6] word9;
uniform int[6] word10;
uniform int[6] word11;
uniform int[6] word12;
uniform int[6] word13;
uniform int[6] word14;
uniform int[6] word15;

int[6][26] offsetSortedByLetter;
uniform int[26] offsetsInSortedByLetter0;
uniform int[26] offsetsInSortedByLetter1;
uniform int[26] offsetsInSortedByLetter2;
uniform int[26] offsetsInSortedByLetter3;
uniform int[26] offsetsInSortedByLetter4;
uniform int[26] offsetsInSortedByLetter5;

int[6][26] numberOfWordsSortedBy;
uniform int[26] numberOfWordsSortedByLetter0;
uniform int[26] numberOfWordsSortedByLetter1;
uniform int[26] numberOfWordsSortedByLetter2;
uniform int[26] numberOfWordsSortedByLetter3;
uniform int[26] numberOfWordsSortedByLetter4;
uniform int[26] numberOfWordsSortedByLetter5;


uniform sampler2D allWords;

uniform sampler2D wordsSortedByLetter0;
uniform sampler2D wordsSortedByLetter1;
uniform sampler2D wordsSortedByLetter2;
uniform sampler2D wordsSortedByLetter3;
uniform sampler2D wordsSortedByLetter4;
uniform sampler2D wordsSortedByLetter5;

layout(location = 0) out ivec4 FragColor;
layout(location = 1) out ivec4 secondOut;
layout(location = 2) out ivec4 thirdOut;

int isInCoord(float x, float y)
{
	return int(step(x, gl_FragCoord.x) * step(gl_FragCoord.x, x + 1) * step(y, gl_FragCoord.y) * step(gl_FragCoord.y, y + 1 ));
}

int[6] getWord(sampler2D tex, int index)
{
	int word[6];

	int col = (index * 6) % 3072;
	int row = int(floor((index * 6) / 3072.0));

	for(int i = 0; i < 6; i++)
	{
		word[i] = floatBitsToInt(texelFetch(tex, ivec2(row, col + i), 0).r);
	}

	return word;
}

int[6] getWordFromSorted(sampler2D tex, int sortedByLetterIndex, int letter, int index)
{
	return getWord(tex, offsetSortedByLetter[sortedByLetterIndex][letter - 'a'] + index);
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
	text[0] = word0;
	text[1] = word1;
	text[2] = word2;
	text[3] = word3;
	text[4] = word4;
	text[5] = word5;
	text[6] = word6;
	text[7] = word7;
	text[8] = word8;
	text[9] = word9;
	text[10] = word10;
	text[11] = word11;
	text[12] = word12;
	text[13] = word13;
	text[14] = word14;
	text[15] = word15;
	
	offsetSortedByLetter[0] = offsetsInSortedByLetter0;
	offsetSortedByLetter[1] = offsetsInSortedByLetter1;
	offsetSortedByLetter[2] = offsetsInSortedByLetter2;
	offsetSortedByLetter[3] = offsetsInSortedByLetter3;
	offsetSortedByLetter[4] = offsetsInSortedByLetter4;
	offsetSortedByLetter[5] = offsetsInSortedByLetter5;

	numberOfWordsSortedBy[0] = numberOfWordsSortedByLetter0;
	numberOfWordsSortedBy[1] = numberOfWordsSortedByLetter1;
	numberOfWordsSortedBy[2] = numberOfWordsSortedByLetter2;
	numberOfWordsSortedBy[3] = numberOfWordsSortedByLetter3;
	numberOfWordsSortedBy[4] = numberOfWordsSortedByLetter4;
	numberOfWordsSortedBy[5] = numberOfWordsSortedByLetter5;



	FragColor = ivec4(0);
	secondOut = ivec4(0);
	thirdOut = ivec4(0);

	int isIn00 = isInCoord(0, 0);

	//Is in coord
    
    int[2] myOutput = wordToInt(getWordFromSorted(wordsSortedByLetter5, 5, 'b', 0));
	
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