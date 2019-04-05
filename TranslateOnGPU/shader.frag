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

int[6][26] offsetSortedByLetter0;
uniform int[26] offsetsSortedByLetter0_Length1;
uniform int[26] offsetsSortedByLetter0_Length2;
uniform int[26] offsetsSortedByLetter0_Length3;
uniform int[26] offsetsSortedByLetter0_Length4;
uniform int[26] offsetsSortedByLetter0_Length5;
uniform int[26] offsetsSortedByLetter0_Length6;

int[6][26] offsetSortedByLetter1;
uniform int[26] offsetsSortedByLetter1_Length2;
uniform int[26] offsetsSortedByLetter1_Length3;
uniform int[26] offsetsSortedByLetter1_Length4;
uniform int[26] offsetsSortedByLetter1_Length5;
uniform int[26] offsetsSortedByLetter1_Length6;

int[6][26] offsetSortedByLetter2;
uniform int[26] offsetsSortedByLetter2_Length3;
uniform int[26] offsetsSortedByLetter2_Length4;
uniform int[26] offsetsSortedByLetter2_Length5;
uniform int[26] offsetsSortedByLetter2_Length6;

int[6][26] offsetSortedByLetter3;
uniform int[26] offsetsSortedByLetter3_Length4;
uniform int[26] offsetsSortedByLetter3_Length5;
uniform int[26] offsetsSortedByLetter3_Length6;

int[6][26] offsetSortedByLetter4;
uniform int[26] offsetsSortedByLetter4_Length5;
uniform int[26] offsetsSortedByLetter4_Length6;

int[6][26] offsetSortedByLetter5;
uniform int[26] offsetsSortedByLetter5_Length6;

int[6][6][26] offsetSortedByLetter;



int[6][26] numberOfWordsSortedByLetter0;
uniform int[26] numberOfWordsSortedByLetter0_Length1;
uniform int[26] numberOfWordsSortedByLetter0_Length2;
uniform int[26] numberOfWordsSortedByLetter0_Length3;
uniform int[26] numberOfWordsSortedByLetter0_Length4;
uniform int[26] numberOfWordsSortedByLetter0_Length5;
uniform int[26] numberOfWordsSortedByLetter0_Length6;

int[6][26] numberOfWordsSortedByLetter1;
uniform int[26] numberOfWordsSortedByLetter1_Length2;
uniform int[26] numberOfWordsSortedByLetter1_Length3;
uniform int[26] numberOfWordsSortedByLetter1_Length4;
uniform int[26] numberOfWordsSortedByLetter1_Length5;
uniform int[26] numberOfWordsSortedByLetter1_Length6;

int[6][26] numberOfWordsSortedByLetter2;
uniform int[26] numberOfWordsSortedByLetter2_Length3;
uniform int[26] numberOfWordsSortedByLetter2_Length4;
uniform int[26] numberOfWordsSortedByLetter2_Length5;
uniform int[26] numberOfWordsSortedByLetter2_Length6;

int[6][26] numberOfWordsSortedByLetter3;
uniform int[26] numberOfWordsSortedByLetter3_Length4;
uniform int[26] numberOfWordsSortedByLetter3_Length5;
uniform int[26] numberOfWordsSortedByLetter3_Length6;

int[6][26] numberOfWordsSortedByLetter4;
uniform int[26] numberOfWordsSortedByLetter4_Length5;
uniform int[26] numberOfWordsSortedByLetter4_Length6;

int[6][26] numberOfWordsSortedByLetter5;
uniform int[26] numberOfWordsSortedByLetter5_Length6;

int[6][6][26] numberOfWordsSortedBy;

uniform sampler2D allWords;

uniform sampler2D words_Length1;
uniform sampler2D words_Length2;
uniform sampler2D words_Length3;
uniform sampler2D words_Length4;
uniform sampler2D words_Length5;
uniform sampler2D words_Length6;

uniform int[26] offsetOfWordsLength1;
uniform int[26] numberOfWordsLength1;

uniform int[26] offsetOfWordsLength2;
uniform int[26] numberOfWordsLength2;

uniform int[26] offsetOfWordsLength3;
uniform int[26] numberOfWordsLength3;

uniform int[26] offsetOfWordsLength4;
uniform int[26] numberOfWordsLength4;

uniform int[26] offsetOfWordsLength5;
uniform int[26] numberOfWordsLength5;

uniform int[26] offsetOfWordsLength6;
uniform int[26] numberOfWordsLength6;


uniform sampler2D wordsSortedByLetter0_Length1;
uniform sampler2D wordsSortedByLetter0_Length2;
uniform sampler2D wordsSortedByLetter0_Length3;
uniform sampler2D wordsSortedByLetter0_Length4;
uniform sampler2D wordsSortedByLetter0_Length5;
uniform sampler2D wordsSortedByLetter0_Length6;

uniform sampler2D wordsSortedByLetter1_Length2;
uniform sampler2D wordsSortedByLetter1_Length3;
uniform sampler2D wordsSortedByLetter1_Length4;
uniform sampler2D wordsSortedByLetter1_Length5;
uniform sampler2D wordsSortedByLetter1_Length6;

