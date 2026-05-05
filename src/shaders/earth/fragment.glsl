uniform sampler2D uStyTexture;
varying vec2 vUv;
varying vec3 vertexNormal;

void main()
{
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0,0.0,1.0));
    vec3 atmosphere = vec3(0.8, 0.2, 1) * pow(intensity, 1.9);

    gl_FragColor = vec4(atmosphere + texture2D(uStyTexture, vUv).xyz, 1.0);
}