/*

main.js is a dependency for filters.js

*/

// Create WebGL program from context an' shaderz
const createWebGLProgram = (gl, vertexShader, fragmentShader) => {
    // Create our shaders
    const vertex_shader = gl.createShader(gl.VERTEX_SHADER)
    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER)
    // Set the shaders to the shader detailed in the non-parsed script tags
    gl.shaderSource(vertex_shader, vertexShader)
    gl.shaderSource(fragment_shader, fragmentShader)
    // Compile the shaders for processin'
    gl.compileShader(vertex_shader)
    gl.compileShader(fragment_shader)
    // Create our program
    const program = gl.createProgram()
    // Attach our shaders
    gl.attachShader(program, vertex_shader)
    gl.attachShader(program, fragment_shader)
    // Link our program to the context
    gl.linkProgram(program)
    // Use our program
    gl.useProgram(program)
    return program
}
const buffer = (gl, program, arr, attrib, num = 0, size = 0, type = gl.FLOAT, normalize = gl.FALSE, offset = 0) => {
    // Makes it easier to input arrays
    if (arr instanceof Array) arr = new Float32Array(arr.flat(2))
    else if (!(arr instanceof Float32Array) || typeof attrib !== 'string') return
    // Create buffer
    const BUFFER = gl.createBuffer()
    // Assign property to the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER)
    // Assign our data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW)
    // Get our position attribute
    const attribute = gl.getAttribLocation(program, attrib)
    // Tell the GPU how to read our attribute
    gl.vertexAttribPointer(attribute, //attribute
        num, // Elements per attribute
        type, // Type of elements
        normalize, // Normalize?
        0, // Size of vertex in bytes
        0 // Offset from single vertex to this attribute
    )
    //add our buffer data to the attribute
    gl.enableVertexAttribArray(attribute)
}
const texture = (gl, canvas, width, height) => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
}
const getWeight = kernel => {
    const weight = kernel.reduce((p, c) => p + c)
    return weight <= 0 ? 1 : weight
}
const determineShader = (name, val) => {
    // Utility function
    const constrain = (a, b, c) => Math.min(Math.max(a, b), c)
    if (typeof val !== "number") return
    switch (name) {
        case 'opaque':
            return `
            vec4 tex = texture2D(Sampler, texture);
            gl_FragColor = vec4(tex.rgb, 1.0);
            `
        case 'invert':
            return `
            vec4 tex = texture2D(Sampler, texture);
            gl_FragColor = vec4(1.0 - tex.r, 1.0 - tex.g, 1.0 - tex.b, tex.a);
            `
        case 'threshold':
            return `
            lowp float threshold = ${constrain(val, 0, 1) | 0}.0;
            vec4 tex = texture2D(Sampler, texture);
            float color = (0.2126 * tex.r + 0.7152 * tex.g + 0.0722 * tex.b) >= threshold ? 255.0 : 0.0;
            gl_FragColor = vec4(color, color, color, tex.a);
            `
        case 'brightness':
            return `
            lowp float brightness = ${constrain(val, 0, 255) | 0}.0 / 255.0;
            vec4 tex = texture2D(Sampler, texture);
            gl_FragColor = vec4(tex.r + brightness, tex.g + brightness, tex.b + brightness, tex.a);
            `
        case 'grayscale':
            return `
            vec4 tex = texture2D(Sampler, texture);
            float color = 0.299 * tex.r + 0.587 * tex.g + 0.114 * tex.b;
            gl_FragColor = vec4(color, color, color, tex.a);
            `
        case 'posterize':
            if ((val | 0) !== val) return
            return `
            lowp float num = ${constrain(val, 2, 255) | 0}.0;
            vec4 color = texture2D(Sampler, texture);
            gl_FragColor = vec4(floor(color.r * num) / (num - 1.0), floor(color.g * num) / (num - 1.0), floor(color.b * num) / (num - 1.0), floor(color.a * num) / (num - 1.0));
            `
        case 'weird posterize':
            return `
            lowp float num = ${constrain(val, 2, 255) | 0}.0;
            vec4 color = texture2D(Sampler, texture);
            gl_FragColor = vec4(floor(color.r * num) / (num - 1.0), floor(color.g * num) / (num - 1.0), floor(color.b * num) / (num - 1.0), color);
            `
        default:
            const kernels = {
                sharpen: [
                    0, -1, 0,
                    -1, 5, -1,
                    0, -1, 0
                ],
                sharpen2: [
                    -1, -1, -1,
                    -1, 9, -1,
                    -1, -1, -1
                ],
                prewitt_x: [
                    -1, 0, 1,
                    -1, 0, 1,
                    -1, 0, 1
                ],
                prewitt_y: [
                    -1, -1, -1,
                    0, 0, 0,
                    1, 1, 1
                ],
                sobel_top: [
                    1, 2, 1,
                    0, 0, 0,
                    -1, -2, -1
                ],
                sobel_bottom: [
                    -1, -2, -1,
                    0, 0, 0,
                    1, 2, 1
                ],
                sobel_left: [
                    1, 0, -1,
                    2, 0, -2,
                    1, 0, -1
                ],
                sobel_right: [
                    -1, 0, 1,
                    -2, 0, 2,
                    -1, 0, 1
                ],
                emboss: [
                    -2, -1, 0,
                    -1, 1, 1,
                    0, 1, 2
                ],
                outline: [
                    -1, -1, -1,
                    -1, 8, -1,
                    -1, -1, -1
                ],
                darken: [
                    0, 0, 0,
                    0, 0.5, 0,
                    0, 0, 0
                ],
                lighten: [
                    0, 0, 0,
                    0, 2, 0,
                    0, 0, 0
                ],
                edge: [
                    0, 1, 0,
                    1, -4, 1,
                    0, 1, 0
                ],
            }
            // Kernel calculator
            const createKernel = (n, blur) => {
                // Utility functionz
                const abs = n => n < 0 ? -n : n
                const dist = (x, y, X, Y) => abs(X - x) + abs(Y - y)
                //  Array, midpoint, string
                let arr = [],
                    mid = n >> 1,
                    str = 'vec4 tex = texture2D(Sampler, texture); vec2 pixel = vec2(1.0, 1.0) / size;\nvec4 color = '
                // Loop through in order [y]
                for (let i = 0; i < n; i++) {
                    // Loop through in order [x]
                    for (let j = 0; j < n; j++) {
                        // Get the index of in the array
                        const index = i * n + j
                        // Set the value of the element
                        blur && (arr[index] = dist(j, i, mid, mid) > mid ? 0 : 1)
                        // Add that line to the string
                        str += `texture2D(Sampler, texture + pixel * vec2(${(j - mid)}.0,  ${(i - mid)}.0)) * kernel[${index}]${index < n * n - 1 ? ' + ' : ';'}\n`
                    }
                }
                //return our results in object form
                return blur ? {
                    kernel: arr,
                    shader: `${str}
                            //set out color
                            gl_FragColor = vec4((color / weight).rgb, tex.a);
                    `,
                    n: n
                } : `${str}
                    // Set out color
                    gl_FragColor = vec4((color / weight).rgb, tex.a);
                    `
            }
            if (!kernels[name] && name !== 'blur') return
            return name === 'blur' ? createKernel(constrain(val + 2, 3, 9), !0) : {
                shader: createKernel(3),
                kernel: kernels[name],
                n: 3
            }
    }
}
const applyShader = (img, shader, kernel = 0, n = 0) => {
    //oh boy, o.o.
    const vertex = `
    //set the precision to low an' to type float
    precision lowp float;
    //position of the vertices
    attribute vec2 position;
    //resolution of the canvas
    uniform vec2 resolution;
    //create a color attribute
    attribute vec2 vTexture;
    //create another color attribute 
        //(one used by fragment shader)
    varying vec2 texture;
    
    //main loop [i hate this. it should be of type int]
    void main () {
        //which allows us to set the fragment color here
        texture = vTexture;
        //set our position
        vec2 one = position / resolution;
        vec2 two = one * 2.0;
        vec2 clip = two - 1.0;
        
        gl_Position = vec4(clip, 0.0, 1.0);
    }
    `
    const fragment = `
    precision lowp float;
    varying vec2 texture;
    uniform sampler2D Sampler;
    uniform vec2 size;
    
    
    ${kernel ? `uniform float kernel[${n * n}];uniform float weight;` : ''}void main () {${shader}}`
    const output = new OffscreenCanvas(img.width, img.height)
    const gl = output.getContext('webgl2')
    const position = [
        0, img.height,
        img.width, img.height,
        0, 0,
        0, 0,
        img.width, img.height,
        img.width, 0
    ]
    const texturePos = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ]
    const program = createWebGLProgram(
        gl, // Our WebGL context
        vertex, // Vertex shader
        fragment // Fragment shader
    )
    // Set the buffers
    buffer(gl, program, position, 'position', 2)
    buffer(gl, program, texturePos, 'vTexture', 2)
    // Set the resolution
    gl.viewport(0, 0, img.width, img.height)
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), img.width, img.height)
    gl.uniform2f(gl.getUniformLocation(program, 'size'), img.width, img.height)
    if (kernel) {
        gl.uniform1fv(gl.getUniformLocation(program, 'kernel[0]'), kernel)
        gl.uniform1f(gl.getUniformLocation(program, 'weight'), getWeight(kernel))
    }
    gl.useProgram(program)
    let textureCanvas = img instanceof HTMLCanvasElement ? img : new OffscreenCanvas(img.width, img.height)
    if (textureCanvas instanceof OffscreenCanvas) {
        const ctx = textureCanvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
    }
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    texture(gl, textureCanvas, img.width, img.height)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    return output
}
const filter = (...args) => {
    let target, name, val, bool
    if (args[0] instanceof HTMLCanvasElement || args[0] instanceof HTMLImageElement || args[0] instanceof OffscreenCanvas) {
        target = args[0]
        name = args[1]
        args[2] && (val = args[2])
        args[3] && (bool = args[3])
    } else {
        target = canvas
        name = args[0]
        args[1] && (val = args[1])
        args[2] && (bool = args[2])
    }
    const cache = determineShader(name, val)
    if (['opaque', 'invert', 'threshold', 'brightness', 'grayscale', 'posterize'].includes(name)) {
        const shader = cache
        const output = applyShader(target, shader)
        if (bool) return output
        else image(output, skiJSData.image ? 300 : 0, skiJSData.image ? 300 : 0)
    } else {
        const shader = cache.shader
        const output = applyShader(target, shader, cache.kernel, cache.n)
        if (bool) return output
        else image(output, skiJSData.image ? 300 : 0, skiJSData.image ? 300 : 0)
    }
}
