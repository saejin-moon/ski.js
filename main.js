/*

    ski.js
    version 1.9.0

*/

// all variables at global scope
var canvas, ctx, width, height, CORNER, CENTER, CLOSE, SPACE, LEFT, RIGHT, UP, DOWN, SQUARE, ROUND, PROJECT, MITER, BEVEL, DEGREES, RADIANS, PI, TAU, RGB, HSL, HEX, LEFT_BUTTON, RIGHT_BUTTON, frameCount, frameRate, millis, debug, equal, day, month, year, hour, minute, seconds, enableContextMenu, enableResize, smooth, cursor, angleMode, max, min, mag, dist, exp, norm, map, lerp, random, constrain, log, sqrt, sq, pow, abs, floor, ceil, round, sin, cos, tan, acos, asin, atan, atan2, radians, degrees, fill, stroke, background, color, colorMode, noStroke, noFill, comp, rect, clear, text, rectMode, ellipseMode, createFont, textAlign, textFont, textSize, strokeCap, strokeJoin, strokeWeight, pushMatrix, popMatrix, translate, rotate, scale, beginShape, vertex, curveVertex, bezierVertex, endShape, curve, bezier, arc, ellipse, quad, triangle, point, line, textWidth, textAscent, textDescent, get, mask, image, mousePressed, mouseReleased, mouseScrolled, mouseClicked, mouseOver, mouseOut, mouseMoved, mouseIsPressed, mouseButton, mouseX, mouseY, pmouseX, pmouseY, keyPressed, keyReleased, keyTyped, key, keyIsPressed, keyCode, resetMatrix, clear, bezierPoint, bezierTangent, fps, lerpColor, size, imageMode, arcMode, noLoop, raf, delta, loadImage, then, draw_standin, startMask, resetMask, getImage, shapePathz, set, loadFont, noSmooth, skiJSData, textLeading, pushStyle, popStyle, breakText

// setup the canvas
canvas = document.getElementsByTagName('canvas')[0] ?? new OffscreenCanvas(window.innerWidth, window.innerHeight)
ctx = canvas.getContext('2d')


// create constants
CORNER = 0
CENTER = 1
CLOSE = true
SPACE = 32
LEFT = 37
RIGHT = 39
UP = 38
DOWN = 40
SQUARE = 'but' + 't'
ROUND = 'round'
PROJECT = 'square'
MITER = 'miter'
BEVEL = 'bevel'
DEGREES = 'deg'
RADIANS = 'rad'
PI = Math.PI
TAU = PI * 2
RGB = 'rgb'
HSL = 'hsl'
HEX = 'hex'
LEFT_BUTTON = 0
RIGHT_BUTTON = 2

// data used by ski.js
skiJSData = {
    rect: CORNER,
    ellipse: CENTER,
    arc: CENTER,
    image: CORNER,
    angle: DEGREES,
    color: RGB,
    leading: 0,
    height: 12,
    rate: 60,
    millis: 0,
    start: 0,
    flags: [],
    fontString(font, size) {
        return (this.flags.includes('bold') ? 'bold ' : '') + (this.flags.includes('italic') ? 'italic ' : '') + `${size}px ${font}`
    },
    pos(type, x, y, w, h) {
        return type !== "ellipse" ? this[type] < 1 ? [x, y] : [x - w / 2, y - h / 2] : this[type] < 1 ? [x + w / 2, y + w / 2] : [x, y]
    },
    matrixToArray(matrix) {
        return ['a', 'b', 'c', 'd', 'e', 'f'].map(el => matrix[el])
    },
    matrices: []
}

// FPS
fps = 60
// vector array for shapes
shapePathz = []

// miscellaneous
debug = (...args) => console.debug(...args)
equal = (...args) => console.assert(...args)
day = () => (new Date).getDate()
month = () => (new Date).getMonth()
year = () => (new Date).getYear()
hour = () => (new Date).getHours()
minute = () => (new Date).getMinutes()
seconds = () => (new Date).getSeconds()
enableContextMenu = () => canvas.oncontextmenu = true
enableResize = () => 0 //window.onresize = () => size(window.innerWidth, window.innerHeight, true);
cursor = name => document.body.style.cursor = name
smooth = () => {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
}
angleMode = mode => skiJSData.angle = mode
size = (w, h, css) => {
    width = canvas.width = w
    height = canvas.height = h
    css && (canvas.style.width = `${w}px`, canvas.style.height = `${h}px`)
}
noLoop = () => draw = 0
set = (...args) => {
    switch (args.length) {
        case 0:
            canvas = new OffscreenCanvas(width, height)
            ctx = canvas.getContext('2d')
            return [canvas, ctx]
            break
        case 1:
            canvas = args[0]
            ctx = canvas.getContext('2d')
            width = canvas.width
            height = canvas.height
            break
        case 2:
            canvas = new OffscreenCanvas(args[0], args[1])
            ctx = canvas.getContext('2d')
            width = args[0]
            height = args[1]
            return [canvas, ctx]
    }
}

