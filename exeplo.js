
    function createParticles() {
      particles = [];
      const count = Math.min(120, Math.floor(window.innerWidth / 12));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.2 + 0.4,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          hue: Math.random() > 0.5 ? 190 : 315
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, 0.9)`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.8)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(46,242,255,${1 - dist / 110})`;
            ctx.lineWidth = 0.5;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }

      requestAnimationFrame(drawParticles);
    }

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    resizeCanvas();
    createParticles();
    drawParticles();