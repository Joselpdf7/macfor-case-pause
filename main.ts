import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'expo.out';

/* ==========================================================================
   Content: the three creative paths
   ========================================================================== */

interface Card {
  img?: string;
  alt?: string;
  big?: string;
  title: string;
  text?: string;
  note?: string;
}

interface Caminho {
  num: string;
  name: string;
  theme: 'yellow' | 'dark';
  mark: 'pause' | 'faixa' | 'losango';
  left: string;
  right: string;
  end: string;
  cards: Card[];
}

const CAMINHOS: Caminho[] = [
  {
    num: '001',
    name: 'A placa',
    theme: 'yellow',
    mark: 'pause',
    left: 'Seja para um pedestre, um motorista ou um ciclista, nós vamos tomar de volta a atenção que os aparelhos eletrônicos pegaram para eles.',
    right: 'A sinalização visual incentiva o contato direto com o entorno, garantindo que a caminhada continue com segurança e presença ativa. Mas a placa é só o começo.',
    end: 'A placa é só o começo',
    cards: [
      { img: 'placa-rua', alt: 'Pedestre com celular na mão olha para a placa de pause em um poste', title: 'Sinalização', text: 'O símbolo de pause na altura dos olhos, no ponto exato da travessia.' },
      { img: 'placa-close', alt: 'Placa circular preta com o símbolo de pause e a frase Aperte o pause antes de atravessar', title: 'A placa', text: 'Aperte o pause antes de atravessar.' },
      { img: 'abrigo', alt: 'Abrigo de ônibus com a campanha', title: 'Abrigo de ônibus', text: 'Atravessar a rua ou responder a mensagem? Na dúvida, aperte o pause e vá com segurança.' },
      { img: 'empena', alt: 'Empena de prédio com a campanha', title: 'Empena' },
      { img: 'painel', alt: 'Painel sobre a via com a campanha', title: 'Painel de via', text: 'Deixe o celular de lado e foque no volante.' },
      { img: 'influenciadores', alt: 'Casal de influenciadores gravando dentro de um carro', title: 'Influenciadores', text: 'A conversa entra nas redes por meio de conteúdos sobre coisas que não percebemos no dia a dia, terminando com a importância de fazer um pause e deixar de lado o celular onde se está vendo esse vídeo, em prol da própria segurança.' },
      { img: 'mimicos', alt: 'Mímicos vestidos de salva-vidas em uma travessia', title: 'Salva-Vidas Urbanos', text: 'Vestidos a caráter, os icônicos mímicos da CET ficam a postos nos pontos mais críticos da cidade. Ao flagrar um pedestre atravessando fora da faixa, entram em cena para um “resgate” silencioso e bem-humorado.' },
      { img: 'filme-case', alt: 'Homem sorri ao tirar os fones de ouvido na rua', title: 'Filme case', text: 'Para medir e comprovar o impacto da ação, um filme mostra pedestres parando de mexer no celular ao notarem a intervenção no chão.' },
    ],
  },
  {
    num: '002',
    name: 'A faixa',
    theme: 'dark',
    mark: 'faixa',
    left: 'Atravessar a rua é algo automático. Você sai da calçada para a rua da mesma forma que sai de um post para o próximo: sem pensar duas vezes.',
    right: 'Para interromper o fluxo automático, podemos interromper o pensamento das pessoas antes mesmo de elas chegarem perto da faixa.',
    end: 'A rua é a mídia',
    cards: [
      { img: 'automatico', alt: 'Mulher desce da calçada olhando para o celular enquanto um carro se aproxima', title: 'No automático' },
      { img: 'faixa-pause-noite', alt: 'Faixa de pedestres estendida até a calçada com o ícone de pause pintado', title: 'A intervenção', text: 'Estendemos a faixa de pedestres até a calçada e pintamos um contorno circular ao redor de duas listras, transformando-as no ícone universal de pause.' },
      { img: 'faixa-pause-pe', alt: 'Pés de um pedestre sobre o ícone de pause pintado no chão', title: 'A assinatura', text: 'Para amarrar o conceito, um stencil no chão: “Aperte o pause antes de atravessar”.' },
      { img: 'faixa-pause-close', alt: 'Detalhe do círculo amarelo pintado sobre duas listras da faixa', title: 'A rua como mídia', text: 'Instalação nas travessias de maior fluxo. O custo se concentra em tinta, stencil e na autorização da Prefeitura e da CET.' },
    ],
  },
  {
    num: '003',
    name: 'O ponto cego',
    theme: 'yellow',
    mark: 'losango',
    left: 'Nossa atenção é roubada por aparelhos e distrações a todo momento. E isso cria pontos cegos que geram armadilhas no dia a dia.',
    right: 'Vamos tornar os pontos cegos visíveis, por meio de intervenções urbanas focadas em avisar aos pedestres sobre riscos que podem fugir de seu campo de visão.',
    end: 'O invisível, visível',
    cards: [
      { img: 'ponto-cego-chuva', alt: 'Pedestre de capa amarela cruza em frente a um carro em dia de chuva', title: 'Fração de segundos', text: 'Onde, em uma fração de segundos, um imprevisto se torna algo quase inevitável.' },
      { big: '70%', title: 'Mais chance de atropelar', text: 'Veículos com grandes pontos cegos do lado do motorista, especialmente SUVs e picapes, elevam em 70% as chances de atropelar um pedestre durante manobras e conversões à esquerda.', note: 'Fonte: Webmotors / WM1, “Pontos cegos aumentam riscos para pedestres”.' },
      { img: 'ponto-cego-suv', alt: 'Pedestre é atingido por um SUV em uma conversão', title: 'O que os olhos não veem' },
      { img: 'placas', alt: 'Seis placas amarelas em formato de losango com alertas sobre pontos cegos', title: 'Tornando o invisível visível', text: 'Cuidado, você está em um ponto cego. O que os olhos não veem, o freio não impede.' },
      { img: 'cacamba', alt: 'Caçamba amarela com alerta de ponto cego', title: 'Caçamba', text: 'Eu sou um ponto cego de 3 toneladas. Não atravesse por trás de mim.' },
      { img: 'onibus', alt: 'Traseira de ônibus com alerta de ponto cego', title: 'Traseira de ônibus', text: 'O ônibus parou, o carro ao lado não.' },
      { img: 'lombada', alt: 'Lombada amarela e preta instalada na calçada antes da travessia', title: 'Lombada na calçada', text: 'Um relevo que simula uma lombada trava a caminhada, quebra o ritmo e força a pessoa distraída a olhar para frente. Faz com o pedestre o mesmo que faz com os carros: obriga a desacelerar no momento exato em que a distração se tornaria tragédia.' },
    ],
  },
];

