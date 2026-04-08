// ── Neural Network Background ──────────────────────────────────────────────
(function () {
    const bg = document.createElement('canvas');
    bg.id = 'neuralBg';
    document.body.prepend(bg);
    const ctx = bg.getContext('2d');

    const MAX_DIST   = 210;
    const LAYERS     = [0.08, 0.28, 0.50, 0.72, 0.92]; // mais espalhado nas laterais
    let W, H, nodes;
    const signals = [];

    function resize() {
        W = bg.width  = window.innerWidth;
        H = bg.height = window.innerHeight;
        initNodes();
    }

    function initNodes() {
        nodes = [];
        // Nós distribuídos em camadas (estrutura de rede neural)
        LAYERS.forEach((lx) => {
            const count = Math.floor(Math.random() * 5) + 6;
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x:  lx * W + (Math.random() - 0.5) * W * 0.14,
                    y:  (i + 1) / (count + 1) * H,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r:  Math.random() * 2.5 + 2,
                    hue: Math.random() > 0.5 ? 190 : 315,
                    pulse:      Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.018 + 0.008,
                    layer: lx,
                });
            }
        });
        // Alguns nós extras aleatórios para preencher
        for (let i = 0; i < 12; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r:  Math.random() * 1.5 + 1,
                hue: Math.random() > 0.5 ? 190 : 315,
                pulse:      Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.01 + 0.005,
                layer: -1,
            });
        }
    }

    function buildEdges() {
        const edges = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) edges.push({ a: i, b: j, d });
            }
        }
        return edges;
    }

    function spawnSignal(edges) {
        if (!edges.length) return;
        const e = edges[Math.floor(Math.random() * edges.length)];
        signals.push({
            a: e.a,
            b: e.b,
            t: 0,
            hue: nodes[e.a].hue,
            speed: Math.random() * 0.009 + 0.004,
        });
    }

    setInterval(() => {
        if (nodes) spawnSignal(buildEdges());
    }, 110);

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Mover nós
        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            n.pulse += n.pulseSpeed;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
        }

        const edges = buildEdges();

        // Conexões
        for (const e of edges) {
            const a = nodes[e.a], b = nodes[e.b];
            const alpha = (1 - e.d / MAX_DIST) * 0.55;
            const linkHue = Math.random() > 0.5 ? a.hue : b.hue;

            // Camada de brilho (glow) para efeito eletrico.
            ctx.strokeStyle = `hsla(${linkHue}, 100%, 68%, ${alpha * 0.45})`;
            ctx.lineWidth = 2.2;
            ctx.shadowColor = `hsla(${linkHue}, 100%, 70%, 0.9)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Linha principal mais clara e fina por cima.
            ctx.strokeStyle = `hsla(${linkHue}, 100%, 78%, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        // Sinais viajando pelas conexões
        for (let i = signals.length - 1; i >= 0; i--) {
            const s = signals[i];
            s.t += s.speed;
            if (s.t > 1) { signals.splice(i, 1); continue; }
            const a = nodes[s.a], b = nodes[s.b];
            const sx = a.x + (b.x - a.x) * s.t;
            const sy = a.y + (b.y - a.y) * s.t;
            const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
            grd.addColorStop(0, `hsla(${s.hue}, 100%, 72%, 0.98)`);
            grd.addColorStop(0.4, `hsla(${s.hue}, 100%, 65%, 0.38)`);
            grd.addColorStop(1, `hsla(${s.hue}, 100%, 65%, 0)`);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(sx, sy, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nós (neurônios)
        for (const n of nodes) {
            const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
            // Halo externo
            const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
            halo.addColorStop(0, `hsla(${n.hue}, 100%, 68%, ${0.2 * pulse})`);
            halo.addColorStop(1, `hsla(${n.hue}, 100%, 68%, 0)`);
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
            ctx.fill();
            // Núcleo
            ctx.shadowColor = `hsla(${n.hue}, 100%, 70%, 0.95)`;
            ctx.shadowBlur  = 8 * pulse;
            ctx.fillStyle   = `hsla(${n.hue}, 100%, 70%, ${0.45 + 0.55 * pulse})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}());

// ── Drawing Canvas ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const clearBtn = document.getElementById('clearBtn');
    const predictBtn = document.getElementById('predictBtn');
    const statusEl = document.getElementById('status');
    const emotionEl = document.getElementById('emotion');
    const confidenceEl = document.getElementById('confidence');
    const probabilityList = document.getElementById('probabilityList');

    if (!canvas) {
        console.error('Canvas não encontrado.');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        statusEl.textContent = 'Seu navegador não conseguiu inicializar a área de desenho.';
        return;
    }

    let isDrawing = false;

    function prepareCanvas() {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1, 1, canvas.width - 2, canvas.height - 2);
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        console.log('Canvas preparado com sucesso');
    }

    function getPosition(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDrawing(x, y) {
        isDrawing = true;
        const pos = getPosition(x, y);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(x, y) {
        if (!isDrawing) return;
        const pos = getPosition(x, y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }

    canvas.addEventListener('mousedown', (event) => {
        console.log('Mouse down');
        startDrawing(event.clientX, event.clientY);
    });

    canvas.addEventListener('mousemove', (event) => {
        draw(event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        if (!event.touches.length) return;
        const touch = event.touches[0];
        startDrawing(touch.clientX, touch.clientY);
        console.log('Touch start');
    }, { passive: false });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (!event.touches.length) return;
        const touch = event.touches[0];
        draw(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        stopDrawing();
        console.log('Touch end');
    }, { passive: false });

    clearBtn.addEventListener('click', () => {
        prepareCanvas();
        statusEl.textContent = 'Canvas limpo. Desenhe um novo emoji.';
        emotionEl.textContent = '--';
        confidenceEl.textContent = '--';
        probabilityList.innerHTML = '';
    });

    function renderProbabilities(probabilities) {
        probabilityList.innerHTML = '';
        Object.entries(probabilities).forEach(([label, value]) => {
            const item = document.createElement('div');
            item.className = 'prob-item';
            item.innerHTML = `
                <div class="prob-label">
                    <span>${label}</span>
                    <span>${value.toFixed(2)}%</span>
                </div>
                <div class="bar">
                    <div class="bar-fill" style="width:${value}%"></div>
                </div>
            `;
            probabilityList.appendChild(item);
        });
    }

    predictBtn.addEventListener('click', async () => {
        statusEl.textContent = 'Analisando desenho...';

        try {
            const image = canvas.toDataURL('image/png');
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Falha desconhecida ao analisar a imagem.');
            }

            statusEl.textContent = 'Análise concluída.';
            emotionEl.textContent = data.emotion;
            confidenceEl.textContent = `${data.confidence.toFixed(2)}%`;
            renderProbabilities(data.probabilities);
        } catch (error) {
            statusEl.textContent = error.message;
            emotionEl.textContent = '--';
            confidenceEl.textContent = '--';
            probabilityList.innerHTML = '';
        }
    });

    prepareCanvas();
    statusEl.textContent = 'Desenhe olhos e boca; o contorno do rosto pode ser adicionado como opcional.';
});
