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
    const mass = size; // Mass proportional to size
    const elasticity = 0.9; // Bounce factor

    return { x, y, size, color, type, angle, rotationSpeed, targetType, shapeShiftProgress, shapeShiftSpeed, vx, vy, colorChangeProgress, colorChangeSpeed, targetColor, pulseSpeed, mass, elasticity };
}

function checkCollision(shape1, shape2) {
    if (shape1.type === 1 && shape2.type === 1) {
        // Circle-Circle Collision
        const dx = shape2.x - shape1.x;
        const dy = shape2.y - shape1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (shape1.size / 2 + shape2.size / 2);
    } else {
        // Simple AABB (Axis-Aligned Bounding Box) Collision for rectangles and mixed shapes
        const rect1 = {
            x: shape1.x - shape1.size / 2,
            y: shape1.y - shape1.size / 2,
            width: shape1.size,
            height: shape1.size
        };
        const rect2 = {
            x: shape2.x - shape2.size / 2,
            y: shape2.y - shape2.size / 2,
            width: shape2.size,
            height: shape2.size
        };
        return !(rect1.x > rect2.x + rect2.width ||
                 rect1.x + rect1.width < rect2.x ||
                 rect1.y > rect2.y + rect2.height ||
                 rect1.y + rect1.height < rect2.y);
    }
}

function resolveCollision(shape1, shape2) {
    const dx = shape2.x - shape1.x;
    const dy = shape2.y - shape1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = (shape1.size / 2 + shape2.size / 2) - distance;

    // Normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = shape2.vx - shape1.vx;
    const dvy = shape2.vy - shape1.vy;

    // Relative velocity in terms of the normal direction
    const vn = dvx * nx + dvy * ny;

    // Collision response based on mass and elasticity
    const totalMass = shape1.mass + shape2.mass;
    const impulse = (2 * vn) / totalMass;
    shape1.vx -= (impulse * shape2.mass * nx) * shape1.elasticity;
    shape1.vy -= (impulse * shape2.mass * ny) * shape1.elasticity;
    shape2.vx += (impulse * shape1.mass * nx) * shape2.elasticity;
    shape2.vy += (impulse * shape1.mass * ny) * shape2.elasticity;

    // Separate shapes to avoid sticking together
    shape1.x -= nx * overlap / 2;
    shape1.y -= ny * overlap / 2;
    shape2.x += nx * overlap / 2;
    shape2.y += ny * overlap / 2;
}