// math
max = (n, N) => n < N ? N : n
min = (n, N) => n < N ? n : N
mag = (a, b) => Math.sqrt((a ** 2) + (b ** 2))
dist = (x, y, X, Y) => mag(x - X, y - Y)
exp = n => Math.E ** n
norm = (val, low, high) => (val - low) / (high - low)
map = (val, s, e, S, E) => S + (E - S) * norm(val, s, e)
lerp = (val, targ, amt) => ((targ - val) * amt) + val
random = (min, max) => max ? (Math.random() * (max - min)) + min : min ? (Math.random() * min) : Math.random()
constrain = (val, low, high) => min(max(val, low), high)
log = n => Math.log(n)
sqrt = n => Math.sqrt(n)
sq = n => n ** 2
pow = (n, a) => n ** a
abs = n => n < 0 ? -n : n
floor = n => n | 0
ceil = n => (n | 0) + 1
round = n => n - (n | 0) < 0.5 ? (n | 0) : (n | 0) + 1
sin = ang => Math.sin(skiJSData.angle == "deg" ? degrees(ang) : ang)
cos = ang => Math.cos(skiJSData.angle == "deg" ? degrees(ang) : ang)
tan = ang => Math.tan(skiJSData.angle == "deg" ? degrees(ang) : ang)
acos = ang => Math.acos(skiJSData.angle == "deg" ? degrees(ang) : ang)
asin = ang => Math.asin(skiJSData.angle == "deg" ? degrees(ang) : ang)
atan = ang => Math.atan(skiJSData.angle == "deg" ? degrees(ang) : ang)
radians = ang => ang * (180 / PI)
degrees = ang => ang * (PI / 180)
atan2 = (y, x) => skiJSData.angle == "deg" ? radians(Math.atan2(y, x)) : Math.atan2(x, y)
bezierPoint = (a, b, c, d, t) => (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d
bezierTangent = (a, b, c, d, t) => (3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b))

