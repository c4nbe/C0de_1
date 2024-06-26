// Perlin noise implementation (simple 1D noise for demonstration)
class PerlinNoise {
    constructor() {
        this.permutation = this.generatePermutation();
    }

    generatePermutation() {
        const array = Array.from({ length: 256 }, (_, i) => i);
        return array.concat(array);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x) {
        return (hash & 1) === 0 ? x : -x;
    }

    noise(x) {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const u = this.fade(x);
        return this.lerp(u, this.grad(this.permutation[X], x), this.grad(this.permutation[X + 1], x - 1)) * 2;
    }
}

const noise = new PerlinNoise();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createRandomShape(width, height) {
    const type = getRandomInt(0, 2);
    const x = getRandomInt(0, width);
    const y = getRandomInt(0, height);
    const size = getRandomInt(20, 100);
    const color = getRandomColor();
    const angle = 0;
    const rotationSpeed = (Math.random() - 0.5) * 0.02; // Random speed between -0.01 and 0.01
    const targetType = getRandomInt(0, 2);
    const shapeShiftProgress = 0;
    const shapeShiftSpeed = Math.random() * 0.01 + 0.005; // Random speed between 0.005 and 0.015
    const vx = (Math.random() - 0.5) * 2; // Random horizontal velocity
    const vy = (Math.random() - 0.5) * 2; // Random vertical velocity
    const colorChangeProgress = 0;
    const colorChangeSpeed = Math.random() * 0.01 + 0.005; // Random speed between 0.005 and 0.015
    const targetColor = getRandomColor();
    const pulseSpeed = Math.random() * 0.02 + 0.01; // Random speed between 0.01 and 0.03

    return { x, y, size, color, type, angle, rotationSpeed, targetType, shapeShiftProgress, shapeShiftSpeed, vx, vy, colorChangeProgress, colorChangeSpeed, targetColor, pulseSpeed };
}

function interpolateColor(color1, color2, factor) {
    const hex = color => parseInt(color.slice(1), 16);
    const r = (hex(color1) >> 16) * (1 - factor) + (hex(color2) >> 16) * factor;
    const g = ((hex(color1) >> 8) & 0xff) * (1 - factor) + ((hex(color2) >> 8) & 0xff) * factor;
    const b = (hex(color1) & 0xff) * (1 - factor) + (hex(color2) & 0xff) * factor;
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
}

function drawShape(ctx, shape, time) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.angle);
    ctx.fillStyle = shape.color;

    const type = shape.shapeShiftProgress < 0.5 ? shape.type : shape.targetType;
    const scale = 1 + 0.3 * Math.sin(shape.pulseSpeed * time); // Pulsating effect

    ctx.scale(scale, scale);

    switch (type) {
        case 0:
            ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            break;
        case 1:
            ctx.beginPath();
            ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 2:
            ctx.beginPath();
            ctx.moveTo(-shape.size / 2, shape.size / 2);
            ctx.lineTo(shape.size / 2, shape.size / 2);
            ctx.lineTo(0, -shape.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }

    ctx.restore();
}

function animateShapes(ctx, shapes, width, height, time) {
    // Create a trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Change background color every tick
    document.body.style.backgroundColor = getRandomColor();

    const centerX = width / 2;
    const centerY = height / 2;

    shapes.forEach(shape => {
        shape.angle += shape.rotationSpeed;
        shape.shapeShiftProgress += shape.shapeShiftSpeed;
        shape.colorChangeProgress += shape.colorChangeSpeed;

        // Create vortex effect
        const dx = centerX - shape.x;
        const dy = centerY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 100 / distance;
        shape.vx += (dx / distance) * force;
        shape.vy += (dy / distance) * force;

        shape.x += shape.vx * noise.noise(time * 0.001);
        shape.y += shape.vy * noise.noise(time * 0.001 + 100);

        // Wrap around edges
        if (shape.x < 0) shape.x = width;
        if (shape.x > width) shape.x = 0;
        if (shape.y < 0) shape.y = height;
        if (shape.y > height) shape.y = 0;

        if (shape.shapeShiftProgress >= 1) {
            shape.shapeShiftProgress = 0;
            shape.type = shape.targetType;
            shape.targetType = getRandomInt(0, 2);
        }

        if (shape.colorChangeProgress >= 1) {
            shape.colorChangeProgress = 0;
            shape.color = shape.targetColor;
            shape.targetColor = getRandomColor();
        } else {
            shape.color = interpolateColor(shape.color, shape.targetColor, shape.colorChangeProgress);
        }

        drawShape(ctx, shape, time);
    });

    requestAnimationFrame((newTime) => animateShapes(ctx, shapes, width, height, newTime));
}

window.onload = function() {
    const canvas = document.getElementById('artCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const shapes = [];
        for (let i = 0; i < 100; i++) {
            shapes.push(createRandomShape(canvas.width, canvas.height));
        }

        animateShapes(ctx, shapes, canvas.width, canvas.height, performance.now());
    }
};
