// CanvasTesting.js

// Made this way with = (function(){})(); because if not, validation errors due to
// initshaders and getWebGLContext not being defined according to the validator
/* global WebGLUtils, Matrix4 */

/** -------------------------------------------------------------------
 * Create an object for the control panel.
 */
 function ControlPanel(mvp) {
    this.mvp = mvp;

    this.elEyeX = document.getElementById("eyeX");
    this.elEyeY = document.getElementById("eyeY");
    this.elEyeZ = document.getElementById("eyeZ");

    this.elAtX = document.getElementById("atX");
    this.elAtY = document.getElementById("atY");
    this.elAtZ = document.getElementById("atZ");

    this.elUpX = document.getElementById("upX");
    this.elUpY = document.getElementById("upY");
    this.elUpZ = document.getElementById("upZ");

    this.elAngle = document.getElementById("angle");
    this.elrx = document.getElementById("rx");
    this.elry = document.getElementById("ry");
    this.elrz = document.getElementById("rz");

    this.eltx = document.getElementById("tx");
    this.elty = document.getElementById("ty");
    this.eltz = document.getElementById("tz");

    this.elFov = document.getElementById("fov");
    this.elAspect = document.getElementById("aspect");
    this.elNear = document.getElementById("near");
    this.elFar = document.getElementById("far");
}

/**
 * Update the control panel to reflect current settings.
 */
ControlPanel.prototype.updateFromMVP = function () {
    this.elEyeX.value = this.mvp.eyeX;
    this.elEyeY.value = this.mvp.eyeY;
    this.elEyeZ.value = this.mvp.eyeZ;

    this.elAtX.value = this.mvp.atX;
    this.elAtY.value = this.mvp.atY;
    this.elAtZ.value = this.mvp.atZ;

    this.elUpX.value = this.mvp.upX;
    this.elUpY.value = this.mvp.upY;
    this.elUpZ.value = this.mvp.upZ;

    this.elAngle.value = this.mvp.angle;
    this.elrx.value = this.mvp.rx;
    this.elry.value = this.mvp.ry;
    this.elrz.value = this.mvp.rz;

    this.eltx.value = this.mvp.tx;
    this.elty.value = this.mvp.ty;
    this.eltz.value = this.mvp.tz;

    this.elFov.value = this.mvp.fov;
    this.elAspect.value = this.mvp.aspect;
    this.elNear.value = this.mvp.near;
    this.elFar.value = this.mvp.far;
};


/**
 * Update from the control panel to reflect current settings.
 */
ControlPanel.prototype.updateMVP = function () {
    this.mvp.eyeX = parseFloat(this.elEyeX.value);
    this.mvp.eyeY = parseFloat(this.elEyeY.value);
    this.mvp.eyeZ = parseFloat(this.elEyeZ.value);

    this.mvp.atX = parseFloat(this.elAtX.value);
    this.mvp.atY = parseFloat(this.elAtY.value);
    this.mvp.atZ = parseFloat(this.elAtZ.value);

    this.mvp.upX = parseFloat(this.elUpX.value);
    this.mvp.upY = parseFloat(this.elUpY.value);
    this.mvp.upZ = parseFloat(this.elUpZ.value);

    this.mvp.angle = parseFloat(this.elAngle.value);
    this.mvp.rx = parseFloat(this.elrx.value);
    this.mvp.ry = parseFloat(this.elry.value);
    this.mvp.rz = parseFloat(this.elrz.value);

    this.mvp.tx = parseFloat(this.eltx.value);
    this.mvp.ty = parseFloat(this.elty.value);
    this.mvp.tz = parseFloat(this.eltz.value);

    this.mvp.fov = parseFloat(this.elFov.value);
    this.mvp.aspect = parseFloat(this.elAspect.value);
    this.mvp.near = parseFloat(this.elNear.value);
    this.mvp.far = parseFloat(this.elFar.value);
};



/** -------------------------------------------------------------------
 * Keypress object
 */
function KeyPress(mvp, step) {
    this.mvp = mvp;
    this.step = step || 0.05;
}



/**
 * Keypress event handler
 *
 * @return Boolean true if an update was made, else false
 */
