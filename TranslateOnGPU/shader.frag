#version 330 core 
#extension GL_EXT_gpu_shader4 : enable

uniform sampler2D words;

layout(location = 0) out vec4 FragColor; 
layout(location = 1) out float secondOut;

float isInCoord(float x, float y)
{
	return step(x, gl_FragCoord.x) * step(gl_FragCoord.x, x + 1) * step(y, gl_FragCoord.y) * step(gl_FragCoord.y, y + 1 );
}


void main() 
{
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
    
    
	float output[2];

	output[0] = (intBitsToFloat((word[0] << 24) | (word[1] << 16) | (word[2] << 8) | word[3]));
	output[1] = (intBitsToFloat((word[4] << 24) | word[5] << 16 & 0xFFFF0000));

	FragColor += vec4(intBitsToFloat(0x68616C6C),intBitsToFloat(0x6F5F7765),output[0],output[1]) * isIn00;
	secondOut += intBitsToFloat(0x34333231) * isIn00;

	//Is not in coord
	FragColor += vec4(1.0) * (1 - isIn00); 
	secondOut += 1.0 * (1 - isIn00);
}