function animateShapes(ctx, shapes, width, height, time) {
    // Create a fading effect by drawing a semi-transparent rectangle over the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Adjust alpha value for longer or shorter trails
    ctx.fillRect(0, 0, width, height);

    // Change background color every tick
    document.body.style.backgroundColor = getRandomColor();

    const centerX = width / 2;
    const centerY = height / 2;

    // Check for collisions and resolve them
    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            if (checkCollision(shapes[i], shapes[j])) {
                resolveCollision(shapes[i], shapes[j]);
            }
        }
    }

    shapes.forEach(shape => {
        shape.angle += shape.rotationSpeed;
        shape.shapeShiftProgress += shape.shapeShiftSpeed;
        shape.colorChangeProgress += shape.colorChangeSpeed;

        // Calculate distance to the center
        const dx = centerX - shape.x;
        const dy = centerY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 1 / distance; // Inverse distance to create a stronger pull closer to the center

        // Apply force to velocity
        shape.vx += (dx / distance) * force;
        shape.vy += (dy / distance) * force;

        // Apply a rotational force for spiraling effect
        const spiralStrength = 0.05; // Adjust this value to control the spiraling effect
        const angle = Math.atan2(dy, dx);
        shape.vx += Math.cos(angle + Math.PI / 2) * spiralStrength;
        shape.vy += Math.sin(angle + Math.PI / 2) * spiralStrength;

        shape.x += shape.vx;
        shape.y += shape.vy;

        // Shrink shape size based on distance to the center
        shape.size = Math.max(10, 100 * (distance / Math.max(width, height)));

        // Smoothly wrap around edges
        if (shape.x < -shape.size) {
            shape.x = width + shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.x > width + shape.size) {
            shape.x = -shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y < -shape.size) {
            shape.y = height + shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y > height + shape.size) {
            shape.y = -shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }

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

    // Create gradient
    const gradient = ctx.createRadialGradient(0, 0, shape.size / 10, 0, 0, shape.size / 2);
    gradient.addColorStop(0, shape.color);
    gradient.addColorStop(1, shape.targetColor);

    ctx.fillStyle = gradient;

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
    // Create a fading effect by drawing a semi-transparent rectangle over the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)'; // Adjust alpha value for longer or shorter trails
    ctx.fillRect(0, 0, width, height);

    // Change background color every tick
    document.body.style.backgroundColor = getRandomColor();

    const centerX = width / 2;
    const centerY = height / 2;

    shapes.forEach(shape => {
        shape.angle += shape.rotationSpeed;
        shape.shapeShiftProgress += shape.shapeShiftSpeed;
        shape.colorChangeProgress += shape.colorChangeSpeed;

        // Calculate distance to the center
        const dx = centerX - shape.x;
        const dy = centerY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 1 / distance; // Inverse distance to create a stronger pull closer to the center

        // Apply force to velocity
        shape.vx += (dx / distance) * force;
        shape.vy += (dy / distance) * force;

        // Apply a rotational force for spiraling effect
        const spiralStrength = 0.1; // Adjust this value to control the spiraling effect
        const angle = Math.atan2(dy, dx);
        shape.vx += Math.cos(angle + Math.PI / 2) * spiralStrength;
        shape.vy += Math.sin(angle + Math.PI / 2) * spiralStrength;

        shape.x += shape.vx;
        shape.y += shape.vy;

        // Shrink shape size based on distance to the center
        shape.size = Math.max(0.01, 100 * (distance / Math.max(width, height)));

        // Smoothly wrap around edges
        if (shape.x < -shape.size) {
            shape.x = width + shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.x > width + shape.size) {
            shape.x = -shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y < -shape.size) {
            shape.y = height + shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y > height + shape.size) {
            shape.y = -shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }

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

window.onload = function() {
    const canvas = document.getElementById('artCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const shapes = [];
        for (let i = 0; i < 500; i++) {
            shapes.push(createRandomShape(canvas.width, canvas.height));
        }

        animateShapes(ctx, shapes, canvas.width, canvas.height, performance.now());
    }
};
class Particle {
    constructor(x, y, vx, vy, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime -= 1;
    }

    draw(ctx) {
        if (this.lifetime > 0) {
            ctx.save();
            ctx.globalAlpha = this.lifetime / 100;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

const particles = [];

function emitParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const vx = (Math.random() - 0.5) * 4;
        const vy = (Math.random() - 0.5) * 4;
        const size = Math.random() * 5 + 2;
        const lifetime = 100;
        particles.push(new Particle(x, y, vx, vy, size, color, lifetime));
    }
}

function updateAndDrawParticles(ctx) {
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);
        if (particle.lifetime <= 0) {
            particles.splice(index, 1);
        }
    });
}

function resolveCollision(shape1, shape2) {
    const dx = shape2.x - shape1.x;
    const dy = shape2.y - shape1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = (shape1.size / 2 + shape2.size / 2) - distance;

    // Normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = shape2.vx - shape1.vx;
    const dvy = shape2.vy - shape1.vy;

    // Relative velocity in terms of the normal direction
    const vn = dvx * nx + dvy * ny;

    // Collision response based on mass and elasticity
    const totalMass = shape1.mass + shape2.mass;
    const impulse = (2 * vn) / totalMass;
    shape1.vx -= (impulse * shape2.mass * nx) * shape1.elasticity;
    shape1.vy -= (impulse * shape2.mass * ny) * shape1.elasticity;
    shape2.vx += (impulse * shape1.mass * nx) * shape2.elasticity;
    shape2.vy += (impulse * shape1.mass * ny) * shape2.elasticity;

    // Separate shapes to avoid sticking together
    shape1.x -= nx * overlap / 2;
    shape1.y -= ny * overlap / 2;
    shape2.x += nx * overlap / 2;
    shape2.y += ny * overlap / 2;

    // Emit particles
    emitParticles((shape1.x + shape2.x) / 2, (shape1.y + shape2.y) / 2, shape1.color);
}

function animateShapes(ctx, shapes, width, height, time) {
    // Create a fading effect by drawing a semi-transparent rectangle over the entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Adjust alpha value for longer or shorter trails
    ctx.fillRect(0, 0, width, height);

    // Change background color every tick
    document.body.style.backgroundColor = getRandomColor();

    const centerX = width / 2;
    const centerY = height / 2;

    // Check for collisions and resolve them
    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            if (checkCollision(shapes[i], shapes[j])) {
                resolveCollision(shapes[i], shapes[j]);
            }
        }
    }

    shapes.forEach(shape => {
        shape.angle += shape.rotationSpeed;
        shape.shapeShiftProgress += shape.shapeShiftSpeed;
        shape.colorChangeProgress += shape.colorChangeSpeed;

        // Calculate distance to the center
        const dx = centerX - shape.x;
        const dy = centerY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 1 / distance; // Inverse distance to create a stronger pull closer to the center

        // Apply force to velocity
        shape.vx += (dx / distance) * force;
        shape.vy += (dy / distance) * force;

        // Apply a rotational force for spiraling effect
        const spiralStrength = 0.05; // Adjust this value to control the spiraling effect
        const angle = Math.atan2(dy, dx);
        shape.vx += Math.cos(angle + Math.PI / 2) * spiralStrength;
        shape.vy += Math.sin(angle + Math.PI / 2) * spiralStrength;

        shape.x += shape.vx;
        shape.y += shape.vy;

        // Shrink shape size based on distance to the center
        shape.size = Math.max(10, 100 * (distance / Math.max(width, height)));

        // Smoothly wrap around edges
        if (shape.x < -shape.size) {
            shape.x = width + shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.x > width + shape.size) {
            shape.x = -shape.size;
            shape.vx *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y < -shape.size) {
            shape.y = height + shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }
        if (shape.y > height + shape.size) {
            shape.y = -shape.size;
            shape.vy *= 0.5; // Reduce velocity to prevent shooting across the screen
        }

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

    // Update and draw particles
    updateAndDrawParticles(ctx);

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
