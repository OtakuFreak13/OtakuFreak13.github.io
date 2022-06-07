// CanvasTesting.js
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function vertShader(){
    return`
    attribute vec4 a_Position;
    attribute float a_PointSize;
    uniform mat4 u_MVMatrix;
    uniform mat4 u_PMatrix;
    varying vec4 fragPos;
    varying vec3 rayPos;
    varying vec3 rayDir;
    varying vec3 objPos;
   

    void main() {
        
        gl_Position = u_PMatrix * u_MVMatrix * a_Position;
        objPos = vec4(u_MVMatrix * a_Position).xyz;
        gl_PointSize = a_PointSize; 

    }
    `;
}

function fragShader() {
    return `
    precision mediump float;    
    uniform vec4 u_FragColor;
    uniform vec3 u_CamPos;
    uniform float a_TimeSinceStart;
    uniform float a_TimeLast;
    uniform float u_depthA;
    uniform float u_depthB;
    uniform float u_pitch;
    uniform float u_yaw;
    varying vec4 fragPos;
    varying vec3 rayPos;
    varying vec3 rayDir;
    varying vec3 objPos;

    const int MAX_MARCHING_STEPS = 255;
    const float MIN_DIST = 0.01;
    const float MAX_DIST = 100.0;
    const float EPSILON = 0.0001;


    // rotation stuff

    mat4 rotationMatrix(vec3 axis, float angle) 
    {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
    }
    
    vec3 rotate(vec3 v, vec3 axis, float angle) 
    {
        mat4 m = rotationMatrix(axis, angle);
        return (m * vec4(v, 1.0)).xyz;
    }

    // end of rotation stuff


    // moving sdf from on pos to another and back again
    vec3 oscilate(vec3 pos, vec3 stepSize, float speed) 
    {
        pos += stepSize * sin(a_TimeSinceStart * speed);
        return pos;
    }

    // smooth min taken from iquilezles
    float sMin( float a, float b, float k )
    {
        float h = max( k-abs(a-b), 0.0 )/k;
        return min( a, b ) - h * h * k * (1.0 / 4.0);
    }

    // sphereSDF taken from iquilezles
    float sphereSDF(vec3 point, float radius) {
        return length(point) - radius;
    }
    // boxSDF taken from iquilezles
    float boxSDF(vec3 point, vec3 halfSizeAxis)
    {
    vec3 q = abs(point) - halfSizeAxis;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
    }
    // sdTorus taken from iquilezles
    float sdTorus(vec3 point, vec2 hole)
    {
    vec2 q = vec2(length(point.xz) - hole.x, point.y);
    return length(q)-hole.y;
    }

    // sceneSDF has all objects in world
    float sceneSDF(vec3 samplePoint) {
        float minDist = MAX_DIST;

        // Sphere 1
        vec3 spherePos = oscilate(vec3(-1.0, -2.0, -2.0), vec3(2.5, 3.50, -1.0), 0.5); // vec3(2.0, 1.0, -3.0);
        float sphere = sphereSDF(samplePoint - spherePos, 0.70);

        minDist = sMin(minDist, sphere, 2.0);
        
        // Sphere 2
        vec3 spherePos2 = oscilate(vec3(1.0, 1.0, -2.0), vec3(6, 1, 0), 0.3);
        float sphere2 = sphereSDF(samplePoint - spherePos2, 0.70);
        minDist = sMin(minDist, sphere2, 2.0);

        // Sphere 3
        vec3 spherePos3 = oscilate(vec3(-1.0, -1.0, -5.0), vec3(5, 10, 3), 1.3);
        float sphere3 = sphereSDF(samplePoint - spherePos3, 0.70);
        minDist = sMin(minDist, sphere3, 2.0);

        // Sphere 4
        vec3 spherePos4 = oscilate(vec3(-0.30, 0.30, -2.0), vec3(6, 4, 0), 0.5);
        float sphere4 = sphereSDF(samplePoint - spherePos4, 0.70);
        minDist = sMin(minDist, sphere4, 2.0);

        // Sphere 5
        vec3 spherePos5 = oscilate(vec3(8.0, 7.0, -2.0), vec3(-6, -7, 0), 0.1);
        // rotating before doing "samplePoint - pos" will rotate the object around a point in the world
        spherePos5 = rotate(spherePos5, vec3(0.20, -0.50, 0.0), a_TimeSinceStart / 1.0);
        float sphere5 = sphereSDF(samplePoint - spherePos5, 0.70);
        minDist = sMin(minDist, sphere5, 2.0);

        // Torus 1
        vec3 torusPos = vec3(0.0, 1.0, -2.0);
        torusPos = samplePoint - torusPos;
        torusPos = rotate(torusPos, vec3(1.0, 1.0, 1.0), a_TimeSinceStart / 1.0);
        float torus = sdTorus(torusPos, vec2(5.0 , 0.50));
        minDist = sMin(minDist, torus, 2.0);

        // Floor
        vec3 floorPos = samplePoint - vec3(0.0, -5.0, 0.0);
        float floor = boxSDF(floorPos, vec3(30.0, 0.00, 30.0));
        minDist = sMin(minDist, floor, 2.0);


        // Box 1
        //vec3 boxPosMove = oscilate(vec3(-1.0, -2.0, -2.0), vec3(2.5, 3.50, -1.0), 0.5);
        vec3 boxPos = samplePoint - vec3(0.0, 1.0, -3.0);
        vec3 boxRot = rotate(boxPos, vec3(1.0, 1.0, 0.50), a_TimeSinceStart / 1.0);
        float box = boxSDF(boxRot, vec3(1.0, 1.0, 1.0)); 
        minDist = sMin(minDist, box, 2.0);

        
        // return what was closest of all the objects in scene
        return minDist;//sphereSDF(samplePoint - objPos, 1.0);
    }

    // ray marching tutorial http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/
    float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
        float depth = start;
        for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
            float dist = sceneSDF(eye + depth * marchingDirection);
            if (dist < EPSILON) {
                return depth;
            }
            depth += dist;
            if (depth >= end) {
                return end;
            }
        }
        return end;
    }

    vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
        vec2 xy = fragCoord - size / 2.0;
        float z = size.y / tan(radians(fieldOfView) / 2.0) / 2.0;
        return normalize(vec3(xy, -z));
    }

    vec3 estimateNormal(vec3 p) {
        return normalize(vec3(
            sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
            sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
            sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
        ));
    }

    vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, 
                                vec3 lightPos, vec3 lightIntensity) {
        vec3 N = estimateNormal(p);
        vec3 L = normalize(lightPos - p);
        vec3 V = normalize(eye - p);
        vec3 R = normalize(reflect(-L, N));

        float dotLN = clamp(dot(L, N), 0.0, 1.0); 
        float dotRV = dot(R, V);

        if (dotLN < 0.0) {
            // Light not visible from this point on the surface
            return vec3(0.0, 0.0, 0.0);
        } 

        if (dotRV < 0.0) {
            // Light reflection in opposite direction as viewer, apply only diffuse
            // component
            return lightIntensity * (k_d * dotLN);
        }
        return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
    }

    vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
        const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
        vec3 color = ambientLight * k_a;
        
        vec3 light1Pos = vec3(4.0 * sin(a_TimeSinceStart), 2.0, 4.0 * cos(a_TimeSinceStart));
        vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
        
        color += phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);
        
        vec3 light2Pos = vec3(2.0 * sin(0.37 * a_TimeSinceStart),
                            2.0 * cos(0.37 * a_TimeSinceStart), 2.0);
        vec3 light2Intensity = vec3(0.4, 0.4, 0.4);
        
        color += phongContribForLight(k_d, k_s, alpha, p, eye, light2Pos, light2Intensity);    
        return color;
    }

    void main() {

        // ray march stuff
        vec3 dir = rayDirection(45.0, vec2(800, 500), gl_FragCoord.xy);        
        vec3 eye = u_CamPos; 
        float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);
        
        if (dist > MAX_DIST - EPSILON) {
            // Didn't hit anything
            gl_FragColor = vec4(0.0, 0.50, 0.50, 0.0);
            return;
        }
        
        // phong stuff
        vec3 p = eye + dist * dir;
        vec3 K_a = vec3(0.2, 0.8, 0.2);
        vec3 K_d = vec3(0.4, 0.5, 0.2);
        vec3 K_s = vec3(1.0, 1.0, 1.0);
        float shininess = 40.0;
    
        vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

        gl_FragColor = vec4(color, 1.0);
    }
    `;
}