KeyPress.prototype.handler = function (event) {
    console.log(event.keyCode);

    switch (event.keyCode) {
        case 39:   //ArrowRight
            this.mvp.eyeX += this.step;
            break;

        case 37:   //ArrowLeft
            this.mvp.eyeX -= this.step;
            break;

        case 40:   //ArrowDown
            this.mvp.eyeY -= this.step;
            break;

        case 38:   //ArrowUp
            this.mvp.eyeY += this.step;
            break;

        case 82:  //r
            this.mvp.angle += this.step * 20;
            break;

        case 85:   //u
            this.mvp.near += this.step;
            break;

        case 73:   //i
            this.mvp.near -= this.step;
            break;

        case 74:   //j
            this.mvp.far += this.step;
            break;

        case 75:   //k
            this.mvp.far -= this.step;
            break;

        case 87:   //w
            this.mvp.tz += this.step;
            break;

        case 83:   //s
            this.mvp.tz -= this.step;
            break;

        case 65:   //a
            this.mvp.tx -= this.step;
            break;

        case 68:   //d
            this.mvp.tx += this.step;
            break;

        default:
            return false;
    }

    return true;
};


/** -------------------------------------------------------------------
 * Create an object Projection, Model, View
 */
function MVP() {
    this.eyeX = 0;
    this.eyeY = 0;
    this.eyeZ = 0;

    this.atX = 0;
    this.atY = 0;
    this.atZ = -1;

    this.upX = 0;
    this.upY = 1;
    this.upZ = 0;

    this.view = new Matrix4();

    this.angle = 0;
    this.rx = 0;
    this.ry = 0;
    this.rz = 1;

    this.tx = 0;
    this.ty = 0;
    this.tz = 0;

    this.model = new Matrix4();

    this.fov = 30;
    this.aspect = 800 / 500;
    this.near = 1;
    this.far = 100;

    this.projection = new Matrix4();

    // Combined mvp matrix
    this.matrix = new Matrix4();
}


/**
 * Set view.
 */
MVP.prototype.setView = function (eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
    this.eyeX = eyeX || 0;
    this.eyeY = eyeY || 0;
    this.eyeZ = eyeZ || 0;

    this.atX = atX || 0;
    this.atY = atY || 0;
    this.atZ = atZ || -1;

    this.upX = upX || 0;
    this.upY = upY || 1;
    this.upZ = upZ || 0;
};


/**
 * Set view.
 */
MVP.prototype.setPerspective = function (fov, aspect, near, far) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
};


/**
 * Update the matrix based on current values.
 */
MVP.prototype.update = function () {
    this.view.setLookAt(
        this.eyeX, this.eyeY, this.eyeZ,
        this.atX, this.atY, this.atZ,
        this.upX, this.upY, this.upZ
    );

    // this.model.setTranslate(this.tx, this.ty, this.tz);
    // this.model.rotate(this.angle, this.rx, this.ry, this.rz);

    //this.projection.setOrtho(this.left, this.right, this.bottom, this.top, this.near, this.far);
    this.projection.setPerspective(this.fov, this.aspect, this.near, this.far);

    this.matrix.set(this.projection).multiply(this.view)/*.multiply(this.model)*/;
};



/** -------------------------------------------------------------------
 * Rectangle with vertices and texture position.
 */