const MARKS: Record<Caminho['mark'], string> = {
  pause: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="3"/><rect x="72" y="58" width="20" height="84" fill="currentColor"/><rect x="108" y="58" width="20" height="84" fill="currentColor"/></svg>`,
  faixa: `<svg viewBox="0 0 200 200"><g fill="currentColor" opacity=".35"><rect x="20" y="62" width="18" height="76"/><rect x="46" y="62" width="18" height="76"/><rect x="136" y="62" width="18" height="76"/><rect x="162" y="62" width="18" height="76"/></g><rect x="74" y="62" width="18" height="76" fill="currentColor"/><rect x="108" y="62" width="18" height="76" fill="currentColor"/><circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" stroke-width="3"/></svg>`,
  losango: `<svg viewBox="0 0 200 200"><rect x="34" y="34" width="132" height="132" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(45 100 100)"/><rect x="48" y="48" width="104" height="104" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(45 100 100)"/><path d="M58 100c14-20 28-28 42-28s28 8 42 28c-14 20-28 28-42 28s-28-8-42-28z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="100" cy="100" r="11" fill="currentColor"/><path d="M64 140 136 60" stroke="currentColor" stroke-width="3"/></svg>`,
};

function renderCaminhos(): void {
  const host = $('#caminhos');
  if (!host) return;
  host.innerHTML = CAMINHOS.map((c) => {
    const cards = c.cards
      .map((card, i) => {
        const media = card.big
          ? `<div class="card__media"><span class="card__big" data-scramble>${card.big}</span></div>`
          : `<div class="card__media"><img src="./img/${card.img}.jpg" alt="${card.alt ?? ''}" /></div>`;
        const text = card.text
          ? `<p class="card__text">${card.text}${card.note ? `<small>${card.note}</small>` : ''}</p>`
          : '';
        return `<article class="card${card.big ? ' card--stat' : ''}">${media}
          <div class="card__cap"><span class="card__idx">${c.num} / ${String(i + 1).padStart(2, '0')}</span><h3 class="card__title">${card.title}</h3>${text}</div>
        </article>`;
      })
      .join('');
    return `
      <section class="cam cam--${c.theme}" data-hud="${c.theme === 'yellow' ? 'dark' : 'light'}">
        <p class="label">Caminho criativo</p>
        <div class="cam__mark" aria-hidden="true">${MARKS[c.mark]}</div>
        <div class="cam__head">
          <span class="cam__num"><span class="line"><span>${c.num}</span></span></span>
          <h2 class="cam__name"><span class="line"><span>${c.name}</span></span></h2>
        </div>
        <div class="cam__rule"></div>
        <div class="cam__info"><p>${c.left}</p><p>${c.right}</p></div>
      </section>
      <section class="gal" data-hud="light" data-cursor="Role">
        <div class="gal__track">${cards}<p class="gal__end">${c.end} <span class="pause-glyph" aria-hidden="true"><i></i><i></i></span></p></div>
        <div class="gal__bar" aria-hidden="true"><i></i></div>
      </section>`;
  }).join('');
}