// Made this way with = (function(){})(); because if not, validation errors due to
// initshaders and getWebGLContext not being defined according to the validator
/* global WebGLUtils */
/* global glMatrix */
window.onload = (function () {
    "use strict";

    // Retrieve <canvas> element
    var canvas = document.getElementById('canvasMetaBalls');

    // Get the rendering context for WebGL
    // This is a fuction in one of the provided libs that
    // hides the difference in getting the context between browsers.
    var gl = WebGLUtils.getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for canvasMetaBalls');
        return;
    }

    //var shader = Object.create(window.ShaderPrototype);
    //var vertexShaderUrl = window.location.origin + "/shaders/vertShader.glsl";
    //var fragmentShaderUrl = window.location.origin; + "/shaders/fragShader.glsl";
    //shader.load(vertexShaderUrl,fragmentShaderUrl);
    //var ctx = document.getElementById("canvasMetaBalls").getContext("webgl");	
    //shader.compile(gl);
    var vertSH = createShader(gl,  gl.VERTEX_SHADER, vertShader());
    var fragSH = createShader(gl, gl.FRAGMENT_SHADER, fragShader());
    var program = createProgram(gl, vertSH, fragSH);
    
    // // Setup GLSL program
    //var program = WebGLUtils.createProgramFromScripts(
    //    gl,
    //    ["vertex-shader", "fragment-shader"]
    //);

    gl.useProgram(program);//program);

    // enable depth and set far and near
    gl.enable(gl.DEPTH_TEST);
    var far = 100.0;
    var near = 0.1;

    // Get the storage location of attribute variable
    var a_Position = gl.getAttribLocation(program, 'a_Position');

    // Get the storage location of attribute variable
    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');

    // Set vertex position to attribute variable
    gl.vertexAttrib1f(a_PointSize, 5000.0);

    // Get storage location of uniform variable
    var u_FragColor = gl.getUniformLocation(program, 'u_FragColor');

    // Get the storage location of uniform variable
    var a_TimeSinceStart = gl.getUniformLocation(program, 'a_TimeSinceStart');
    var a_TimeLast = gl.getUniformLocation(program, 'a_TimeLast');

    // Stuff for mvp
    var mvMatrix = glMatrix.mat4.create();
    var pMatrix = glMatrix.mat4.create();
    //var camPos = glMatrix.vec3.create();
    var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
    var u_MVMatrix = gl.getUniformLocation(program, "u_MVMatrix");
    var u_CamPos = gl.getUniformLocation(program, "u_CamPos");

    // fixing depth for raymarching
    var depthA = (far+near) / (far-near);
    var depthB = 2.0 * far * near / (far-near);
    var u_depthA = gl.getUniformLocation(program, "u_depthA");
    var u_depthB = gl.getUniformLocation(program, "u_depthB");
    gl.uniform1f(u_depthA, depthA);
    gl.uniform1f(u_depthB, depthB);

    // world stores pos and other info of point (rect) in the scene
    var world = {
        objects: []
    };

    world.add = function (angle, speed, color, scale, x, y, z, rotAxis, rotAroundWorld) {
        color = new Float32Array(color);
        this.objects.push({
            angle: angle,
            speed: speed,
            color: color,
            scale: scale,
            x: x,
            y: y,
            z: z,
            rotAxis: rotAxis,
            rotAroundWorld: rotAroundWorld,
        });
    };

    // Adding the point
    world.add(0, 0, [0.0, 1.0, 0.0, 1.0], 1.0,
        0.0, 1.0, 0.0, // x, y, z
        [0.0, 0.0, 1.0], false);

    // Pause and play button that pauses the webgl stuff when the button is hit
    // taken from kmom02
    var request = null;
    // time stuff here so that the animations don't suddenly
    // jump when the program start again
    var timeDiff = 0.0;
    var timeStop;
    var startTime = Date.now();
    var playElement = document.getElementById("playBalls");
    playElement.addEventListener("click", function () {
        if (request === null) {
            gameLoop();
            timeDiff = Date.now() - timeStop;
            startTime += timeDiff;
        }
    });

    var pauseElement = document.getElementById("pauseBalls");
    pauseElement.addEventListener("click", function () {
        if (request) {
            window.cancelRequestAnimFrame(request);
            request = null;
            timeStop = Date.now();
        }
    });

    /**
    * Code for moving in the scene
    * Mostly taken from the example "moveWASD"
    */
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }


    var pitch = 0;

    var yaw = 0;

    var xPos = 0.0;
    var yPos = 0.0;
    var zPos = 5.0;

    var moveX = 0.0;
    var moveY = 0.0;
    var moveZ = 0.0;

    function handleKeys() {
        if (currentlyPressedKeys[33] || currentlyPressedKeys[32]) {
            // Page Up or Spacebar
            moveY = 0.1; 
        } else if (currentlyPressedKeys[34] || currentlyPressedKeys[16]) {
            // Page Down or Shift
            moveY = -0.1; 
        } else {
            moveY = 0.0; 
        }

        if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
        // Left cursor key or A
            moveX = 0.1;
        } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
            // Right cursor key or D
            moveX = -0.1;
        } else {
            moveX = 0.0;
        }

        if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
            // Up cursor key or W
            moveZ = 0.1;
            
        } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
            // Down cursor key or S
            moveZ = -0.1; 
            
        } else {
            moveZ = 0.0;
        }
    }


    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    

    var lastTime = 0;

    function moveInScene() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {

            if ((moveX || moveY || moveZ!= 0)) {
                xPos -= moveX;
                zPos -= moveZ;

                
                
                yPos += moveY;
            }
        }

        lastTime = timeNow;
    }

    /**
    * Drawing the scene
    */
    // for drawing the point (rectangle) that all the ray marching is drawn in
    glMatrix.mat4.perspective(pMatrix, 45, canvas.width / canvas.height, near, far);
    glMatrix.mat4.identity(mvMatrix);
    glMatrix.mat4.rotate(mvMatrix, mvMatrix, degToRad(-pitch), [1, 0, 0]);
    glMatrix.mat4.rotate(mvMatrix, mvMatrix, degToRad(-yaw), [0, 1, 0]);
    glMatrix.mat4.translate(mvMatrix, mvMatrix, [-xPos, -yPos, -zPos]);

    gl.uniformMatrix4fv(u_PMatrix, false, pMatrix);
    gl.uniformMatrix4fv(u_MVMatrix, false, mvMatrix);


    xPos = 0.0;
    yPos = 1.0;
    zPos = 15.0;

    function draw() {
        var i;
        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

        gl.uniform3f(u_CamPos, xPos, yPos, zPos);

        // drawing the objects in the scene
        for (i = 0; i < world.objects.length; i++) {
            gl.vertexAttrib3f(a_Position, world.objects[i].x, world.objects[i].y,
                world.objects[i].z);
            // Pass variable with color
            gl.uniform4f(u_FragColor, world.objects[i].color[0], world.objects[i].color[1],
                world.objects[i].color[2], world.objects[i].color[3]);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    /**
     * A gameloop to animate
     */
    var lastTick;

    var fps_time = 0;
    var fps_Frames = 0;
    var g_last = 0;

    function gameLoop() {
        var now = Date.now();
        var dt = (now - (lastTick || now)) / 1000;
        lastTick = now;
        // sending time since start and last ticks time (in seconds)
        // to the shader for calculations
        gl.uniform1f(a_TimeSinceStart, (now - startTime) * 0.001);
        gl.uniform1f(a_TimeLast, (lastTick - startTime) * 0.001);


        request = window.requestAnimFrame(gameLoop);
        handleKeys();

        // fps counter taget från kmom02
        var elapsed = now - g_last;
        g_last = now;
        fps_time += elapsed; // Öka på Tidsräknaren
        fps_Frames++;        // Öka på Frameräknaren

        if (fps_time > 1000) {
            // Räkna ut FPS. Det är 1000 då fps_time är i millisekunder
            var fps = 1000 * fps_Frames / fps_time;
            // Uppdatera värdet i sandboxen
            document.getElementById("fpsBalls").innerHTML = Math.round(fps);
            // Nollställ räknaren
            fps_time = fps_Frames = 0;
        }

        draw(dt);
        moveInScene();
    }

    console.log("Everything is ready.");
    gameLoop();
})();