function setGeometryThreeTriangles(gl) {
    var data = {
        usage: gl.STATIC_DRAW,
        mode: gl.TRIANGLES,
        fsize: null,
        n: 36,
        vertex: new Float32Array([
            // Create a cube
            //    v6----- v5
            //   /|      /|
            //  v1------v0|
            //  | |     | |
            //  | |v7---|-|v4
            //  |/      |/
            //  v2------v3
            // Front face        // Front UV
            -1.0, -1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, 0.0, 1.0,
            // Back face         // Back UV
            -1.0, -1.0, -1.0, 0.0, 0.0,
            -1.0, 1.0, -1.0, 1.0, 0.0,
            1.0, 1.0, -1.0, 1.0, 1.0,
            1.0, -1.0, -1.0, 0.0, 1.0,
            // Top face         // Top UV
            -1.0, 1.0, -1.0, 0.0, 0.0,
            -1.0, 1.0, 1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, -1.0, 0.0, 1.0,
            // Bottom face       // Bottom UV
            -1.0, -1.0, -1.0, 0.0, 0.0,
            1.0, -1.0, -1.0, 1.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0, 0.0, 1.0,
            // Right face        // Right UV
            1.0, -1.0, -1.0, 0.0, 0.0,
            1.0, 1.0, -1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, -1.0, 1.0, 0.0, 1.0,
            // Left face         // Left UV
            -1.0, -1.0, -1.0, 0.0, 0.0,
            -1.0, -1.0, 1.0, 1.0, 0.0,
            -1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0, 0.0, 1.0
            // // Vertex coordinates and  UV
            // /* eslint-disable indent */
            // 1.0, 1.0, 1.0, 0.0, 1.0,  // v0 White
            // -1.0, 1.0, 1.0, 1.0, 1.0,  // v1 Magenta
            // -1.0, -1.0, 1.0, 1.0, 0.0,  // v2 Red
            // 1.0, -1.0, 1.0, 0.0, 0.0,  // v3 Yellow
            // 1.0, -1.0, -1.0, 0.0, 1.0,  // v4 Green
            // 1.0, 1.0, -1.0, 0.0, 0.0,  // v5 Cyan
            // -1.0, 1.0, -1.0, 1.0, 0.0,  // v6 Blue
            // -1.0, -1.0, -1.0, 1.0, 1.0  // v7 Black
            // /* eslint-enable indent */


        ]),
        indice: new Uint8Array([
            0, 1, 2, 0, 2, 3,       // front
            4, 5, 6, 4, 6, 7,       // back
            8, 9, 10, 8, 10, 11,    // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23  // left
        ])
    };

    data.fsize = data.vertex.BYTES_PER_ELEMENT;

    return data;
}

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

function vertShader() {
    return`
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        attribute vec2 a_TexCoord;

        uniform mat4 u_ModelMatrix;
        uniform mat4 u_VpMatrix;

        varying vec4 v_Color;
        varying vec2 v_TexCoord;

        void main() {
            gl_Position = u_VpMatrix * u_ModelMatrix * a_Position;
            v_TexCoord = a_TexCoord;
        }
    `;
}

function fragShader() {
    return`
        precision mediump float;

        varying vec2 v_TexCoord;
        uniform sampler2D u_Sampler;

        void main() {
            gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        }
    `;
}