/* ==========================================================================
   Smooth scroll
   ========================================================================== */

let lenis: Lenis | null = null;

function initScroll(): void {
  if (reducedMotion) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

/* ==========================================================================
   3D pause button
   ========================================================================== */

const glState = { intro: 0, heroP: 0, footP: 0, paused: false };

function initGL(): void {
  const canvas = $<HTMLCanvasElement>('.gl');
  if (!canvas) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);

  const button = new THREE.Group();
  const black = new THREE.MeshPhysicalMaterial({ color: 0x070707, roughness: 0.22, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 });
  const yellow = new THREE.MeshPhysicalMaterial({ color: 0xffd400, roughness: 0.28, metalness: 0.1, clearcoat: 0.6 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf6f4ee, roughness: 0.35, clearcoat: 0.4 });

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.34, 128), black);
  disc.rotation.x = Math.PI / 2;
  button.add(disc);

  const ringGeo = new THREE.TorusGeometry(1.3, 0.045, 24, 160);
  const barGeo = new RoundedBoxGeometry(0.3, 1.12, 0.14, 5, 0.03);
  for (const side of [1, -1]) {
    const ring = new THREE.Mesh(ringGeo, yellow);
    ring.position.z = 0.17 * side;
    button.add(ring);
    for (const x of [-0.27, 0.27]) {
      const bar = new THREE.Mesh(barGeo, white);
      bar.position.set(x, 0, 0.2 * side);
      button.add(bar);
    }
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.17, 32, 160), black);
  button.add(rim);
  scene.add(button);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let fit = 1;
  const resize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fit = Math.min(1, camera.aspect / 1.25);
  };
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  let wasVisible = true;
  gsap.ticker.add((_time, deltaMs) => {
    if (!glState.paused) t += deltaMs / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    const heroScale = glState.intro * (1 - glState.heroP) ** 1.4;
    const footScale = glState.footP;
    const scale = Math.max(heroScale, footScale) * fit;
    const visible = scale > 0.002;
    if (!visible) {
      if (wasVisible) renderer.clear();
      wasVisible = false;
      return;
    }
    wasVisible = true;

    const inFoot = footScale > heroScale;
    button.scale.setScalar(scale * (inFoot ? 0.92 : 0.98));
    button.position.y = inFoot ? 0.55 : glState.heroP * 2.4 + Math.sin(t * 0.9) * 0.06;
    button.rotation.y = -0.55 + Math.sin(t * 0.45) * 0.35 + pointer.x * 0.55 + glState.heroP * Math.PI * 1.5 + (inFoot ? t * 0.5 : 0);
    button.rotation.x = 0.18 + Math.cos(t * 0.38) * 0.12 + pointer.y * 0.35;
    button.rotation.z = Math.sin(t * 0.3) * 0.08;
    renderer.render(scene, camera);
  });
}