uniform sampler2D wordsSortedByLetter2_Length3;
uniform sampler2D wordsSortedByLetter2_Length4;
uniform sampler2D wordsSortedByLetter2_Length5;
uniform sampler2D wordsSortedByLetter2_Length6;

uniform sampler2D wordsSortedByLetter3_Length4;
uniform sampler2D wordsSortedByLetter3_Length5;
uniform sampler2D wordsSortedByLetter3_Length6;

uniform sampler2D wordsSortedByLetter4_Length5;
uniform sampler2D wordsSortedByLetter4_Length6;

uniform sampler2D wordsSortedByLetter5_Length6;

uniform sampler2D selectedWords0To3;
uniform sampler2D selectedWords4To7;
uniform sampler2D selectedWords8To11;
uniform sampler2D selectedWords12To15;


layout(location = 0) out ivec4 FragColor;
layout(location = 1) out ivec4 secondOut;
layout(location = 2) out ivec4 thirdOut;

ivec2 currentCoords;

int isInCoord(float x, float y)
{
	return int(step(x, gl_FragCoord.x) * step(gl_FragCoord.x, x + 1) * step(y, gl_FragCoord.y) * step(gl_FragCoord.y, y + 1 ));
}

ivec2 getCurrentCoord()
{
	return ivec2(int(floor(gl_FragCoord.x)), int(floor(gl_FragCoord.y)));
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

int[6] getWordFromSorted(sampler2D tex, int sortedByLetterIndex, int letter, int lengthOfWord, int index)
{
	return getWord(tex, offsetSortedByLetter[lengthOfWord - 1][sortedByLetterIndex][letter - 'a'] + index);
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
	FragColor = ivec4(0);
	secondOut = ivec4(0);
	thirdOut = ivec4(0);

	currentCoords = getCurrentCoord();


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
	
	offsetSortedByLetter0[0] = offsetsSortedByLetter0_Length1;
	offsetSortedByLetter0[1] = offsetsSortedByLetter0_Length2;
	offsetSortedByLetter0[2] = offsetsSortedByLetter0_Length3;
	offsetSortedByLetter0[3] = offsetsSortedByLetter0_Length4;
	offsetSortedByLetter0[4] = offsetsSortedByLetter0_Length5;
	offsetSortedByLetter0[5] = offsetsSortedByLetter0_Length6;

	offsetSortedByLetter1[1] = offsetsSortedByLetter1_Length2;
	offsetSortedByLetter1[2] = offsetsSortedByLetter1_Length3;
	offsetSortedByLetter1[3] = offsetsSortedByLetter1_Length4;
	offsetSortedByLetter1[4] = offsetsSortedByLetter1_Length5;
	offsetSortedByLetter1[5] = offsetsSortedByLetter1_Length6;

	offsetSortedByLetter2[2] = offsetsSortedByLetter2_Length3;
	offsetSortedByLetter2[3] = offsetsSortedByLetter2_Length4;
	offsetSortedByLetter2[4] = offsetsSortedByLetter2_Length5;
	offsetSortedByLetter2[5] = offsetsSortedByLetter2_Length6;

	offsetSortedByLetter3[3] = offsetsSortedByLetter3_Length4;
	offsetSortedByLetter3[4] = offsetsSortedByLetter3_Length5;
	offsetSortedByLetter3[5] = offsetsSortedByLetter3_Length6;

	offsetSortedByLetter4[4] = offsetsSortedByLetter4_Length5;
	offsetSortedByLetter4[5] = offsetsSortedByLetter4_Length6;

	offsetSortedByLetter5[5] = offsetsSortedByLetter5_Length6;
	
	offsetSortedByLetter[0] = offsetSortedByLetter0;
	offsetSortedByLetter[1] = offsetSortedByLetter1;
	offsetSortedByLetter[2] = offsetSortedByLetter2;
	offsetSortedByLetter[3] = offsetSortedByLetter3;
	offsetSortedByLetter[4] = offsetSortedByLetter4;
	offsetSortedByLetter[5] = offsetSortedByLetter5;


	numberOfWordsSortedByLetter0[0] = numberOfWordsSortedByLetter0_Length1;
	numberOfWordsSortedByLetter0[1] = numberOfWordsSortedByLetter0_Length2;
	numberOfWordsSortedByLetter0[2] = numberOfWordsSortedByLetter0_Length3;
	numberOfWordsSortedByLetter0[3] = numberOfWordsSortedByLetter0_Length4;
	numberOfWordsSortedByLetter0[4] = numberOfWordsSortedByLetter0_Length5;
	numberOfWordsSortedByLetter0[5] = numberOfWordsSortedByLetter0_Length6;

	numberOfWordsSortedByLetter1[1] = numberOfWordsSortedByLetter1_Length2;
	numberOfWordsSortedByLetter1[2] = numberOfWordsSortedByLetter1_Length3;
	numberOfWordsSortedByLetter1[3] = numberOfWordsSortedByLetter1_Length4;
	numberOfWordsSortedByLetter1[4] = numberOfWordsSortedByLetter1_Length5;
	numberOfWordsSortedByLetter1[5] = numberOfWordsSortedByLetter1_Length6;

	numberOfWordsSortedByLetter2[2] = numberOfWordsSortedByLetter2_Length3;
	numberOfWordsSortedByLetter2[3] = numberOfWordsSortedByLetter2_Length4;
	numberOfWordsSortedByLetter2[4] = numberOfWordsSortedByLetter2_Length5;
	numberOfWordsSortedByLetter2[5] = numberOfWordsSortedByLetter2_Length6;

	numberOfWordsSortedByLetter3[3] = numberOfWordsSortedByLetter3_Length4;
	numberOfWordsSortedByLetter3[4] = numberOfWordsSortedByLetter3_Length5;
	numberOfWordsSortedByLetter3[5] = numberOfWordsSortedByLetter3_Length6;

	numberOfWordsSortedByLetter4[4] = numberOfWordsSortedByLetter4_Length5;
	numberOfWordsSortedByLetter4[5] = numberOfWordsSortedByLetter4_Length6;

	numberOfWordsSortedByLetter5[5] = numberOfWordsSortedByLetter5_Length6;

	numberOfWordsSortedBy[0] = numberOfWordsSortedByLetter0;
	numberOfWordsSortedBy[1] = numberOfWordsSortedByLetter1;
	numberOfWordsSortedBy[2] = numberOfWordsSortedByLetter2;
	numberOfWordsSortedBy[3] = numberOfWordsSortedByLetter3;
	numberOfWordsSortedBy[4] = numberOfWordsSortedByLetter4;
	numberOfWordsSortedBy[5] = numberOfWordsSortedByLetter5;


	int[16] selectedWords;
	selectedWords[0] = floatBitsToInt(texelFetch(selectedWords0To3, currentCoords, 0).r);
	selectedWords[1] = floatBitsToInt(texelFetch(selectedWords0To3, currentCoords, 0).g);
	selectedWords[2] = floatBitsToInt(texelFetch(selectedWords0To3, currentCoords, 0).b);
	selectedWords[3] = floatBitsToInt(texelFetch(selectedWords0To3, currentCoords, 0).a);
	selectedWords[4] = floatBitsToInt(texelFetch(selectedWords4To7, currentCoords, 0).r);
	selectedWords[5] = floatBitsToInt(texelFetch(selectedWords4To7, currentCoords, 0).g);
	selectedWords[6] = floatBitsToInt(texelFetch(selectedWords4To7, currentCoords, 0).b);
	selectedWords[7] = floatBitsToInt(texelFetch(selectedWords4To7, currentCoords, 0).a);
	selectedWords[8] = floatBitsToInt(texelFetch(selectedWords8To11, currentCoords, 0).r);
	selectedWords[9] = floatBitsToInt(texelFetch(selectedWords8To11, currentCoords, 0).g);
	selectedWords[10] = floatBitsToInt(texelFetch(selectedWords8To11, currentCoords, 0).b);
	selectedWords[11] = floatBitsToInt(texelFetch(selectedWords8To11, currentCoords, 0).a);
	selectedWords[12] = floatBitsToInt(texelFetch(selectedWords12To15, currentCoords, 0).r);
	selectedWords[13] = floatBitsToInt(texelFetch(selectedWords12To15, currentCoords, 0).g);
	selectedWords[14] = floatBitsToInt(texelFetch(selectedWords12To15, currentCoords, 0).b);
	selectedWords[15] = floatBitsToInt(texelFetch(selectedWords12To15, currentCoords, 0).a);



	int isIn00 = isInCoord(0, 0);

	//Is in coord
    
    int[2] myOutput = wordToInt(getWordFromSorted(wordsSortedByLetter5_Length6, 5, 'b', 6, 0));
	
	FragColor += ivec4(0x68616C6C,0x6F5F7765, myOutput[0],myOutput[1]) * isIn00;

	int[2] myOutput20 = numbersToText(text[0]);
	int[2] myOutput21 = numbersToText(text[1]);
	int[2] myOutput22 = numbersToText(text[2]);
	int[2] myOutput23 = numbersToText(text[3]);

	int[6] offsetNumbers;
	int offsetNumber = offsetSortedByLetter[5][5][1]; //888288;
	
	offsetNumbers[3] = offsetNumber / 1      % 10;
	offsetNumbers[2] = offsetNumber / 10     % 10;
	offsetNumbers[1] = offsetNumber / 100    % 10;
	offsetNumbers[0] = offsetNumber / 1000   % 10;
	offsetNumbers[5] = offsetNumber / 10000  % 10;
	offsetNumbers[4] = offsetNumber / 100000 % 10;

	int myOut = numbersToText(offsetNumbers)[0];

	secondOut += ivec4(myOutput20[0], myOutput20[1], myOutput21[0], myOutput21[1]) * isIn00;
	thirdOut += ivec4(myOutput22[0], myOutput22[1], myOutput23[0], myOut) * isIn00;
	


	//Is not in coord
	FragColor += ivec4(1) * (1 - isIn00); 
	secondOut += ivec4(1) * (1 - isIn00);
	thirdOut += ivec4(1) * (1 - isIn00);
}