import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgStyle } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
import { DailyReflectionService } from '../daily-reflection.service';

const SCENES: string[] = [
  // 1 – Jungle
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      .j-frond{animation:j-sway 3.5s ease-in-out infinite alternate;transform-origin:bottom center}
      .j-frond2{animation:j-sway 4.5s ease-in-out infinite alternate-reverse;transform-origin:bottom center}
      @keyframes j-sway{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
    </style>
    <defs><linearGradient id="j-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1b4332"/><stop offset="100%" stop-color="#2d6a4f"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#j-bg)"/>
    <path d="M0,190 Q100,140 200,170 Q300,120 400,155 Q500,110 600,145 Q700,118 800,135 L800,300 L0,300 Z" fill="#40916c"/>
    <path d="M0,220 Q100,175 200,205 Q300,168 400,195 Q500,170 600,200 Q700,178 800,190 L800,300 L0,300 Z" fill="#2d6a4f"/>
    <path d="M0,255 Q100,232 200,250 Q300,228 400,252 Q500,230 600,255 Q700,235 800,252 L800,300 L0,300 Z" fill="#1b4332"/>
    <g class="j-frond">
      <rect x="96" y="155" width="9" height="145" rx="4" fill="#6b3a2a"/>
      <ellipse cx="74" cy="163" rx="30" ry="11" fill="#52b788" transform="rotate(-28 74 163)"/>
      <ellipse cx="100" cy="149" rx="34" ry="11" fill="#74c69d" transform="rotate(4 100 149)"/>
      <ellipse cx="126" cy="158" rx="28" ry="10" fill="#52b788" transform="rotate(24 126 158)"/>
    </g>
    <g class="j-frond2">
      <rect x="676" y="142" width="9" height="158" rx="4" fill="#6b3a2a"/>
      <ellipse cx="652" cy="150" rx="32" ry="11" fill="#52b788" transform="rotate(-22 652 150)"/>
      <ellipse cx="680" cy="135" rx="36" ry="11" fill="#74c69d" transform="rotate(6 680 135)"/>
      <ellipse cx="708" cy="145" rx="30" ry="10" fill="#52b788" transform="rotate(22 708 145)"/>
    </g>
    <path d="M290,95 Q302,160 298,300" stroke="#40916c" stroke-width="3" fill="none" opacity="0.55" stroke-dasharray="6,4"/>
    <path d="M510,78 Q524,148 518,300" stroke="#40916c" stroke-width="2.5" fill="none" opacity="0.45" stroke-dasharray="6,4"/>
  </svg>`,

  // 2 – Night Forest
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      .fo-star{animation:fo-tw 2.5s ease-in-out infinite}
      @keyframes fo-tw{0%,100%{opacity:.4}50%{opacity:1}}
    </style>
    <rect x="0" y="0" width="800" height="300" fill="#0f1923"/>
    <circle cx="680" cy="58" r="32" fill="#fffde7"/>
    <circle cx="696" cy="47" r="28" fill="#0f1923"/>
    <circle cx="80" cy="32" r="2" fill="white" class="fo-star" style="animation-delay:0s"/>
    <circle cx="210" cy="52" r="1.5" fill="white" class="fo-star" style="animation-delay:.5s"/>
    <circle cx="330" cy="24" r="2" fill="white" class="fo-star" style="animation-delay:1s"/>
    <circle cx="450" cy="44" r="1.5" fill="white" class="fo-star" style="animation-delay:1.5s"/>
    <circle cx="155" cy="68" r="1.5" fill="white" class="fo-star" style="animation-delay:.3s"/>
    <circle cx="540" cy="34" r="2" fill="white" class="fo-star" style="animation-delay:.8s"/>
    <polygon points="55,205 88,108 121,205" fill="#1a2e1a"/>
    <polygon points="95,205 132,90 169,205" fill="#1f3520"/>
    <polygon points="195,205 236,78 277,205" fill="#1a2e1a"/>
    <polygon points="370,205 412,72 454,205" fill="#1f3520"/>
    <polygon points="520,205 560,82 600,205" fill="#1a2e1a"/>
    <polygon points="635,205 672,92 709,205" fill="#1f3520"/>
    <polygon points="0,230 50,112 100,230" fill="#0d1f0d"/>
    <polygon points="155,230 210,95 265,230" fill="#112511"/>
    <polygon points="305,230 363,82 421,230" fill="#0d1f0d"/>
    <polygon points="455,230 512,90 569,230" fill="#112511"/>
    <polygon points="595,230 648,98 701,230" fill="#0d1f0d"/>
    <polygon points="710,230 760,108 810,230" fill="#112511"/>
    <rect x="0" y="228" width="800" height="72" fill="#08120a"/>
  </svg>`,

  // 3 – Mountains + Airplane
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes mt-fly{from{transform:translateX(-120px)}to{transform:translateX(900px)}}
      @keyframes mt-cloud{from{transform:translateX(0)}to{transform:translateX(50px)}}
      .mt-plane{animation:mt-fly 22s linear infinite}
      .mt-cloud{animation:mt-cloud 14s ease-in-out infinite alternate}
    </style>
    <defs><linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8d4f0"/><stop offset="100%" stop-color="#f0d8b0"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#mt-sky)"/>
    <circle cx="640" cy="65" r="38" fill="#f5c842" opacity="0.75"/>
    <ellipse cx="145" cy="72" rx="58" ry="20" fill="white" opacity="0.72" class="mt-cloud"/>
    <ellipse cx="166" cy="62" rx="38" ry="17" fill="white" opacity="0.72" class="mt-cloud"/>
    <ellipse cx="430" cy="52" rx="65" ry="19" fill="white" opacity="0.65" class="mt-cloud" style="animation-delay:-6s"/>
    <polygon points="40,215 195,62 350,215" fill="#8ba8c8"/>
    <polygon points="175,215 340,55 505,215" fill="#9ab8d8"/>
    <polygon points="350,215 488,80 626,215" fill="#8ba8c8"/>
    <polygon points="500,215 640,65 780,215" fill="#9ab8d8"/>
    <polygon points="195,62 222,98 168,98" fill="white" opacity="0.88"/>
    <polygon points="340,55 368,95 312,95" fill="white" opacity="0.88"/>
    <polygon points="488,80 513,114 463,114" fill="white" opacity="0.88"/>
    <polygon points="640,65 665,102 615,102" fill="white" opacity="0.88"/>
    <path d="M0,248 Q120,205 240,232 Q360,210 480,238 Q600,218 720,242 L800,240 L800,300 L0,300 Z" fill="#4a6a3a"/>
    <g class="mt-plane" transform="translate(0,58)">
      <rect x="0" y="-3.5" width="30" height="7" rx="3.5" fill="white" opacity="0.92"/>
      <polygon points="22,-3.5 30,0 22,3.5" fill="#ddd" opacity="0.92"/>
      <rect x="8" y="-8" width="13" height="5" rx="2" fill="white" opacity="0.92"/>
      <rect x="3" y="3.5" width="9" height="3.5" rx="1.5" fill="white" opacity="0.92"/>
      <line x1="-2" y1="0" x2="-65" y2="0" stroke="white" stroke-width="1.5" opacity="0.35"/>
    </g>
  </svg>`,

  // 4 – Underwater
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes uw-swim1{from{transform:translateX(850px) scaleX(-1)}to{transform:translateX(-100px) scaleX(-1)}}
      @keyframes uw-swim2{from{transform:translateX(-80px)}to{transform:translateX(860px)}}
      @keyframes uw-bubble{from{transform:translateY(0);opacity:.6}to{transform:translateY(-130px);opacity:0}}
      @keyframes uw-sway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
      .uw-f1{animation:uw-swim1 16s linear infinite}
      .uw-f2{animation:uw-swim2 22s linear infinite;animation-delay:-9s}
      .uw-b1{animation:uw-bubble 4s ease-out infinite}
      .uw-b2{animation:uw-bubble 5s ease-out infinite;animation-delay:-2s}
      .uw-b3{animation:uw-bubble 3.5s ease-out infinite;animation-delay:-1.2s}
      .uw-sw{animation:uw-sway 3s ease-in-out infinite alternate;transform-origin:bottom center}
    </style>
    <defs><linearGradient id="uw-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0077b6"/><stop offset="100%" stop-color="#023e8a"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#uw-sea)"/>
    <path d="M0,28 Q100,8 200,28 Q300,48 400,28 Q500,8 600,28 Q700,48 800,28 L800,0 L0,0 Z" fill="#90e0ef" opacity="0.28"/>
    <path d="M75,300 Q60,255 75,215 Q90,175 75,130" stroke="#2d8b6b" stroke-width="7" fill="none" stroke-linecap="round" class="uw-sw"/>
    <path d="M148,300 Q165,265 148,225 Q131,185 148,148" stroke="#3aab85" stroke-width="5.5" fill="none" stroke-linecap="round" class="uw-sw" style="animation-delay:-1.2s"/>
    <path d="M638,300 Q654,258 638,218 Q622,178 638,138" stroke="#2d8b6b" stroke-width="7" fill="none" stroke-linecap="round" class="uw-sw" style="animation-delay:-.6s"/>
    <path d="M718,300 Q700,260 718,222 Q736,184 718,148" stroke="#3aab85" stroke-width="5.5" fill="none" stroke-linecap="round" class="uw-sw" style="animation-delay:-2.1s"/>
    <path d="M0,278 Q200,265 400,278 Q600,290 800,272 L800,300 L0,300 Z" fill="#c9a96e" opacity="0.38"/>
    <circle cx="318" cy="282" r="12" fill="#e63946" opacity="0.65"/>
    <circle cx="330" cy="274" r="9" fill="#e63946" opacity="0.65"/>
    <circle cx="342" cy="281" r="11" fill="#c1121f" opacity="0.65"/>
    <g class="uw-f1" transform="translate(0,98)">
      <ellipse cx="0" cy="0" rx="19" ry="11" fill="#ff8c00"/>
      <polygon points="-19,0 -30,-9 -30,9" fill="#ff6200"/>
      <ellipse cx="5" cy="-2" rx="3.5" ry="3.5" fill="white"/><circle cx="6" cy="-2" r="1.8" fill="#222"/>
      <line x1="-4" y1="-11" x2="-4" y2="11" stroke="white" stroke-width="1.5" opacity="0.45"/>
    </g>
    <g class="uw-f2" transform="translate(0,168)">
      <ellipse cx="0" cy="0" rx="13" ry="8" fill="#48cae4"/>
      <polygon points="-13,0 -22,-7 -22,7" fill="#0096c7"/>
      <circle cx="4" cy="-1" r="2.5" fill="white"/><circle cx="4.5" cy="-1" r="1.2" fill="#222"/>
    </g>
    <circle cx="195" cy="248" r="4.5" fill="none" stroke="white" stroke-width="1.5" opacity=".6" class="uw-b1"/>
    <circle cx="378" cy="228" r="3" fill="none" stroke="white" stroke-width="1.5" opacity=".6" class="uw-b2"/>
    <circle cx="572" cy="255" r="5" fill="none" stroke="white" stroke-width="1.5" opacity=".6" class="uw-b3"/>
  </svg>`,

  // 5 – Savannah
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes sv-bird{0%{transform:translateX(0)}100%{transform:translateX(320px)}}
      .sv-bird{animation:sv-bird 18s linear infinite}
    </style>
    <defs><linearGradient id="sv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e64a19"/><stop offset="55%" stop-color="#ffb74d"/><stop offset="100%" stop-color="#ffe0b2"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#sv-sky)"/>
    <circle cx="400" cy="195" r="52" fill="#ff6f00" opacity="0.68"/>
    <path d="M0,210 Q200,198 400,210 Q600,222 800,205 L800,300 L0,300 Z" fill="#8d6e3a"/>
    <path d="M0,232 Q200,220 400,232 Q600,244 800,228 L800,300 L0,300 Z" fill="#6d4c2a"/>
    <rect x="140" y="162" width="12" height="72" fill="#5d4037"/>
    <ellipse cx="146" cy="155" rx="52" ry="22" fill="#33691e"/>
    <ellipse cx="170" cy="148" rx="38" ry="16" fill="#558b2f"/>
    <ellipse cx="122" cy="150" rx="36" ry="15" fill="#33691e"/>
    <rect x="620" y="168" width="10" height="66" fill="#5d4037"/>
    <ellipse cx="625" cy="162" rx="46" ry="20" fill="#33691e"/>
    <ellipse cx="646" cy="156" rx="34" ry="14" fill="#558b2f"/>
    <ellipse cx="604" cy="158" rx="32" ry="13" fill="#33691e"/>
    <rect x="478" y="143" width="14" height="75" rx="7" fill="#3e2723" opacity="0.78"/>
    <rect x="482" y="100" width="9" height="48" rx="4.5" fill="#3e2723" opacity="0.78"/>
    <ellipse cx="487" cy="96" rx="11" ry="13" fill="#3e2723" opacity="0.78"/>
    <rect x="474" y="185" width="9" height="32" rx="4.5" fill="#3e2723" opacity="0.78"/>
    <rect x="491" y="185" width="9" height="30" rx="4.5" fill="#3e2723" opacity="0.78"/>
    <line x1="483" y1="87" x2="481" y2="76" stroke="#3e2723" stroke-width="3.5" opacity="0.78"/>
    <line x1="492" y1="86" x2="494" y2="75" stroke="#3e2723" stroke-width="3.5" opacity="0.78"/>
    <g class="sv-bird" transform="translate(60,122)">
      <path d="M0,0 Q5,-5 10,0 Q15,-5 20,0" stroke="#3e2723" stroke-width="1.8" fill="none" opacity="0.72"/>
    </g>
    <g class="sv-bird" transform="translate(90,112)" style="animation-delay:-7s">
      <path d="M0,0 Q4,-4 8,0 Q12,-4 16,0" stroke="#3e2723" stroke-width="1.8" fill="none" opacity="0.72"/>
    </g>
  </svg>`,

  // 6 – Cherry Blossom
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes ch-fall{from{transform:translate(0,0) rotate(0deg);opacity:.9}to{transform:translate(45px,310px) rotate(600deg);opacity:0}}
      .ch-p1{animation:ch-fall 5.5s ease-in infinite}
      .ch-p2{animation:ch-fall 6.5s ease-in infinite;animation-delay:-2.2s}
      .ch-p3{animation:ch-fall 4.8s ease-in infinite;animation-delay:-1.1s}
      .ch-p4{animation:ch-fall 7s ease-in infinite;animation-delay:-3.8s}
      .ch-p5{animation:ch-fall 5s ease-in infinite;animation-delay:-.5s}
      .ch-p6{animation:ch-fall 6s ease-in infinite;animation-delay:-4.2s}
    </style>
    <defs><linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fce4ec"/><stop offset="100%" stop-color="#f8bbd0"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#ch-sky)"/>
    <rect x="112" y="188" width="17" height="112" rx="8" fill="#5d4037"/>
    <rect x="116" y="158" width="11" height="38" rx="5.5" fill="#5d4037"/>
    <circle cx="92" cy="145" r="30" fill="#f48fb1" opacity="0.82"/>
    <circle cx="118" cy="130" r="34" fill="#f06292" opacity="0.72"/>
    <circle cx="148" cy="140" r="28" fill="#f48fb1" opacity="0.82"/>
    <circle cx="106" cy="160" r="24" fill="#ec407a" opacity="0.62"/>
    <rect x="662" y="192" width="15" height="108" rx="7" fill="#5d4037"/>
    <rect x="665" y="162" width="11" height="36" rx="5" fill="#5d4037"/>
    <circle cx="643" cy="148" r="28" fill="#f48fb1" opacity="0.82"/>
    <circle cx="668" cy="133" r="32" fill="#f06292" opacity="0.72"/>
    <circle cx="696" cy="142" r="26" fill="#f48fb1" opacity="0.82"/>
    <path d="M0,252 Q200,240 400,252 Q600,264 800,250 L800,300 L0,300 Z" fill="#a5d6a7" opacity="0.55"/>
    <ellipse cx="195" cy="262" rx="5" ry="2.5" fill="#f48fb1" opacity="0.6" transform="rotate(-20 195 262)"/>
    <ellipse cx="340" cy="268" rx="4.5" ry="2" fill="#f06292" opacity="0.5" transform="rotate(15 340 268)"/>
    <ellipse cx="545" cy="260" rx="5" ry="2.5" fill="#f48fb1" opacity="0.6" transform="rotate(-10 545 260)"/>
    <ellipse cx="172" cy="62" rx="5.5" ry="2.5" fill="#f48fb1" class="ch-p1" transform="rotate(-30 172 62)"/>
    <ellipse cx="295" cy="42" rx="4.5" ry="2" fill="#f06292" class="ch-p2" transform="rotate(22 295 42)"/>
    <ellipse cx="415" cy="56" rx="5" ry="2.5" fill="#f48fb1" class="ch-p3" transform="rotate(-14 415 56)"/>
    <ellipse cx="518" cy="36" rx="4" ry="2" fill="#ec407a" class="ch-p4" transform="rotate(36 518 36)"/>
    <ellipse cx="248" cy="78" rx="5.5" ry="2.5" fill="#f48fb1" class="ch-p5" transform="rotate(-26 248 78)"/>
    <ellipse cx="598" cy="52" rx="4.5" ry="2" fill="#f06292" class="ch-p6" transform="rotate(12 598 52)"/>
  </svg>`,

  // 7 – Desert Night
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      .ds-s{animation:ds-tw 2.2s ease-in-out infinite}
      @keyframes ds-tw{0%,100%{opacity:.3}50%{opacity:1}}
      .ds-sh{animation:ds-shoot 4s ease-in infinite;animation-delay:-2s}
      @keyframes ds-shoot{0%{transform:translate(0,0);opacity:1}100%{transform:translate(90px,90px);opacity:0}}
    </style>
    <defs><linearGradient id="ds-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b1622"/><stop offset="100%" stop-color="#1b2d3e"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#ds-sky)"/>
    <circle cx="672" cy="58" r="30" fill="#f5f5dc"/>
    <circle cx="688" cy="47" r="26" fill="#1b2d3e"/>
    <circle cx="78" cy="32" r="2" fill="white" class="ds-s" style="animation-delay:0s"/>
    <circle cx="195" cy="54" r="1.5" fill="white" class="ds-s" style="animation-delay:.35s"/>
    <circle cx="318" cy="26" r="2" fill="white" class="ds-s" style="animation-delay:.7s"/>
    <circle cx="432" cy="48" r="1.5" fill="white" class="ds-s" style="animation-delay:1.1s"/>
    <circle cx="545" cy="30" r="2" fill="white" class="ds-s" style="animation-delay:.55s"/>
    <circle cx="148" cy="68" r="1.5" fill="white" class="ds-s" style="animation-delay:.2s"/>
    <circle cx="380" cy="74" r="1.5" fill="white" class="ds-s" style="animation-delay:.9s"/>
    <line x1="270" y1="42" x2="332" y2="88" stroke="white" stroke-width="1.5" opacity=".65" class="ds-sh"/>
    <path d="M0,242 Q150,205 300,238 Q450,222 600,242 Q700,230 800,240 L800,300 L0,300 Z" fill="#c2955a"/>
    <path d="M0,262 Q100,248 220,258 Q360,248 500,262 Q650,252 800,260 L800,300 L0,300 Z" fill="#a0785a"/>
    <rect x="143" y="172" width="14" height="90" rx="7" fill="#2e7d32"/>
    <rect x="118" y="192" width="30" height="10" rx="5" fill="#2e7d32"/>
    <rect x="104" y="172" width="14" height="42" rx="7" fill="#2e7d32"/>
    <rect x="157" y="195" width="30" height="10" rx="5" fill="#2e7d32"/>
    <rect x="171" y="176" width="14" height="38" rx="7" fill="#2e7d32"/>
    <rect x="578" y="178" width="12" height="84" rx="6" fill="#2e7d32"/>
    <rect x="555" y="198" width="28" height="9" rx="4.5" fill="#2e7d32"/>
    <rect x="543" y="180" width="12" height="36" rx="6" fill="#2e7d32"/>
  </svg>`,

  // 8 – Campfire
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes cf-flicker{0%,100%{transform:scaleY(1) scaleX(1)}25%{transform:scaleY(1.1) scaleX(0.9)}50%{transform:scaleY(0.94) scaleX(1.06)}75%{transform:scaleY(1.06) scaleX(0.95)}}
      @keyframes cf-glow{0%,100%{opacity:.32}50%{opacity:.52}}
      @keyframes cf-star{0%,100%{opacity:.3}50%{opacity:.95}}
      @keyframes cf-sp1{0%{transform:translate(0,0);opacity:1}100%{transform:translate(-22px,-68px);opacity:0}}
      @keyframes cf-sp2{0%{transform:translate(0,0);opacity:1}100%{transform:translate(20px,-75px);opacity:0}}
      @keyframes cf-sp3{0%{transform:translate(0,0);opacity:1}100%{transform:translate(-6px,-85px);opacity:0}}
      .cf-flame{animation:cf-flicker .65s ease-in-out infinite;transform-origin:bottom center}
      .cf-glow{animation:cf-glow 1.3s ease-in-out infinite}
      .cf-s{animation:cf-star 2.5s ease-in-out infinite}
      .cf-sp1{animation:cf-sp1 1.6s ease-out infinite}
      .cf-sp2{animation:cf-sp2 1.9s ease-out infinite;animation-delay:-.55s}
      .cf-sp3{animation:cf-sp3 1.4s ease-out infinite;animation-delay:-1.1s}
    </style>
    <defs>
      <linearGradient id="cf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0c0c1a"/><stop offset="65%" stop-color="#1a0800"/><stop offset="100%" stop-color="#2e1200"/></linearGradient>
      <radialGradient id="cf-rg" cx="50%" cy="90%" r="45%"><stop offset="0%" stop-color="#ff6600" stop-opacity=".48"/><stop offset="100%" stop-color="#ff6600" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#cf-sky)"/>
    <ellipse cx="400" cy="290" rx="230" ry="85" fill="url(#cf-rg)" class="cf-glow"/>
    <circle cx="78" cy="28" r="1.8" fill="white" class="cf-s" style="animation-delay:0s"/>
    <circle cx="198" cy="50" r="1.2" fill="white" class="cf-s" style="animation-delay:.42s"/>
    <circle cx="318" cy="22" r="2" fill="white" class="cf-s" style="animation-delay:.85s"/>
    <circle cx="502" cy="40" r="1.5" fill="white" class="cf-s" style="animation-delay:.28s"/>
    <circle cx="618" cy="18" r="1.8" fill="white" class="cf-s" style="animation-delay:.62s"/>
    <circle cx="718" cy="46" r="1.2" fill="white" class="cf-s" style="animation-delay:1.05s"/>
    <circle cx="142" cy="64" r="1.5" fill="white" class="cf-s" style="animation-delay:.18s"/>
    <circle cx="548" cy="58" r="1" fill="white" class="cf-s" style="animation-delay:.72s"/>
    <circle cx="678" cy="72" r="1.5" fill="white" class="cf-s" style="animation-delay:.38s"/>
    <path d="M0,258 Q200,244 400,258 Q600,272 800,256 L800,300 L0,300 Z" fill="#1c0e00"/>
    <path d="M0,274 Q200,263 400,274 Q600,285 800,272 L800,300 L0,300 Z" fill="#120900"/>
    <ellipse cx="372" cy="270" rx="46" ry="7" fill="#3a1e00" transform="rotate(-18 372 270)"/>
    <ellipse cx="428" cy="270" rx="46" ry="7" fill="#4a2600" transform="rotate(18 428 270)"/>
    <g class="cf-flame">
      <path d="M383,267 Q376,232 400,205 Q424,232 417,267 Z" fill="#ff5500" opacity="0.9"/>
      <path d="M386,267 Q380,238 400,218 Q420,238 414,267 Z" fill="#ff7700" opacity="0.88"/>
      <path d="M390,267 Q385,246 400,230 Q415,246 410,267 Z" fill="#ffaa00" opacity="0.82"/>
      <path d="M394,267 Q391,254 400,243 Q409,254 406,267 Z" fill="#ffdd00" opacity="0.72"/>
    </g>
    <circle cx="397" cy="256" r="1.5" fill="#ffdd00" class="cf-sp1"/>
    <circle cx="403" cy="251" r="1.2" fill="#ff8800" class="cf-sp2"/>
    <circle cx="400" cy="248" r="1" fill="#ffdd00" class="cf-sp3"/>
    <circle cx="316" cy="234" r="9" fill="#180c00" opacity="0.88"/>
    <path d="M307,243 Q311,260 316,267 Q321,260 325,243 Z" fill="#180c00" opacity="0.88"/>
    <circle cx="484" cy="236" r="9" fill="#180c00" opacity="0.88"/>
    <path d="M475,245 Q479,262 484,269 Q489,262 493,245 Z" fill="#180c00" opacity="0.88"/>
    <polygon points="72,280 110,158 148,280" fill="#0c0700" opacity="0.82"/>
    <polygon points="105,280 146,146 187,280" fill="#100900" opacity="0.82"/>
    <polygon points="618,280 656,150 694,280" fill="#0c0700" opacity="0.82"/>
    <polygon points="650,280 686,162 722,280" fill="#100900" opacity="0.82"/>
  </svg>`,

  // 9 – Meadow
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes mw-fly{0%{transform:translate(0,0)}25%{transform:translate(16px,-14px)}50%{transform:translate(32px,0)}75%{transform:translate(16px,12px)}100%{transform:translate(0,0)}}
      @keyframes mw-sw{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
      .mw-b{animation:mw-fly 5.5s ease-in-out infinite}
      .mw-f{animation:mw-sw 2.2s ease-in-out infinite alternate;transform-origin:bottom center}
    </style>
    <defs><linearGradient id="mw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b3e5fc"/><stop offset="100%" stop-color="#e1f5fe"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#mw-sky)"/>
    <circle cx="678" cy="52" r="32" fill="#fff176" opacity="0.85"/>
    <ellipse cx="148" cy="62" rx="62" ry="21" fill="white" opacity="0.8"/>
    <ellipse cx="170" cy="52" rx="42" ry="18" fill="white" opacity="0.8"/>
    <ellipse cx="418" cy="46" rx="72" ry="22" fill="white" opacity="0.7"/>
    <ellipse cx="448" cy="36" rx="46" ry="18" fill="white" opacity="0.7"/>
    <path d="M0,228 Q150,172 300,218 Q450,180 600,222 Q700,202 800,218 L800,300 L0,300 Z" fill="#81c784"/>
    <path d="M0,255 Q100,235 200,252 Q300,232 400,255 Q500,234 600,255 Q700,236 800,255 L800,300 L0,300 Z" fill="#4caf50"/>
    <g class="mw-f" transform="translate(118,250)"><rect x="-2" y="-18" width="4" height="18" fill="#388e3c"/><circle cx="0" cy="-22" r="7" fill="#f9a825"/></g>
    <g class="mw-f" transform="translate(198,257)" style="animation-delay:-.35s"><rect x="-2" y="-16" width="4" height="16" fill="#388e3c"/><circle cx="0" cy="-20" r="6" fill="#e53935"/></g>
    <g class="mw-f" transform="translate(298,252)" style="animation-delay:-.7s"><rect x="-2" y="-18" width="4" height="18" fill="#388e3c"/><circle cx="0" cy="-22" r="7" fill="#ab47bc"/></g>
    <g class="mw-f" transform="translate(398,258)" style="animation-delay:-.42s"><rect x="-2" y="-16" width="4" height="16" fill="#388e3c"/><circle cx="0" cy="-20" r="6" fill="#f9a825"/></g>
    <g class="mw-f" transform="translate(498,253)" style="animation-delay:-.9s"><rect x="-2" y="-18" width="4" height="18" fill="#388e3c"/><circle cx="0" cy="-22" r="7" fill="#e53935"/></g>
    <g class="mw-f" transform="translate(598,258)" style="animation-delay:-.22s"><rect x="-2" y="-16" width="4" height="16" fill="#388e3c"/><circle cx="0" cy="-20" r="6" fill="#ab47bc"/></g>
    <g class="mw-f" transform="translate(678,252)" style="animation-delay:-.6s"><rect x="-2" y="-18" width="4" height="18" fill="#388e3c"/><circle cx="0" cy="-22" r="7" fill="#f9a825"/></g>
    <g class="mw-b" transform="translate(338,148)">
      <ellipse cx="-9" cy="-5" rx="13" ry="8" fill="#ff8f00" opacity="0.85" transform="rotate(-20 -9 -5)"/>
      <ellipse cx="9" cy="-5" rx="13" ry="8" fill="#ff8f00" opacity="0.85" transform="rotate(20 9 -5)"/>
      <ellipse cx="-7" cy="3" rx="8" ry="6" fill="#ffe082" opacity="0.7" transform="rotate(15 -7 3)"/>
      <ellipse cx="7" cy="3" rx="8" ry="6" fill="#ffe082" opacity="0.7" transform="rotate(-15 7 3)"/>
      <line x1="0" y1="-10" x2="0" y2="8" stroke="#5d4037" stroke-width="1.5"/>
    </g>
  </svg>`,

  // 10 – Arctic
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
    <style>
      @keyframes ar-aurora{0%,100%{opacity:.28;transform:skewX(-6deg)}50%{opacity:.55;transform:skewX(6deg)}}
      .ar-a1{animation:ar-aurora 4.5s ease-in-out infinite}
      .ar-a2{animation:ar-aurora 5.5s ease-in-out infinite;animation-delay:-2.2s}
      .ar-a3{animation:ar-aurora 6.5s ease-in-out infinite;animation-delay:-3.5s}
      .ar-st{animation:ar-tw 2.8s ease-in-out infinite}
      @keyframes ar-tw{0%,100%{opacity:.35}50%{opacity:1}}
    </style>
    <defs><linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b1a26"/><stop offset="100%" stop-color="#1a3a4e"/></linearGradient></defs>
    <rect x="0" y="0" width="800" height="300" fill="url(#ar-sky)"/>
    <circle cx="58" cy="36" r="1.8" fill="white" class="ar-st" style="animation-delay:0s"/>
    <circle cx="178" cy="54" r="1.2" fill="white" class="ar-st" style="animation-delay:.45s"/>
    <circle cx="288" cy="28" r="2" fill="white" class="ar-st" style="animation-delay:.9s"/>
    <circle cx="518" cy="42" r="1.8" fill="white" class="ar-st" style="animation-delay:.3s"/>
    <circle cx="638" cy="24" r="1.2" fill="white" class="ar-st" style="animation-delay:.75s"/>
    <circle cx="748" cy="50" r="2" fill="white" class="ar-st" style="animation-delay:1.15s"/>
    <path d="M0,82 Q200,52 400,87 Q600,118 800,78" stroke="#00e676" stroke-width="14" fill="none" opacity="0.32" class="ar-a1"/>
    <path d="M0,102 Q200,72 400,107 Q600,138 800,98" stroke="#40c4ff" stroke-width="9" fill="none" opacity="0.28" class="ar-a2"/>
    <path d="M0,66 Q200,40 400,72 Q600,98 800,62" stroke="#ea80fc" stroke-width="6" fill="none" opacity="0.22" class="ar-a3"/>
    <rect x="0" y="195" width="800" height="105" fill="#0c3652" opacity="0.88"/>
    <polygon points="72,195 136,132 200,195" fill="#dff0f5" opacity="0.9"/>
    <polygon points="94,195 136,148 178,195" fill="white" opacity="0.8"/>
    <polygon points="298,195 362,140 426,195" fill="#dff0f5" opacity="0.9"/>
    <polygon points="320,195 362,156 404,195" fill="white" opacity="0.8"/>
    <polygon points="558,195 618,136 678,195" fill="#dff0f5" opacity="0.9"/>
    <polygon points="578,195 618,152 658,195" fill="white" opacity="0.8"/>
    <ellipse cx="238" cy="196" rx="32" ry="8" fill="white" opacity="0.55"/>
    <ellipse cx="478" cy="197" rx="28" ry="7" fill="white" opacity="0.55"/>
    <ellipse cx="728" cy="196" rx="36" ry="9" fill="white" opacity="0.55"/>
    <path d="M0,268 Q200,258 400,268 Q600,278 800,264 L800,300 L0,300 Z" fill="white" opacity="0.45"/>
  </svg>`,
];

@Component({
  selector: 'app-r2-settle-down',
  standalone: true,
  imports: [MatButtonModule, NgStyle],
  animations: [
    trigger('fadePrompt', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' })),
      ]),
    ]),
  ],
  template: `
    <div class="scene-wrap"
         [style.transform]="'scaleY(' + $sceneProgress() + ')'"
         [innerHTML]="safeScene">
    </div>

    <div class="settle-layout">
      <div class="card glass">
        <p>Let's take a minute to settle down.</p>

        <div class="timer-icon" [class.pulsing]="$isPulsing()">
          <svg class="progress-ring" viewBox="0 0 36 36">
            <circle
              class="ring-progress"
              cx="18" cy="18" r="16"
              [attr.stroke-dashoffset]="progressOffset()"
              [attr.stroke]="interpolatedColor()"
            />
          </svg>
          <span class="timer-text">
            @if (remainingSeconds() > 0) { {{ displaySeconds() }} }
            @if (remainingSeconds() === 0) { 0 }
            @if (remainingSeconds() < 0) { +{{ -remainingSeconds() }} }
          </span>
        </div>

        <button mat-raised-button
          (click)="completeStep()"
          [ngStyle]="{ 'background-color': interpolatedColor() }"
          class="transition-button">
          I took my time
        </button>
      </div>

      <div class="prompt-slot">
        @for (i of [1, 2, 3]; track i) {
          @if ($promptIndex() === i) {
            <p class="settle-prompt" @fadePrompt>{{ prompts[i] }}</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .scene-wrap {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100vh;
      transform-origin: bottom center;
      transition: transform 1s linear;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .settle-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .prompt-slot {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .glass {
      background: rgba(255, 255, 255, 0.86) !important;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    .settle-prompt {
      text-align: center;
      font-family: 'Caveat', cursive;
      font-size: 1.4rem;
      color: rgba(50, 50, 50, 0.82);
      margin: 0;
      padding: 0 24px;
      line-height: 1.5;
      pointer-events: none;
    }

    @media (min-width: 768px) {
      .prompt-slot {
        position: absolute;
        left: calc(50% + 180px);
        top: 50%;
        transform: translateY(-50%);
        height: auto;
        width: 200px;
        justify-content: flex-start;
        align-items: flex-start;
      }

      .settle-prompt {
        text-align: left;
        padding: 0;
      }
    }

    .transition-button {
      color: white;
      transition: background-color 1s linear;
      margin-top: 10px;
    }

    .timer-icon {
      display: inline-block;
      font-size: 2rem;
      font-family: 'Courier New', Courier, monospace;
      background: #f3f3f3;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      line-height: 60px;
      text-align: center;
      margin-bottom: 12px;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
      position: relative;
    }

    .timer-icon.pulsing .progress-ring {
      animation: pulse-ring 1.4s ease-in-out 1;
    }

    @keyframes pulse-ring {
      0% { filter: drop-shadow(0 0 0px currentColor); }
      50% { filter: drop-shadow(0 0 7px currentColor); }
      100% { filter: drop-shadow(0 0 0px currentColor); }
    }

    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Rubik', sans-serif;
      font-weight: 300;
      font-size: 1.5rem;
      color: rgba(64, 59, 59, 0.7);
      letter-spacing: 0.5px;
      pointer-events: none;
    }

    .progress-ring {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-progress {
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 100;
      transition: stroke-dashoffset 1s linear;
    }
  `],
})
export class R2SettleDownComponent implements OnDestroy {
  dailyReflectionService = inject(DailyReflectionService);
  private sanitizer = inject(DomSanitizer);