/* ==========================================================================
   Ambient sound (synthesized street hum, cut when paused)
   ========================================================================== */

const sound = { ctx: null as AudioContext | null, gain: null as GainNode | null, on: false };

function setSoundLevel(level: number, time = 0.5): void {
  if (!sound.ctx || !sound.gain) return;
  const now = sound.ctx.currentTime;
  sound.gain.gain.cancelScheduledValues(now);
  sound.gain.gain.setTargetAtTime(level, now, time / 3);
}

function initSound(): void {
  const btn = $<HTMLButtonElement>('[data-sound]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!sound.ctx) {
      const ctx = new AudioContext();
      const length = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i++) {
        // Brown noise reads as distant traffic
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 6;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1600;
      // Cut the sub-bass that laptop speakers cannot reproduce
      const high = ctx.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = 140;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(high).connect(gain).connect(ctx.destination);
      src.start();
      sound.ctx = ctx;
      sound.gain = gain;
    }
    sound.on = !sound.on;
    void sound.ctx.resume();
    setSoundLevel(sound.on && !glState.paused ? 0.9 : 0);
    btn.textContent = sound.on ? '[ Som on ]' : '[ Som off ]';
    btn.setAttribute('aria-pressed', String(sound.on));
  });
}

/* ==========================================================================
   Helpers
   ========================================================================== */

function splitWords(el: HTMLElement): HTMLElement[] {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.textContent = '';
  return words.map((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(' ');
    return span;
  });
}

const SCRAMBLE_CHARS = '0123456789X/+%';

function scramble(el: HTMLElement, duration = 1.1): void {
  const final = el.dataset.final ?? el.textContent ?? '';
  el.dataset.final = final;
  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const settled = Math.floor(state.p * final.length);
      let out = final.slice(0, settled);
      for (let i = settled; i < final.length; i++) {
        out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
}

function setHud(theme: string | undefined): void {
  if (theme) document.body.dataset.hud = theme;
}

/* ==========================================================================
   Sections
   ========================================================================== */

function initHud(): void {
  $$('[data-hud]:not(body)').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 34px',
      end: 'bottom 34px',
      onToggle: (self) => self.isActive && setHud(el.dataset.hud),
    });
  });

  const count = $('[data-scroll-count]');
  const hint = $('[data-scroll-hint]');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (count) count.textContent = String(Math.round(self.progress * 100)).padStart(3, '0');
      if (hint) hint.style.opacity = self.scroll() > 60 ? '0' : '1';
    },
  });
}

function initCursor(): void {
  const cursor = $('.cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;
  const label = $('.cursor__label', cursor);
  const x = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    x(e.clientX);
    y(e.clientY);
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
    cursor.classList.toggle('is-big', Boolean(target));
    if (target && label) label.textContent = target.dataset.cursor ?? '';
  });
}

function initHero(): void {
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      glState.heroP = self.progress;
    },
  });
  gsap.to('.hero__title', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function initWords(): void {
  $$('[data-words]').forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: true },
    });
  });
}

function initDados(): void {
  gsap.fromTo(
    '.dados__bg img',
    { yPercent: -7 },
    { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.dados', start: 'top bottom', end: 'bottom top', scrub: true } },
  );
  gsap.from('.dado', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: EASE,
    stagger: 0.1,
    scrollTrigger: { trigger: '.dados__grid', start: 'top 75%' },
  });
  $$('[data-scramble]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => scramble(el) });
  });
}

function initPergunta(): void {
  const st = { trigger: '.pergunta', start: 'top 75%', end: 'top top', scrub: true };
  gsap.to('.pergunta__media', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st });
  gsap.to('.pergunta__media img', { scale: 1, ease: 'none', scrollTrigger: { ...st, end: 'bottom bottom' } });
}