window.onload = (function () {
    "use strict";

    // Retrieve <canvas> element
    var canvas = document.getElementById('canvasCubes3D');

    // Get the rendering context for WebGL
    // This is a fuction in one of the provided libs that
    // hides the difference in getting the context between browsers.
    var gl = WebGLUtils.getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for canvasCubes3D');
        return;
    }

    var vertSH = createShader(gl,  gl.VERTEX_SHADER, vertShader());
    var fragSH = createShader(gl, gl.FRAGMENT_SHADER, fragShader());
    var program = createProgram(gl, vertSH, fragSH);

    // Setup GLSL program
    // var program = WebGLUtils.createProgramFromScripts(
    //     gl,
    //     ["vertex-shader", "fragment-shader"]
    // );
    
    gl.useProgram(program);

    // Create a buffer
    var vertexBuffer = gl.createBuffer();
    var indiceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiceBuffer);

    // Enable hinnden surface removal
    gl.enable(gl.DEPTH_TEST);


    // Get the storage location of attribute variable
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    var u_VpMatrix = gl.getUniformLocation(program, "u_VpMatrix");
    var u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
    var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");


    // Get storage location of uniform variable
    //var a_Color = gl.getAttribLocation(program, "a_Color");
    var u_FragColor = gl.getUniformLocation(program, "u_FragColor");

    // Set Geometry
    var data = setGeometryThreeTriangles(gl);

    // Define parts for position
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, data.fsize * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    // Define parts for texture
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, data.fsize * 5, data.fsize * 3);
    gl.enableVertexAttribArray(a_TexCoord);

    // var cubeText = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, cubeText);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    //     new Uint8Array([255, 0, 0, 255]));
    // gl.bindTexture(gl.TEXTURE_2D, null);

    // var img = document.getElementById("cubeTexImg");//new Image();
    // //img.src = document.getElementById("cubeTexImg");
    // img.onload = function () {
    //     gl.bindTexture(gl.TEXTURE_2D, cubeText);

    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // }

    function getTexture(imgId) {
        var cubeText = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, cubeText);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255]));

        var img = new Image;
        img = document.getElementById(imgId);//new Image();
        //img.src = document.getElementById("cubeTexImg");
        img.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, cubeText);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        gl.bindTexture(gl.TEXTURE_2D, null);
        return cubeText;
    }

    //gl.bindTexture(gl.TEXTURE_2D, null);



    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, data.vertex, data.usage);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indice, data.usage);


    // Create various objects for the world
    var mvp = new MVP();
    var cp = new ControlPanel(mvp);
    var key = new KeyPress(mvp, 0.05);

    // mvp.setView(3, 3, 7, 0, 0, 0, 0, 1, 0);
    mvp.setView(0, -22, 4, 0, 0, 0, 0, 1, 0);
    mvp.setPerspective(30, 800 / 500, 1, 100);

    cp.updateFromMVP();

    window.addEventListener("keydown", function (event) {
        if (key.handler(event)) {
            cp.updateFromMVP();
            // update();
            // draw();
        }
    });

    // document.getElementById("update").addEventListener("click", function () {
    //     cp.updateMVP();
    //     update();
    //     draw();
    // });

    /**
     * Prepare to add a lot of objects to the world
     */
    var world = {
        objects: []
    };
    world.add = function (angle, speed, color, scale, x, y, z, rotAxis, rotAroundWorld, texture) {
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
            texture: texture
        });
    };

    // Add the first object
    world.add(0, -10, [0.0, 1.0, 0.0, 1.0], 1.0, 0.0, 0.0, 0.0,
        [0.0, 0.0, 1.0], false, getTexture("helixTexImg"));

    // Add the second object
    world.add(0, 20, [1.0, 0.0, 0.0, 1.0], 0.5, 1.0, 0.0, 3.0,
        [1.0, 1.0, 0.0], false, getTexture("chessTexImg"));

    // Add the third object
    world.add(0, 20, [1.0, 0.0, 0.4, 1.0], 2.0, 2.0, 0.0, -5.0,
        [1.0, 0.0, 1.0], true, getTexture("cubeTexImg"));

    // world.objects[0].color[0] += 1;
    // world.objects[0].color[1] += 1;
    // world.objects[0].color[2] += 1;
    // world.objects[1].color[0] += 1;
    // world.objects[1].color[1] += 1;
    // world.objects[1].color[2] += 1;
    // world.objects[2].color[0] += 1;
    // world.objects[2].color[1] += 1;
    // world.objects[2].color[2] += 1;
    /**
     * Update and respect timediff
     */
    var speed = 0.1;

    var fps_time = 0;       // Skapa variablerna som behövs
    var fps_Frames = 0;     // Skapa variablerna som behövs
    var g_last = 0;

    function update(td) {
        var i;
        var object;
        var now = Date.now();
        var elapsed = now - g_last;

        mvp.update();
        gl.uniformMatrix4fv(u_VpMatrix, false, mvp.matrix.elements);
        cp.updateFromMVP();

        g_last = now;

        fps_time += elapsed; // Öka på Tidsräknaren
        fps_Frames++;        // Öka på Frameräknaren

        if (fps_time > 1000) {
            // Räkna ut FPS. Det är 1000 då fps_time är i millisekunder
            var fps = 1000 * fps_Frames / fps_time;
            // Uppdatera värdet i sandboxen
            document.getElementById("fpsCubes").innerHTML = Math.round(fps);
            // Nollställ räknaren
            fps_time = fps_Frames = 0;
        }

        for (i = 0; i < world.objects.length; i++) {
            object = world.objects[i];
            object.angle = (object.angle + object.speed * speed * td) % 360;
        }
    }

    /**
     * Draw it
     */
    function draw() {
        var i;
        var object;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (i = 0; i < world.objects.length; i++) {
            var modelMatrix = new Matrix4();
            object = world.objects[i];

            // if true rotate around the worlds --- axis
            if (object.rotAroundWorld) {
                modelMatrix.rotate(
                    object.angle, object.rotAxis[0], object.rotAxis[1], object.rotAxis[2]);
                modelMatrix.translate(object.x, object.y, object.z);
                modelMatrix.scale(object.scale, object.scale, object.scale);
            } else {
                // if false rotate around models --- axis
                modelMatrix.translate(object.x, object.y, object.z);
                modelMatrix.rotate(
                    object.angle, object.rotAxis[0], object.rotAxis[1], object.rotAxis[2]);
                modelMatrix.scale(object.scale, object.scale, object.scale);
            }

            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            gl.uniform4fv(u_FragColor, object.color);

            //gl.drawArrays(data.mode, 0, data.n);
            gl.bindTexture(gl.TEXTURE_2D, object.texture);
            gl.drawElements(data.mode, data.n, gl.UNSIGNED_BYTE, 0);
        }
    }

    /**
     * A gameloop to animate
     */
    var lastTick;
    var request = null;

    function gameLoop() {
        var now = Date.now();
        var td = (now - (lastTick || now)) / 1000;
        lastTick = now;

        request = window.requestAnimFrame(gameLoop);

        //cp.updateFromMVP();
        cp.updateMVP();
        update(td);
        draw();
    }

    /**
     * Control panel
     */
    var playElement = document.getElementById("playCubes");
    playElement.addEventListener("click", function () {
        if (request === null) {
            gameLoop();
        }
    });

    var pauseElement = document.getElementById("pauseCubes");
    pauseElement.addEventListener("click", function () {
        if (request) {
            window.cancelRequestAnimFrame(request);
            request = null;
        }
    });

    var speedElement = document.getElementById("speed");
    speedElement.addEventListener("change", function () {
        speed = parseFloat(speedElement.value);
    });

    // // Do it
    // update();
    // render();

    /**
     * Update before drawing
     */
    // function update() {
    //     mvp.update();
    //     //gl.uniformMatrix4fv(u_ModelMatrix, false, mvp.model.elements);
    //     //gl.uniformMatrix4fv(u_ViewMatrix,  false, mvp.view.elements);
    //     //gl.uniformMatrix4fv(u_ProjMatrix,  false, mvp.projection.elements);
    //     gl.uniformMatrix4fv(u_MvpMatrix, false, mvp.matrix.elements);
    // }



    /**
     * Render it all
     */
    // function render() {
    //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //     //gl.drawArrays(data.mode, 0, data.n);
    //     // Draw the cube
    //     gl.drawElements(data.mode, data.n, gl.UNSIGNED_BYTE, 0);
    // }




    // /**
    //  * Prepare to add a lot of objects to the world
    //  */
    // var world = {
    //     objects: []
    // };

    // world.add = function (angle, speed, color, scale, transX, transY) {
    //     color = new Float32Array(color);

    //     this.objects.push({
    //         angle: angle,
    //         speed: speed,
    //         color: color,
    //         scale: scale,
    //         transX: transX,
    //         transY: transY
    //     });
    // };

    // // Add the first object
    // world.add(0, 10, [0.0, 1.0, 0.0, 1.0], 1.0, 0, 0);


    // /**
    //  * Update and respect timediff
    //  */
    // var speed = 0.1;

    // var fps_time = 0;       // Skapa variablerna som behövs
    // var fps_Frames = 0;     // Skapa variablerna som behövs
    // var g_last = 0;

    // function update(td) {
    //     var i;
    //     var object;
    //     var now = Date.now();
    //     var elapsed = now - g_last;

    //     g_last = now;

    //     fps_time += elapsed; // Öka på Tidsräknaren
    //     fps_Frames++;        // Öka på Frameräknaren

    //     if (fps_time > 1000) {
    //         // Räkna ut FPS. Det är 1000 då fps_time är i millisekunder
    //         var fps = 1000 * fps_Frames / fps_time;
    //         // Uppdatera värdet i sandboxen
    //         document.getElementById("fps").innerHTML = Math.round(fps);
    //         // Nollställ räknaren
    //         fps_time = fps_Frames = 0;
    //     }

    //     for (i = 0; i < world.objects.length; i++) {
    //         object = world.objects[i];
    //         object.angle = (object.angle + object.speed * speed * td) % 360;
    //     }
    // }
    // /**
    //  * Draw it
    //  */
    // function draw() {
    //     var i;
    //     var object;
    //     gl.clear(gl.COLOR_BUFFER_BIT);

    //     for (i = 0; i < world.objects.length; i++) {
    //         var modelMatrix = new Matrix4();
    //         object = world.objects[i];

    //         modelMatrix.translate(object.transX, object.transY, 0);
    //         modelMatrix.rotate(object.angle, 0, 0, 1);
    //         modelMatrix.scale(object.scale, object.scale, object.scale);

    //         gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    //         gl.uniform4fv(u_FragColor, object.color);

    //         gl.drawArrays(data.mode, 0, data.n);
    //     }
    // }

    // /**
    //  * A gameloop to animate
    //  */
    // var lastTick;
    // var request = null;

    // function gameLoop() {
    //     var now = Date.now();
    //     var td = (now - (lastTick || now)) / 1000;
    //     lastTick = now;

    //     request = window.requestAnimFrame(gameLoop);

    //     update(td);
    //     draw();
    // }


    // /**
    //  * Control panel
    //  */
    // var playElement = document.getElementById("play");
    // playElement.addEventListener("click", function () {
    //     if (request === null) {
    //         gameLoop();
    //     }
    // });

    // var pauseElement = document.getElementById("pause");
    // pauseElement.addEventListener("click", function () {
    //     if (request) {
    //         window.cancelRequestAnimFrame(request);
    //         request = null;
    //     }
    // });

    // var addElement = document.getElementById("add");
    // addElement.addEventListener("click", function () {
    //     var angle = parseFloat(document.getElementById("angle").value);
    //     // Make sure that angle is within accepted parameters.
    //     // Esspecially that it is not NaN.
    //     if (angle < 0.0 || isNaN(angle)) {
    //         angle = 0.0;
    //     }

    //     var velocity = parseFloat(document.getElementById("velocity").value);
    //     // Make sure that velocity is within accepted parameters.
    //     // Esspecially that it is not NaN.
    //     if (velocity < 0.1 || velocity > 20 || isNaN(velocity)) {
    //         velocity = 1.0;
    //     }
    //     var scale = parseFloat(document.getElementById("size").value);
    //     // Make sure that scale is within accepted parameters.
    //     // Esspecially that it is not NaN.
    //     if (scale < 0.1 || scale > 2 || isNaN(scale)) {
    //         scale = 1.0;
    //     }

    //     // Get color as hexadecimal.
    //     var color = document.getElementById("color").value;
    //     // Parse it via regex.
    //     color = color.match(/[A-Za-z0-9]{2}/g)
    //         .map(function (v) {
    //             return parseInt(v, 16) / 255.0;
    //         }
    //         );
    //     color.push(1.0);

    //     var transX = parseFloat(document.getElementById("translateX").value);
    //     // Make sure that transX is within the canvas.
    //     if (isNaN(transX)) {
    //         transX = 0.0;
    //     } else if (transX > canvas.width) {
    //         transX = canvas.width;
    //     } else if (transX < -canvas.width) {
    //         transX = -canvas.width;
    //     }


    //     var transY = parseFloat(document.getElementById("translateY").value);
    //     // Make sure that transY is within the canvas.
    //     if (isNaN(transY)) {
    //         transY = 0.0;
    //     } else if (transY > canvas.height) {
    //         transY = canvas.height;
    //     } else if (transY < -canvas.height) {
    //         transY = -canvas.height;
    //     }

    //     world.add(angle, velocity, color, scale, transX / canvas.width, transY / canvas.height);
    // });

    // var speedElement = document.getElementById("speed");
    // speedElement.addEventListener("change", function () {
    //     speed = parseFloat(speedElement.value);
    // });


    // var addRandomElement = document.getElementById("addRand");
    // addRandomElement.addEventListener("click", function () {
    //     var quantity = parseInt(document.getElementById("quantity").value);
    //     if (isNaN(quantity) || quantity < 0) {
    //         quantity = 1;
    //     }
    //     for (let i = 0; i < quantity; i++) {
    //         var angle = Math.random() * 360;
    //         var speed = Math.random() * 20;
    //         var scale = Math.random() * 2;
    //         var x = Math.random() * (canvas.width + canvas.width + 1) - canvas.width;
    //         var y = Math.random() * (canvas.height + canvas.height + 1) - canvas.height;
    //         var color = [Math.random(), Math.random(), Math.random(), 1.0];
    //         // If the color is the same as the black background then
    //         // change it to white instead.
    //         if (color[0] == 0 && color[1] == 0 && color[2] == 0) {
    //             color = [1.0, 1.0, 1.0, 1.0];
    //         }
    //         world.add(angle, speed, color, scale, x / canvas.width, y / canvas.height);
    //     }
    // });


    console.log("Everything is ready.");
    gameLoop();
})();