  totalSeconds = 60;
  remainingSeconds = signal(this.totalSeconds);

  private intervalId: ReturnType<typeof setInterval>;

  readonly safeScene: SafeHtml;

  readonly prompts = [
    '',
    'Feel free to take a deep breath.',
    'Would you like to close your eyes?',
    'Gently allow your awareness to be inside your body.',
  ];

  constructor() {
    this.safeScene = this.sanitizer.bypassSecurityTrustHtml(
      SCENES[Math.floor(Math.random() * SCENES.length)]
    );
    this.intervalId = setInterval(() => this.remainingSeconds.update(n => n - 1), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  completeStep() {
    this.dailyReflectionService.$currentStep.set('reflect-on-good');
  }

  $promptIndex = computed(() => {
    const elapsed = this.totalSeconds - this.remainingSeconds();
    if (elapsed >= 45) return 3;
    if (elapsed >= 30) return 2;
    if (elapsed >= 15) return 1;
    return 0;
  });

  $sceneProgress = computed(() => {
    const remaining = this.remainingSeconds();
    if (remaining > 5) return 0;
    return Math.min((5 - remaining) / 10, 1);
  });

  $isPulsing = computed(() => this.remainingSeconds() <= 5);

  interpolatedColor = computed(() => {
    const clamped = Math.max(this.remainingSeconds(), 0);
    const progress = (this.totalSeconds - clamped) / this.totalSeconds;
    const r = Math.round(255 * (1 - progress));
    const g = Math.round(140 * (1 - progress) + 128 * progress);
    return `rgb(${r}, ${g}, 0)`;
  });

  progressOffset = computed(() => {
    const remaining = Math.max(this.remainingSeconds(), 0);
    const progress = (this.totalSeconds - remaining) / this.totalSeconds;
    return `${100 - progress * 100}`;
  });

  displaySeconds = computed(() => {
    const sec = this.remainingSeconds();
    if (sec % 5 === 0 || sec >= 50) return sec;
    return sec + (5 - sec % 5);
  });
}