function initInsight(): void {
  const ring = $<SVGCircleElement>('.ring');
  if (!ring) return;
  const len = ring.getTotalLength();
  gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('.stripe', { transformOrigin: '50% 100%' });
  gsap.set('.insight__svg', { transformOrigin: '50% 50%' });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '.insight', start: 'top top', end: '+=340%', pin: true, scrub: 0.6 },
  });
  tl.from('.stripe', { scaleY: 0, duration: 1, stagger: { each: 0.07, from: 'edges' } })
    .to('.stripe:not(.stripe--on)', { opacity: 0.13, duration: 1 }, '+=0.2')
    .to('.insight__a .line > span', { y: 0, duration: 0.8 }, '<')
    .to(ring, { strokeDashoffset: 0, duration: 1.4 }, '+=0.1')
    .to('.insight__b .line > span', { y: 0, duration: 0.8 }, '<0.5')
    .to('.insight__sub', { opacity: 1, duration: 0.5 })
    .to({}, { duration: 0.6 })
    .to('.insight__sub', { opacity: 0, duration: 0.4 })
    .to('.insight__a .line > span, .insight__b .line > span', { yPercent: -120, duration: 0.7 }, '<')
    .to('.stripe:not(.stripe--on)', { opacity: 0, duration: 0.7 }, '<')
    .to('.insight__svg', { scale: 0.72, rotate: 0.001, duration: 1 }, '<')
    .to('.insight__lock', { opacity: 1, duration: 0.6 }, '-=0.4')
    .to({}, { duration: 0.5 });
}

function initHold(): void {
  const section = $('[data-hold]');
  const rowsHost = $('.hold__rows');
  const btn = $<HTMLButtonElement>('[data-hold-btn]');
  const prog = $<SVGCircleElement>('.hold__prog');
  const hint = $('[data-hold-hint]');
  if (!section || !rowsHost || !btn || !prog || !hint) return;

  const phrases = [
    ['Nova mensagem', '3 curtidas', 'Ao vivo agora', 'Você foi marcado'],
    ['Próximo vídeo em 3, 2, 1', 'Áudio de 2:47', 'Só mais um story'],
    ['Ligação perdida', '12 notificações', 'Responder agora', 'Digitando…'],
    ['Assista até o final', 'Arrasta pra cima', 'Novo seguidor', 'Chegou seu pedido'],
    ['Só um segundo', 'Já te respondo', 'Tô chegando', 'Olha isso'],
  ];
  const tweens = phrases.map((row, i) => {
    const el = document.createElement('div');
    el.className = 'hold__row';
    const half = row.map((p, j) => `<span>${(i + j) % 3 === 0 ? `<em>${p}</em>` : p} •</span>`).join('');
    el.innerHTML = half.repeat(4);
    rowsHost.append(el);
    const dir = i % 2 === 0 ? -1 : 1;
    return gsap.fromTo(
      el,
      { xPercent: dir < 0 ? 0 : -50 },
      { xPercent: dir < 0 ? -50 : 0, duration: 16 + i * 5, ease: 'none', repeat: -1 },
    );
  });

  const DASH = 578;
  const state = { p: 0 };
  const apply = (): void => {
    prog.style.strokeDashoffset = String(DASH * (1 - state.p));
    const speed = 1 - state.p;
    tweens.forEach((tw) => tw.timeScale(Math.max(speed, 0.0001)));
  };
  const setDone = (done: boolean): void => {
    section.classList.toggle('is-done', done);
    document.body.classList.toggle('is-paused', done);
    glState.paused = done;
    setHud(done ? 'light' : section.dataset.hud);
    tweens.forEach((tw) => tw.paused(done));
    hint.textContent = done ? 'Solte para voltar ao barulho' : 'Segure para pausar';
    setSoundLevel(done || !sound.on ? 0 : 0.5, done ? 0.08 : 0.6);
  };

  const press = (): void => {
    section.classList.add('is-held');
    gsap.to(state, { p: 1, duration: 1.2 * (1 - state.p) + 0.01, ease: 'power1.in', overwrite: true, onUpdate: apply, onComplete: () => setDone(true) });
  };
  const release = (): void => {
    if (!section.classList.contains('is-held')) return;
    section.classList.remove('is-held');
    setDone(false);
    gsap.to(state, { p: 0, duration: 0.7, ease: 'power2.out', overwrite: true, onUpdate: apply });
  };

  btn.dataset.cursor = 'Segure';
  btn.addEventListener('pointerdown', (e) => {
    btn.setPointerCapture(e.pointerId);
    press();
  });
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  btn.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      press();
    }
  });
  btn.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') release();
  });
  btn.addEventListener('blur', release);

  // Marquees only run while the section is on screen
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (!self.isActive) release();
      tweens.forEach((tw) => tw.paused(!self.isActive));
    },
  });
}

