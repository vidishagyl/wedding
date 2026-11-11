import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';

declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

export interface RsvpSubmission {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  inviteMode: 'full' | 'reception';
  attending: 'yes' | 'maybe' | 'no';
  events: string[];
  performHaldi: boolean;
  performReception: boolean;
  performanceNote: string;
  stayRequired: boolean;
  blessings: string;
  language: 'en' | 'hi';
  updatedAt: number;
}

export interface WeddingEventItem {
  id: string;
  timeEn: string;
  timeHi: string;
  titleEn: string;
  titleHi: string;
  taglineEn: string;
  taglineHi: string;
  dateEn: string;
  dateHi: string;
  venueEn: string;
  venueHi: string;
  latticeTheme: 'rose' | 'sage' | 'blush' | 'marigold' | 'crimson' | 'lavender';
  titleColor: string;
  receptionIncluded: boolean;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Cinzel+Decorative:wght@400;700&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

    :host {
      display: block;
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      font-family: 'Cormorant Garamond', 'Noto Serif Devanagari', Georgia, serif;
      background-color: #EFE6D5;
      color: #4A3B36;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* Full-Screen Mandatory Scroll Snap Container */
    .snap-viewport {
      width: 100%;
      height: 100dvh;
      overflow-y: scroll;
      overflow-x: hidden;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    .snap-viewport::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }

    .snap-page {
      position: relative;
      width: 100%;
      height: 100dvh;
      min-height: 100dvh;
      scroll-snap-align: start;
      scroll-snap-stop: always;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
    }

    /* Pastel Diamond-Lattice / Argyle Outer Backdrops (Matching Screenshots) */
    .lattice-gold {
      background-color: #E8D5B5;
      background-image:
        linear-gradient(135deg, rgba(255, 253, 247, 0.28) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 253, 247, 0.28) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 253, 247, 0.28) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 253, 247, 0.28) 25%, #E8D5B5 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
      background-repeat: repeat;
    }

    .lattice-sage {
      background-color: #DCE9DF;
      background-image:
        linear-gradient(135deg, rgba(255, 255, 255, 0.35) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 255, 255, 0.35) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 255, 255, 0.35) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 255, 255, 0.35) 25%, #DCE9DF 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
    }

    .lattice-blush {
      background-color: #F6DFDF;
      background-image:
        linear-gradient(135deg, rgba(255, 250, 250, 0.42) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 250, 250, 0.42) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 250, 250, 0.42) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 250, 250, 0.42) 25%, #F6DFDF 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
    }

    .lattice-rose {
      background-color: #F2D2D4;
      background-image:
        linear-gradient(135deg, rgba(255, 248, 248, 0.38) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 248, 248, 0.38) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 248, 248, 0.38) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 248, 248, 0.38) 25%, #F2D2D4 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
    }

    .lattice-lavender {
      background-color: #E3E7EE;
      background-image:
        linear-gradient(135deg, rgba(255, 255, 255, 0.45) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 255, 255, 0.45) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 255, 255, 0.45) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 255, 255, 0.45) 25%, #E3E7EE 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
    }

    .lattice-marigold {
      background-color: #F4E3C9;
      background-image:
        linear-gradient(135deg, rgba(255, 252, 245, 0.42) 25%, transparent 25%),
        linear-gradient(225deg, rgba(255, 252, 245, 0.42) 25%, transparent 25%),
        linear-gradient(45deg, rgba(255, 252, 245, 0.42) 25%, transparent 25%),
        linear-gradient(315deg, rgba(255, 252, 245, 0.42) 25%, #F4E3C9 25%);
      background-position: 28px 0, 28px 0, 0 0, 0 0;
      background-size: 56px 56px;
    }

    .sky-goodbye {
      background: linear-gradient(180deg, #D8F0F2 0%, #E7F6F7 65%, #CFE7E9 100%);
    }

    /* Mobile-First Card Wrapper */
    .jharokha-stage {
      position: relative;
      width: 100%;
      max-width: 440px;
      height: calc(100dvh - 20px);
      max-height: 860px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      border-radius: 18px;
      box-shadow: 0 18px 48px rgba(74, 50, 40, 0.14);
    }

    /* Typography Swashes & Hindi Matra-Safe Rules */
    .swash-heading {
      font-family: 'Cinzel Decorative', 'Cormorant Garamond', serif;
      font-weight: 400;
      letter-spacing: 0.04em;
      line-height: 1.15;
    }

    .hindi-heading {
      font-family: 'Noto Serif Devanagari', serif;
      font-weight: 600;
      line-height: 1.55 !important;
      padding-top: 0.22em !important;
      padding-bottom: 0.12em !important;
      letter-spacing: 0.01em !important;
      overflow: visible !important;
      display: inline-block;
    }

    .hindi-body {
      font-family: 'Noto Serif Devanagari', sans-serif;
      line-height: 1.65 !important;
      padding-top: 0.1em;
    }

    .tracked-caps {
      font-family: 'Cormorant Garamond', serif;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      font-weight: 600;
    }

    .script-italic {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-weight: 600;
    }

    /* Subtle Keyframe Animations */
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-6px) rotate(1.5deg); }
    }

    @keyframes swayGentle {
      0%, 100% { transform: rotate(-2.2deg); }
      50% { transform: rotate(2.2deg); }
    }

    @keyframes butterflyFlap {
      0%, 100% { transform: translate(0, 0) scaleX(1) rotate(-6deg); }
      25% { transform: translate(4px, -5px) scaleX(0.82) rotate(-2deg); }
      50% { transform: translate(8px, -2px) scaleX(1) rotate(4deg); }
      75% { transform: translate(3px, 4px) scaleX(0.85) rotate(-4deg); }
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.72; transform: scale(0.96); }
      50% { opacity: 1; transform: scale(1.08); }
    }

    @keyframes scrollBounce {
      0%, 100% { transform: translateY(0); opacity: 0.75; }
      50% { transform: translateY(6px); opacity: 1; }
    }

    @keyframes waterRipple {
      0%, 100% { transform: translateX(0px); }
      50% { transform: translateX(5px); }
    }

    .anim-float {
      animation: floatSlow 4.5s ease-in-out infinite;
    }

    .anim-sway {
      transform-origin: top center;
      animation: swayGentle 3.8s ease-in-out infinite;
    }

    .anim-butterfly {
      animation: butterflyFlap 5.2s ease-in-out infinite;
    }

    .anim-bulb {
      animation: pulseGlow 2.4s ease-in-out infinite;
    }

    .anim-scroll-cue {
      animation: scrollBounce 2s ease-in-out infinite;
    }

    .anim-lotus {
      animation: waterRipple 3.6s ease-in-out infinite;
    }

    /* Door Gate Transition */
    .gate-curtain {
      transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .gate-open {
      opacity: 0;
      pointer-events: none;
      transform: scale(1.08);
    }

    /* Custom Inputs */
    .royal-input {
      background: rgba(255, 253, 247, 0.92);
      border: 1.5px solid #D7C2A8;
      border-radius: 12px;
      padding: 10px 14px;
      font-family: 'Cormorant Garamond', 'Noto Serif Devanagari', serif;
      font-size: 1.08rem;
      color: #3E2F2B;
      transition: all 0.2s ease;
      width: 100%;
      outline: none;
    }

    .royal-input:focus {
      border-color: #D96B70;
      box-shadow: 0 0 0 3px rgba(217, 107, 112, 0.16);
      background: #FFFFFF;
    }
  `],
  template: `
    <!-- ================= TOP FLOATING CONTROLS BAR ================= -->
    <header class="fixed top-2.5 left-0 right-0 z-40 px-3 pointer-events-none flex items-center justify-between max-w-[440px] mx-auto">
      <!-- Mode Switcher Pill (Full Day vs Reception Only) -->
      <div class="pointer-events-auto flex items-center bg-[#FFFDF7]/90 backdrop-blur-md border border-[#D8C3A5] rounded-full p-0.5 shadow-sm text-[11px] font-sans">
        <button
          type="button"
          (click)="setInviteMode('full')"
          [class]="inviteMode() === 'full'
            ? 'px-2.5 py-1 rounded-full bg-[#D96B70] text-white font-medium transition-all'
            : 'px-2.5 py-1 rounded-full text-[#6E5A4F] hover:text-[#3E2F2B] transition-all'">
          {{ lang() === 'en' ? 'Full Day' : 'पूरा दिन' }}
        </button>
        <button
          type="button"
          (click)="setInviteMode('reception')"
          [class]="inviteMode() === 'reception'
            ? 'px-2.5 py-1 rounded-full bg-[#5F7A6E] text-white font-medium transition-all'
            : 'px-2.5 py-1 rounded-full text-[#6E5A4F] hover:text-[#3E2F2B] transition-all'">
          {{ lang() === 'en' ? 'Reception' : 'रिसेप्शन' }}
        </button>
      </div>

      <!-- Right Controls: Language, Audio & Admin -->
      <div class="pointer-events-auto flex items-center gap-1.5">
        <!-- Language Toggle -->
        <button
          type="button"
          (click)="toggleLanguage()"
          class="px-2.5 py-1 rounded-full bg-[#FFFDF7]/90 backdrop-blur-md border border-[#D8C3A5] text-[#4A3B36] text-xs font-medium shadow-sm hover:border-[#D96B70] transition-all">
          {{ lang() === 'en' ? 'हिन्दी' : 'EN' }}
        </button>

        <!-- Shehnai / Santoor Ambient Music Toggle -->
        <button
          type="button"
          (click)="toggleAudio()"
          [attr.aria-label]="audioPlaying() ? 'Mute Music' : 'Play Music'"
          class="w-7 h-7 rounded-full bg-[#FFFDF7]/90 backdrop-blur-md border border-[#D8C3A5] flex items-center justify-center text-[#D96B70] shadow-sm hover:scale-105 transition-all">
          @if (audioPlaying()) {
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          } @else {
            <svg class="w-3.5 h-3.5 opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13M9 9l12-2M3 3l18 18"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          }
        </button>

        <!-- Admin Drawer Button -->
        <button
          type="button"
          (click)="showAdminModal.set(true)"
          title="RSVP Admin Dashboard"
          class="px-2 py-1 rounded-full bg-[#FFFDF7]/90 backdrop-blur-md border border-[#D8C3A5] text-[#5F7A6E] text-[11px] font-sans font-medium shadow-sm hover:bg-[#5F7A6E] hover:text-white transition-all">
          /admin ({{ allSubmissions().length }})
        </button>
      </div>
    </header>

    <!-- ================= INITIAL LANGUAGE & TAP-TO-OPEN DOOR OVERLAY ================= -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center lattice-gold p-3 gate-curtain"
      [class.gate-open]="doorOpened()">
      <div class="jharokha-stage relative bg-[#FFFDF7] border-2 border-[#D5B88B] shadow-2xl flex flex-col items-center justify-between py-8 px-6 text-center">
        <!-- Scalloped Inner Arch Outline -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 760" preserveAspectRatio="none">
          <path
            d="M 18,742 L 18,165 C 18,125 46,105 64,84 C 82,62 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,62 336,84 C 354,105 382,125 382,165 L 382,742 Z"
            fill="none"
            stroke="#D6B785"
            stroke-width="2"
          />
          <path
            d="M 26,734 L 26,170 C 26,133 52,113 70,92 C 88,70 104,50 136,44 C 165,38 185,26 200,16 C 215,26 235,38 264,44 C 296,50 312,70 330,92 C 348,113 374,133 374,170 L 374,734 Z"
            fill="none"
            stroke="#E7D3B3"
            stroke-width="1"
          />
        </svg>

        <!-- Top Ganesh & Botanical Flourish -->
        <div class="relative z-10 flex flex-col items-center mt-4">
          <svg class="w-10 h-10 text-[#D4A359] mb-1" viewBox="0 0 64 64" fill="currentColor">
            <path d="M32 6c-4 5-7 9-7 14 0 4 3 7 7 7s7-3 7-7c0-5-3-9-7-14zm-12 22c-5 0-9 4-9 9 0 6 5 10 11 10h4c1 5 5 9 10 9 4 0 7-2 8-5-4 0-7-3-7-7 0-3 2-5 5-6 4-1 7-4 7-8 0-5-4-9-9-9-3 0-6 2-8 4-2-2-5-4-8-4h-4z"/>
          </svg>
          <p class="text-xs tracking-[0.25em] text-[#B68642] font-semibold">
            ॥ श्री गणेशाय नमः ॥
          </p>
        </div>

        <!-- Central Calligraphic VK Monogram Crest -->
        <div class="relative z-10 my-auto flex flex-col items-center">
          <div class="relative w-44 h-44 flex items-center justify-center">
            <svg class="w-full h-full" viewBox="0 0 220 220">
              <!-- Floral Crest Frame -->
              <path
                d="M110 16 C145 16 178 38 188 76 C198 114 185 156 150 178 C126 193 94 193 70 178 C35 156 22 114 32 76 C42 38 75 16 110 16 Z"
                fill="none"
                stroke="#92B2B8"
                stroke-width="1.5"
                stroke-dasharray="4 3"
              />
              <!-- Interlocked vk Monogram (Styled like screenshot 1 'ap') -->
              <text x="68" y="122" font-family="'Cormorant Garamond', serif" font-size="88" font-style="italic" fill="#8FB0B9" opacity="0.92">v</text>
              <text x="104" y="108" font-family="'Cormorant Garamond', serif" font-size="88" font-weight="600" fill="#7CA0AA" opacity="0.95">k</text>
              <!-- Infinity Calligraphic Swash Loop -->
              <path
                d="M 112,108 C 112,148 52,162 46,136 C 40,114 86,118 114,132 C 142,146 184,148 178,126 C 172,106 124,120 108,162 C 102,178 86,182 82,170"
                fill="none"
                stroke="#8FB0B9"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <!-- Delicate Butterfly on the Swash -->
              <g class="anim-butterfly" transform="translate(65, 130)">
                <path d="M12 10 C4 2, 0 6, 3 13 C5 17, 10 16, 12 13 Z" fill="#FDF8EC" stroke="#8C5A4C" stroke-width="1"/>
                <path d="M12 10 C20 2, 24 6, 21 13 C19 17, 14 16, 12 13 Z" fill="#FDF8EC" stroke="#8C5A4C" stroke-width="1"/>
                <circle cx="6" cy="9" r="1.5" fill="#D96B70"/>
                <circle cx="18" cy="9" r="1.5" fill="#D96B70"/>
                <line x1="12" y1="7" x2="12" y2="16" stroke="#4A3B36" stroke-width="1.2"/>
              </g>
            </svg>
          </div>

          <!-- Language Picker Pills -->
          <p class="text-xs uppercase tracking-[0.22em] text-[#8C705F] mb-2.5">
            Choose Language / भाषा चुनें
          </p>
          <div class="flex items-center gap-3 mb-5">
            <button
              type="button"
              (click)="selectLanguage('en')"
              [class]="lang() === 'en'
                ? 'px-5 py-2 rounded-full bg-[#D96B70] text-white text-sm font-medium shadow-md scale-105 transition-all'
                : 'px-5 py-2 rounded-full bg-[#F7EFE4] text-[#5E4B42] text-sm border border-[#D8C3A5] hover:border-[#D96B70] transition-all'">
              English
            </button>
            <button
              type="button"
              (click)="selectLanguage('hi')"
              [class]="lang() === 'hi'
                ? 'px-5 py-2 rounded-full bg-[#D96B70] text-white text-sm font-medium shadow-md scale-105 transition-all hindi-body'
                : 'px-5 py-2 rounded-full bg-[#F7EFE4] text-[#5E4B42] text-sm border border-[#D8C3A5] hover:border-[#D96B70] transition-all hindi-body'">
              हिन्दी
            </button>
          </div>

          <!-- Open Invitation CTA -->
          <button
            type="button"
            (click)="openInvitationDoor()"
            class="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D96B70] to-[#C85A60] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2.5">
            <span class="tracking-[0.18em] uppercase text-xs font-semibold">
              {{ lang() === 'en' ? 'Tap to Open Invitation' : 'निमंत्रण खोलें' }}
            </span>
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Bottom Mini Lotus Motif -->
        <div class="relative z-10 text-[11px] tracking-[0.2em] uppercase text-[#9B826E]">
          {{ inviteMode() === 'full'
            ? (lang() === 'en' ? '20th January • Full Day Celebrations' : '२० जनवरी • संपूर्ण विवाह उत्सव')
            : (lang() === 'en' ? '20th January • Varmala & Reception' : '२० जनवरी • वरमाला एवं रिसेप्शन') }}
        </div>
      </div>
    </div>

    <!-- ================= MAIN FULL-SCREEN SCROLL-SNAP CONTAINER ================= -->
    <main #snapViewport class="snap-viewport" (scroll)="onViewportScroll($event)">

      <!-- =======================================================================
           SCREEN 1: MONOGRAM GATE & LOTUS POND (EXACT MATCH TO SCREENSHOT 1)
           ======================================================================= -->
      <section class="snap-page lattice-gold">
        <div class="jharokha-stage relative bg-[#FFFDF7]">
          <!-- Scalloped Mughal Jharokha Arch Frame SVG (Screenshot 1) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 760" preserveAspectRatio="none">
            <!-- Outer Gold Surround outside the arch -->
            <path
              d="M0,0 L400,0 L400,760 L0,760 Z M 22,726 L 378,726 L 378,165 C 378,125 352,108 335,86 C 318,64 302,42 268,36 C 238,30 216,18 200,8 C 184,18 162,30 132,36 C 98,42 82,64 65,86 C 48,108 22,125 22,165 Z"
              fill="#E5CFA9"
              fill-rule="evenodd"
            />
            <!-- Inner Gold Arch Border -->
            <path
              d="M 22,726 L 22,165 C 22,125 48,108 65,86 C 82,64 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,64 335,86 C 352,108 378,125 378,165 L 378,726"
              fill="none"
              stroke="#C9AB79"
              stroke-width="2.5"
            />
          </svg>

          <!-- Warm Watercolor Sun in Upper Right -->
          <div class="absolute top-20 right-14 w-14 h-14 rounded-full bg-gradient-to-br from-[#F7D070] to-[#EAB84B] opacity-85 blur-[0.5px] z-10 anim-float"></div>

          <!-- Top & Side Botanical Foliage Overlays (Sage Leaves, Pink Hibiscus, White Bell Blooms) -->
          <svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 760">
            <!-- Top Center Twin Pink Blooms & Sage Leaves -->
            <g transform="translate(150, 6)">
              <path d="M50,15 Q30,35 10,45 M50,15 Q70,35 90,45" stroke="#6F8576" stroke-width="1.5" fill="none"/>
              <ellipse cx="28" cy="28" rx="12" ry="6" transform="rotate(-25 28 28)" fill="#9EB4A5" opacity="0.8"/>
              <ellipse cx="72" cy="28" rx="12" ry="6" transform="rotate(25 72 28)" fill="#9EB4A5" opacity="0.8"/>
              <!-- Left Pink Lily/Hibiscus -->
              <g transform="translate(36, 16)">
                <ellipse cx="0" cy="-10" rx="5" ry="12" fill="#E67A83"/>
                <ellipse cx="9" cy="-4" rx="5" ry="12" transform="rotate(65 9 -4)" fill="#EE959D"/>
                <ellipse cx="-9" cy="-4" rx="5" ry="12" transform="rotate(-65 -9 -4)" fill="#EE959D"/>
                <ellipse cx="6" cy="7" rx="4" ry="10" transform="rotate(135 6 7)" fill="#D96B70"/>
                <ellipse cx="-6" cy="7" rx="4" ry="10" transform="rotate(-135 -6 7)" fill="#D96B70"/>
                <circle cx="0" cy="0" r="3" fill="#F6D06B"/>
              </g>
              <!-- Right Pink Lily/Hibiscus -->
              <g transform="translate(64, 16)">
                <ellipse cx="0" cy="-10" rx="5" ry="12" fill="#E67A83"/>
                <ellipse cx="9" cy="-4" rx="5" ry="12" transform="rotate(65 9 -4)" fill="#EE959D"/>
                <ellipse cx="-9" cy="-4" rx="5" ry="12" transform="rotate(-65 -9 -4)" fill="#EE959D"/>
                <ellipse cx="6" cy="7" rx="4" ry="10" transform="rotate(135 6 7)" fill="#D96B70"/>
                <ellipse cx="-6" cy="7" rx="4" ry="10" transform="rotate(-135 -6 7)" fill="#D96B70"/>
                <circle cx="0" cy="0" r="3" fill="#F6D06B"/>
              </g>
            </g>

            <!-- Left Arch Botanical Vines & Pink Flower -->
            <g transform="translate(18, 95)">
              <path d="M5,120 Q35,65 75,20" stroke="#6E8475" stroke-width="1.6" fill="none"/>
              <ellipse cx="32" cy="75" rx="10" ry="5" transform="rotate(-40 32 75)" fill="#7F9686"/>
              <ellipse cx="48" cy="52" rx="10" ry="5" transform="rotate(-35 48 52)" fill="#95AC9C"/>
              <ellipse cx="22" cy="55" rx="9" ry="4.5" transform="rotate(20 22 55)" fill="#6E8475"/>
              <!-- Left Side Pink Hibiscus -->
              <g transform="translate(22, 92)">
                <ellipse cx="0" cy="-12" rx="6" ry="14" transform="rotate(-15)" fill="#E67A83"/>
                <ellipse cx="11" cy="-4" rx="6" ry="14" transform="rotate(45)" fill="#F09CA3"/>
                <ellipse cx="8" cy="9" rx="6" ry="14" transform="rotate(110)" fill="#D96B70"/>
                <ellipse cx="-7" cy="9" rx="6" ry="14" transform="rotate(-120)" fill="#E67A83"/>
                <circle cx="0" cy="0" r="3.5" fill="#F5CE62"/>
              </g>
              <!-- Soft Sage Broad Leaves -->
              <path d="M2,190 C28,175 44,195 36,222 C24,218 8,208 2,190 Z" fill="#C9D9D0" opacity="0.85"/>
              <path d="M4,225 C34,215 48,238 34,262 C18,255 6,242 4,225 Z" fill="#B8CCC1" opacity="0.85"/>
            </g>

            <!-- Right Arch Botanical Vines & Pink Flower -->
            <g transform="translate(305, 85)">
              <path d="M72,130 Q45,70 5,18" stroke="#6E8475" stroke-width="1.6" fill="none"/>
              <ellipse cx="42" cy="72" rx="10" ry="5" transform="rotate(40 42 72)" fill="#7F9686"/>
              <ellipse cx="26" cy="48" rx="10" ry="5" transform="rotate(35 26 48)" fill="#95AC9C"/>
              <!-- Soft Sage Broad Leaves -->
              <path d="M70,135 C42,125 28,145 38,172 C50,168 64,154 70,135 Z" fill="#C9D9D0" opacity="0.85"/>
              <!-- Right Pink Flower -->
              <g transform="translate(54, 195)">
                <ellipse cx="0" cy="-12" rx="6" ry="14" fill="#E67A83"/>
                <ellipse cx="-11" cy="-4" rx="6" ry="14" transform="rotate(-55)" fill="#F09CA3"/>
                <ellipse cx="-8" cy="9" rx="6" ry="14" transform="rotate(-115)" fill="#D96B70"/>
                <ellipse cx="8" cy="8" rx="6" ry="14" transform="rotate(115)" fill="#E67A83"/>
                <circle cx="0" cy="0" r="3.5" fill="#F5CE62"/>
              </g>
            </g>
          </svg>

          <!-- Center Monogram & Intro Copy -->
          <div class="relative z-20 flex flex-col items-center justify-center my-auto pt-12 px-8 text-center">
            <svg class="w-48 h-44" viewBox="0 0 220 200">
              <text x="68" y="110" font-family="'Cormorant Garamond', serif" font-size="86" font-style="italic" fill="#8FB0B9">v</text>
              <text x="104" y="96" font-family="'Cormorant Garamond', serif" font-size="86" font-weight="600" fill="#7CA0AA">k</text>
              <path
                d="M 112,96 C 112,138 48,152 42,126 C 36,104 86,108 114,122 C 142,136 186,138 180,116 C 174,96 124,110 108,154 C 102,170 86,174 82,162"
                fill="none"
                stroke="#8FB0B9"
                stroke-width="1.5"
              />
              <!-- Butterfly perched on loop -->
              <g class="anim-butterfly" transform="translate(64, 118)">
                <path d="M12 10 C4 2, 0 6, 3 13 C5 17, 10 16, 12 13 Z" fill="#FDF8EC" stroke="#8C5A4C" stroke-width="1"/>
                <path d="M12 10 C20 2, 24 6, 21 13 C19 17, 14 16, 12 13 Z" fill="#FDF8EC" stroke="#8C5A4C" stroke-width="1"/>
                <circle cx="6" cy="9" r="1.5" fill="#D96B70"/>
                <circle cx="18" cy="9" r="1.5" fill="#D96B70"/>
              </g>
            </svg>

            @if (lang() === 'en') {
              <p class="tracked-caps text-xs sm:text-sm text-[#D96B70] leading-relaxed mt-2">
                THE DAY HAS FINALLY<br/>ARRIVED FOR THE
              </p>
            } @else {
              <p class="hindi-body text-base text-[#D96B70] font-medium mt-2">
                वह शुभ घड़ी आखिरकार आ गई है<br/>जब दो दिल एक होने जा रहे हैं
              </p>
            }
          </div>

          <!-- Bottom Lotus Pond & Royal Decorated Elephants SVG (Exact Match to Screenshot 1 & 2) -->
          <div class="relative w-full h-56 z-20 mt-auto">
            <svg class="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pondWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#D7ECEB" stop-opacity="0.3"/>
                  <stop offset="30%" stop-color="#A8CFD1" stop-opacity="0.85"/>
                  <stop offset="100%" stop-color="#6A9BA6" stop-opacity="0.98"/>
                </linearGradient>
              </defs>

              <!-- Fluttering Second Butterfly Above Pond -->
              <g class="anim-butterfly" transform="translate(202, 28)">
                <path d="M10 8 C3 1, 0 5, 2 11 C4 14, 8 13, 10 11 Z" fill="#FDF8EC" stroke="#7A4B3A" stroke-width="1"/>
                <path d="M10 8 C17 1, 20 5, 18 11 C16 14, 12 13, 10 11 Z" fill="#FDF8EC" stroke="#7A4B3A" stroke-width="1"/>
                <circle cx="5" cy="7" r="1.3" fill="#D96B70"/>
                <circle cx="15" cy="7" r="1.3" fill="#D96B70"/>
              </g>

              <!-- Turquoise Lotus Pond Water -->
              <rect x="22" y="68" width="356" height="128" fill="url(#pondWater)"/>
              <!-- Subtle Water Ripples -->
              <g stroke="#E4F2F2" stroke-width="0.9" opacity="0.55">
                <line x1="95" y1="95" x2="155" y2="95"/>
                <line x1="210" y1="108" x2="285" y2="108"/>
                <line x1="130" y1="136" x2="220" y2="136"/>
                <line x1="160" y1="168" x2="260" y2="168"/>
              </g>

              <!-- Floating Pink Lotuses on Lily Pads -->
              <g class="anim-lotus" transform="translate(158, 152)">
                <ellipse cx="0" cy="8" rx="32" ry="11" fill="#7D9C82"/>
                <path d="M-22,4 Q0,-18 22,4 Z" fill="#E67A83"/>
                <path d="M-15,5 Q0,-22 15,5 Z" fill="#F29CA3"/>
                <path d="M-8,6 Q0,-24 8,6 Z" fill="#FAD2D5"/>
                <circle cx="0" cy="2" r="4" fill="#F3C85F"/>
              </g>

              <g class="anim-lotus" transform="translate(244, 120) scale(0.82)">
                <ellipse cx="0" cy="8" rx="30" ry="10" fill="#7D9C82"/>
                <path d="M-20,4 Q0,-16 20,4 Z" fill="#E67A83"/>
                <path d="M-13,5 Q0,-20 13,5 Z" fill="#F29CA3"/>
                <path d="M-6,6 Q0,-22 6,6 Z" fill="#FAD2D5"/>
              </g>

              <!-- LEFT ROYAL ELEPHANT WITH RAISED TRUNK & GREEN/GOLD HEADPIECE -->
              <g transform="translate(16, 18)">
                <!-- Body & Legs -->
                <path d="M6,95 Q38,88 55,115 L68,176 L48,176 L40,138 L22,138 L18,176 L2,176 Z" fill="#68676C"/>
                <!-- Pink & Gold Neck Garland & Tassels -->
                <path d="M18,98 Q42,106 60,96" fill="none" stroke="#F09CA3" stroke-width="5"/>
                <path d="M18,102 Q42,110 60,100" fill="none" stroke="#E8C266" stroke-width="2.5"/>
                <!-- Pink Hanging Tassels under tusk -->
                <polygon points="88,88 81,112 95,112" fill="#F09CA3"/>
                <polygon points="100,88 93,112 107,112" fill="#E5838C"/>
                <circle cx="88" cy="86" r="2.5" fill="#E8C266"/>
                <circle cx="100" cy="86" r="2.5" fill="#E8C266"/>
                <!-- Head, Ear & Raised Trunk -->
                <path d="M26,56 C52,44 76,54 88,72 C98,84 108,74 104,58 C100,44 88,36 86,26 C84,18 92,16 96,22 C104,34 118,52 114,74 C110,92 90,96 72,88 C58,96 34,96 26,76 Z" fill="#68676C"/>
                <!-- Green & Gold Netted Headpiece (Jhool) -->
                <path d="M32,54 C50,42 72,46 82,60 C66,64 46,64 32,54 Z" fill="#6F8769" stroke="#E8C266" stroke-width="1.5"/>
                <path d="M42,48 L54,61 M56,47 L66,60 M68,50 L76,60" stroke="#E8C266" stroke-width="1"/>
                <!-- Gold Trunk Bands -->
                <path d="M96,42 Q104,40 108,44 M98,54 Q107,52 112,56 M96,66 Q106,66 112,70" fill="none" stroke="#E8C266" stroke-width="1.6"/>
                <!-- White Ivory Tusk -->
                <path d="M78,80 Q96,86 110,76 Q98,92 76,86 Z" fill="#FFFDF7"/>
                <!-- Eye -->
                <ellipse cx="66" cy="64" rx="3.5" ry="2.2" fill="#FFF"/>
                <circle cx="66" cy="64" r="1.5" fill="#222"/>
                <!-- Gold Anklets -->
                <line x1="48" y1="168" x2="66" y2="168" stroke="#E8C266" stroke-width="3"/>
              </g>

              <!-- RIGHT ROYAL ELEPHANT WITH RAISED TRUNK (MIRRORED) -->
              <g transform="translate(384, 18) scale(-1, 1)">
                <path d="M6,95 Q38,88 55,115 L68,176 L48,176 L40,138 L22,138 L18,176 L2,176 Z" fill="#68676C"/>
                <path d="M18,98 Q42,106 60,96" fill="none" stroke="#F09CA3" stroke-width="5"/>
                <path d="M18,102 Q42,110 60,100" fill="none" stroke="#E8C266" stroke-width="2.5"/>
                <polygon points="88,88 81,112 95,112" fill="#F09CA3"/>
                <polygon points="100,88 93,112 107,112" fill="#E5838C"/>
                <circle cx="88" cy="86" r="2.5" fill="#E8C266"/>
                <circle cx="100" cy="86" r="2.5" fill="#E8C266"/>
                <path d="M26,56 C52,44 76,54 88,72 C98,84 108,74 104,58 C100,44 88,36 86,26 C84,18 92,16 96,22 C104,34 118,52 114,74 C110,92 90,96 72,88 C58,96 34,96 26,76 Z" fill="#68676C"/>
                <path d="M32,54 C50,42 72,46 82,60 C66,64 46,64 32,54 Z" fill="#6F8769" stroke="#E8C266" stroke-width="1.5"/>
                <path d="M42,48 L54,61 M56,47 L66,60 M68,50 L76,60" stroke="#E8C266" stroke-width="1"/>
                <path d="M96,42 Q104,40 108,44 M98,54 Q107,52 112,56 M96,66 Q106,66 112,70" fill="none" stroke="#E8C266" stroke-width="1.6"/>
                <path d="M78,80 Q96,86 110,76 Q98,92 76,86 Z" fill="#FFFDF7"/>
                <ellipse cx="66" cy="64" rx="3.5" ry="2.2" fill="#FFF"/>
                <circle cx="66" cy="64" r="1.5" fill="#222"/>
                <line x1="48" y1="168" x2="66" y2="168" stroke="#E8C266" stroke-width="3"/>
              </g>

              <!-- Bottom Geometric Jali Border Strip -->
              <rect x="0" y="196" width="400" height="24" fill="#C7AD7F"/>
              <path d="M0,204 L400,204 M0,214 L400,214" stroke="#8C9AA2" stroke-width="1.5" stroke-dasharray="8 6"/>
            </svg>

            <!-- Gentle Scroll Down Indicator -->
            <div class="absolute bottom-7 left-0 right-0 flex flex-col items-center pointer-events-none anim-scroll-cue">
              <span class="text-[10px] uppercase tracking-[0.22em] text-white/95 bg-[#4A3B36]/45 backdrop-blur-sm px-3 py-0.5 rounded-full">
                {{ lang() === 'en' ? 'Scroll Down ↓' : 'नीचे स्क्रॉल करें ↓' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- =======================================================================
           SCREEN 2: WELCOME TO VIDISHA & KSHITIJ'S WEDDING + COUPLE PHOTO
           (MATCHING SCREENSHOT 2 + PHOTO ARCH FRAME)
           ======================================================================= -->
      <section class="snap-page lattice-gold">
        <div class="jharokha-stage relative bg-[#FFFDF7] pt-8 pb-0 px-5 flex flex-col items-center justify-between">
          <!-- Botanical Corners -->
          <svg class="absolute top-0 left-0 w-full h-56 pointer-events-none z-10" viewBox="0 0 400 220">
            <g transform="translate(8, 6)">
              <path d="M0,90 Q35,45 85,8" stroke="#6E8475" stroke-width="1.6" fill="none"/>
              <ellipse cx="28" cy="52" rx="11" ry="5" transform="rotate(-35 28 52)" fill="#7F9686"/>
              <ellipse cx="52" cy="30" rx="10" ry="5" transform="rotate(-30 52 30)" fill="#95AC9C"/>
              <path d="M0,125 C28,112 42,132 32,156 C18,150 6,138 0,125 Z" fill="#C9D9D0" opacity="0.85"/>
            </g>
            <g transform="translate(310, 6)">
              <path d="M82,90 Q48,45 0,8" stroke="#6E8475" stroke-width="1.6" fill="none"/>
              <ellipse cx="52" cy="52" rx="11" ry="5" transform="rotate(35 52 52)" fill="#7F9686"/>
              <ellipse cx="28" cy="30" rx="10" ry="5" transform="rotate(30 28 30)" fill="#95AC9C"/>
              <path d="M82,125 C54,112 40,132 50,156 C64,150 76,138 82,125 Z" fill="#C9D9D0" opacity="0.85"/>
            </g>
          </svg>

          <!-- Main Invitation Heading & Swashed Names -->
          <div class="relative z-20 flex flex-col items-center text-center mt-2 w-full">
            <p class="script-italic text-base sm:text-lg text-[#66999B] mb-1">
              {{ lang() === 'en' ? 'With the blessings of our families' : 'परिवार के आशीर्वाद एवं स्नेह के साथ' }}
            </p>

            @if (lang() === 'en') {
              <p class="tracked-caps text-[11px] text-[#D96B70] leading-relaxed">
                WELCOME TO THE WEDDING OF
              </p>

              <!-- VIDISHA & KSHITIJ with Decorative Calligraphic Swashes (Screenshot 2 style) -->
              <div class="relative my-1.5 flex flex-col items-center">
                <h1 class="swash-heading text-3xl sm:text-4xl text-[#6A8374] tracking-wider">
                  VIDISHA
                </h1>
                <svg class="w-40 h-3.5 -mt-1 text-[#6A8374]" viewBox="0 0 180 18" fill="none">
                  <path d="M8,6 C32,18 115,16 148,4 C160,0 142,-2 136,6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>

                <span class="script-italic text-2xl sm:text-3xl text-[#D96B70] -my-1">&amp;</span>

                <svg class="w-40 h-3.5 -mb-1 text-[#6A8374]" viewBox="0 0 180 18" fill="none">
                  <path d="M42,14 C65,2 145,2 172,12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                <h1 class="swash-heading text-3xl sm:text-4xl text-[#6A8374] tracking-wider">
                  KSHITIJ
                </h1>
              </div>
            } @else {
              <p class="hindi-body text-xs text-[#D96B70] font-medium">
                हमारे शुभ विवाह उत्सव में आपका हार्दिक स्वागत है
              </p>
              <!-- Hindi Names with generous line-height & padding so क्षितिज's ि matra never clips -->
              <div class="my-1 flex flex-col items-center">
                <h1 class="hindi-heading text-3xl sm:text-4xl text-[#6A8374]">
                  विदिशा
                </h1>
                <span class="text-xl text-[#D96B70] font-serif my-0.5">और</span>
                <h1 class="hindi-heading text-3xl sm:text-4xl text-[#6A8374]">
                  क्षितिज
                </h1>
              </div>
            }

            <!-- COUPLE PHOTO ARCH FRAME (Supports distinct photo for Full-Day vs Reception + Instant Upload) -->
            <div class="relative mt-1 mb-1 group">
              <div class="w-44 h-52 sm:w-48 sm:h-56 rounded-t-full rounded-b-2xl p-1.5 bg-gradient-to-b from-[#DFC394] via-[#EBD6B3] to-[#C9A874] shadow-md relative overflow-hidden">
                <div class="w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-[#FAF2E6] relative flex items-center justify-center">
                  @if (activeCouplePhoto()) {
                    <img
                      [src]="activeCouplePhoto()"
                      alt="Vidisha & Kshitij"
                      class="w-full h-full object-cover"
                    />
                  } @else {
                    <!-- Artistic Illustrated Couple Placeholder (Changes between Full Day & Reception Mode) -->
                    @if (inviteMode() === 'full') {
                      <svg class="w-full h-full" viewBox="0 0 200 240">
                        <defs>
                          <linearGradient id="coupleBgFull" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#FCE8E6"/>
                            <stop offset="100%" stop-color="#F5D0C8"/>
                          </linearGradient>
                        </defs>
                        <rect width="200" height="240" fill="url(#coupleBgFull)"/>
                        <circle cx="100" cy="75" r="48" fill="#FFFDF7" opacity="0.55"/>
                        <!-- Groom & Bride Minimal Royal Portrait -->
                        <!-- Groom -->
                        <path d="M52,240 L56,148 C56,134 70,126 86,126 C102,126 112,134 114,148 L118,240 Z" fill="#E8D5B7" stroke="#C8A978" stroke-width="1.5"/>
                        <path d="M68,128 L86,162 L102,128" fill="none" stroke="#D96B70" stroke-width="3"/>
                        <circle cx="85" cy="96" r="20" fill="#F2C6A0"/>
                        <!-- Groom Safa / Turban -->
                        <path d="M63,92 C62,72 82,64 102,72 C108,76 108,86 104,92 C92,84 74,84 63,92 Z" fill="#F09CA3"/>
                        <circle cx="96" cy="76" r="4" fill="#E8C266"/>
                        <!-- Bride -->
                        <path d="M92,240 L98,154 C100,140 112,134 126,134 C140,134 152,140 154,154 L160,240 Z" fill="#D96B70"/>
                        <!-- Bride Dupatta Veil -->
                        <path d="M104,90 C114,76 140,78 148,96 C156,118 158,165 156,220" fill="none" stroke="#E8C266" stroke-width="3" stroke-dasharray="4 2"/>
                        <circle cx="125" cy="106" r="18" fill="#F4CBA8"/>
                        <path d="M108,100 C116,86 136,86 142,100" fill="#3A2723"/>
                        <circle cx="125" cy="94" r="3" fill="#E8C266"/>
                        <text x="100" y="226" text-anchor="middle" font-size="9" fill="#7A4B3A" letter-spacing="1.5">FULL-DAY PHOTO SLOT</text>
                      </svg>
                    } @else {
                      <svg class="w-full h-full" viewBox="0 0 200 240">
                        <defs>
                          <linearGradient id="coupleBgRec" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#E2E9F3"/>
                            <stop offset="100%" stop-color="#CBD7E8"/>
                          </linearGradient>
                        </defs>
                        <rect width="200" height="240" fill="url(#coupleBgRec)"/>
                        <circle cx="45" cy="45" r="2" fill="#FFF"/>
                        <circle cx="155" cy="60" r="2.5" fill="#FFF"/>
                        <circle cx="100" cy="75" r="48" fill="#FFFDF7" opacity="0.45"/>
                        <!-- Reception Tuxedo / Sherwani & Evening Gown/Lehenga Portrait -->
                        <path d="M52,240 L58,146 C60,132 72,126 86,126 C100,126 112,132 114,146 L118,240 Z" fill="#2C3E50"/>
                        <polygon points="78,126 86,152 94,126" fill="#FFF"/>
                        <circle cx="86" cy="96" r="19" fill="#F2C6A0"/>
                        <path d="M68,88 C74,74 96,74 104,88" fill="#2A1E1B"/>
                        <!-- Bride Reception Look -->
                        <path d="M94,240 L100,152 C102,138 114,132 128,132 C142,132 152,138 156,152 L162,240 Z" fill="#C97A86"/>
                        <circle cx="126" cy="104" r="18" fill="#F4CBA8"/>
                        <path d="M109,98 C116,84 136,84 143,98" fill="#2A1E1B"/>
                        <text x="100" y="226" text-anchor="middle" font-size="9" fill="#34495E" letter-spacing="1.5">RECEPTION PHOTO SLOT</text>
                      </svg>
                    }
                  }

                  <!-- Upload / Change Photo Overlay Pill -->
                  <label class="absolute bottom-2 left-1/2 -translate-x-1/2 cursor-pointer bg-[#FFFDF7]/90 hover:bg-white text-[#5E4B42] border border-[#D5B88B] px-3 py-1 rounded-full text-[10px] font-sans font-medium shadow-sm whitespace-nowrap transition-all">
                    <span>{{ lang() === 'en' ? '📷 Upload Couple Photo' : '📷 अपनी फ़ोटो लगाएं' }}</span>
                    <input type="file" accept="image/*" class="hidden" (change)="onPhotoSelected($event)" />
                  </label>
                </div>
              </div>
            </div>

            <p class="tracked-caps text-[10px] text-[#D96B70] mt-1">
              {{ lang() === 'en'
                ? 'BY BLESSING THEM A LIFETIME OF HAPPINESS'
                : 'उन्हें जीवन भर की खुशियों का आशीर्वाद दें' }}
            </p>
          </div>

          <!-- Bottom Lotus Pond & Elephants Continuation -->
          <div class="relative w-full h-36 z-10 mt-auto">
            <svg class="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              <rect x="0" y="45" width="400" height="105" fill="#8BB8BE" opacity="0.75"/>
              <g class="anim-lotus" transform="translate(195, 102) scale(0.85)">
                <ellipse cx="0" cy="8" rx="30" ry="10" fill="#7D9C82"/>
                <path d="M-20,4 Q0,-16 20,4 Z" fill="#E67A83"/>
                <path d="M-12,5 Q0,-20 12,5 Z" fill="#F29CA3"/>
              </g>
              <!-- Left Elephant Silhouette -->
              <g transform="translate(6, 5) scale(0.75)">
                <path d="M6,95 Q38,88 55,115 L68,176 L48,176 L40,138 L22,138 L18,176 L2,176 Z" fill="#68676C"/>
                <path d="M26,56 C52,44 76,54 88,72 C98,84 108,74 104,58 C100,44 88,36 86,26 C84,18 92,16 96,22 C104,34 118,52 114,74 C110,92 90,96 72,88 C58,96 34,96 26,76 Z" fill="#68676C"/>
                <path d="M32,54 C50,42 72,46 82,60 C66,64 46,64 32,54 Z" fill="#6F8769" stroke="#E8C266" stroke-width="1.5"/>
                <path d="M78,80 Q96,86 110,76 Q98,92 76,86 Z" fill="#FFFDF7"/>
              </g>
              <!-- Right Elephant Silhouette -->
              <g transform="translate(394, 5) scale(-0.75, 0.75)">
                <path d="M6,95 Q38,88 55,115 L68,176 L48,176 L40,138 L22,138 L18,176 L2,176 Z" fill="#68676C"/>
                <path d="M26,56 C52,44 76,54 88,72 C98,84 108,74 104,58 C100,44 88,36 86,26 C84,18 92,16 96,22 C104,34 118,52 114,74 C110,92 90,96 72,88 C58,96 34,96 26,76 Z" fill="#68676C"/>
                <path d="M32,54 C50,42 72,46 82,60 C66,64 46,64 32,54 Z" fill="#6F8769" stroke="#E8C266" stroke-width="1.5"/>
                <path d="M78,80 Q96,86 110,76 Q98,92 76,86 Z" fill="#FFFDF7"/>
              </g>
            </svg>
            <div class="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none anim-scroll-cue">
              <span class="text-[10px] uppercase tracking-[0.22em] text-white bg-[#4A3B36]/45 px-3 py-0.5 rounded-full">
                {{ lang() === 'en' ? 'Scroll for Celebrations ↓' : 'समारोह देखने के लिए स्क्रॉल करें ↓' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- =======================================================================
           SCREENS 3 TO 8: INDIVIDUAL FULL-SCREEN EVENT PAGES (20TH JAN ONLY)
           ======================================================================= -->
      @for (ev of visibleEvents(); track ev.id) {
        <section
          class="snap-page"
          [class.lattice-rose]="ev.latticeTheme === 'rose'"
          [class.lattice-sage]="ev.latticeTheme === 'sage'"
          [class.lattice-blush]="ev.latticeTheme === 'blush'"
          [class.lattice-marigold]="ev.latticeTheme === 'marigold'"
          [class.lattice-lavender]="ev.latticeTheme === 'lavender'">

          <div class="jharokha-stage relative bg-[#FFFDF7] flex flex-col items-center justify-between">
            <!-- Scalloped Mughal Jharokha Arch Cutout Surround -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 760" preserveAspectRatio="none">
              <path
                d="M0,0 L400,0 L400,760 L0,760 Z M 24,724 L 376,724 L 376,168 C 376,128 350,110 332,88 C 314,66 298,44 266,38 C 236,32 216,20 200,10 C 184,20 164,32 134,38 C 102,44 86,66 68,88 C 50,110 24,128 24,168 Z"
                [attr.fill]="getArchOuterFill(ev.latticeTheme)"
                fill-rule="evenodd"
                opacity="0.82"
              />
              <path
                d="M 24,724 L 24,168 C 24,128 50,110 68,88 C 86,66 102,44 134,38 C 164,32 184,20 200,10 C 216,20 236,32 266,38 C 298,44 314,66 332,88 C 350,110 376,128 376,168 L 376,724"
                fill="none"
                [attr.stroke]="getArchBorderStroke(ev.latticeTheme)"
                stroke-width="2.5"
              />
            </svg>

            <!-- ==================== EVENT-SPECIFIC TOP ARTWORK ==================== -->
            <div class="relative w-full h-44 z-20 pointer-events-none">
              @switch (ev.id) {
                <!-- KUMKUM TOP ART: Marigold & Rose Toran Garland -->
                @case ('kumkum') {
                  <svg class="w-full h-full" viewBox="0 0 400 175">
                    <path d="M25,25 Q110,95 200,35 Q290,95 375,25" fill="none" stroke="#8C9E8E" stroke-width="2"/>
                    <!-- Hanging Marigold & Rose Strings -->
                    @for (x of [55, 105, 155, 200, 245, 295, 345]; track x) {
                      <g class="anim-sway" [attr.transform]="'translate(' + x + ', 18)'">
                        <line x1="0" y1="0" x2="0" y2="58" stroke="#C9A874" stroke-width="1.2"/>
                        <circle cx="0" cy="18" r="8" fill="#F29F38"/>
                        <circle cx="0" cy="36" r="7" fill="#E87461"/>
                        <circle cx="0" cy="54" r="9" fill="#D9534F"/>
                        <circle cx="0" cy="54" r="4" fill="#F7D070"/>
                      </g>
                    }
                  </svg>
                }

                <!-- HALDI TOP ART: Lush Yellow/Orange Marigold Foliage (Exact Match to Screenshot 3) -->
                @case ('haldi') {
                  <svg class="w-full h-full" viewBox="0 0 400 175">
                    <!-- Dense Sage Leaves & Branches -->
                    <path d="M5,5 Q70,55 120,115 M35,0 Q95,45 165,65 M395,5 Q330,55 280,115 M365,0 Q305,45 235,65" stroke="#6E8475" stroke-width="1.8" fill="none"/>
                    @for (leaf of [
                      {x: 35, y: 35, r: -25}, {x: 60, y: 55, r: 15}, {x: 88, y: 78, r: -20},
                      {x: 365, y: 35, r: 25}, {x: 340, y: 55, r: -15}, {x: 312, y: 78, r: 20}
                    ]; track leaf.x) {
                      <ellipse [attr.cx]="leaf.x" [attr.cy]="leaf.y" rx="11" ry="5" [attr.transform]="'rotate(' + leaf.r + ' ' + leaf.x + ' ' + leaf.y + ')'" fill="#7D9383"/>
                    }
                    <!-- Cascading Ruffled Marigold Blooms (Screenshot 3) -->
                    @for (mg of [
                      {x: 72, y: 92, s: 1.15}, {x: 132, y: 26, s: 0.95}, {x: 174, y: 42, s: 1.05},
                      {x: 232, y: 32, s: 1.1}, {x: 295, y: 52, s: 1.05}, {x: 322, y: 102, s: 1.0},
                      {x: 22, y: 112, s: 0.9}, {x: 376, y: 95, s: 0.9}
                    ]; track mg.x) {
                      <g class="anim-float" [attr.transform]="'translate(' + mg.x + ',' + mg.y + ') scale(' + mg.s + ')'">
                        <circle cx="0" cy="0" r="16" fill="#F28C28"/>
                        <circle cx="-5" cy="-4" r="10" fill="#FAA938"/>
                        <circle cx="5" cy="-4" r="10" fill="#FAA938"/>
                        <circle cx="0" cy="5" r="10" fill="#F69B30"/>
                        <circle cx="0" cy="0" r="6" fill="#FCD15A"/>
                      </g>
                    }
                  </svg>
                }

                <!-- PHERAS & VARMALA TOP ART: Crisscrossing Fairy String Lights & Ganesh (Exact Match to Screenshot 5 & 6) -->
                @case ('pheras') {
                  <svg class="w-full h-full" viewBox="0 0 400 175">
                    <!-- Crisscross Fairy Wires -->
                    <path d="M35,88 Q200,128 365,88" fill="none" stroke="#9B8E8E" stroke-width="1.5"/>
                    <path d="M55,105 Q200,82 345,105" fill="none" stroke="#9B8E8E" stroke-width="1.5"/>
                    <path d="M120,38 Q200,115 280,38" fill="none" stroke="#9B8E8E" stroke-width="1.5"/>
                    <!-- Glowing Warm Fairy Bulbs -->
                    @for (bulb of [
                      {x: 68, y: 98}, {x: 105, y: 104}, {x: 145, y: 108}, {x: 185, y: 110},
                      {x: 220, y: 110}, {x: 258, y: 107}, {x: 298, y: 102}, {x: 332, y: 96},
                      {x: 135, y: 55}, {x: 162, y: 74}, {x: 238, y: 74}, {x: 265, y: 55}
                    ]; track bulb.x) {
                      <g class="anim-bulb">
                        <circle [attr.cx]="bulb.x" [attr.cy]="bulb.y + 6" r="7" fill="#FAD678" opacity="0.45"/>
                        <circle [attr.cx]="bulb.x" [attr.cy]="bulb.y + 6" r="4.5" fill="#F6B94D"/>
                      </g>
                    }
                    <!-- Left Pink Hibiscus & Sage Sprigs -->
                    <g transform="translate(26, 86)">
                      <ellipse cx="0" cy="-12" rx="6" ry="14" fill="#E67A83"/>
                      <ellipse cx="11" cy="-4" rx="6" ry="14" transform="rotate(55)" fill="#F09CA3"/>
                      <ellipse cx="-10" cy="-4" rx="6" ry="14" transform="rotate(-55)" fill="#F09CA3"/>
                      <circle cx="0" cy="0" r="3.5" fill="#F5CE62"/>
                    </g>
                    <!-- Gold Ganesh Icon Under Lights -->
                    <g transform="translate(184, 126)" fill="#DFB87B">
                      <path d="M16 2c-3 4-5 7-5 11 0 3 2 5 5 5s5-2 5-5c0-4-2-7-5-11zm-8 17c-4 0-7 3-7 7 0 4 4 7 8 7h3c1 4 4 7 8 7 3 0 5-1 6-4-3 0-5-2-5-5 0-2 1-4 4-5 3-1 5-3 5-6 0-4-3-7-7-7-2 0-4 1-6 3-2-2-4-3-6-3h-3z"/>
                    </g>
                  </svg>
                }

                <!-- BAARAT TOP ART: Festive Toran, Marigolds & Royal Brass Trumpets -->
                @case ('baarat') {
                  <svg class="w-full h-full" viewBox="0 0 400 175">
                    <path d="M20,35 Q200,105 380,35" fill="none" stroke="#D99B26" stroke-width="2" stroke-dasharray="5 3"/>
                    @for (b of [65, 130, 200, 270, 335]; track b) {
                      <g class="anim-sway" [attr.transform]="'translate(' + b + ', 45)'">
                        <circle cx="0" cy="14" r="10" fill="#F28C28"/>
                        <circle cx="0" cy="14" r="5" fill="#FCD15A"/>
                        <polygon points="-6,24 6,24 0,42" fill="#D96B70"/>
                      </g>
                    }
                  </svg>
                }

                <!-- VARMALA TOP ART: Fairy Lights & Swaying Rose/Mogra Jaimala Garlands -->
                @case ('varmala') {
                  <svg class="w-full h-full" viewBox="0 0 400 175">
                    <path d="M35,80 Q200,120 365,80" fill="none" stroke="#9B8E8E" stroke-width="1.5"/>
                    @for (bulb of [75, 125, 175, 225, 275, 325]; track bulb) {
                      <circle class="anim-bulb" [attr.cx]="bulb" cy="96" r="5" fill="#F6B94D"/>
                    }
                    <!-- Two Intertwined Floral Varmala Garlands -->
                    <g class="anim-sway" transform="translate(155, 55)">
                      <path d="M0,0 C-10,55 45,75 45,0" fill="none" stroke="#FFFDF7" stroke-width="9"/>
                      <path d="M0,0 C-10,55 45,75 45,0" fill="none" stroke="#D96B70" stroke-width="7" stroke-dasharray="6 5"/>
                    </g>
                    <g class="anim-sway" transform="translate(195, 55)">
                      <path d="M0,0 C-10,55 45,75 45,0" fill="none" stroke="#FFFDF7" stroke-width="9"/>
                      <path d="M0,0 C-10,55 45,75 45,0" fill="none" stroke="#E88388" stroke-width="7" stroke-dasharray="6 5"/>
                    </g>
                  </svg>
                }

                <!-- RECEPTION TOP ART: Bunting Flags & Glowing Hanging Gold Lanterns (Exact Match to Screenshot 4) -->
                @case ('reception') {
                  <svg class="w-full h-full" viewBox="0 0 400 185">
                    <!-- Crisscrossing Dark Navy Pennant Bunting Flags -->
                    <path d="M10,45 Q140,22 270,2 M60,2 Q220,38 390,62 M15,18 Q200,45 385,12" fill="none" stroke="#4D5D75" stroke-width="1.5"/>
                    @for (flagX of [25, 45, 65, 85, 105, 125, 145, 165, 185, 205, 225, 245, 265, 285, 305, 325, 345, 365]; track flagX) {
                      <polygon [attr.points]="flagX + ',26 ' + (flagX + 8) + ',26 ' + (flagX + 4) + ',38'" fill="#4D5D75" opacity="0.85"/>
                    }

                    <!-- Left Low Hanging Moroccan Gold Lantern -->
                    <g class="anim-sway" transform="translate(52, 0)">
                      <line x1="18" y1="0" x2="18" y2="76" stroke="#A67C38" stroke-width="1.4"/>
                      <path d="M8,76 Q18,64 28,76 L32,84 L4,84 Z" fill="#B58942"/>
                      <rect x="4" y="84" width="28" height="36" rx="4" fill="#FCE86B" stroke="#B58942" stroke-width="2"/>
                      <line x1="12" y1="84" x2="12" y2="120" stroke="#B58942" stroke-width="1.8"/>
                      <line x1="24" y1="84" x2="24" y2="120" stroke="#B58942" stroke-width="1.8"/>
                      <path d="M4,120 L32,120 L22,134 L18,140 L14,134 Z" fill="#B58942"/>
                    </g>

                    <!-- Second Higher Hanging Gold Lantern -->
                    <g class="anim-sway" transform="translate(96, 0)">
                      <line x1="18" y1="0" x2="18" y2="48" stroke="#A67C38" stroke-width="1.4"/>
                      <path d="M8,48 Q18,36 28,48 L32,56 L4,56 Z" fill="#B58942"/>
                      <rect x="4" y="56" width="28" height="36" rx="4" fill="#FCE86B" stroke="#B58942" stroke-width="2"/>
                      <line x1="12" y1="56" x2="12" y2="92" stroke="#B58942" stroke-width="1.8"/>
                      <line x1="24" y1="56" x2="24" y2="92" stroke="#B58942" stroke-width="1.8"/>
                      <path d="M4,92 L32,92 L22,106 L18,112 L14,106 Z" fill="#B58942"/>
                    </g>

                    <!-- Right Low Hanging Gold Lantern -->
                    <g class="anim-sway" transform="translate(318, 0)">
                      <line x1="18" y1="0" x2="18" y2="88" stroke="#A67C38" stroke-width="1.4"/>
                      <path d="M8,88 Q18,76 28,88 L32,96 L4,96 Z" fill="#B58942"/>
                      <rect x="4" y="96" width="28" height="36" rx="4" fill="#FCE86B" stroke="#B58942" stroke-width="2"/>
                      <line x1="12" y1="96" x2="12" y2="132" stroke="#B58942" stroke-width="1.8"/>
                      <line x1="24" y1="96" x2="24" y2="132" stroke="#B58942" stroke-width="1.8"/>
                      <path d="M4,132 L32,132 L22,146 L18,152 L14,146 Z" fill="#B58942"/>
                    </g>
                  </svg>
                }
              }
            </div>

            <!-- ==================== CENTER EVENT TYPOGRAPHY & SWASHES ==================== -->
            <div class="relative z-20 flex flex-col items-center text-center px-7 my-auto">
              <!-- Event Title with Calligraphic Flourishes -->
              @if (lang() === 'en') {
                <div class="relative flex flex-col items-center mb-3">
                  <h2
                    class="swash-heading text-4xl sm:text-[42px] tracking-wider"
                    [style.color]="ev.titleColor">
                    {{ ev.titleEn }}
                  </h2>
                  <!-- Decorative Swash Under Event Title (Matching MEHENDI / HALDI / WEDDING in Screenshots) -->
                  <svg class="w-48 h-5 -mt-1" [style.color]="ev.titleColor" viewBox="0 0 220 24" fill="none">
                    <path
                      d="M12,6 C8,18 48,22 110,12 C165,2 195,20 206,14 C214,10 208,2 200,6"
                      stroke="currentColor"
                      stroke-width="1.4"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>

                <p
                  class="tracked-caps text-[11px] sm:text-xs leading-relaxed max-w-[290px] mb-5"
                  [style.color]="ev.titleColor">
                  {{ ev.taglineEn }}
                </p>

                <div class="w-12 h-[1px] bg-[#D5B88B] mb-4"></div>

                <p class="tracked-caps text-xs sm:text-sm font-semibold text-[#5E4B42] mb-1.5">
                  {{ ev.dateEn }}
                </p>
                <p
                  class="tracked-caps text-sm sm:text-base font-bold mb-1"
                  [style.color]="ev.titleColor">
                  {{ ev.timeEn }}
                </p>
                <p class="tracked-caps text-[11px] text-[#7A6A5E]">
                  {{ ev.venueEn }}
                </p>
              } @else {
                <!-- Hindi Event Title & Details (Matra-Safe) -->
                <div class="relative flex flex-col items-center mb-2">
                  <h2
                    class="hindi-heading text-4xl sm:text-[42px]"
                    [style.color]="ev.titleColor">
                    {{ ev.titleHi }}
                  </h2>
                  <svg class="w-44 h-4" [style.color]="ev.titleColor" viewBox="0 0 200 20" fill="none">
                    <path d="M15,8 Q100,20 185,8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </div>

                <p
                  class="hindi-body text-sm sm:text-base max-w-[290px] mb-4 font-medium"
                  [style.color]="ev.titleColor">
                  {{ ev.taglineHi }}
                </p>

                <div class="w-12 h-[1px] bg-[#D5B88B] mb-3"></div>

                <p class="hindi-body text-sm font-semibold text-[#5E4B42] mb-1">
                  {{ ev.dateHi }}
                </p>
                <p
                  class="hindi-body text-base font-bold mb-1"
                  [style.color]="ev.titleColor">
                  {{ ev.timeHi }}
                </p>
                <p class="hindi-body text-xs text-[#7A6A5E]">
                  {{ ev.venueHi }}
                </p>
              }

              <!-- Floating Musical Notes for Reception / Baarat -->
              @if (ev.id === 'reception' || ev.id === 'baarat') {
                <div class="mt-3 flex items-center gap-6 text-[#6E7F91] opacity-75">
                  <span class="text-xl anim-float">♪</span>
                  <span class="script-italic text-base text-[#6A8374]">
                    {{ lang() === 'en' ? 'Vidisha & Kshitij' : 'विदिशा और क्षितिज' }}
                  </span>
                  <span class="text-xl anim-float">♫</span>
                </div>
              }
            </div>

            <!-- ==================== EVENT-SPECIFIC SPLASHY BOTTOM ARTWORK ==================== -->
            <div class="relative w-full h-48 z-20 mt-auto pointer-events-none">
              @switch (ev.id) {
                <!-- KUMKUM BOTTOM ART: Ornate Brass Thali with Sindoor, Diya, Kalash & Rose Petals -->
                @case ('kumkum') {
                  <svg class="w-full h-full" viewBox="0 0 400 190">
                    <!-- Soft Rose Glow Floor -->
                    <ellipse cx="200" cy="155" rx="150" ry="24" fill="#F2D2D4" opacity="0.6"/>
                    <!-- Brass Kumkum Thali -->
                    <ellipse cx="200" cy="148" rx="95" ry="22" fill="#D9A74A" stroke="#A67623" stroke-width="2"/>
                    <ellipse cx="200" cy="146" rx="82" ry="16" fill="#ECC36F"/>
                    <!-- Red Kumkum Mound Bowl -->
                    <path d="M148,142 Q165,112 182,142 Z" fill="#C9302C"/>
                    <path d="M144,142 Q165,152 186,142 Z" fill="#A67623"/>
                    <!-- Glowing Brass Diya with Flame -->
                    <g transform="translate(215, 128)">
                      <path d="M0,12 Q16,26 32,12 Z" fill="#B58025"/>
                      <path class="anim-bulb" d="M28,12 C32,2 36,2 34,12 C32,15 28,14 28,12 Z" fill="#FF9800"/>
                      <circle class="anim-bulb" cx="31" cy="7" r="3" fill="#FFF176"/>
                    </g>
                    <!-- Auspicious Kalash with Coconut & Mango Leaves -->
                    <g transform="translate(75, 82)">
                      <ellipse cx="25" cy="58" rx="22" ry="24" fill="#D99B26" stroke="#A67623" stroke-width="1.5"/>
                      <path d="M10,36 L40,36 L34,44 L16,44 Z" fill="#ECC36F"/>
                      <!-- Mango Leaves -->
                      <path d="M25,36 Q8,22 4,34 Q14,40 25,36 Z" fill="#5F7A6E"/>
                      <path d="M25,36 Q42,22 46,34 Q36,40 25,36 Z" fill="#5F7A6E"/>
                      <!-- Coconut -->
                      <ellipse cx="25" cy="24" rx="11" ry="13" fill="#8C5A3C"/>
                      <path d="M15,52 L35,52 M25,42 L25,62" stroke="#C9302C" stroke-width="1.5"/>
                    </g>
                    <!-- Scattered Rose Petals -->
                    <ellipse cx="310" cy="150" rx="8" ry="4" transform="rotate(-15 310 150)" fill="#D96B70"/>
                    <ellipse cx="330" cy="160" rx="7" ry="4" transform="rotate(20 330 160)" fill="#E67A83"/>
                    <ellipse cx="95" cy="162" rx="8" ry="4" transform="rotate(12 95 162)" fill="#D96B70"/>
                  </svg>
                }

                <!-- HALDI BOTTOM ART: Wooden Dhol Drum, Golden Haldi Bowl, Lily Pads & Marigolds (Exact Match to Screenshot 3) -->
                @case ('haldi') {
                  <svg class="w-full h-full" viewBox="0 0 400 190">
                    <!-- Sage Green Pond Base -->
                    <rect x="0" y="132" width="400" height="58" fill="#8CA696" opacity="0.55"/>
                    <!-- Floating Green Lily Pads -->
                    <ellipse cx="215" cy="144" rx="36" ry="10" fill="#6F8A78"/>
                    <ellipse cx="275" cy="158" rx="26" ry="7" fill="#5D7866"/>
                    <ellipse cx="145" cy="168" rx="28" ry="8" fill="#6F8A78"/>

                    <!-- Left Marigold & Sage Leaf Cluster behind Dhol -->
                    <path d="M22,125 C20,90 48,72 60,52 C64,82 52,110 22,125 Z" fill="#AEC4B6"/>
                    <g transform="translate(56, 112)">
                      <circle cx="0" cy="0" r="18" fill="#F29F38"/>
                      <circle cx="22" cy="6" r="16" fill="#FAA938"/>
                      <circle cx="10" cy="-6" r="12" fill="#FCD15A"/>
                    </g>

                    <!-- Traditional Wooden Dhol Drum with Rope Lacing & Coloured Tassels -->
                    <g transform="translate(8, 114)">
                      <rect x="0" y="0" width="108" height="68" rx="8" fill="#B58E6B" stroke="#8C6747" stroke-width="2"/>
                      <rect x="102" y="-2" width="8" height="72" rx="3" fill="#DDD5C7" stroke="#8C6747" stroke-width="1.5"/>
                      <!-- Horizontal Wood Stripes -->
                      <line x1="0" y1="22" x2="102" y2="22" stroke="#7A5638" stroke-width="2.5"/>
                      <line x1="0" y1="46" x2="102" y2="46" stroke="#7A5638" stroke-width="2.5"/>
                      <!-- Zigzag Rope Tension Lacing -->
                      <path d="M0,6 L65,22 L0,38 L65,52 L0,64" fill="none" stroke="#EDE4D3" stroke-width="2"/>
                      <!-- Pink, Blue & Yellow Dhol Tassels -->
                      <polygon points="65,22 86,16 86,26" fill="#D96B70"/>
                      <polygon points="65,38 86,34 86,44" fill="#5B82A6"/>
                      <polygon points="65,54 86,50 86,60" fill="#D9B63B"/>
                    </g>

                    <!-- Golden Mound of Haldi Paste in Urli Bowl -->
                    <g transform="translate(116, 122)">
                      <!-- Yellow Haldi Cone -->
                      <path d="M4,34 C12,18 20,2 26,2 C32,2 40,18 48,34 Z" fill="#E5C538"/>
                      <path d="M12,34 C18,20 22,8 26,8 C30,8 34,20 40,34 Z" fill="#F2D64B"/>
                      <!-- Terracotta/Brass Bowl -->
                      <path d="M0,34 Q26,56 52,34 Z" fill="#C88A3B" stroke="#9E6722" stroke-width="1.5"/>
                    </g>

                    <!-- Right Corner Marigolds & Sage Leaf -->
                    <g transform="translate(345, 78)">
                      <path d="M55,35 C30,22 10,8 2,-10 C8,22 25,42 55,35 Z" fill="#AEC4B6"/>
                      <circle cx="22" cy="48" r="18" fill="#F29F38"/>
                      <circle cx="38" cy="64" r="15" fill="#FAA938"/>
                    </g>
                  </svg>
                }

                <!-- PHERAS & VARMALA BOTTOM ART: Rajasthani Sandstone Palace Domes (Chhatris), Birds & Royal Peacock (Exact Match to Screenshot 5 & 6) -->
                @case ('pheras') {
                  <svg class="w-full h-full" viewBox="0 0 400 195">
                    <!-- Distant Flying Birds -->
                    <path d="M135,58 Q140,52 145,58 Q150,52 155,58" fill="none" stroke="#6E5A4F" stroke-width="1.5"/>
                    <path d="M242,68 Q247,62 252,68 Q257,62 262,68" fill="none" stroke="#6E5A4F" stroke-width="1.4"/>
                    <path d="M275,32 Q282,24 289,32 Q296,24 303,32" fill="none" stroke="#6E5A4F" stroke-width="1.6"/>

                    <!-- Left Rajasthani Sandstone Palace Fort & Chhatri Domes -->
                    <g transform="translate(0, 18)">
                      <!-- Dome Spire -->
                      <path d="M35,38 C35,18 52,18 52,38 Z" fill="#E8CFA6"/>
                      <polygon points="41,18 46,18 43.5,6" fill="#C9644A"/>
                      <rect x="30" y="38" width="27" height="18" fill="#C9A978"/>
                      <!-- Main Fort Facade -->
                      <rect x="0" y="56" width="95" height="105" fill="#C29F6D"/>
                      <path d="M0,56 L95,56" stroke="#C9644A" stroke-width="4" stroke-dasharray="4 2"/>
                      <!-- Arched Jharokha Windows -->
                      <path d="M12,135 L12,92 Q28,76 44,92 L44,135 Z" fill="#8C6D46"/>
                      <path d="M58,135 L58,96 Q72,82 86,96 L86,135 Z" fill="#8C6D46"/>
                    </g>

                    <!-- Right Rajasthani Sandstone Palace Fort & Chhatri Domes -->
                    <g transform="translate(305, 24)">
                      <path d="M38,38 C38,18 55,18 55,38 Z" fill="#E8CFA6"/>
                      <polygon points="44,18 49,18 46.5,6" fill="#C9644A"/>
                      <rect x="33" y="38" width="27" height="18" fill="#C9A978"/>
                      <rect x="0" y="56" width="95" height="100" fill="#C29F6D"/>
                      <path d="M0,56 L95,56" stroke="#C9644A" stroke-width="4" stroke-dasharray="4 2"/>
                      <path d="M14,135 L14,92 Q30,76 46,92 L46,135 Z" fill="#8C6D46"/>
                      <path d="M58,135 L58,92 Q74,76 90,92 L90,135 Z" fill="#8C6D46"/>
                    </g>

                    <!-- Bottom Fort Wall Striping -->
                    <rect x="0" y="172" width="400" height="23" fill="#B59669"/>
                    @for (wallX of [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380]; track wallX) {
                      <line [attr.x1]="wallX" y1="172" [attr.x2]="wallX" y2="195" stroke="#8C6D46" stroke-width="2"/>
                    }

                    <!-- Illustrated Royal Blue & Emerald Peacock (Screenshot 5 & 6) -->
                    <g transform="translate(242, 86)">
                      <!-- Crest & Neck -->
                      <path d="M18,12 C22,12 24,22 22,35 C20,46 34,50 42,60 C34,68 14,64 10,50 C8,40 14,24 16,16 Z" fill="#2A5C8A"/>
                      <circle cx="16" cy="14" r="1.5" fill="#FFF"/>
                      <polygon points="12,14 6,16 12,17" fill="#E8B84B"/>
                      <!-- Wing -->
                      <path d="M18,45 C32,42 48,54 52,70 C36,70 22,60 18,45 Z" fill="#3B7A57"/>
                      <!-- Cascading Peacock Tail Feathers -->
                      <path d="M32,58 C52,65 62,88 56,108 L34,108 C32,88 26,72 32,58 Z" fill="#4F8A5B"/>
                      <circle cx="44" cy="78" r="4" fill="#2A5C8A" stroke="#E8C266" stroke-width="1.5"/>
                      <circle cx="48" cy="94" r="4.5" fill="#2A5C8A" stroke="#E8C266" stroke-width="1.5"/>
                      <circle cx="38" cy="98" r="4" fill="#2A5C8A" stroke="#E8C266" stroke-width="1.5"/>
                    </g>

                    <!-- Bottom Left Pink Lotus & Foliage -->
                    <g transform="translate(132, 160)">
                      <path d="M0,12 Q-18,-18 -35,-28 M0,12 Q0,-22 18,-35" stroke="#6E8475" stroke-width="1.8" fill="none"/>
                      <ellipse cx="-16" cy="0" rx="6" ry="15" transform="rotate(-35 -16 0)" fill="#E67A83"/>
                      <ellipse cx="16" cy="0" rx="6" ry="15" transform="rotate(35 16 0)" fill="#E67A83"/>
                      <ellipse cx="0" cy="-4" rx="6" ry="16" fill="#F09CA3"/>
                      <circle cx="0" cy="4" r="3.5" fill="#F5CE62"/>
                    </g>
                  </svg>
                }

                <!-- BAARAT BOTTOM ART: Royal Decorated White Ghodi (Mare), Festive Umbrella & Dhol -->
                @case ('baarat') {
                  <svg class="w-full h-full" viewBox="0 0 400 190">
                    <rect x="0" y="158" width="400" height="32" fill="#E5CFA9"/>
                    <!-- Royal Festive Chhatri Umbrella -->
                    <g class="anim-sway" transform="translate(235, 32)">
                      <line x1="0" y1="20" x2="-15" y2="128" stroke="#A67623" stroke-width="2.5"/>
                      <path d="M-42,24 Q0,-12 42,24 Z" fill="#D96B70" stroke="#E8C266" stroke-width="2"/>
                      <path d="M-42,24 L42,24" stroke="#E8C266" stroke-width="3" stroke-dasharray="5 3"/>
                    </g>
                    <!-- Decorated White Mare (Ghodi) with Pink & Gold Saddle -->
                    <g transform="translate(125, 65)">
                      <!-- Body & Legs -->
                      <path d="M25,45 Q65,42 88,48 L96,92 L86,92 L80,64 L40,64 L32,92 L22,92 L28,55 Z" fill="#FFFDF7" stroke="#C9B8A2" stroke-width="1.5"/>
                      <!-- Head & Arched Neck -->
                      <path d="M28,52 C18,34 16,16 26,8 C32,4 40,12 36,22 L46,46 Z" fill="#FFFDF7" stroke="#C9B8A2" stroke-width="1.5"/>
                      <!-- Decorative Saddle & Jhool -->
                      <path d="M42,45 L78,45 L74,64 L46,64 Z" fill="#D96B70" stroke="#E8C266" stroke-width="1.5"/>
                      <path d="M24,14 L38,44" stroke="#E8C266" stroke-width="2" stroke-dasharray="3 2"/>
                      <!-- Plume on Horse Head -->
                      <path d="M24,8 Q18,-6 28,-2 Z" fill="#D96B70"/>
                    </g>
                  </svg>
                }

                <!-- VARMALA BOTTOM ART: Palace Domes, Peacock & Floral Archway -->
                @case ('varmala') {
                  <svg class="w-full h-full" viewBox="0 0 400 195">
                    <!-- Left & Right Palace Chhatris -->
                    <g transform="translate(0, 28)">
                      <path d="M35,38 C35,18 52,18 52,38 Z" fill="#E8CFA6"/>
                      <rect x="0" y="56" width="88" height="95" fill="#C29F6D"/>
                      <path d="M16,130 L16,92 Q32,76 48,92 L48,130 Z" fill="#8C6D46"/>
                    </g>
                    <g transform="translate(312, 28)">
                      <path d="M35,38 C35,18 52,18 52,38 Z" fill="#E8CFA6"/>
                      <rect x="0" y="56" width="88" height="95" fill="#C29F6D"/>
                      <path d="M40,130 L40,92 Q56,76 72,92 L72,130 Z" fill="#8C6D46"/>
                    </g>
                    <rect x="0" y="172" width="400" height="23" fill="#B59669"/>
                    <!-- Peacock -->
                    <g transform="translate(245, 92)">
                      <path d="M18,12 C22,12 24,22 22,35 C20,46 34,50 42,60 C34,68 14,64 10,50 C8,40 14,24 16,16 Z" fill="#2A5C8A"/>
                      <path d="M32,58 C52,65 62,88 56,102 L34,102 Z" fill="#4F8A5B"/>
                    </g>
                    <!-- Pink Lotus Foreground -->
                    <g transform="translate(150, 162)">
                      <ellipse cx="-14" cy="0" rx="6" ry="14" transform="rotate(-35 -14 0)" fill="#E67A83"/>
                      <ellipse cx="14" cy="0" rx="6" ry="14" transform="rotate(35 14 0)" fill="#E67A83"/>
                      <ellipse cx="0" cy="-4" rx="6" ry="15" fill="#F09CA3"/>
                    </g>
                  </svg>
                }

                <!-- RECEPTION BOTTOM ART: Checkered Dance Floor, Lush Sage Leaves & Pink Hibiscus (Exact Match to Screenshot 4) -->
                @case ('reception') {
                  <svg class="w-full h-full" viewBox="0 0 400 190">
                    <!-- Soft Slate-Blue Checkered Dance Floor Terrace -->
                    <polygon points="0,128 400,128 400,190 0,190" fill="#9EB0BD"/>
                    <polygon points="85,128 195,128 175,190 45,190" fill="#B0C0CC" opacity="0.6"/>
                    <polygon points="235,128 345,128 365,190 225,190" fill="#B0C0CC" opacity="0.6"/>

                    <!-- Left Lush Watercolor Sage Leaves & Pink Hibiscus -->
                    <g transform="translate(12, 65)">
                      <path d="M15,85 C5,45 35,20 62,5 C68,38 48,68 15,85 Z" fill="#B8C9BE"/>
                      <path d="M35,95 C45,55 82,35 112,28 C105,62 75,88 35,95 Z" fill="#9EB4A5"/>
                      <!-- Large Pink Hibiscus -->
                      <g transform="translate(38, 102)">
                        <ellipse cx="0" cy="-16" rx="8" ry="20" fill="#D96B70"/>
                        <ellipse cx="15" cy="-5" rx="8" ry="20" transform="rotate(55)" fill="#E67A83"/>
                        <ellipse cx="-15" cy="-5" rx="8" ry="20" transform="rotate(-55)" fill="#E67A83"/>
                        <ellipse cx="10" cy="12" rx="8" ry="18" transform="rotate(115)" fill="#C85A60"/>
                        <circle cx="0" cy="0" r="4.5" fill="#F5CE62"/>
                      </g>
                    </g>

                    <!-- Right Pink Hibiscus Cluster -->
                    <g transform="translate(310, 148)">
                      <ellipse cx="0" cy="-16" rx="8" ry="20" fill="#D96B70"/>
                      <ellipse cx="15" cy="-5" rx="8" ry="20" transform="rotate(55)" fill="#E67A83"/>
                      <ellipse cx="-15" cy="-5" rx="8" ry="20" transform="rotate(-55)" fill="#E67A83"/>
                      <circle cx="0" cy="0" r="4.5" fill="#F5CE62"/>
                    </g>
                  </svg>
                }
              }
            </div>
          </div>
        </section>
      }

      <!-- =======================================================================
           SCREEN 9: RSVP STEP 1 — NAME, PHONE & PARTY SIZE (MANDATORY)
           ======================================================================= -->
      <section class="snap-page lattice-blush" [formGroup]="rsvpForm">
        <div class="jharokha-stage relative bg-[#FFFDF7] py-8 px-6 flex flex-col items-center justify-between">
          <!-- Scalloped Arch Outline -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 760" preserveAspectRatio="none">
            <path
              d="M 22,736 L 22,165 C 22,125 48,108 65,86 C 82,64 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,64 335,86 C 352,108 378,125 378,165 L 378,736 Z"
              fill="none"
              stroke="#E6B8BC"
              stroke-width="2"
            />
          </svg>

          <!-- Top Step Pill -->
          <div class="relative z-10 flex flex-col items-center mt-6 text-center">
            <span class="px-3 py-0.5 rounded-full bg-[#F7E4E6] text-[#C85A60] text-[10px] font-sans uppercase tracking-[0.2em] font-semibold">
              {{ lang() === 'en' ? 'RSVP • Step 1' : 'आरएसवीपी • पहला चरण' }}
            </span>
            <h2 class="swash-heading text-2xl sm:text-3xl text-[#D96B70] mt-2" [class.hindi-heading]="lang() === 'hi'">
              {{ lang() === 'en' ? 'THE GUEST OF HONOUR' : 'आपका शुभ नाम और नंबर' }}
            </h2>
            <p class="script-italic text-base text-[#6E5A4F] mt-1 max-w-[280px]" [class.hindi-body]="lang() === 'hi'">
              {{ lang() === 'en'
                ? 'Every legendary wedding guest has a name. Who should we look out for at the entrance?'
                : 'हर ख़ास मेहमान की एक पहचान होती है—स्वागत द्वार पर हम किनका इंतज़ार करें?' }}
            </p>
          </div>

          <!-- Form Inputs -->
          <div class="relative z-10 w-full max-w-[310px] flex flex-col gap-4 my-auto">
            <div>
              <label class="block text-xs uppercase tracking-[0.16em] text-[#7A5C58] mb-1.5 font-semibold" [class.hindi-body]="lang() === 'hi'">
                {{ lang() === 'en' ? 'Your Full Name *' : 'आपका पूरा नाम *' }}
              </label>
              <input
                type="text"
                formControlName="name"
                class="royal-input"
                [placeholder]="lang() === 'en' ? 'e.g. Aditi Sharma' : 'उदा. अदिति शर्मा'"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-[0.16em] text-[#7A5C58] mb-1.5 font-semibold" [class.hindi-body]="lang() === 'hi'">
                {{ lang() === 'en' ? 'WhatsApp / Phone Number *' : 'फ़ोन / व्हाट्सएप नंबर (10 अंक) *' }}
              </label>
              <div class="flex items-center gap-2">
                <span class="px-3 py-2.5 rounded-xl bg-[#F4EBE1] border border-[#D7C2A8] text-sm font-sans text-[#5E4B42] font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxlength="10"
                  formControlName="phone"
                  class="royal-input font-sans"
                  placeholder="9876543210"
                />
              </div>
              @if (rsvpForm.get('phone')?.touched && rsvpForm.get('phone')?.invalid) {
                <p class="text-[11px] text-[#C9302C] mt-1 font-sans">
                  {{ lang() === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।' }}
                </p>
              }
            </div>

            <!-- Party Size Counter -->
            <div>
              <label class="block text-xs uppercase tracking-[0.16em] text-[#7A5C58] mb-1.5 font-semibold" [class.hindi-body]="lang() === 'hi'">
                {{ lang() === 'en' ? 'Number of Guests (Including You)' : 'कुल मेहमानों की संख्या (आपके सहित)' }}
              </label>
              <div class="flex items-center justify-between bg-[#FAF4EC] border border-[#D7C2A8] rounded-xl px-4 py-2">
                <button
                  type="button"
                  (click)="adjustPartySize(-1)"
                  class="w-8 h-8 rounded-full bg-white border border-[#D7C2A8] text-[#D96B70] font-bold text-lg flex items-center justify-center hover:bg-[#D96B70] hover:text-white transition-colors">
                  −
                </button>
                <span class="text-xl font-bold text-[#4A3B36] font-sans">
                  {{ rsvpForm.get('partySize')?.value }}
                </span>
                <button
                  type="button"
                  (click)="adjustPartySize(1)"
                  class="w-8 h-8 rounded-full bg-white border border-[#D7C2A8] text-[#D96B70] font-bold text-lg flex items-center justify-center hover:bg-[#D96B70] hover:text-white transition-colors">
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Scroll Down Cue -->
          <div class="relative z-10 flex flex-col items-center text-center anim-scroll-cue mb-2">
            <span class="text-[11px] uppercase tracking-[0.2em] text-[#B06C70]">
              {{ lang() === 'en' ? 'Scroll Down for Next Question ↓' : 'अगले प्रश्न के लिए नीचे स्क्रॉल करें ↓' }}
            </span>
          </div>
        </div>
      </section>

      <!-- =======================================================================
           SCREEN 10: RSVP STEP 2 — ARE YOU COMING?
           ======================================================================= -->
      <section class="snap-page lattice-sage" [formGroup]="rsvpForm">
        <div class="jharokha-stage relative bg-[#FFFDF7] py-8 px-6 flex flex-col items-center justify-between">
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 760" preserveAspectRatio="none">
            <path
              d="M 22,736 L 22,165 C 22,125 48,108 65,86 C 82,64 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,64 335,86 C 352,108 378,125 378,165 L 378,736 Z"
              fill="none"
              stroke="#B8C9BE"
              stroke-width="2"
            />
          </svg>

          <div class="relative z-10 flex flex-col items-center mt-6 text-center">
            <span class="px-3 py-0.5 rounded-full bg-[#E3EFE6] text-[#5F7A6E] text-[10px] font-sans uppercase tracking-[0.2em] font-semibold">
              {{ lang() === 'en' ? 'RSVP • Step 2' : 'आरएसवीपी • दूसरा चरण' }}
            </span>
            <h2 class="swash-heading text-2xl sm:text-3xl text-[#5F7A6E] mt-2" [class.hindi-heading]="lang() === 'hi'">
              {{ lang() === 'en' ? 'ARE YOU COMING?' : 'क्या आप आ रहे हैं?' }}
            </h2>
            <p class="script-italic text-base text-[#6E5A4F] mt-1 max-w-[280px]" [class.hindi-body]="lang() === 'hi'">
              {{ lang() === 'en'
                ? 'Tell us we can count on your blessings (and your dance moves)!'
                : 'बताइए, आप हमारे इस शुभ अवसर की रौनक बढ़ाने आ रहे हैं न?' }}
            </p>
          </div>

          <div class="relative z-10 w-full max-w-[315px] flex flex-col gap-3.5 my-auto">
            @for (opt of attendanceOptions; track opt.value) {
              <button
                type="button"
                (click)="setAttendance(opt.value)"
                [class]="rsvpForm.get('attending')?.value === opt.value
                  ? 'w-full p-4 rounded-2xl border-2 border-[#D96B70] bg-[#FDF2F2] text-left shadow-md transition-all flex items-center justify-between'
                  : 'w-full p-4 rounded-2xl border border-[#D8C3A5] bg-[#FFFDF7] hover:border-[#D96B70]/60 text-left transition-all flex items-center justify-between'">
                <div>
                  <p class="text-lg font-semibold text-[#3E2F2B]" [class.hindi-body]="lang() === 'hi'">
                    {{ lang() === 'en' ? opt.labelEn : opt.labelHi }}
                  </p>
                  <p class="text-xs text-[#7A6A5E] mt-0.5 font-sans">
                    {{ lang() === 'en' ? opt.subEn : opt.subHi }}
                  </p>
                </div>
                <span class="text-2xl">{{ opt.emoji }}</span>
              </button>
            }
          </div>

          <div class="relative z-10 flex flex-col items-center text-center anim-scroll-cue mb-2">
            <span class="text-[11px] uppercase tracking-[0.2em] text-[#5F7A6E]">
              {{ lang() === 'en' ? 'Scroll Down to Continue ↓' : 'आगे बढ़ने के लिए नीचे स्क्रॉल करें ↓' }}
            </span>
          </div>
        </div>
      </section>

      <!-- =======================================================================
           SCREEN 11: RSVP STEP 3 — ATTENDING EACH EVENT CHECKLIST (FULL-DAY MODE ONLY)
           ======================================================================= -->
      @if (inviteMode() === 'full' && rsvpForm.get('attending')?.value !== 'no') {
        <section class="snap-page lattice-marigold">
          <div class="jharokha-stage relative bg-[#FFFDF7] py-7 px-6 flex flex-col items-center justify-between">
            <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 760" preserveAspectRatio="none">
              <path
                d="M 22,736 L 22,165 C 22,125 48,108 65,86 C 82,64 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,64 335,86 C 352,108 378,125 378,165 L 378,736 Z"
                fill="none"
                stroke="#DFC394"
                stroke-width="2"
              />
            </svg>

            <div class="relative z-10 flex flex-col items-center mt-5 text-center">
              <span class="px-3 py-0.5 rounded-full bg-[#F7E8CE] text-[#B57C1E] text-[10px] font-sans uppercase tracking-[0.2em] font-semibold">
                {{ lang() === 'en' ? 'RSVP • Step 3' : 'आरएसवीपी • तीसरा चरण' }}
              </span>
              <h2 class="swash-heading text-2xl sm:text-3xl text-[#D99B26] mt-1.5" [class.hindi-heading]="lang() === 'hi'">
                {{ lang() === 'en' ? 'WHICH EVENTS?' : 'कौन-कौन से समारोह?' }}
              </h2>
              <button
                type="button"
                (click)="toggleAllEvents()"
                class="mt-1.5 px-3 py-1 rounded-full bg-[#FAF2E6] border border-[#D8C3A5] text-xs font-sans text-[#8C6747] hover:bg-[#D99B26] hover:text-white transition-colors">
                {{ allEventsSelected()
                  ? (lang() === 'en' ? '✓ All 6 Events Selected' : '✓ सभी 6 समारोह चुने गए')
                  : (lang() === 'en' ? 'Select All 6 Events' : 'सभी 6 समारोह चुनें') }}
              </button>
            </div>

            <!-- 6 Single-Day Events Checkboxes -->
            <div class="relative z-10 w-full max-w-[320px] grid grid-cols-1 gap-2 my-auto">
              @for (ev of allEvents; track ev.id) {
                <button
                  type="button"
                  (click)="toggleEventSelection(ev.id)"
                  [class]="isEventSelected(ev.id)
                    ? 'w-full px-3.5 py-2.5 rounded-xl border-2 border-[#D99B26] bg-[#FFF9EB] flex items-center justify-between text-left transition-all'
                    : 'w-full px-3.5 py-2.5 rounded-xl border border-[#E2D3BE] bg-white/80 flex items-center justify-between text-left opacity-75 hover:opacity-100 transition-all'">
                  <div>
                    <p class="font-semibold text-base text-[#3E2F2B]" [class.hindi-body]="lang() === 'hi'">
                      {{ lang() === 'en' ? ev.titleEn : ev.titleHi }}
                    </p>
                    <p class="text-[11px] font-sans text-[#8C705F]">
                      {{ lang() === 'en' ? ev.timeEn : ev.timeHi }}
                    </p>
                  </div>
                  <div
                    [class]="isEventSelected(ev.id)
                      ? 'w-6 h-6 rounded-md bg-[#D99B26] text-white flex items-center justify-center font-bold text-xs'
                      : 'w-6 h-6 rounded-md border border-[#C9B396] bg-white'">
                    @if (isEventSelected(ev.id)) { ✓ }
                  </div>
                </button>
              }
            </div>

            <div class="relative z-10 flex flex-col items-center text-center anim-scroll-cue mb-1">
              <span class="text-[11px] uppercase tracking-[0.2em] text-[#B57C1E]">
                {{ lang() === 'en' ? 'Scroll Down for Next Step ↓' : 'अगले चरण के लिए नीचे स्क्रॉल करें ↓' }}
              </span>
            </div>
          </div>
        </section>

        <!-- =======================================================================
             SCREEN 12: RSVP STEP 4 — PERFORM IN HALDI/RECEPTION & STAY REQUIRED
             ======================================================================= -->
        <section class="snap-page lattice-lavender" [formGroup]="rsvpForm">
          <div class="jharokha-stage relative bg-[#FFFDF7] py-8 px-6 flex flex-col items-center justify-between">
            <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 760" preserveAspectRatio="none">
              <path
                d="M 22,736 L 22,165 C 22,125 48,108 65,86 C 82,64 98,42 132,36 C 162,30 184,18 200,8 C 216,18 238,30 268,36 C 302,42 318,64 335,86 C 352,108 378,125 378,165 L 378,736 Z"
                fill="none"
                stroke="#B8C4D4"
                stroke-width="2"
              />
            </svg>

            <div class="relative z-10 flex flex-col items-center mt-6 text-center">
              <span class="px-3 py-0.5 rounded-full bg-[#E4ECF5] text-[#5B7890] text-[10px] font-sans uppercase tracking-[0.2em] font-semibold">
                {{ lang() === 'en' ? 'RSVP • Step 4' : 'आरएसवीपी • चौथा चरण' }}
              </span>
              <h2 class="swash-heading text-2xl sm:text-3xl text-[#5B7890] mt-2" [class.hindi-heading]="lang() === 'hi'">
                {{ lang() === 'en' ? 'STAGE & STAY' : 'डांस परफॉरमेंस और ठहरने की व्यवस्था' }}
              </h2>
              <p class="script-italic text-base text-[#6E5A4F] mt-1 max-w-[280px]" [class.hindi-body]="lang() === 'hi'">
                {{ lang() === 'en'
                  ? 'Ready to set the stage on fire or need a cosy room for the day?'
                  : 'क्या आप हल्दी या रिसेप्शन में परफॉर्म करना चाहेंगे, या ठहरने की आवश्यकता है?' }}
              </p>
            </div>

            <div class="relative z-10 w-full max-w-[315px] flex flex-col gap-3.5 my-auto">
              <!-- Perform in Haldi Checkbox -->
              <button
                type="button"
                (click)="toggleBooleanControl('performHaldi')"
                [class]="rsvpForm.get('performHaldi')?.value
                  ? 'w-full p-3.5 rounded-2xl border-2 border-[#D99B26] bg-[#FFF9EB] flex items-center justify-between text-left transition-all'
                  : 'w-full p-3.5 rounded-2xl border border-[#D8C3A5] bg-white flex items-center justify-between text-left transition-all'">
                <div>
                  <p class="font-semibold text-base text-[#3E2F2B]" [class.hindi-body]="lang() === 'hi'">
                    {{ lang() === 'en' ? '💃 Perform in Haldi?' : '💃 हल्दी में परफॉर्म करेंगे?' }}
                  </p>
                  <p class="text-xs font-sans text-[#7A6A5E]">
                    {{ lang() === 'en' ? 'Dance, song or surprise act during morning Haldi' : 'सुबह हल्दी समारोह में डांस या गीत' }}
                  </p>
                </div>
                <div
                  [class]="rsvpForm.get('performHaldi')?.value
                    ? 'w-6 h-6 rounded-md bg-[#D99B26] text-white flex items-center justify-center font-bold text-xs'
                    : 'w-6 h-6 rounded-md border border-[#C9B396]'">
                  @if (rsvpForm.get('performHaldi')?.value) { ✓ }
                </div>
              </button>

              <!-- Perform After Reception Checkbox -->
              <button
                type="button"
                (click)="toggleBooleanControl('performReception')"
                [class]="rsvpForm.get('performReception')?.value
                  ? 'w-full p-3.5 rounded-2xl border-2 border-[#5B7890] bg-[#F2F6FA] flex items-center justify-between text-left transition-all'
                  : 'w-full p-3.5 rounded-2xl border border-[#D8C3A5] bg-white flex items-center justify-between text-left transition-all'">
                <div>
                  <p class="font-semibold text-base text-[#3E2F2B]" [class.hindi-body]="lang() === 'hi'">
                    {{ lang() === 'en' ? '🎤 Perform after Reception?' : '🎤 रिसेप्शन के बाद परफॉर्म करेंगे?' }}
                  </p>
                  <p class="text-xs font-sans text-[#7A6A5E]">
                    {{ lang() === 'en' ? 'After-party dance floor or special performance' : 'रिसेप्शन के बाद ख़ास प्रस्तुति' }}
                  </p>
                </div>
                <div
                  [class]="rsvpForm.get('performReception')?.value
                    ? 'w-6 h-6 rounded-md bg-[#5B7890] text-white flex items-center justify-center font-bold text-xs'
                    : 'w-6 h-6 rounded-md border border-[#C9B396]'">
                  @if (rsvpForm.get('performReception')?.value) { ✓ }
                </div>
              </button>

              @if (rsvpForm.get('performHaldi')?.value || rsvpForm.get('performReception')?.value) {
                <input
                  type="text"
                  formControlName="performanceNote"
                  class="royal-input text-sm"
                  [placeholder]="lang() === 'en' ? 'Optional: Song name or solo/group act details...' : 'वैकल्पिक: गाने का नाम या ग्रुप की जानकारी...'"
                />
              }

              <!-- Stay Required Checkbox -->
              <button
                type="button"
                (click)="toggleBooleanControl('stayRequired')"
                [class]="rsvpForm.get('stayRequired')?.value
                  ? 'w-full p-3.5 rounded-2xl border-2 border-[#D96B70] bg-[#FDF2F2] flex items-center justify-between text-left transition-all'
                  : 'w-full p-3.5 rounded-2xl border border-[#D8C3A5] bg-white flex items-center justify-between text-left transition-all'">
                <div>
                  <p class="font-semibold text-base text-[#3E2F2B]" [class.hindi-body]="lang() === 'hi'">
                    {{ lang() === 'en' ? '🏨 Stay Required?' : '🏨 क्या ठहरने (Stay) की व्यवस्था चाहिए?' }}
                  </p>
                  <p class="text-xs font-sans text-[#7A6A5E]">
                    {{ lang() === 'en' ? 'Check this if you need accommodation at the venue' : 'यदि आपको वेन्यू पर कमरे की आवश्यकता है तो चुनें' }}
                  </p>
                </div>
                <div
                  [class]="rsvpForm.get('stayRequired')?.value
                    ? 'w-6 h-6 rounded-md bg-[#D96B70] text-white flex items-center justify-center font-bold text-xs'
                    : 'w-6 h-6 rounded-md border border-[#C9B396]'">
                  @if (rsvpForm.get('stayRequired')?.value) { ✓ }
                </div>
              </button>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center anim-scroll-cue mb-2">
              <span class="text-[11px] uppercase tracking-[0.2em] text-[#5B7890]">
                {{ lang() === 'en' ? 'Scroll Down for Final Step ↓' : 'अंतिम चरण के लिए नीचे स्क्रॉल करें ↓' }}
              </span>
            </div>
          </div>
        </section>
      }

      <!-- =======================================================================
           SCREEN 13: WARM GOODBYE & FINAL RSVP SUBMIT
           (EXACT MATCH TO SCREENSHOT 7: POWDER BLUE SKY, FLORAL CREST, TAJ SILHOUETTE, BALUSTRADE & LOVEBIRDS)
           ======================================================================= -->
      <section class="snap-page sky-goodbye" [formGroup]="rsvpForm">
        <div class="jharokha-stage relative sky-goodbye flex flex-col items-center justify-between pt-6 pb-0 overflow-hidden">
          <!-- Top White Blossom & Sage Leaf Branches (Screenshot 7) -->
          <svg class="absolute top-0 left-0 w-full h-56 pointer-events-none z-10" viewBox="0 0 400 220">
            <!-- Left Branch -->
            <g transform="translate(0, 0)">
              <path d="M0,120 Q45,65 110,10 M0,55 Q50,35 85,5" stroke="#6E8475" stroke-width="1.8" fill="none"/>
              @for (lf of [{x: 24, y: 78}, {x: 48, y: 52}, {x: 72, y: 30}, {x: 18, y: 38}]; track lf.x) {
                <ellipse [attr.cx]="lf.x" [attr.cy]="lf.y" rx="10" ry="5" transform="rotate(-30)" fill="#7A9181"/>
              }
              <!-- Hanging White Bell Blossoms -->
              <circle cx="92" cy="48" r="6" fill="#FFFFFF"/>
              <circle cx="105" cy="36" r="5" fill="#FFFFFF"/>
              <circle cx="76" cy="68" r="6" fill="#FFFFFF"/>
            </g>
            <!-- Right Branch -->
            <g transform="translate(400, 0) scale(-1, 1)">
              <path d="M0,135 Q45,75 100,15" stroke="#6E8475" stroke-width="1.8" fill="none"/>
              <ellipse cx="32" cy="82" rx="10" ry="5" fill="#7A9181"/>
              <ellipse cx="56" cy="54" rx="10" ry="5" fill="#7A9181"/>
              <circle cx="84" cy="58" r="6" fill="#FFFFFF"/>
              <circle cx="68" cy="84" r="6" fill="#FFFFFF"/>
            </g>
          </svg>

          <!-- Top Floral Crest with VK Monogram (Screenshot 7) -->
          <div class="relative z-20 flex flex-col items-center mt-2">
            <svg class="w-36 h-40" viewBox="0 0 180 200">
              <!-- Ornate Double Scalloped Crest Shield -->
              <path
                d="M90,18 C115,28 142,42 142,68 L142,132 C142,158 115,172 90,184 C65,172 38,158 38,132 L38,68 C38,42 65,28 90,18 Z"
                fill="none"
                stroke="#9BB8BF"
                stroke-width="2"
              />
              <path
                d="M90,25 C112,34 135,46 135,70 L135,130 C135,154 112,166 90,177 C68,166 45,154 45,130 L45,70 C45,46 68,34 90,25 Z"
                fill="none"
                stroke="#B0C9CF"
                stroke-width="1"
              />
              <!-- Top-Right & Bottom-Left Rose Clusters on Crest -->
              <circle cx="118" cy="36" r="9" fill="#E68A92"/>
              <circle cx="130" cy="44" r="6" fill="#FAD2D5"/>
              <circle cx="64" cy="162" r="8" fill="#E68A92"/>
              <circle cx="54" cy="154" r="5" fill="#FAD2D5"/>
              <!-- Monogram VK inside Crest -->
              <text x="64" y="108" font-family="'Cormorant Garamond', serif" font-size="52" font-style="italic" fill="#8FB0B9">v</text>
              <text x="88" y="98" font-family="'Cormorant Garamond', serif" font-size="52" font-weight="600" fill="#7CA0AA">k</text>
              <path d="M58,118 Q90,132 122,118" fill="none" stroke="#8FB0B9" stroke-width="1.2"/>
            </svg>
          </div>

          <!-- Center Warm Goodbye Message & Submit RSVP Box -->
          <div class="relative z-20 flex flex-col items-center text-center px-6 w-full max-w-[340px] my-auto">
            @if (lang() === 'en') {
              <p class="tracked-caps text-xs text-[#698B8E] leading-relaxed">
                LOOKING FORWARD TO<br/>YOUR ESTEEMED PRESENCE
              </p>
            } @else {
              <p class="hindi-body text-sm text-[#567679] font-semibold">
                आपकी गरिमामयी उपस्थिति की प्रतीक्षा में
              </p>
            }

            <p class="script-italic text-2xl sm:text-3xl text-[#D96B70] mt-2 mb-1">
              {{ lang() === 'en' ? 'With Love' : 'सप्रेम' }}
            </p>

            <p class="tracked-caps text-xs sm:text-sm text-[#D96B70] font-semibold leading-relaxed" [class.hindi-body]="lang() === 'hi'">
              {{ lang() === 'en' ? 'VIDISHA & KSHITIJ' : 'विदिशा और क्षितिज' }}
            </p>

            <!-- Optional Blessings Input + Submit Button -->
            <div class="w-full mt-3">
              <input
                type="text"
                formControlName="blessings"
                class="royal-input text-sm mb-2.5 bg-white/85"
                [placeholder]="lang() === 'en' ? 'Optional: Leave a blessing or note for us...' : 'वैकल्पिक: वर-वधू के लिए शुभकामना संदेश...'"
              />

              @if (formErrorMsg()) {
                <p class="text-xs text-[#C9302C] font-sans mb-2 bg-white/90 px-3 py-1 rounded-lg">
                  {{ formErrorMsg() }}
                </p>
              }

              @if (!rsvpSubmitted()) {
                <button
                  type="button"
                  [disabled]="submitting()"
                  (click)="submitRsvp()"
                  class="w-full py-3 rounded-full bg-gradient-to-r from-[#D96B70] to-[#C85A60] text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold shadow-lg hover:shadow-xl active:scale-98 transition-all">
                  @if (submitting()) {
                    {{ lang() === 'en' ? 'Saving Your RSVP...' : 'आपका उत्तर सहेजा जा रहा है...' }}
                  } @else {
                    {{ lang() === 'en' ? '✨ Confirm & Send RSVP' : '✨ अपना आरएसवीपी भेजें' }}
                  }
                </button>
              } @else {
                <div class="p-3 rounded-2xl bg-white/90 border border-[#7CA0AA] shadow-md text-center">
                  <p class="text-sm font-semibold text-[#5F7A6E]" [class.hindi-body]="lang() === 'hi'">
                    {{ lang() === 'en'
                      ? '🎉 Thank you, ' + rsvpForm.get('name')?.value + '! Your RSVP is saved.'
                      : '🎉 धन्यवाद, ' + rsvpForm.get('name')?.value + '! आपका निमंत्रण उत्तर प्राप्त हो गया है।' }}
                  </p>
                  <button
                    type="button"
                    (click)="rsvpSubmitted.set(false)"
                    class="mt-1 text-[11px] font-sans underline text-[#D96B70]">
                    {{ lang() === 'en' ? 'Edit my response' : 'अपना उत्तर बदलें' }}
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Faint Taj/Palace Silhouette, Sandstone Balustrade Railing & Two Pastel Lovebirds (Exact Match to Screenshot 7) -->
          <div class="relative w-full h-52 z-10 mt-auto pointer-events-none">
            <svg class="w-full h-full" viewBox="0 0 400 210" preserveAspectRatio="none">
              <!-- Misty Aqua Palace Silhouette in Background -->
              <g fill="#C6E4E7" opacity="0.65">
                <path d="M165,68 C165,32 235,32 235,68 Z"/>
                <rect x="132" y="68" width="136" height="70"/>
                <path d="M95,92 C95,70 128,70 128,92 Z"/>
                <rect x="88" y="92" width="44" height="46"/>
                <path d="M272,92 C272,70 305,70 305,92 Z"/>
                <rect x="268" y="92" width="44" height="46"/>
              </g>

              <!-- Terracotta Tiled Balcony Floor -->
              <polygon points="0,168 400,168 400,210 0,210" fill="#B58E85"/>
              <line x1="0" y1="186" x2="400" y2="186" stroke="#9E766D" stroke-width="1.5"/>
              <line x1="90" y1="168" x2="65" y2="210" stroke="#9E766D" stroke-width="1.5"/>
              <line x1="200" y1="168" x2="200" y2="210" stroke="#9E766D" stroke-width="1.5"/>
              <line x1="310" y1="168" x2="335" y2="210" stroke="#9E766D" stroke-width="1.5"/>

              <!-- Classical Sandstone Balustrade Pillars (Screenshot 7) -->
              <rect x="0" y="112" width="400" height="7" fill="#BCA682"/>
              <rect x="0" y="162" width="400" height="7" fill="#9E8968"/>
              @for (bx of [18, 52, 86, 120, 154, 188, 222, 256, 290, 324, 358, 388]; track bx) {
                <path
                  [attr.d]="'M' + (bx - 6) + ',119 C' + (bx - 4) + ',132 ' + (bx - 11) + ',142 ' + (bx - 9) + ',154 L' + (bx - 5) + ',162 L' + (bx + 5) + ',162 L' + (bx + 9) + ',154 C' + (bx + 11) + ',142 ' + (bx + 4) + ',132 ' + (bx + 6) + ',119 Z'"
                  fill="#B29B76"
                />
              }

              <!-- Two Cuddling Pastel Lovebirds Perched on Right Balustrade (Exact Match to Screenshot 7) -->
              <g transform="translate(308, 76)">
                <!-- Pink Lovebird (Left, leaning in) -->
                <path d="M6,38 L-4,52 L4,52 L14,38 Z" fill="#A6656C"/>
                <path d="M8,26 C14,14 28,12 36,18 C40,24 36,36 22,38 C14,38 8,34 8,26 Z" fill="#E8A4AB"/>
                <path d="M12,26 C18,20 28,22 30,30 C22,34 14,32 12,26 Z" fill="#C97A83"/>
                <circle cx="28" cy="18" r="7" fill="#D98B94"/>
                <!-- Closed Peaceful Eye -->
                <path d="M28,18 Q31,20 33,18" fill="none" stroke="#4A3B36" stroke-width="1.2"/>
                <polygon points="34,18 39,20 34,22" fill="#8C6D46"/>

                <!-- Turquoise-Teal Lovebird (Right, upright) -->
                <path d="M46,38 L44,58 L54,58 L52,38 Z" fill="#5D9EA6"/>
                <path d="M36,16 C36,6 48,4 54,12 C60,20 58,34 48,38 C38,38 36,28 36,16 Z" fill="#92CFD4"/>
                <circle cx="44" cy="12" r="8" fill="#7BC0C6"/>
                <path d="M41,12 Q44,14 46,12" fill="none" stroke="#4A3B36" stroke-width="1.2"/>
                <polygon points="37,14 33,16 37,18" fill="#8C6D46"/>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </main>

    <!-- ================= /ADMIN LIVE RSVP DASHBOARD MODAL ================= -->
    @if (showAdminModal()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 font-sans">
        <div class="bg-[#FFFDF7] border-2 border-[#D5B88B] rounded-2xl w-full max-w-2xl max-h-[88dvh] flex flex-col overflow-hidden shadow-2xl">
          <!-- Modal Header -->
          <div class="px-5 py-4 bg-[#F7EFE4] border-b border-[#E2D3BE] flex items-center justify-between">
            <div>
              <h3 class="font-serif text-xl font-bold text-[#3E2F2B]">
                Vidisha &amp; Kshitij — RSVP Admin Dashboard
              </h3>
              <p class="text-xs text-[#7A6A5E]">
                Authorized access: vidishagyl&#64;gmail.com &amp; mepronto96&#64;gmail.com
              </p>
            </div>
            <button
              type="button"
              (click)="showAdminModal.set(false)"
              class="w-8 h-8 rounded-full bg-white border border-[#D8C3A5] text-[#4A3B36] flex items-center justify-center hover:bg-[#D96B70] hover:text-white transition-colors">
              ✕
            </button>
          </div>

          <!-- Summary Headcount Cards -->
          <div class="p-4 overflow-y-auto space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="p-3 rounded-xl bg-[#FDF2F2] border border-[#F0C8CA]">
                <p class="text-[11px] uppercase tracking-wider text-[#A65357]">Confirmed Guests</p>
                <p class="text-2xl font-bold text-[#D96B70] mt-0.5">{{ totalConfirmedHeadcount() }}</p>
                <p class="text-[11px] text-[#7A6A5E]">{{ attendingYesCount() }} families said Yes</p>
              </div>
              <div class="p-3 rounded-xl bg-[#EEF5F0] border border-[#C5DBC9]">
                <p class="text-[11px] uppercase tracking-wider text-[#4B6B58]">Stay Needed</p>
                <p class="text-2xl font-bold text-[#5F7A6E] mt-0.5">{{ stayNeededCount() }}</p>
                <p class="text-[11px] text-[#7A6A5E]">Rooms / parties</p>
              </div>
              <div class="p-3 rounded-xl bg-[#FFF9EB] border border-[#ECD49B]">
                <p class="text-[11px] uppercase tracking-wider text-[#9E711B]">Performers</p>
                <p class="text-2xl font-bold text-[#D99B26] mt-0.5">{{ performersCount() }}</p>
                <p class="text-[11px] text-[#7A6A5E]">Haldi / Reception acts</p>
              </div>
              <div class="p-3 rounded-xl bg-[#F0F4F8] border border-[#C9D6E3]">
                <p class="text-[11px] uppercase tracking-wider text-[#4A657A]">Maybe / Unsure</p>
                <p class="text-2xl font-bold text-[#5B7890] mt-0.5">{{ attendingMaybeCount() }}</p>
                <p class="text-[11px] text-[#7A6A5E]">Follow-up list</p>
              </div>
            </div>

            <!-- Event-Wise Headcount Breakdown (20th Jan) -->
            <div class="p-3.5 rounded-xl bg-[#FAF4EC] border border-[#E2D3BE]">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E4B42]">
                  20th January Event-wise Headcount (Catering Planner)
                </h4>
                <button
                  type="button"
                  (click)="exportCsv()"
                  class="px-3 py-1 rounded-lg bg-[#5F7A6E] text-white text-xs font-medium hover:bg-[#4B6358] transition-colors">
                  ⬇ Download CSV
                </button>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                @for (ev of allEvents; track ev.id) {
                  <div class="p-2 rounded-lg bg-white border border-[#E6D7C3]">
                    <p class="text-[11px] font-semibold text-[#5E4B42]">{{ ev.titleEn }}</p>
                    <p class="text-lg font-bold text-[#D96B70]">{{ getEventHeadcount(ev.id) }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Guest Responses Table -->
            <div class="border border-[#E2D3BE] rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-[#F4EBE1] text-[#5E4B42] border-b border-[#E2D3BE]">
                      <th class="p-2.5">Guest Name</th>
                      <th class="p-2.5">Phone</th>
                      <th class="p-2.5">Link</th>
                      <th class="p-2.5">Status (Party)</th>
                      <th class="p-2.5">Events / Stay / Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (allSubmissions().length === 0) {
                      <tr>
                        <td colspan="5" class="p-6 text-center text-[#8C705F]">
                          No RSVPs submitted yet. Test the survey on Screen 9–13 to see live updates here!
                        </td>
                      </tr>
                    }
                    @for (sub of allSubmissions(); track sub.id) {
                      <tr class="border-b border-[#F0E6D8] hover:bg-[#FAF6F0]">
                        <td class="p-2.5 font-semibold text-[#3E2F2B]">{{ sub.name }}</td>
                        <td class="p-2.5 text-[#6E5A4F]">+91 {{ sub.phone }}</td>
                        <td class="p-2.5">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            [class]="sub.inviteMode === 'full' ? 'bg-[#F7E4E6] text-[#C85A60]' : 'bg-[#E4ECF5] text-[#5B7890]'">
                            {{ sub.inviteMode }}
                          </span>
                        </td>
                        <td class="p-2.5">
                          <span class="font-semibold uppercase"
                            [class.text-green-700]="sub.attending === 'yes'"
                            [class.text-amber-600]="sub.attending === 'maybe'"
                            [class.text-red-600]="sub.attending === 'no'">
                            {{ sub.attending }}
                          </span>
                          <span class="text-[#7A6A5E]"> ({{ sub.partySize }})</span>
                        </td>
                        <td class="p-2.5 space-y-0.5">
                          <div class="text-[11px] text-[#5E4B42]">
                            {{ sub.events.join(', ') || '—' }}
                          </div>
                          @if (sub.stayRequired) {
                            <span class="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] mr-1">🏨 Stay</span>
                          }
                          @if (sub.performHaldi) {
                            <span class="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] mr-1">💃 Haldi Act</span>
                          }
                          @if (sub.performReception) {
                            <span class="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">🎤 Reception Act</span>
                          }
                          @if (sub.performanceNote) {
                            <p class="text-[10px] italic text-[#7A6A5E]">"{{ sub.performanceNote }}"</p>
                          }
                          @if (sub.blessings) {
                            <p class="text-[10px] text-[#5F7A6E]">💌 {{ sub.blessings }}</p>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class App implements OnInit, OnDestroy {
  @ViewChild('snapViewport') snapViewport?: ElementRef<HTMLElement>;

  private fb = new FormBuilder();
  private firebaseApp?: FirebaseApp;
  private auth?: Auth;
  private db?: Firestore;
  private unsubscribeRsvps?: () => void;
  private audioCtx?: AudioContext;
  private audioInterval?: ReturnType<typeof setInterval>;

  // Core UI Signals
  lang = signal<'en' | 'hi'>('en');
  inviteMode = signal<'full' | 'reception'>('full');
  doorOpened = signal<boolean>(false);
  audioPlaying = signal<boolean>(false);
  activePageIndex = signal<number>(0);

  // Couple Photo Signals (Separate slots for Full Day & Reception)
  fullDayPhotoUrl = signal<string | null>(null);
  receptionPhotoUrl = signal<string | null>(null);

  activeCouplePhoto = computed(() =>
    this.inviteMode() === 'full' ? this.fullDayPhotoUrl() : this.receptionPhotoUrl()
  );

  // RSVP & Admin State
  rsvpForm: FormGroup;
  selectedEvents = signal<string[]>([
    'kumkum',
    'haldi',
    'pheras',
    'baarat',
    'varmala',
    'reception',
  ]);
  submitting = signal<boolean>(false);
  rsvpSubmitted = signal<boolean>(false);
  formErrorMsg = signal<string>('');
  showAdminModal = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  allSubmissions = signal<RsvpSubmission[]>([]);

  // 20th January All 6 Single-Day Wedding Events
  readonly allEvents: WeddingEventItem[] = [
    {
      id: 'kumkum',
      timeEn: '9:30 AM Onwards',
      timeHi: 'सुबह 9:30 बजे से',
      titleEn: 'KUMKUM',
      titleHi: 'कुमकुम',
      taglineEn: 'AUSPICIOUS VERMILION BLESSINGS & MORNING RITUALS',
      taglineHi: 'मंगल तिलक, आशीर्वाद एवं शुभ पारंपरिक रस्में',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'ROYAL COURTYARD MANDAP',
      venueHi: 'रॉयल कोर्टयार्ड मंडप',
      latticeTheme: 'rose',
      titleColor: '#C85A60',
      receptionIncluded: false,
    },
    {
      id: 'haldi',
      timeEn: '11:00 AM Onwards',
      timeHi: 'सुबह 11:00 बजे से',
      titleEn: 'HALDI',
      titleHi: 'हल्दी',
      taglineEn: 'AN AFTERNOON OF GOLDEN TURMERIC, MARIGOLDS & DHOL BEATS',
      taglineHi: 'पीली हल्दी, गेंदे के फूलों और ढोल की थाप से सजी दुपहरी',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'SUNLIT LOTUS LAWNS',
      venueHi: 'सनलिट लोटस लॉन',
      latticeTheme: 'sage',
      titleColor: '#D99B26',
      receptionIncluded: false,
    },
    {
      id: 'pheras',
      timeEn: '2:30 PM Onwards',
      timeHi: 'दोपहर 2:30 बजे से',
      titleEn: 'PHERAS',
      titleHi: 'फेरे',
      taglineEn: 'SACRED SEVEN VOWS AROUND THE HOLY FIRE',
      taglineHi: 'पवित्र अग्नि के समक्ष सात जन्मों के सात वचन',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'THE PALACE JHAROKHA MANDAP',
      venueHi: 'द पैलेस झरोखा मंडप',
      latticeTheme: 'blush',
      titleColor: '#D96B70',
      receptionIncluded: false,
    },
    {
      id: 'baarat',
      timeEn: '5:00 PM Onwards',
      timeHi: 'शाम 5:00 बजे से',
      titleEn: 'BAARAT',
      titleHi: 'बारात',
      taglineEn: 'THE ROYAL PROCESSION OF MUSIC, DANCING & CELEBRATION',
      taglineHi: 'नाचते-गाते बारातियों और शाही ठाठ-बाट के साथ बारात आगमन',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'MAIN PALACE GATEWAY',
      venueHi: 'मुख्य पैलेस द्वार',
      latticeTheme: 'marigold',
      titleColor: '#C86D3B',
      receptionIncluded: false,
    },
    {
      id: 'varmala',
      timeEn: '7:00 PM Onwards',
      timeHi: 'शाम 7:00 बजे से',
      titleEn: 'VARMALA',
      titleHi: 'वरमाला',
      taglineEn: 'EXCHANGE OF FLORAL GARLANDS UNDER THE STARLIT SKY',
      taglineHi: 'तारों की छाँव में फूलों की जयमाला और मधुर मिलन',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'STARLIGHT PALACESTAGE',
      venueHi: 'स्टारलाइट पैलेस स्टेज',
      latticeTheme: 'blush',
      titleColor: '#D96B70',
      receptionIncluded: true,
    },
    {
      id: 'reception',
      timeEn: '8:00 PM Onwards',
      timeHi: 'रात 8:00 बजे से',
      titleEn: 'RECEPTION',
      titleHi: 'रिसेप्शन',
      taglineEn: 'AN EVENING OF GRAND DINNER, TOASTS & CELEBRATION',
      taglineHi: 'नवदंपति को आशीर्वाद, संगीत और शाही प्रीतिभोज की शाम',
      dateEn: 'WEDNESDAY, 20TH JANUARY',
      dateHi: 'बुधवार, २० जनवरी',
      venueEn: 'THE GRAND BALLROOM TERRACE',
      venueHi: 'द ग्रैंड बॉलरूम टेरेस',
      latticeTheme: 'lavender',
      titleColor: '#5B7890',
      receptionIncluded: true,
    },
  ];

  readonly attendanceOptions: {
    value: 'yes' | 'maybe' | 'no';
    labelEn: string;
    labelHi: string;
    subEn: string;
    subHi: string;
    emoji: string;
  }[] = [
    {
      value: 'yes',
      labelEn: 'Joyfully Attending!',
      labelHi: 'हाँ, हम ज़रूर आ रहे हैं!',
      subEn: 'Count us in for the celebrations on 20th Jan',
      subHi: '२० जनवरी के शुभ उत्सव में हम शामिल होंगे',
      emoji: '🥳',
    },
    {
      value: 'maybe',
      labelEn: 'Trying Our Best / Maybe',
      labelHi: 'शायद / आने की पूरी कोशिश करेंगे',
      subEn: 'Will confirm final travel plans shortly',
      subHi: 'जल्द ही अपनी यात्रा की पुष्टि करेंगे',
      emoji: '🤞',
    },
    {
      value: 'no',
      labelEn: 'Sending Blessings From Afar',
      labelHi: 'क्षमा करें, दूर से ही आशीर्वाद भेज रहे हैं',
      subEn: 'Will miss being there in person',
      subHi: 'व्यक्तिगत रूप से उपस्थित नहीं हो पाएंगे',
      emoji: '💐',
    },
  ];

  visibleEvents = computed(() => {
    if (this.inviteMode() === 'reception') {
      return this.allEvents.filter((ev) => ev.receptionIncluded);
    }
    return this.allEvents;
  });

  allEventsSelected = computed(
    () => this.selectedEvents().length === this.allEvents.length
  );

  // Admin Computed Stats
  attendingYesCount = computed(
    () => this.allSubmissions().filter((s) => s.attending === 'yes').length
  );
  attendingMaybeCount = computed(
    () => this.allSubmissions().filter((s) => s.attending === 'maybe').length
  );
  totalConfirmedHeadcount = computed(() =>
    this.allSubmissions()
      .filter((s) => s.attending === 'yes')
      .reduce((acc, s) => acc + (Number(s.partySize) || 1), 0)
  );
  stayNeededCount = computed(
    () =>
      this.allSubmissions().filter((s) => s.attending !== 'no' && s.stayRequired)
        .length
  );
  performersCount = computed(
    () =>
      this.allSubmissions().filter(
        (s) => s.attending !== 'no' && (s.performHaldi || s.performReception)
      ).length
  );

  constructor() {
    this.rsvpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      partySize: [1, [Validators.required, Validators.min(1), Validators.max(15)]],
      attending: ['yes', Validators.required],
      performHaldi: [false],
      performReception: [false],
      performanceNote: [''],
      stayRequired: [false],
      blessings: [''],
    });
  }

  ngOnInit(): void {
    this.detectUrlParameters();
    this.loadSavedLocalState();
    this.initFirebase();
  }

  ngOnDestroy(): void {
    if (this.unsubscribeRsvps) {
      this.unsubscribeRsvps();
    }
    this.stopSynthMusic();
  }

  private detectUrlParameters(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode') || params.get('invite');
      const langParam = params.get('lang');
      const path = window.location.pathname.toLowerCase();

      if (modeParam === 'reception' || path.includes('reception')) {
        this.setInviteMode('reception');
      }
      if (langParam === 'hi') {
        this.lang.set('hi');
      }
      if (params.get('admin') === '1' || path.includes('/admin')) {
        this.showAdminModal.set(true);
      }
    } catch {
      // Ignore URL parsing errors in sandboxed frames
    }
  }

  private loadSavedLocalState(): void {
    try {
      const savedFullPhoto = localStorage.getItem('vk_photo_full');
      const savedRecPhoto = localStorage.getItem('vk_photo_reception');
      if (savedFullPhoto) this.fullDayPhotoUrl.set(savedFullPhoto);
      if (savedRecPhoto) this.receptionPhotoUrl.set(savedRecPhoto);

      const localRsvps = localStorage.getItem('vk_rsvp_submissions');
      if (localRsvps) {
        this.allSubmissions.set(JSON.parse(localRsvps));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private async initFirebase(): Promise<void> {
    try {
      if (typeof __firebase_config === 'undefined' || !__firebase_config) {
        return;
      }
      const config = JSON.parse(__firebase_config);
      this.firebaseApp = initializeApp(config);
      this.auth = getAuth(this.firebaseApp);
      this.db = getFirestore(this.firebaseApp);

      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(this.auth, __initial_auth_token);
      } else {
        await signInAnonymously(this.auth);
      }

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        if (user && this.db) {
          this.listenToFirestoreRsvps();
        }
      });
    } catch {
      // Fallback to localStorage if Firebase is not configured
    }
  }

  private listenToFirestoreRsvps(): void {
    if (!this.db) return;
    try {
      const appId = typeof __app_id !== 'undefined' && __app_id ? __app_id : 'vk-wedding-20jan';
      const colRef = collection(
        this.db,
        'artifacts',
        appId,
        'public',
        'data',
        'rsvps'
      );
      this.unsubscribeRsvps = onSnapshot(colRef, (snap) => {
        const list: RsvpSubmission[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as RsvpSubmission);
        });
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        this.allSubmissions.set(list);
      });
    } catch {
      // Ignore snapshot errors
    }
  }

  selectLanguage(l: 'en' | 'hi'): void {
    this.lang.set(l);
  }

  toggleLanguage(): void {
    this.lang.set(this.lang() === 'en' ? 'hi' : 'en');
  }

  setInviteMode(mode: 'full' | 'reception'): void {
    this.inviteMode.set(mode);
    if (mode === 'reception') {
      this.selectedEvents.set(['varmala', 'reception']);
    } else {
      this.selectedEvents.set(this.allEvents.map((e) => e.id));
    }
  }

  openInvitationDoor(): void {
    this.doorOpened.set(true);
    if (!this.audioPlaying()) {
      this.startSynthMusic();
    }
  }

  onViewportScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el) return;
    const pageHeight = el.clientHeight || 1;
    const idx = Math.round(el.scrollTop / pageHeight);
    this.activePageIndex.set(idx);
  }

  getArchOuterFill(theme: WeddingEventItem['latticeTheme']): string {
    switch (theme) {
      case 'rose':
        return '#E8C2C5';
      case 'sage':
        return '#C8D8CC';
      case 'blush':
        return '#EED2D4';
      case 'marigold':
        return '#EAD4B4';
      case 'lavender':
        return '#CFD7E3';
      default:
        return '#E5CFA9';
    }
  }

  getArchBorderStroke(theme: WeddingEventItem['latticeTheme']): string {
    switch (theme) {
      case 'rose':
        return '#C88D92';
      case 'sage':
        return '#8FA696';
      case 'blush':
        return '#D49EA2';
      case 'marigold':
        return '#C9A46A';
      case 'lavender':
        return '#94A6BA';
      default:
        return '#C9AB79';
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (this.inviteMode() === 'full') {
        this.fullDayPhotoUrl.set(result);
        try {
          localStorage.setItem('vk_photo_full', result);
        } catch {}
      } else {
        this.receptionPhotoUrl.set(result);
        try {
          localStorage.setItem('vk_photo_reception', result);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  }

  adjustPartySize(delta: number): void {
    const current = Number(this.rsvpForm.get('partySize')?.value) || 1;
    const next = Math.min(15, Math.max(1, current + delta));
    this.rsvpForm.get('partySize')?.setValue(next);
  }

  setAttendance(val: 'yes' | 'maybe' | 'no'): void {
    this.rsvpForm.get('attending')?.setValue(val);
  }

  isEventSelected(eventId: string): boolean {
    return this.selectedEvents().includes(eventId);
  }

  toggleEventSelection(eventId: string): void {
    const current = this.selectedEvents();
    if (current.includes(eventId)) {
      this.selectedEvents.set(current.filter((id) => id !== eventId));
    } else {
      this.selectedEvents.set([...current, eventId]);
    }
  }

  toggleAllEvents(): void {
    if (this.allEventsSelected()) {
      this.selectedEvents.set([]);
    } else {
      this.selectedEvents.set(this.allEvents.map((e) => e.id));
    }
  }

  toggleBooleanControl(controlName: string): void {
    const ctrl = this.rsvpForm.get(controlName);
    if (ctrl) {
      ctrl.setValue(!ctrl.value);
    }
  }

  async submitRsvp(): Promise<void> {
    this.formErrorMsg.set('');
    const nameVal = (this.rsvpForm.get('name')?.value || '').trim();
    const phoneVal = (this.rsvpForm.get('phone')?.value || '').trim();

    if (!nameVal || !/^[0-9]{10}$/.test(phoneVal)) {
      this.rsvpForm.markAllAsTouched();
      this.formErrorMsg.set(
        this.lang() === 'en'
          ? 'Please scroll up to Step 1 and enter your Name & 10-digit Phone Number.'
          : 'कृपया पहले चरण में अपना नाम और 10 अंकों का मोबाइल नंबर दर्ज करें।'
      );
      return;
    }

    this.submitting.set(true);

    const cleanPhone = phoneVal.replace(/\D/g, '');
    const attendingVal = this.rsvpForm.get('attending')?.value as 'yes' | 'maybe' | 'no';
    const eventsList =
      attendingVal === 'no'
        ? []
        : this.inviteMode() === 'reception'
          ? ['varmala', 'reception']
          : this.selectedEvents();

    const payload: RsvpSubmission = {
      id: `rsvp_${cleanPhone}`,
      name: nameVal,
      phone: cleanPhone,
      partySize: Number(this.rsvpForm.get('partySize')?.value) || 1,
      inviteMode: this.inviteMode(),
      attending: attendingVal,
      events: eventsList,
      performHaldi: Boolean(this.rsvpForm.get('performHaldi')?.value),
      performReception: Boolean(this.rsvpForm.get('performReception')?.value),
      performanceNote: (this.rsvpForm.get('performanceNote')?.value || '').trim(),
      stayRequired: Boolean(this.rsvpForm.get('stayRequired')?.value),
      blessings: (this.rsvpForm.get('blessings')?.value || '').trim(),
      language: this.lang(),
      updatedAt: Date.now(),
    };

    try {
      // Save to LocalStorage for immediate persistence
      const existing = [...this.allSubmissions().filter((s) => s.id !== payload.id)];
      const updated = [payload, ...existing];
      this.allSubmissions.set(updated);
      try {
        localStorage.setItem('vk_rsvp_submissions', JSON.stringify(updated));
      } catch {}

      // Save to Firestore if initialized
      if (this.db && this.currentUser()) {
        const appId = typeof __app_id !== 'undefined' && __app_id ? __app_id : 'vk-wedding-20jan';
        const docRef = doc(
          this.db,
          'artifacts',
          appId,
          'public',
          'data',
          'rsvps',
          payload.id
        );
        await setDoc(docRef, payload, { merge: true });
      }

      this.rsvpSubmitted.set(true);
    } catch {
      this.rsvpSubmitted.set(true);
    } finally {
      this.submitting.set(false);
    }
  }

  getEventHeadcount(eventId: string): number {
    return this.allSubmissions()
      .filter((s) => s.attending === 'yes' && s.events.includes(eventId))
      .reduce((sum, s) => sum + (Number(s.partySize) || 1), 0);
  }

  exportCsv(): void {
    const rows = [
      [
        'Name',
        'Phone',
        'InviteLink',
        'Attending',
        'PartySize',
        'Events',
        'StayRequired',
        'PerformHaldi',
        'PerformReception',
        'PerformanceNote',
        'Blessings',
      ],
    ];
    for (const s of this.allSubmissions()) {
      rows.push([
        `"${(s.name || '').replace(/"/g, '""')}"`,
        s.phone,
        s.inviteMode,
        s.attending,
        String(s.partySize),
        `"${(s.events || []).join(' | ')}"`,
        String(s.stayRequired),
        String(s.performHaldi),
        String(s.performReception),
        `"${(s.performanceNote || '').replace(/"/g, '""')}"`,
        `"${(s.blessings || '').replace(/"/g, '""')}"`,
      ]);
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'vidisha_kshitij_rsvps_20jan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Gentle WebAudio Santoor / Jal Tarang Chime Synthesizer (Zero external MP3 dependency)
  toggleAudio(): void {
    if (this.audioPlaying()) {
      this.stopSynthMusic();
    } else {
      this.startSynthMusic();
    }
  }

  private startSynthMusic(): void {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.audioPlaying.set(true);

      // Raag Yaman / Bhupali Pentatonic Notes (Hz)
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      let step = 0;

      const playPluck = () => {
        if (!this.audioPlaying() || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const freq = notes[step % notes.length];
        step = (step + Math.floor(Math.random() * 2) + 1) % notes.length;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.45);
      };

      playPluck();
      this.audioInterval = setInterval(playPluck, 1100);
    } catch {
      this.audioPlaying.set(false);
    }
  }

  private stopSynthMusic(): void {
    this.audioPlaying.set(false);
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
      this.audioInterval = undefined;
    }
  }
}