// graphix
colorMode = mode => skiJSData.color = mode
color = (...args) => {
    if (typeof args[0] === 'string' && args.length <= 1 && (/(#|rgb|hsl)/).test(args[0])) return args[0]
    args[0] instanceof Array && (args = args[0])
    if (typeof args[1] === 'number' && (/rgb/).test(args[0])) {
        let cache = args[0].match(/\d{1,3}/g)
        args = [cache[0], cache[1], cache[2], args[1]]
    }
    switch (skiJSData.color) {
        case 'rgb':
            const [r, g, b, a] = args.length > 4 ? Object.assign(args, {
                length: 4
            }) : args
            switch (args.length) {
                case 1:
                    return `rgba(${r}, ${r}, ${r}, 1)`
                    break
                case 2:
                    return `rgba(${r}, ${r}, ${r}, ${g / 255})`
                    break
                case 3:
                    return `rgba(${r}, ${g}, ${b}, 1)`
                    break
                case 4:
                    return `rgba(${r}, ${g}, ${b}, ${a / 255})`
            }
            break
        case 'hsl':
            return `hsl(${args[0]}, ${args[1]}%, ${args[2]}%)`
            break
        case 'hex':
            return args[0]
    }
}
background = (...args) => {
    const cache = [ctx.strokeStyle, ctx.fillStyle]
    ctx.save()
    ctx.reset()
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)',
        ctx.fillStyle = color(...args)
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = cache[0], ctx.fillStyle = cache[1]
    ctx.restore()
}
fill = (...args) => ctx.fillStyle = color(...args)
stroke = (...args) => ctx.strokeStyle = color(...args)
lerpColor = (c, C, a) => {
    if (typeof C !== 'string' || typeof c !== 'string' || skiJSData.color !== RGB) return
    const [r, g, b, _a] = c.match(/\d{1,3}/g)
    const [R, G, B, A] = C.match(/\d{1,3}/g)
    return `rgba(${lerp(+r, +R, a)}, ${lerp(+g, +G, a)}, ${lerp(+b, +B, a)}, ${lerp(+_a, +A, a)})`
}
clear = () => {
    ctx.save()
    ctx.reset()
    ctx.clearRect(0, 0, width, height)
    ctx.restore()
}
noStroke = () => ctx.strokeStyle = 'rgb(0, 0, 0, 0)'
noFill = () => ctx.fillStyle = 'rgb(0, 0, 0, 0)'
rect = (x, y, width, height, tl, tr, br, bl) => {
    [x, y] = skiJSData.pos('rect', x, y, width, height)
    if (tl) {
        const w = width / 2,
              h = height / 2
        tl = tl > w || tl > h ? Math.min(w, h) : tl
        tr = !bl ? tl : tr
        tr = tr > w || tr > h ? Math.min(w, h) : tr
        br = !bl ? tl : br
        br = br > w || br > h ? Math.min(w, h) : br
        bl = !bl ? tl : bl
        bl = bl > w || bl > h ? Math.min(w, h) : bl
        if (ctx.strokeStyle === 'rgba(0, 0, 0, 0)')
            ctx.translate(0.5, 0.5)
        beginShape()
        vertex(x + tl, y)
        vertex(x + width - tr, y)
        curveVertex(x + width, y, x + width, y + tr)
        vertex(x + width, y + height - br)
        curveVertex(x + width, y + height, x + width - br, y + height)
        vertex(x + bl, y + height)
        curveVertex(x, y + height, x, y + height - bl)
        vertex(x, y + tl)
        curveVertex(x, y, x + tl, y)
        endShape()
        if (ctx.strokeStyle === 'rgba(0, 0, 0, 0)')
            ctx.translate(-0.5, -0.5)
    } else {
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
    }
}
clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height)
breakText = (txt, w) => {
    if (textWidth(txt) > w) {
        let char = 0,
            str = '',
            result = ''
        for (let i = 0; i < txt.length; i++) {
            str += txt[i]
            if (textWidth(str) > w) {
                char = i + 1
                str = txt.slice(0, char)
                result = txt.slice(char, txt.length)
                break
            }
        }
        if (result) return str + '\n' + breakText(result, w)
        else return str
    } else return txt
}
text = (msg, x, y, w, h) => { // h doesn't do anything
    msg = msg.toString()
    if (w) msg = breakText(msg, w)
    if (msg.match('\n')) {
        msg.split('\n').map((p, i) => {
            ctx.fillText(p, x, y + ((i - ((msg.split('\n')).length - 1) / 2) * (skiJSData.height + skiJSData.leading)))
            ctx.strokeText(p, x, y + ((i - ((msg.split('\n')).length - 1) / 2) * (skiJSData.height + skiJSData.leading)))
        })
    } else {
        ctx.fillText(msg, x, y)
        ctx.strokeText(msg, x, y)
    }
}
rectMode = m => skiJSData.rect = m
ellipseMode = m => skiJSData.ellipse = m
arcMode = m => skiJSData.arc = m
imageMode = m => skiJSData.image = m
textAlign = (x, y) => {
    ctx.textAlign = x <= 0 ? 'start' : 'center'
    ctx.textBaseline = y <= 0 ? 'hanging' : 'middle'
}
createFont = font => font
textSize = size => skiJSData.height = size && (ctx.font = skiJSData.fontString(skiJSData.font, size))
textFont = (font, size = skiJSData.height) => {
    skiJSData.height !== size && (skiJSData.height = size)
    skiJSData.flags = []
    if ((/bold/i).test(font))(skiJSData.flags.push('bold'), font = font.replace('bold', ''))
    if ((/italic/i).test(font))(skiJSData.flags.push('italic'), font = font.replace('italic', ''))
    font = font.trim()
    skiJSData.font = font
    ctx.font = skiJSData.fontString(font, size)
}
textLeading = val => skiJSData.leading = val
strokeCap = mode => ctx.lineCap = mode
strokeJoin = mode => ctx.lineJoin = mode
strokeWeight = weight => ctx.lineWidth = weight
pushStyle = () => ctx.save()
popStyle = () => ctx.restore()
pushMatrix = () => {
    const { matrices: arr, matrixToArray: convert } = skiJSData
    arr.push(convert(ctx.getTransform()))
}
popMatrix = () => ctx.setTransform(DOMMatrix.fromFloat32Array(new Float32Array(skiJSData.matrices.pop())))
resetMatrix = popMatrix
translate = (x, y) => ctx.transform(1, 0, 0, 1, x, y)
rotate = ang => {
    ang = degrees(ang)
    const cos = Math.cos, sin = Math.sin
    ctx.transform(cos(ang), sin(ang), -sin(ang), cos(ang), 0, 0)
}
scale = (w, h) => ctx.transform(w, 0, 0, h ? h : w, 0, 0)
beginShape = () => shapePathz = []
vertex = (x, y) => shapePathz.push({
    type: 'vertex',
    points: [x, y]
})
curveVertex = (cx, cy, x, y) => shapePathz.push({
    type: 'curve',
    points: [cx, cy, x, y]
})
bezierVertex = (cx, cy, cX, cY, x, y) => shapePathz.push({
    type: 'bezier',
    points: [cx, cy, cX, cY, x, y]
})
endShape = (end) => {
    const paths = shapePathz
    if (paths.length < 2 || paths[0].type !== 'vertex') return
    ctx.beginPath()
    paths.forEach((path, index) => ctx[index < 1 && path.type === 'vertex' ? 'moveTo' : path.type === 'vertex' ? 'lineTo' : path.type === 'curve' ? 'quadraticCurveTo' : 'bezierCurveTo'](...path.points))
    end && ctx.closePath()
    ctx.fill()
    ctx.stroke()
}
curve = (...args) => {
    if (args.length !== 6) return
    const [x, y, cx, cy, X, Y] = args
    beginShape()
    vertex(x, y)
    curveVertex(cx, cy, X, Y)
    endShape()
}
bezier = (...args) => {
    if (args.length !== 8) return
    const [x, y, cx, cy, cX, cY, X, Y] = args
    beginShape()
    vertex(x, y)
    bezierVertex(cx, cy, cX, cY, X, Y)
    endShape()
}
arc = (x, y, w, h, start, stop, close = false) => {
    if (skiJSData.arc) {
        x += w / 2
        y += h / 2
    }
    ctx.save()
    ctx.translate(x, y)
    w !== h && (w > h ? ctx.scale(Math.max(w, h) / Math.min(w, h), 1) : ctx.scale(1, Math.max(w, h) / Math.min(w, h)))
    ctx.beginPath()
    ctx.fillStyle !== 'rgba(0, 0, 0, 0)' && ctx.moveTo(0, 0)
    ctx.arc(0, 0, Math.min(w, h) / 2, degrees(start), degrees(stop))
    close && ctx.closePath()
    ctx.restore()
    ctx.fill()
    ctx.stroke()
}
ellipse = (x, y, w, h) => {
    ctx.beginPath()
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
}
quad = (x, y, X, Y, _x, _y, _X, _Y) => {
    beginShape()
    vertex(x, y)
    vertex(X, Y)
    vertex(_x, _y)
    vertex(_X, _Y)
    endShape(CLOSE)
}
triangle = (x, y, X, Y, _x, _y) => {
    beginShape()
    vertex(x, y)
    vertex(X, Y)
    vertex(_x, _y)
    endShape(CLOSE)
}
point = (x, y) => {
    if (ctx.strokeStyle != 'rgba(0, 0, 0, 0)') {
        const cache = [ctx.strokeStyle, ctx.fillStyle]
        noStroke()
        ctx.fillStyle = cache[0]
        ellipse(x, y, ctx.lineWidth, ctx.lineWidth)
        ctx.strokeStyle = cache[0]
        ctx.fillStyle = cache[1]
    }
}
line = (x, y, X, Y) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(X, Y)
    ctx.closePath()
    ctx.stroke()
}
textWidth = (txt) => {
    let width = 0
    txt.split('\n').map(str => width = max(width, ctx.measureText(txt).width))
    return width
}
textAscent = () => ctx.measureText('a').fontBoundingBoxAscent
textDescent = () => ctx.measureText('a').fontBoundingBoxDescent
textLeading = num => skiJSData.leading = num
get = (...args) => {
    const [x, y, w, h, src] = args
    switch (args.length) {
        case 0:
            return get(0, 0, width, height)
        case 2:
            data = ctx.getImageData(x, y, 1, 1).data
            return color(data[0], data[1], data[2], data[3])
        case 3: 
            const canvas = new OffscreenCanvas(w.width, w.height)
            const ctx = canvas.getContext('2d')
            if (w instanceof HTMLImageElement) {
                ctx.drawImage(w, 0, 0)
                data = ctx.getImageData(x, y, 1, 1)
            } else {
                data = w.getContext('2d').getImageData(x, y, 1, 1).data
            }
            return color(data[0], data[1], data[2], data[3])
        case 4: 
            const imageCanvas = new OffscreenCanvas(w, h)
            const context = imageCanvas.getContext('2d')
            context.putImageData(ctx.getImageData(x, y, w, h), 0, 0)
            return imageCanvas
        case 5: 
            const Canvas = new OffscreenCanvas(src.width, src.height)
            const Ctx = canvas.getContext('2d')
            Ctx.drawImage(src, -x, -y)
            return Canvas
    }
}
mask = () => ctx.globalCompositeOperation = 'source-atop'
startMask = resetMask = () => ctx.globalCompositeOperation = 'source-over'
getImage = (src, width, height) => new Promise((resolve, reject) => {
    const img = Object.assign(width ? new Image(width, height) : new Image, (/khanacademy/).test(src) ? { src: src } : { src: src, crossOrigin: 'anonymous' })
    img.onload = () => resolve(img)
    img.onerror = () => reject('Invalid or unaccessible image source')
})
image = (img, x, y, w = img.width, h = img.height) => {
    [x, y] = skiJSData.pos('image', x, y, w, h)
    ctx[img instanceof ImageData ? 'putImageData' : 'drawImage'](img, x, y, w, h)
}
loadImage = (src, width, height) => Object.assign(width ? new Image(width, height) : new Image, (/khanacademy/).test(src) ? { src: src } : { src: src, crossOrigin: 'anonymous' })
loadFont = (...fontz) => {
    const link = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css?family=${fontz.join('|').replace(/ /g, '+')}`
    })
    document.body.appendChild(link)
    return link
}

// event handlers
mousePressed = () => {}
mouseReleased = () => {}
mouseScrolled = () => {}
mouseClicked = () => {}
mouseOut = () => {}
mouseOver = () => {}
mouseMoved = () => {}
mouseIsPressed = false
mouseButton = LEFT_BUTTON
mouseX = 0
mouseY = 0
pmouseX = mouseX
pmouseY = mouseY
canvas.onmousedown = e => {
    mousePressed(e)
    mouseIsPressed = true
    mouseButton = e.button
}
canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect()
    pmouseX = mouseX
    pmouseY = mouseY
    mouseX = constrain(e.pageX - rect.x, 0, width)
    mouseY = constrain(e.pageY - rect.y, 0, height)
    mouseMoved(e)
}
canvas.onmouseup = e => {
    mouseReleased(e)
    mouseClicked(e)
    mouseButton = e.button
    mouseIsPressed = false
    e.preventDefault()
}
canvas.oncontextmenu = e => e.preventDefault()
canvas.onmouseover = e => mouseOver(e)
canvas.onmouseout = e => mouseOut(e)
canvas.onwheel = e => {
    // Just for now. May reimplement this in the future - PROMISE
    // e.preventDefault()
    mouseScrolled(e)
}

keyPressed = () => {}
keyReleased = () => {}
keyTyped = () => {}
document.onkeydown = e => {
    if (e.target instanceof HTMLBodyElement) {
        e.preventDefault()
        key = e.key
        keyCode = e.keyCode
        keyIsPressed = true
        keyPressed(e)
    }
}
document.onkeyup = e => {
    if (e.target instanceof HTMLBodyElement) {
        e.preventDefault()
        key = e.key
        keyCode = e.keyCode
        keyReleased(e)
    }
}
document.onkeypress = e => {
    if (e.target instanceof HTMLBodyElement) {
        e.preventDefault()
        key = e.key
        keyCode = e.keyCode
        keyTyped(e)
    }
}

// animation
frameCount = 0
frameRate = rate => skiJSData.rate = rate
millis = () => skiJSData.millis
delta = 1000 / 60
then = performance.now()
skiJSData.start = performance.now()
raf = time => {
    requestAnimationFrame(raf)
    delta = time - then
    let ms = 1000 / skiJSData.rate
    if (delta < ms) return
    let overflow = delta % ms
    then = time - overflow
    delta -= overflow
    draw_standin(time)
    frameCount++
    skiJSData.millis = performance.now() - skiJSData.start
    fps = 1000 / delta
}

Object.defineProperty(window, "draw", {
    get() {
        return draw_standin
    },
    set(func) {
        typeof draw_standin != "function" && requestAnimationFrame(raf)
        draw_standin = func
    },
    configurable: true
})

// quick resolution change
size(window.innerWidth, window.innerHeight)

// for the KA environment
for (let i = requestAnimationFrame(() => 0); i--;) cancelAnimationFrame(i)

// Easter egg?