function fitCamHeads(): void {
  $$('.cam__head').forEach((head) => {
    const num = $('.cam__num', head);
    const name = $('.cam__name', head);
    if (!num || !name) return;
    num.style.fontSize = '';
    name.style.fontSize = '';
    if (getComputedStyle(head).flexDirection === 'column') return;
    const gap = window.innerWidth * 0.04;
    const needed = num.scrollWidth + name.scrollWidth + gap;
    const ratio = head.clientWidth / needed;
    if (ratio < 1) {
      const size = `${parseFloat(getComputedStyle(num).fontSize) * ratio}px`;
      num.style.fontSize = size;
      name.style.fontSize = size;
    }
  });
}

function initCaminhos(): void {
  fitCamHeads();
  window.addEventListener('resize', fitCamHeads);

  $$('.cam').forEach((cam) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: cam, start: 'top 55%' } });
    tl.to($$('.cam__head .line > span', cam), { y: 0, duration: 1.3, ease: EASE, stagger: 0.12 })
      .to($('.cam__rule', cam), { scaleX: 1, duration: 1.2, ease: EASE }, '<0.2')
      .from($$('.cam__info p', cam), { y: 30, opacity: 0, duration: 1, ease: EASE, stagger: 0.1 }, '<0.2');
    gsap.fromTo(
      $('.cam__mark', cam),
      { rotate: -40 },
      { rotate: 140, ease: 'none', scrollTrigger: { trigger: cam, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  $$('.gal').forEach((gal) => {
    const track = $('.gal__track', gal);
    const bar = $('.gal__bar i', gal);
    if (!track) return;
    const distance = (): number => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: gal,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    $$('.card', gal).forEach((card) => {
      const img = $('img', card);
      if (!img) return;
      gsap.fromTo(
        img,
        { xPercent: -6 },
        { xPercent: 6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
      );
    });
  });
}

function fitFootGiant(): void {
  const giant = $('.foot__giant');
  const span = giant && $('span', giant);
  if (!giant || !span) return;
  giant.style.fontSize = '';
  const ratio = giant.clientWidth / span.offsetWidth;
  giant.style.fontSize = `${parseFloat(getComputedStyle(giant).fontSize) * ratio}px`;
}

function initFoot(): void {
  fitFootGiant();
  window.addEventListener('resize', fitFootGiant);
  void document.fonts.ready.then(() => {
    fitFootGiant();
    fitCamHeads();
  });
  gsap.to('.foot__giant span', {
    y: 0,
    duration: 1.6,
    ease: EASE,
    scrollTrigger: { trigger: '.foot', start: 'top 35%' },
  });
  ScrollTrigger.create({
    trigger: '.foot',
    start: 'top 60%',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      glState.footP = gsap.parseEase('power2.out')(self.progress);
    },
  });
}

/* ==========================================================================
   Preloader + intro
   ========================================================================== */

function waitForAssets(onProgress: (p: number) => void): Promise<void> {
  const images = $$<HTMLImageElement>('img');
  const total = images.length + 1;
  let loaded = 0;
  const tick = (): void => {
    loaded += 1;
    onProgress(loaded / total);
  };
  const jobs: Promise<void>[] = images.map(
    (img) =>
      new Promise<void>((resolve) => {
        const done = (): void => {
          tick();
          resolve();
        };
        if (img.complete) done();
        else {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }
      }),
  );
  jobs.push(document.fonts.ready.then(tick));
  const film = $<HTMLVideoElement>('.loader__film');
  if (film && film.readyState < 3) {
    // Wait for the cold-open film, but never block the page on it
    jobs.push(
      new Promise<void>((resolve) => {
        film.addEventListener('canplaythrough', () => resolve(), { once: true });
        film.addEventListener('error', () => resolve(), { once: true });
        window.setTimeout(resolve, 8000);
      }),
    );
  }
  return Promise.all(jobs).then(() => undefined);
}

const FILM_SECONDS = 3.6;

/** Cold open: a few seconds of the crosswalk film before the hero. Click skips. */
function playFilm(): Promise<void> {
  const loader = $('.loader');
  const film = $<HTMLVideoElement>('.loader__film');
  if (!loader || !film || reducedMotion || film.readyState < 2) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let finished = false;
    const finish = (): void => {
      if (finished) return;
      finished = true;
      loader.removeEventListener('click', finish);
      resolve();
    };
    gsap.to('.loader__mark, .loader__title, .loader__enter, .loader__count', { autoAlpha: 0, duration: 0.4 });
    gsap.fromTo(film, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' });
    gsap.to('.loader__skip', { autoAlpha: 1, duration: 0.6, delay: 0.6 });
    film.currentTime = 0;
    film.play().catch(finish);
    film.addEventListener('ended', finish, { once: true });
    gsap.delayedCall(FILM_SECONDS, finish);
    gsap.delayedCall(0.5, () => loader.addEventListener('click', finish));
  });
}

function playIntro(): void {
  const loader = $('.loader');
  const tl = gsap.timeline({
    onComplete: () => {
      loader?.remove();
      document.body.classList.remove('is-loading');
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
      lenis?.start();
      ScrollTrigger.refresh();
    },
  });
  tl.to('.loader__curtain i', { scaleY: 1, duration: 0.9, ease: 'expo.inOut', stagger: 0.12 })
    .set(loader, { background: 'transparent' })
    .set('.loader > *:not(.loader__curtain)', { autoAlpha: 0 })
    .set('.loader__curtain i', { transformOrigin: '50% 0%' })
    .to('.loader__curtain i', { scaleY: 0, duration: 1, ease: 'expo.inOut', stagger: 0.12 })
    .to('.hero__title .line > span', { y: 0, duration: 1.5, ease: EASE, stagger: 0.1 }, '-=0.75')
    .to(glState, { intro: 1, duration: 1.8, ease: 'elastic.out(1, 0.75)' }, '-=1.2')
    .from('.hud, .hud-foot, .hero__kicker', { autoAlpha: 0, duration: 1 }, '-=1.4');
}

function initLoader(): void {
  const count = $('[data-loader-count]');
  const enter = $<HTMLButtonElement>('[data-enter]');
  const shown = { p: 0 };
  const paint = (): void => {
    if (count) count.textContent = String(Math.round(shown.p * 100)).padStart(3, '0');
    gsap.set('.loader__mark i', { scaleY: shown.p });
  };
  const ready = waitForAssets((p) => {
    gsap.to(shown, { p, duration: 0.6, ease: 'power2.out', overwrite: true, onUpdate: paint });
  });
  void ready.then(() => {
    gsap.to(shown, {
      p: 1,
      duration: 0.5,
      overwrite: true,
      onUpdate: paint,
      onComplete: () => {
        if (!enter) return playIntro();
        enter.disabled = false;
        enter.focus();
        enter.addEventListener(
          'click',
          () => {
            // The click is the user gesture that unlocks audio: start the street hum with the film
            if (!sound.on) $<HTMLButtonElement>('[data-sound]')?.click();
            void playFilm().then(playIntro);
          },
          { once: true },
        );
      },
    });
  });
}

/* ==========================================================================
   Boot
   ========================================================================== */

// Always open on the hero, even after a reload mid-page
ScrollTrigger.clearScrollMemory('manual');
window.scrollTo(0, 0);

renderCaminhos();
initScroll();
initGL();
initSound();
initCursor();
initHero();
initWords();
initDados();
initPergunta();
initInsight();
initHold();
initCaminhos();
initFoot();
initHud();
ScrollTrigger.sort();
initLoader();
