import { createElement, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Image, ImageBackground, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, {
  Circle,
  Line,
  Path,
} from 'react-native-svg';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MobileWelcome from '../components/MobileWelcome';
import { Text, Touch, useResponsive } from '../components/ui';

const HERO_BACKGROUND = require('../../assets/images/musa-hero-gradient.png');
const PHONE_SCREEN = require('../../assets/images/app-home.png');
const IPHONE_FRAME = require('../../assets/images/iphone-frame.png');
const GOOGLE_PLAY_ICON = require('../../assets/images/google-play.png');
const APP_STORE_ICON = require('../../assets/images/app-store.png');
const CARD_LANGUAGE_IMAGE = require('../../assets/images/card-language-field.png');
const CARD_LIVE_IMAGE = require('../../assets/images/card-live-concert.png');
const CARD_PHONE_IMAGE = require('../../assets/images/card-just-phone-realistic.png');
const CARD_ANY_SONG_IMAGE = require('../../assets/images/card-any-song-signal.png');

const INK = '#0E1726';
const MUTED = '#3A4654';
const HERO_MUTED = '#1F2A36';
const LINE = 'rgba(14,23,38,0.12)';
const PAPER = '#FFFDF7';
const BLUE = '#315BFF';
const MINT = '#1FD3A3';

// === Acceso a la app (hackathon) — REEMPLAZAR con el link y QR reales ===
// QR oficial provisto por el usuario (assets/images/musa-qr.png).
const APP_URL = 'https://musa.tu-vps.com';
const APP_URL_LABEL = 'musa.tu-vps.com';
const QR_SRC = require('../../assets/images/musa-qr.png');

// === Links del footer — REEMPLAZAR con los reales ===
const MUSICATHON_URL = 'https://musicathon.example';
const GITHUB_URL = 'https://github.com/MauroProto/musa';
const YOUTUBE_URL = 'https://youtube.com/@musa';
const CONTACT_EMAIL = 'hola@musa.app';
const MUSIXMATCH_URL = 'https://www.musixmatch.com';
const LALAL_URL = 'https://www.lalal.ai';
const MAURO_LINKEDIN_URL = 'https://www.linkedin.com/in/mauroprotocassina/';
const IGNACIO_LINKEDIN_URL = 'https://www.linkedin.com/in/ignacio-estevo/';
// Expo Go en las stores
const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=host.exp.exponent';
const APPSTORE_URL = 'https://apps.apple.com/app/expo-go/id982107779';

type LandingCanvas = 'regular' | 'large' | 'ultra';

function landingCanvasForWidth(width: number): LandingCanvas {
  if (width >= 2400) return 'ultra';
  if (width >= 1680) return 'large';
  return 'regular';
}

function openURL(url: string) {
  Linking.openURL(url).catch(() => {});
}

// El navegador fija el teléfono nativamente con `position: sticky` (sin lag, en GPU).
// En nativo no existe, así que cae a flujo normal (igual ahí se usa el layout mobile).
const STICKY: any = Platform.OS === 'web' ? { position: 'sticky', top: 0 } : { position: 'relative' };

const FEATURE_CARDS = [
  {
    title: 'Synced lyrics',
    copy: 'Big, timed captions keep the current line easy to read as the song plays.',
    icon: 'reader-outline' as const,
  },
  {
    title: 'Meaningful touch',
    copy: 'Every vibration means something — a voice, a riff, a pause, the chorus.',
    icon: 'finger-print-outline' as const,
  },
  {
    title: 'Visible structure',
    copy: 'Pulse, energy and section cues keep the timing clear, even in silence.',
    icon: 'pulse-outline' as const,
  },
];

const TRANSLATION_STEPS = [
  {
    title: 'Lyrics set the clock',
    copy: 'Musixmatch timestamps tell MUSA when each line begins, holds, breathes, and changes.',
    icon: 'time-outline' as const,
  },
  {
    title: 'The song becomes structure',
    copy: 'The engine adds beat, energy, stem cues, authored demo moments, and chorus countdowns.',
    icon: 'analytics-outline' as const,
  },
  {
    title: 'The phone speaks in touch',
    copy: 'The result is a readable visual score plus haptic cues you can learn and calibrate.',
    icon: 'phone-portrait-outline' as const,
  },
];

export default function WelcomeScreen() {
  return Platform.OS === 'web' ? <WelcomeLanding /> : <MobileWelcome />;
}

function WelcomeLanding() {
  const { isWide, width, height } = useResponsive();
  const insets = useSafeAreaInsets();
  const isTablet = !isWide && width >= 700;
  const canvas = landingCanvasForWidth(width);
  const [showGetApp, setShowGetApp] = useState(false);
  const [showBootLoader, setShowBootLoader] = useState(Platform.OS === 'web');
  const [bootLoaderExiting, setBootLoaderExiting] = useState(false);
  const openGetApp = () => setShowGetApp(true);
  const scrollY = useSharedValue(0);
  // Y (en coords de scroll) donde arranca la sección pinned. La setea su onLayout.
  const pinTop = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const scrollRef = useRef<any>(null);
  // El nav lleva a cada parte del scroll pinneado (p ≈ donde cada beat se ve completo).
  const scrollToPart = (idx: number) => {
    const targets = [0.19, 0.5, 0.81];
    const y = pinTop.value + (targets[idx] ?? 0) * (height * 1.3);
    scrollRef.current?.scrollTo({ y, animated: true });
  };
  // El header arranca transparente sobre el hero y se vuelve sólido al entrar
  // en las secciones claras, para que no se pise visualmente con el scroll.
  const headerBgStyle = useAnimatedStyle(() => {
    const fadeStart = !isWide ? height * 0.72 : pinTop.value - height * 0.18;
    const fadeEnd = !isWide ? height * 0.94 : pinTop.value + height * 0.02;
    const t = interpolate(
      scrollY.value,
      [fadeStart, fadeEnd],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      backgroundColor: interpolateColor(t, [0, 1], ['rgba(250,250,250,0)', 'rgba(250,250,250,1)']),
      borderBottomColor: interpolateColor(t, [0, 1], ['rgba(14,23,38,0)', 'rgba(14,23,38,0.08)']),
    };
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const exitTimer = setTimeout(() => setBootLoaderExiting(true), 620);
    const removeTimer = setTimeout(() => setShowBootLoader(false), 960);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <View style={styles.page}>
      <Animated.View
        style={[
          styles.headerOverlay,
          headerBgStyle,
          { paddingTop: insets.top + 18 },
        ]}
      >
        <Header isWide={isWide} isTablet={isTablet} canvas={canvas} onGetApp={openGetApp} onNavigatePart={scrollToPart} />
      </Animated.View>
      <Animated.ScrollView
        ref={(node: any) => {
          scrollRef.current = node;
          // Scroll-snap suave (proximity) en los puntos de la sección pinned: da una
          // "resistencia" para quedarte en una parte sin pasarte por accidente. Web-only.
          if (Platform.OS === 'web' && node) {
            const dom = node.getScrollableNode ? node.getScrollableNode() : node;
            if (dom && dom.style) dom.style.scrollSnapType = 'y proximity';
          }
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 0 },
        ]}
      >
        <ImageBackground
          source={HERO_BACKGROUND}
          resizeMode="cover"
          style={[
            styles.heroFrame,
            isTablet ? styles.heroFrameTablet : null,
            !isWide && !isTablet ? styles.heroFrameMobile : null,
            { minHeight: height },
          ]}
          imageStyle={styles.heroFrameImage}
        >
          <View style={styles.heroVeil} />
          <View
            style={[
              styles.heroFrameInner,
              isTablet ? styles.heroFrameInnerTablet : null,
              !isWide && !isTablet ? styles.heroFrameInnerMobile : null,
              { paddingTop: insets.top + 92 },
            ]}
          >
            <Hero isWide={isWide} isTablet={isTablet} canvas={canvas} onGetApp={openGetApp} />
          </View>
        </ImageBackground>
        <PinnedPhoneSection scrollY={scrollY} pinTop={pinTop} isWide={isWide} isTablet={isTablet} />
        <CardsSection isWide={isWide} isTablet={isTablet} />
        <FinalCta isWide={isWide} isTablet={isTablet} onGetApp={openGetApp} />
      </Animated.ScrollView>

      {showGetApp ? <GetAppModal onClose={() => setShowGetApp(false)} /> : null}
      {showBootLoader ? <WelcomeBootLoader exiting={bootLoaderExiting} /> : null}
    </View>
  );
}

function WelcomeBootLoader({ exiting }: { exiting: boolean }) {
  const clock = useSharedValue(0);
  const opacity = useSharedValue(0);

  useFrameCallback((frame) => {
    clock.value = frame.timeSinceFirstFrame ?? 0;
  });

  useEffect(() => {
    opacity.value = withTiming(exiting ? 0 : 1, { duration: exiting ? 260 : 160 });
  }, [exiting, opacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View testID="welcome-boot-loader" pointerEvents="none" style={[styles.bootLoader, overlayStyle]}>
      <ImageBackground
        source={HERO_BACKGROUND}
        resizeMode="cover"
        style={styles.bootLoaderBg}
        imageStyle={styles.heroFrameImage}
      >
        <View style={styles.bootLoaderVeil} />
        <View style={styles.bootLoaderContent}>
          <Text color={INK} weight="800" style={styles.bootLoaderLogo}>
            MUSA
          </Text>
          <View style={styles.bootLoaderPulse}>
            {[0, 1, 2, 3, 4].map((index) => (
              <BootLoaderBar key={index} clock={clock} index={index} />
            ))}
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

function BootLoaderBar({ clock, index }: { clock: { value: number }; index: number }) {
  const barStyle = useAnimatedStyle(() => {
    const phase = clock.value / 220 + index * 0.62;
    const wave = (Math.sin(phase) + 1) / 2;
    return {
      height: 12 + wave * 28,
      opacity: 0.34 + wave * 0.48,
      transform: [{ translateY: -wave * 4 }],
    };
  });

  return <Animated.View style={[styles.bootLoaderBar, barStyle]} />;
}

function Header({
  isWide,
  isTablet,
  canvas,
  onGetApp,
  onNavigatePart,
}: {
  isWide: boolean;
  isTablet: boolean;
  canvas: LandingCanvas;
  onGetApp: () => void;
  onNavigatePart?: (idx: number) => void;
}) {
  return (
    <View style={[styles.shell, canvas === 'large' ? styles.shellLarge : canvas === 'ultra' ? styles.shellUltra : null]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/welcome')} hitSlop={10}>
          <Text color={INK} weight="800" style={styles.logo}>
            MUSA
          </Text>
        </Pressable>

        {isWide || isTablet ? (
          <View style={styles.nav}>
            <NavLink label="How it works" onPress={() => onNavigatePart?.(0)} />
            <NavLink label="Personalize" onPress={() => onNavigatePart?.(1)} />
            <NavLink label="Live captions" onPress={() => onNavigatePart?.(2)} />
          </View>
        ) : null}

        <Touch onPress={onGetApp} style={styles.headerCta} scaleTo={0.98}>
          <Text color={PAPER} weight="700" style={styles.headerCtaText}>
            Feel demo
          </Text>
        </Touch>
      </View>
    </View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Text color="rgba(14,23,38,0.92)" weight="700" style={styles.navText}>
        {label}
      </Text>
    </Pressable>
  );
}

function Hero({ isWide, isTablet, canvas, onGetApp }: { isWide: boolean; isTablet: boolean; canvas: LandingCanvas; onGetApp: () => void }) {
  const isCompact = !isWide && !isTablet;
  const phoneSize = canvas === 'ultra' ? 'ultra' : canvas === 'large' ? 'large' : 'regular';

  return (
    <View
      style={[
        styles.shell,
        canvas === 'large' ? styles.shellLarge : canvas === 'ultra' ? styles.shellUltra : null,
        styles.hero,
        isWide ? styles.heroWide : isTablet ? styles.heroTablet : styles.heroMobile,
        canvas === 'large' ? styles.heroWideLarge : canvas === 'ultra' ? styles.heroWideUltra : null,
      ]}
    >
      <View
        style={[
          styles.heroCopyColumn,
          isWide ? styles.heroCopyWide : null,
          isWide && canvas === 'ultra' ? styles.heroCopyWideUltra : null,
          isTablet ? styles.heroCopyTablet : null,
        ]}
      >
        <Text
          color={INK}
          weight="800"
          style={StyleSheet.flatten([
            isWide ? styles.heroTitle : isTablet ? styles.heroTitleTablet : styles.heroTitleMobile,
            isWide && canvas === 'ultra' ? styles.heroTitleUltra : null,
          ])}
        >
          Lyrics you can read. Rhythm you can feel.
        </Text>
        <Text
          color={HERO_MUTED}
          weight="500"
          style={StyleSheet.flatten([
            isWide ? styles.heroBody : isTablet ? styles.heroBodyTablet : styles.heroBodyMobile,
            isWide && canvas === 'ultra' ? styles.heroBodyUltra : null,
          ])}
        >
          MUSA turns synced lyrics and song structure into haptic captions for people who
          follow music through sight, touch, hearing aids, or cochlear implants.
        </Text>

        <View style={[styles.ctaRow, !isWide && !isTablet ? styles.ctaRowMobile : null]}>
          <Touch
            onPress={onGetApp}
            style={StyleSheet.flatten([
              styles.primaryCta,
              isWide && canvas === 'ultra' ? styles.primaryCtaUltra : null,
            ])}
            scaleTo={0.98}
          >
            <Ionicons name="play" size={17} color={PAPER} style={{ marginLeft: 1 }} />
            <Text
              color={PAPER}
              weight="700"
              style={StyleSheet.flatten([styles.ctaText, isWide && canvas === 'ultra' ? styles.ctaTextUltra : null])}
            >
              Feel the demo
            </Text>
          </Touch>
        </View>

        <View style={[styles.heroSponsors, isCompact ? styles.heroSponsorsMobile : null]}>
          <Text
            color="rgba(14,23,38,0.62)"
            weight="700"
            style={StyleSheet.flatten([
              isCompact ? styles.sponsorLabelMobile : styles.sponsorLabel,
              isWide && canvas === 'ultra' ? styles.sponsorLabelUltra : null,
            ])}
          >
            Powered by
          </Text>
          <Pressable
            onPress={() => openURL(MUSIXMATCH_URL)}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Open Musixmatch website"
          >
            <Text
              color={INK}
              weight="600"
              style={StyleSheet.flatten([
                isCompact ? styles.sponsorNameMobile : styles.sponsorName,
                isWide && canvas === 'ultra' ? styles.sponsorNameUltra : null,
              ])}
            >
              Musixmatch
            </Text>
          </Pressable>
          <View style={styles.sponsorDot} />
          <Pressable
            onPress={() => openURL(LALAL_URL)}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Open LALAL.AI website"
          >
            <Text
              color={INK}
              weight="600"
              style={StyleSheet.flatten([
                isCompact ? styles.sponsorNameMobile : styles.sponsorName,
                isWide && canvas === 'ultra' ? styles.sponsorNameUltra : null,
              ])}
            >
              LALAL.AI
            </Text>
          </Pressable>
        </View>
      </View>

      {isWide || isTablet ? (
        <View style={[styles.phoneStage, isTablet ? styles.phoneStageTablet : styles.phoneStageWide]}>
          <WaveField />
          <PhoneMockup compact={isTablet} size={phoneSize} />
        </View>
      ) : null}
    </View>
  );
}

function WaveField() {
  return (
    <View style={styles.waveField}>
      <Svg width="100%" height="100%" viewBox="0 0 640 580">
        <Path
          d="M-42 418 C112 270 236 184 390 72 C486 2 594 -20 704 -4"
          stroke={BLUE}
          strokeWidth="0.8"
          opacity="0.035"
          fill="none"
        />
        <Path
          d="M-22 458 C144 320 272 222 416 112 C510 40 610 18 712 30"
          stroke={MINT}
          strokeWidth="0.9"
          opacity="0.045"
          fill="none"
        />
        <Path
          d="M12 500 C180 372 312 266 456 158 C542 94 626 72 716 82"
          stroke={BLUE}
          strokeWidth="0.6"
          opacity="0.028"
          fill="none"
        />
        {Array.from({ length: 11 }).map((_, i) => (
          <Line
            key={i}
            x1={88 + i * 42}
            y1={112}
            x2={58 + i * 42}
            y2={478}
            stroke={INK}
            strokeWidth="0.45"
            opacity="0.018"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <Circle
            key={i}
            cx={180 + i * 128}
            cy={336 - i * 74}
            r={42 + i * 10}
            stroke={i === 1 ? BLUE : MINT}
            strokeWidth="0.6"
            opacity="0.035"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

// Latido de música alrededor del marco (SOLO hero): anillos que emanan + glow que late,
// como si el teléfono estuviera "generando" la música que suena en el video.
function pulseRingStyle(t: number, offset: number) {
  'worklet';
  const local = (t + offset) % 1;
  return {
    opacity: (1 - local) * 0.055,
    transform: [{ scale: 1 + local * 0.38 }],
  };
}

function BeatPulse() {
  const t = useSharedValue(0);
  // ~100 BPM: el período total (1800ms) se reparte en 3 anillos → uno emana cada ~600ms.
  useFrameCallback((f) => {
    t.value = (f.timeSinceFirstFrame % 1800) / 1800;
  });
  const ring1 = useAnimatedStyle(() => pulseRingStyle(t.value, 0));
  const ring2 = useAnimatedStyle(() => pulseRingStyle(t.value, 1 / 3));
  const ring3 = useAnimatedStyle(() => pulseRingStyle(t.value, 2 / 3));
  const glow = useAnimatedStyle(() => {
    const beat = (t.value * 3) % 1; // 3 "pum" por período
    const o = (1 - beat) * (1 - beat); // decaimiento rápido tras cada golpe
    return { opacity: 0.025 + o * 0.055, transform: [{ scale: 1 + o * 0.018 }] };
  });
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.beatGlow, glow]} />
      <Animated.View pointerEvents="none" style={[styles.beatRing, ring1]} />
      <Animated.View pointerEvents="none" style={[styles.beatRing, ring2]} />
      <Animated.View pointerEvents="none" style={[styles.beatRing, ring3]} />
    </>
  );
}

function PhoneMockup({ compact, size = 'regular' }: { compact: boolean; size?: LandingCanvas }) {
  return (
    <View style={[styles.phoneShadow, compact ? styles.phoneShadowCompact : null]}>
      <View
        style={[
          styles.phoneFrameWrap,
          size === 'large' ? styles.phoneFrameWrapLarge : size === 'ultra' ? styles.phoneFrameWrapUltra : null,
          compact ? styles.phoneFrameWrapCompact : null,
        ]}
      >
        {Platform.OS === 'web' ? <BeatPulse /> : null}
        <View style={[styles.phoneScreenHole, styles.heroPhoneScreenHole]}>
          {Platform.OS === 'web' ? <HeroPhoneVideo /> : <Image source={PHONE_SCREEN} style={styles.phoneScreenImage} resizeMode="cover" />}
        </View>
        <Image source={IPHONE_FRAME} style={styles.phoneFrameImg} resizeMode="contain" />
      </View>

      <View style={styles.phoneCaption}>
        <View style={styles.captionDot} />
        <Text color={INK} weight="800" style={styles.captionLive}>
          LIVE
        </Text>
        <View style={styles.captionDivider} />
        <Text color={MUTED} weight="600" style={styles.captionText}>
          Semantic haptics
        </Text>
      </View>
    </View>
  );
}

function HeroPhoneVideo() {
  return createElement('video', {
    src: SCROLL_VIDEO_1_SRC,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    ref: (el: any) => {
      if (el) {
        el.muted = true;
        const p = el.play && el.play();
        if (p && p.catch) p.catch(() => {});
      }
    },
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center center',
      display: 'block',
      backgroundColor: '#F7FAFA',
    },
  });
}

function FeatureBand({ isWide, isTablet }: { isWide: boolean; isTablet: boolean }) {
  const stacked = !isWide && !isTablet;
  return (
    <View
      style={[
        styles.shell,
        styles.featureBand,
        isTablet ? styles.featureBandTablet : null,
        stacked ? styles.featureBandMobile : null,
      ]}
    >
      {FEATURE_CARDS.map((feature, index) => (
        <View
          key={feature.title}
          style={[
            styles.featureItem,
            isTablet ? styles.featureItemTablet : null,
            !stacked && index > 0 ? styles.featureDivider : null,
          ]}
        >
          <View style={styles.featureIcon}>
            <Ionicons name={feature.icon} size={22} color={INK} />
          </View>
          <Text color={INK} weight="800" style={styles.featureTitle}>
            {feature.title}
          </Text>
          <Text color={MUTED} style={styles.featureCopy}>
            {feature.copy}
          </Text>
          <MiniStrip />
        </View>
      ))}
    </View>
  );
}

function MiniStrip() {
  return (
    <View style={styles.miniStrip}>
      {[0.4, 0.7, 0.5, 1, 0.62, 0.85, 0.45, 0.72].map((h, i) => (
        <View key={i} style={[styles.miniBar, { height: 5 + h * 18 }]} />
      ))}
    </View>
  );
}

function ScoreStory({ isWide, isTablet }: { isWide: boolean; isTablet: boolean }) {
  const compactPreview = !isWide && !isTablet;

  return (
    <View style={styles.storyBand}>
      <View
        style={[
          styles.shell,
          styles.story,
          isTablet ? styles.storyTablet : null,
          !isWide && !isTablet ? styles.storyMobile : null,
        ]}
      >
        <View
          style={[
            styles.storyCopy,
            isWide ? styles.storyCopyWide : null,
            isTablet ? styles.storyCopyTablet : null,
            compactPreview ? styles.storyCopyMobile : null,
          ]}
        >
          <Text
            color={INK}
            weight="800"
            style={isWide ? styles.sectionTitle : isTablet ? styles.sectionTitleTablet : styles.sectionTitleMobile}
          >
            From lyric timing to touch language.
          </Text>
          <Text color={MUTED} style={isTablet ? styles.sectionBodyTablet : styles.sectionBody}>
            MUSA uses synced lyrics as the spine of the song, then adds structure: beat, voice,
            stems, pauses, energy, and chorus moments. What comes out is not a vibration track. It
            is a sensory score.
          </Text>
          <View style={styles.translationSteps}>
            {TRANSLATION_STEPS.map((step) => (
              <TranslationStep key={step.title} {...step} />
            ))}
          </View>
        </View>

        <TranslationPreview compact={compactPreview} isTablet={isTablet} />
      </View>
    </View>
  );
}

function TranslationStep({
  title,
  copy,
  icon,
}: {
  title: string;
  copy: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.translationStep}>
      <View style={styles.translationStepIcon}>
        <Ionicons name={icon} size={20} color={INK} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text color={INK} weight="800" style={styles.translationStepTitle}>
          {title}
        </Text>
        <Text color={MUTED} style={styles.translationStepCopy}>
          {copy}
        </Text>
      </View>
    </View>
  );
}

function TranslationPreview({ compact = false, isTablet = false }: { compact?: boolean; isTablet?: boolean }) {
  return (
    <View
      style={[
        styles.translationPreview,
        compact ? styles.translationPreviewMobile : styles.translationPreviewWide,
        isTablet ? styles.translationPreviewTablet : null,
      ]}
    >
      <View style={[styles.translationHeader, compact ? styles.translationHeaderMobile : null]}>
        <View style={{ flex: 1 }}>
          <Text color={INK} weight="800" style={styles.translationTitle}>
            Sensory score
          </Text>
          <Text color={MUTED} style={styles.translationSubtitle}>
            One lyric line, three layers in sync
          </Text>
        </View>
        <View style={styles.translationStatus}>
          <View style={styles.translatingDot} />
          {!compact ? (
            <Text color={MUTED} weight="700" style={styles.footerStatusText}>
              in sync
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.currentLineCard}>
        <Text color="rgba(255,255,255,0.5)" weight="700" style={styles.currentLineLabel}>
          now playing
        </Text>
        <Text color={PAPER} weight="800" style={styles.currentLineText}>
          Chorus in 8 seconds
        </Text>
      </View>

      <View style={styles.scoreTracks}>
        <View style={styles.scoreLabels}>
          <TrackLabel label="Lyrics" sub="line starts" />
          <TrackLabel label="Structure" sub="energy rising" />
          <TrackLabel label="Haptics" sub="countdown taps" />
        </View>
        <View style={styles.scoreStrips}>
          <View style={styles.scoreStrip}>
            {SCORE_TICKS.map((on, i) => (
              <View key={i} style={[styles.scoreTick, { opacity: on ? 0.9 : 0.2 }]} />
            ))}
          </View>
          <View style={styles.scoreStrip}>
            {SCORE_RISE.map((h, i) => (
              <View key={i} style={[styles.scoreRiseBar, { height: 5 + h * 24, opacity: 0.3 + h * 0.5 }]} />
            ))}
          </View>
          <View style={styles.scoreStrip}>
            {SCORE_PULSE.map((s, i) => (
              <View key={i} style={[styles.scorePulse, { width: 6 + s * 9, height: 6 + s * 9, opacity: 0.32 + s * 0.55 }]} />
            ))}
          </View>
          <View style={styles.playhead} pointerEvents="none">
            <View style={styles.playheadDot} />
          </View>
        </View>
      </View>

      <View style={styles.translationFooter}>
        <Text color={MUTED} style={styles.translationFooterText}>
          One timeline — captions you read, a pulse you feel.
        </Text>
        <Ionicons name="arrow-forward" size={18} color={INK} />
      </View>
    </View>
  );
}

const SCORE_TICKS = [true, false, true, false, true, false, true, true];
const SCORE_RISE = [0.2, 0.32, 0.28, 0.48, 0.6, 0.74, 0.86, 1];
const SCORE_PULSE = [0.12, 0.24, 0.2, 0.38, 0.52, 0.68, 0.84, 1];

function TrackLabel({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.trackLabelRow}>
      <Text color={INK} weight="800" style={styles.trackLabelText}>
        {label}
      </Text>
      <Text color={MUTED} style={styles.trackLabelSub}>
        {sub}
      </Text>
    </View>
  );
}

function TranslationLane({
  label,
  value,
  color,
  bars,
}: {
  label: string;
  value: string;
  color: string;
  bars: number[];
}) {
  return (
    <View style={styles.translationLane}>
      <View style={styles.translationLaneText}>
        <Text color={INK} weight="800" style={styles.translationLaneLabel}>
          {label}
        </Text>
        <Text color={MUTED} style={styles.translationLaneValue}>
          {value}
        </Text>
      </View>
      <View style={styles.translationBars}>
        {bars.map((height, i) => (
          <View
            key={i}
            style={[
              styles.translationBar,
              {
                height: 12 + height * 34,
                backgroundColor: color,
                opacity: label === 'lyrics' ? 0.3 + height * 0.35 : 0.22 + height * 0.5,
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.translationLaneDot, { backgroundColor: color }]} />
    </View>
  );
}

function FinalCta({ isWide, isTablet, onGetApp }: { isWide: boolean; isTablet: boolean; onGetApp: () => void }) {
  const stacked = !isWide && !isTablet;
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={HERO_BACKGROUND}
      resizeMode="cover"
      blurRadius={20}
      style={styles.footerBand}
      imageStyle={styles.footerBackgroundImage}
    >
      <View style={styles.footerSoftVeil} />
      <Text
        color="rgba(14,23,38,0.10)"
        weight="700"
        style={isWide ? styles.footerMegaBrand : isTablet ? styles.footerMegaBrandTablet : styles.footerMegaBrandMobile}
      >
        MUSA
      </Text>

      <View
        style={[
          styles.shell,
          styles.finalFooter,
          { paddingTop: 88, paddingBottom: insets.bottom + 44 },
          stacked ? styles.finalFooterMobile : null,
        ]}
      >
        <View style={[styles.footerContentGrid, stacked ? styles.footerContentGridMobile : null]}>
          <View style={styles.footerIntro}>
            <Text color={MUTED} weight="800" style={styles.footerSmallBrand}>
              MUSA
            </Text>
            <Text
              color={INK}
              weight="800"
              style={
                isWide
                  ? styles.footerMinimalTitle
                  : isTablet
                    ? styles.footerMinimalTitleTablet
                    : styles.footerMinimalTitleMobile
              }
            >
              Music you can read, feel, and follow.
            </Text>
            <Text color={HERO_MUTED} weight="500" style={isTablet ? styles.footerMinimalTextTablet : styles.footerMinimalText}>
              Synced captions, visual rhythm, and haptic cues — for music beyond hearing.
            </Text>
            <View style={styles.footerBuiltByRow}>
              <Text color="rgba(14,23,38,0.58)" weight="700" style={styles.footerBuiltBy}>
                Built by{' '}
              </Text>
              <Pressable
                onPress={() => openURL(MAURO_LINKEDIN_URL)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="Open Mauro Proto LinkedIn profile"
              >
                <Text color="rgba(14,23,38,0.7)" weight="800" style={styles.footerBuiltBy}>
                  Mauro Proto
                </Text>
              </Pressable>
              <Text color="rgba(14,23,38,0.58)" weight="700" style={styles.footerBuiltBy}>
                {' '}and{' '}
              </Text>
              <Pressable
                onPress={() => openURL(IGNACIO_LINKEDIN_URL)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="Open Ignacio Estevo LinkedIn profile"
              >
                <Text color="rgba(14,23,38,0.7)" weight="800" style={styles.footerBuiltBy}>
                  Ignacio Estevo
                </Text>
              </Pressable>
              <Text color="rgba(14,23,38,0.58)" weight="700" style={styles.footerBuiltBy}>
                .
              </Text>
            </View>
            <View style={[styles.footerActionRow, stacked ? styles.finalActionsMobile : null]}>
              <Touch onPress={onGetApp} style={styles.primaryCta} scaleTo={0.98}>
                <Ionicons name="play" size={17} color={PAPER} style={{ marginLeft: 1 }} />
                <Text color={PAPER} weight="700" style={styles.ctaText}>
                  Feel demo
                </Text>
              </Touch>
            </View>
          </View>

          <View style={styles.footerNavColumn}>
            <Text color={MUTED} weight="800" style={styles.footerNavLabel}>
              RESOURCES
            </Text>
            <FooterLink label="Get the app" onPress={onGetApp} />
            <FooterLink label="Musicathon 2026" onPress={() => openURL(MUSICATHON_URL)} />
            <FooterLink label="GitHub" onPress={() => openURL(GITHUB_URL)} />
            <FooterLink label="Demo on YouTube" onPress={() => openURL(YOUTUBE_URL)} />
            <FooterLink label="Contact" onPress={() => openURL(`mailto:${CONTACT_EMAIL}`)} />
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Text color={INK} weight="700" style={styles.footerLinkText}>
        {label}
      </Text>
    </Pressable>
  );
}

function GetAppModal({ onClose }: { onClose: () => void }) {
  const { width } = useResponsive();
  const stacked = width < 760;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(APP_URL)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.modalCard, stacked ? styles.modalCardStacked : null]}>
        <Pressable style={styles.modalClose} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={20} color="rgba(244,246,248,0.72)" />
        </Pressable>

        <View style={[styles.modalLeft, stacked ? styles.modalLeftStacked : null]}>
          <Text color="rgba(244,246,248,0.4)" weight="700" style={styles.modalEyebrow}>
            GET THE APP
          </Text>
          <Text color="#F4F6F8" weight="800" style={styles.modalTitle}>
            Try MUSA on your phone
          </Text>
          <Text color="rgba(244,246,248,0.62)" weight="500" style={styles.modalBody}>
            MUSA&apos;s haptics live in your hands, so the real thing runs on a phone — not the
            browser. Install Expo Go, then scan the QR or open the link.
          </Text>

          <View style={styles.modalSteps}>
            <ModalStep n="1" title="Install Expo Go" copy="Free — get it here:" stores />
            <ModalStep n="2" title="Scan the QR or open the link" copy="MUSA loads straight from our server." />
          </View>

          <View style={styles.modalUrlRow}>
            <View style={styles.modalUrlPill}>
              <Ionicons name="link-outline" size={16} color="rgba(244,246,248,0.6)" />
              <Text color="#F4F6F8" weight="600" numberOfLines={1} style={styles.modalUrlText}>
                {APP_URL_LABEL}
              </Text>
            </View>
            <Touch onPress={copyLink} style={styles.modalCopyBtn} scaleTo={0.97}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#0C0E13" />
              <Text color="#0C0E13" weight="700" style={styles.modalCopyText}>
                {copied ? 'Copied' : 'Copy link'}
              </Text>
            </Touch>
          </View>

        </View>

        <View style={[styles.modalRight, stacked ? styles.modalRightStacked : null]}>
          <View style={styles.qrPanel}>
            <Text color="rgba(14,23,38,0.5)" weight="800" style={styles.qrLabel}>
              SCAN TO OPEN
            </Text>
            <View style={styles.qrBox}>
              <Image source={QR_SRC} style={styles.qrImage} resizeMode="contain" />
            </View>
            <View style={styles.qrFoot}>
              <View style={styles.qrDot} />
              <Text color="rgba(14,23,38,0.62)" weight="700" style={styles.qrFootText}>
                Open with Expo Go
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function ModalStep({ n, title, copy, stores }: { n: string; title: string; copy: string; stores?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text color="#F4F6F8" weight="700" style={styles.stepNumText}>
          {n}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text color="#F4F6F8" weight="700" style={styles.stepTitle}>
          {title}
        </Text>
        <Text color="rgba(244,246,248,0.55)" style={styles.stepCopy}>
          {copy}
        </Text>
        {stores ? (
          <View style={styles.storeRow}>
            <Touch onPress={() => openURL(APPSTORE_URL)} style={styles.storeBtn} scaleTo={0.95} accessibilityLabel="Expo Go on the App Store">
              <Image source={APP_STORE_ICON} style={styles.storeIcon} resizeMode="contain" />
            </Touch>
            <Touch onPress={() => openURL(PLAYSTORE_URL)} style={styles.storeBtn} scaleTo={0.95} accessibilityLabel="Expo Go on Google Play">
              <Image source={GOOGLE_PLAY_ICON} style={styles.storeIcon} resizeMode="contain" />
            </Touch>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* =========================================================
   Scroll-pinned phone section (Novu-style)
   ========================================================= */
const BEATS = [
  {
    title: 'Music you can read and feel.',
    body: 'This is MUSA. As a song plays, it turns the lyrics and the rhythm into captions you read and touch you feel — so people who are Deaf or hard of hearing don’t just see the words, they feel the music move.',
  },
  {
    title: 'Tuned to how you hear.',
    body: 'No two people hear the same way. Pick a profile and dial in the strength of every cue — from a light touch to a strong pulse — so MUSA fits your ears, your body, and the way you sense sound.',
  },
  {
    title: 'Feel the show as it happens.',
    body: 'At concerts, festivals, and live events, MUSA turns the performance into synced captions and haptic cues in real time — so the next lyric, chorus, or drop stays visible and felt, even in the crowd.',
  },
];

type PhoneMomentMode = 'video' | 'video2' | 'video3' | 'library' | 'touch' | 'lyrics';

const MOBILE_SCROLL_MOMENTS: {
  label: string;
  kicker: string;
  title: string;
  body: string;
  phone: PhoneMomentMode;
}[] = [
  {
    label: '01',
    kicker: 'Guided demo',
    title: BEATS[0].title,
    body: BEATS[0].body,
    phone: 'video',
  },
  {
    label: '02',
    kicker: 'Personalize',
    title: BEATS[1].title,
    body: BEATS[1].body,
    phone: 'video2',
  },
  {
    label: '03',
    kicker: 'Live captions',
    title: BEATS[2].title,
    body: BEATS[2].body,
    phone: 'video3',
  },
];

function Beat({
  title,
  body,
  compact = false,
  size = 'regular',
}: {
  title: string;
  body: string;
  compact?: boolean;
  size?: LandingCanvas;
}) {
  return (
    <>
      <Text
        color={INK}
        weight="800"
        style={StyleSheet.flatten([
          compact ? styles.beatTitleMobile : styles.beatTitle,
          !compact && size === 'large' ? styles.beatTitleLarge : null,
          !compact && size === 'ultra' ? styles.beatTitleUltra : null,
        ])}
      >
        {title}
      </Text>
      <Text
        color={MUTED}
        weight="500"
        style={StyleSheet.flatten([
          compact ? styles.beatBodyMobile : styles.beatBody,
          !compact && size === 'large' ? styles.beatBodyLarge : null,
          !compact && size === 'ultra' ? styles.beatBodyUltra : null,
        ])}
      >
        {body}
      </Text>
    </>
  );
}

// Video de la parte 1 (scrubbed por scroll). Servido desde public/, todo-keyframes.
const SCROLL_VIDEO_1_SRC = '/musa-scroll-1.mp4';
const SCROLL_VIDEO_2_SRC = '/musa-scroll-2.mp4';
const SCROLL_VIDEO_3_SRC = '/musa-scroll-3.mp4';

function PinnedPhone({
  videoLayerStyle,
  video2LayerStyle,
  video3LayerStyle,
  compact = false,
  size = 'regular',
  showVideo = false,
  moment = 'library',
}: {
  videoLayerStyle?: any;
  video2LayerStyle?: any;
  video3LayerStyle?: any;
  compact?: boolean;
  size?: LandingCanvas;
  showVideo?: boolean;
  moment?: PhoneMomentMode;
}) {
  const shouldShowVideo = Platform.OS === 'web' && (moment === 'video' || showVideo || Boolean(videoLayerStyle));
  const staticVideoSrc =
    Platform.OS === 'web'
      ? moment === 'video2'
        ? SCROLL_VIDEO_2_SRC
        : moment === 'video3'
          ? SCROLL_VIDEO_3_SRC
          : null
      : null;

  return (
    <View
      style={[
        styles.pinnedPhone,
        size === 'large' ? styles.pinnedPhoneLarge : size === 'ultra' ? styles.pinnedPhoneUltra : null,
        compact ? styles.pinnedPhoneMobile : null,
      ]}
    >
      <View style={styles.pinnedScreenHole}>
        <Image source={PHONE_SCREEN} style={styles.phoneScreenImage} resizeMode="cover" />
        {shouldShowVideo ? (
          <Animated.View style={[styles.pinnedVideoLayer, videoLayerStyle]}>
            {createElement('video', {
              src: SCROLL_VIDEO_1_SRC,
              autoPlay: true,
              loop: true,
              muted: true,
              playsInline: true,
              preload: 'auto',
              // Garantiza muted+play (sin muted no hay autoplay en el navegador).
              ref: (el: any) => {
                if (el) {
                  el.muted = true;
                  const p = el.play && el.play();
                  if (p && p.catch) p.catch(() => {});
                }
              },
              // El video viene en proporción de pantalla. Lo encajamos apenas más corto
              // para que el marco inferior del iPhone no tape los controles del video.
              style: {
                width: '100%',
                height: '97.25%',
                objectFit: 'contain',
                objectPosition: 'center top',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#F7FAFA',
              },
            })}
          </Animated.View>
        ) : null}
        {staticVideoSrc ? (
          <View style={styles.pinnedVideoLayer}>
            {createElement('video', {
              src: staticVideoSrc,
              autoPlay: true,
              loop: true,
              muted: true,
              playsInline: true,
              preload: 'auto',
              ref: (el: any) => {
                if (el) {
                  el.muted = true;
                  const p = el.play && el.play();
                  if (p && p.catch) p.catch(() => {});
                }
              },
              style: {
                width: '100%',
                height: '97.25%',
                objectFit: 'contain',
                objectPosition: 'center top',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#F7FAFA',
              },
            })}
          </View>
        ) : null}
        {/* Parte 2 del scroll: mismo tratamiento que el video 1, aparece durante el beat 2. */}
        {video2LayerStyle && Platform.OS === 'web' ? (
          <Animated.View style={[styles.pinnedVideoLayer, video2LayerStyle]}>
            {createElement('video', {
              src: SCROLL_VIDEO_2_SRC,
              autoPlay: true,
              loop: true,
              muted: true,
              playsInline: true,
              preload: 'auto',
              ref: (el: any) => {
                if (el) {
                  el.muted = true;
                  const p = el.play && el.play();
                  if (p && p.catch) p.catch(() => {});
                }
              },
              style: {
                width: '100%',
                height: '97.25%',
                objectFit: 'contain',
                objectPosition: 'center top',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#F7FAFA',
              },
            })}
          </Animated.View>
        ) : null}
        {/* Parte 3 del scroll: video Live/bolsillo. Mismo tratamiento, aparece en el beat 3. */}
        {video3LayerStyle && Platform.OS === 'web' ? (
          <Animated.View style={[styles.pinnedVideoLayer, video3LayerStyle]}>
            {createElement('video', {
              src: SCROLL_VIDEO_3_SRC,
              autoPlay: true,
              loop: true,
              muted: true,
              playsInline: true,
              preload: 'auto',
              ref: (el: any) => {
                if (el) {
                  el.muted = true;
                  const p = el.play && el.play();
                  if (p && p.catch) p.catch(() => {});
                }
              },
              style: {
                width: '100%',
                height: '97.25%',
                objectFit: 'contain',
                objectPosition: 'center top',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#F7FAFA',
              },
            })}
          </Animated.View>
        ) : null}
        {moment === 'touch' ? <PhoneTouchMoment /> : null}
        {moment === 'lyrics' ? <PhoneLyricsMoment /> : null}
      </View>
      <Image source={IPHONE_FRAME} style={styles.phoneFrameImg} resizeMode="contain" />
    </View>
  );
}

function PhoneTouchMoment() {
  return (
    <View style={styles.phoneTouchLayer}>
      <View style={styles.phoneMomentBadge}>
        <Ionicons name="finger-print-outline" size={14} color={INK} />
        <Text color={INK} weight="800" style={styles.phoneMomentBadgeText}>
          TOUCH PROFILE
        </Text>
      </View>

      <View style={styles.touchCard}>
        <Text color={INK} weight="800" style={styles.touchTitle}>
          Calibrate the feel
        </Text>
        {[
          ['Voice', 0.68],
          ['Drums', 0.82],
          ['Chorus', 0.94],
        ].map(([label, value]) => (
          <View key={label as string} style={styles.touchRow}>
            <Text color={MUTED} weight="700" style={styles.touchLabel}>
              {label as string}
            </Text>
            <View style={styles.touchTrack}>
              <View style={[styles.touchFill, { width: `${Math.round((value as number) * 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.touchFooterPill}>
        <View style={styles.captionDot} />
        <Text color={INK} weight="800" style={styles.touchFooterText}>
          semantic haptics
        </Text>
      </View>
    </View>
  );
}

function PhoneLyricsMoment() {
  return (
    <View style={styles.phoneLyricsLayer}>
      <View style={styles.lyricsTopRow}>
        <Text color="rgba(255,253,247,0.52)" weight="800" style={styles.lyricsKicker}>
          NOW PLAYING
        </Text>
        <Ionicons name="radio-outline" size={16} color="rgba(255,253,247,0.72)" />
      </View>
      <View style={styles.lyricsCenter}>
        <Text color={PAPER} weight="800" style={styles.lyricsMainLine}>
          Hold the line
        </Text>
        <Text color="rgba(255,253,247,0.48)" weight="600" style={styles.lyricsNextLine}>
          next lyric in 4 beats
        </Text>
      </View>
      <View style={styles.lyricsSignal}>
        {[0.34, 0.62, 0.82, 0.48, 0.96, 0.58].map((height, index) => (
          <View key={index} style={[styles.lyricsSignalBar, { height: 12 + height * 50 }]} />
        ))}
      </View>
      <View style={styles.lyricsRail}>
        <View style={styles.lyricsRailFill} />
        <View style={styles.lyricsRailDot} />
      </View>
    </View>
  );
}

function PinnedPhoneSection({
  scrollY,
  pinTop,
  isWide,
  isTablet,
}: {
  scrollY: { value: number };
  pinTop: { value: number };
  isWide: boolean;
  isTablet: boolean;
}) {
  const { height, width } = useResponsive();
  const wide = width >= 1120;
  const canvas = landingCanvasForWidth(width);
  const vh = height;
  const sectionH = vh * (canvas === 'regular' ? 2.3 : 2.12);
  const range = sectionH - vh;
  // El texto no va centrado: lo subimos al tercio superior del viewport.
  const beatPadTop = Math.max(96, Math.round(vh * (canvas === 'regular' ? 0.18 : 0.13)));
  const pinMaxWidth = canvas === 'ultra' ? 2180 : canvas === 'large' ? 1560 : 1240;
  const progressRight = canvas === 'regular' ? 30 : Math.max(42, (width - pinMaxWidth) / 2 + 34);
  const pinnedPhoneSize = canvas === 'ultra' ? 'ultra' : canvas === 'large' ? 'large' : 'regular';

  // El video corre solo (autoplay+loop). Se ve durante la parte 1 y se desvanece
  // hacia el screenshot en las partes 2/3.
  const videoLayerStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0, 0.02, 0.342, 0.412], [1, 1, 1, 0], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    return { opacity: o };
  });
  // El espacio de scroll de cada parte es PROPORCIONAL a la duración real de su video
  // (15s / 10s / 14.8s → 37.7% / 25.1% / 37.2%). Crossfades en los bordes 0.377 y 0.628.
  const video2LayerStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.342, 0.412, 0.593, 0.663], [0, 1, 1, 0], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    return { opacity: o };
  });
  const video3LayerStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.593, 0.663, 1], [0, 1, 1], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    return { opacity: o };
  });

  // `ease` = smoothstep. Parte 1: el TÍTULO aparece primero; el CUERPO al seguir bajando.
  const beat1Style = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0, 0.02, 0.32, 0.39], [1, 1, 1, 0], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    const ty = interpolate(p, [0.32, 0.39], [0, 24], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateY: ty }] };
  });
  const beat1BodyStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.08, 0.18], [0, 1], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    const ty = interpolate(p, [0.08, 0.18], [10, 0], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateY: ty }] };
  });
  const beat2Style = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.4, 0.46, 0.56, 0.62], [0, 1, 1, 0], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    const ty = interpolate(p, [0.4, 0.46, 0.56, 0.62], [24, 0, 0, -24], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateY: ty }] };
  });
  const beat3Style = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.65, 0.72, 1], [0, 1, 1], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    const ty = interpolate(p, [0.65, 0.72], [24, 0], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateY: ty }] };
  });
  // Copy "en tu bolsillo" (parte 3): aparece al COSTADO un poco después del beat 3.
  const pocketSideStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    let o = interpolate(p, [0.74, 0.8, 1], [0, 1, 1], Extrapolation.CLAMP);
    o = o * o * (3 - 2 * o);
    const ty = interpolate(p, [0.74, 0.8], [18, 0], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateY: ty }] };
  });
  // Indicador de progreso del scroll (pegado a la derecha, solo visible en esta sección).
  const trackH = Math.round(Math.min(340, Math.max(200, vh * 0.42)));
  const progressFillStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    return { height: p * trackH };
  });
  const progressThumbStyle = useAnimatedStyle(() => {
    const p = range > 0 ? Math.min(Math.max((scrollY.value - pinTop.value) / range, 0), 1) : 0;
    return { transform: [{ translateY: p * (trackH - 12) }] };
  });

  if (!wide) {
    return (
      <View
        style={[styles.pinMobile, isTablet ? styles.pinMobileTablet : null]}
        onLayout={(e) => {
          pinTop.value = e.nativeEvent.layout.y;
        }}
      >
        {MOBILE_SCROLL_MOMENTS.map((moment) => (
          <View key={moment.label} style={[styles.mobileScrollMoment, isTablet ? styles.mobileScrollMomentTablet : null]}>
            <View style={styles.mobileMomentPhoneWrap}>
              <PinnedPhone compact moment={moment.phone} />
              <View style={styles.mobileMomentNumber}>
                <Text color={PAPER} weight="800" style={styles.mobileMomentNumberText}>
                  {moment.label}
                </Text>
              </View>
            </View>
            <View style={styles.mobileMomentCopy}>
              <Text color={MUTED} weight="800" style={styles.mobileMomentKicker}>
                {moment.kicker}
              </Text>
              <Text color={INK} weight="800" style={styles.beatTitleMobile}>
                {moment.title}
              </Text>
              <Text color={MUTED} weight="500" style={styles.beatBodyMobile}>
                {moment.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={[styles.pinSection, { height: sectionH }]}
      onLayout={(e) => {
        pinTop.value = e.nativeEvent.layout.y;
      }}
    >
      {/* Puntos de snap (web): el scroll "descansa" en cada parte (1/2/3) con resistencia
          suave (proximity), así no te pasás de largo por accidente. Coinciden con el nav. */}
      {Platform.OS === 'web'
        ? [0.19, 0.5, 0.81].map((p, i) =>
            createElement('div', {
              key: `snap-${i}`,
              style: {
                position: 'absolute',
                top: Math.round(p * range),
                left: 0,
                width: 1,
                height: 1,
                pointerEvents: 'none',
                scrollSnapAlign: 'start',
              },
            }),
          )
        : null}
      <View style={[styles.pinSticky, STICKY, { height: vh }]}>
        <View
          style={[
            styles.pinRow,
            canvas === 'large' ? styles.pinRowLarge : canvas === 'ultra' ? styles.pinRowUltra : null,
          ]}
        >
          <View style={styles.pinCol}>
            <Animated.View
              style={[
                styles.colLeft,
                canvas === 'large' ? styles.colWideLarge : canvas === 'ultra' ? styles.colWideUltra : null,
                { paddingTop: beatPadTop },
                beat1Style,
              ]}
            >
              <Text
                color={INK}
                weight="800"
                style={StyleSheet.flatten([
                  styles.beatTitle,
                  canvas === 'large' ? styles.beatTitleLarge : canvas === 'ultra' ? styles.beatTitleUltra : null,
                ])}
              >
                {BEATS[0].title}
              </Text>
              <Animated.View style={beat1BodyStyle}>
                <Text
                  color={MUTED}
                  weight="500"
                  style={StyleSheet.flatten([
                    styles.beatBody,
                    canvas === 'large' ? styles.beatBodyLarge : canvas === 'ultra' ? styles.beatBodyUltra : null,
                  ])}
                >
                  {BEATS[0].body}
                </Text>
              </Animated.View>
            </Animated.View>
            <Animated.View
              style={[
                styles.colLeft,
                canvas === 'large' ? styles.colWideLarge : canvas === 'ultra' ? styles.colWideUltra : null,
                { paddingTop: beatPadTop },
                beat3Style,
              ]}
            >
              <Beat title={BEATS[2].title} body={BEATS[2].body} size={canvas} />
            </Animated.View>
          </View>
          <PinnedPhone
            size={pinnedPhoneSize}
            videoLayerStyle={videoLayerStyle}
            video2LayerStyle={video2LayerStyle}
            video3LayerStyle={video3LayerStyle}
          />
          <View style={styles.pinCol}>
            <Animated.View
              style={[
                styles.colRight,
                canvas === 'large' ? styles.colWideLarge : canvas === 'ultra' ? styles.colWideUltra : null,
                { paddingTop: beatPadTop },
                beat2Style,
              ]}
            >
              <Beat title={BEATS[1].title} body={BEATS[1].body} size={canvas} />
            </Animated.View>
            {/* Parte 3: aparece al costado un poco después del beat 3 (cel en el bolsillo). */}
            <Animated.View
              style={[
                styles.colRight,
                canvas === 'large' ? styles.colWideLarge : canvas === 'ultra' ? styles.colWideUltra : null,
                { paddingTop: beatPadTop },
                pocketSideStyle,
              ]}
            >
              <Beat
                title="Even in your pocket"
                body="Screen off, phone away — the haptics keep playing in sync, so you never stop feeling the music."
                size={canvas}
              />
            </Animated.View>
          </View>
        </View>
        <View style={[styles.scrollIndic, { right: progressRight }]} pointerEvents="none">
          <View style={[styles.scrollTrack, { height: trackH }]}>
            <Animated.View style={[styles.scrollFill, progressFillStyle]} />
            {[0.19, 0.5, 0.81].map((f, i) => (
              <View key={i} style={[styles.scrollDot, { top: `${f * 100}%` }]} />
            ))}
            <Animated.View style={[styles.scrollThumb, progressThumbStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   Big horizontal cards (Apple-style)
   ========================================================= */
const CARDS: {
  title: string;
  body: string;
  dark: boolean;
  video?: boolean;
  image?: ImageSourcePropType;
  imageVeil?: 'soft-dark' | 'signal-dark';
}[] = [
  {
    title: 'From lyrics to touch',
    body: 'It turns the lyric timing and the song’s structure into a score of captions and touch.',
    dark: false,
    video: true,
  },
  {
    title: 'A language you can learn',
    body: 'Every pattern means something — a voice, the drums, the chorus. A built-in legend teaches the vocabulary.',
    dark: true,
    image: CARD_LANGUAGE_IMAGE,
  },
  {
    title: 'Live, in the moment',
    body: 'At a concert, MUSA follows the show in real time, turning the music on stage into captions and touch in your hands.',
    dark: true,
    image: CARD_LIVE_IMAGE,
    imageVeil: 'soft-dark',
  },
  {
    title: 'Just your phone',
    body: 'No wristband, no extra hardware — MUSA uses the vibration motor your phone already has.',
    dark: true,
    image: CARD_PHONE_IMAGE,
    imageVeil: 'soft-dark',
  },
  {
    title: 'Any song you love',
    body: 'Search a track and MUSA builds its sensory score on the spot — your music, ready to read and feel.',
    dark: true,
    image: CARD_ANY_SONG_IMAGE,
    imageVeil: 'signal-dark',
  },
];

// Velocidad del auto-scroll en px/seg (constante en cualquier ancho). Más bajo = más lento.
const MARQUEE_SPEED = 24;

// El video va servido desde public/ (URL raíz). En web renderizamos un <video> nativo
// (loop, muted, autoplay); en nativo cae a un panel oscuro de respaldo.
const CARD1_VIDEO_SRC = '/musa-card-1.mp4';

function CardVideo() {
  if (Platform.OS !== 'web') {
    return <View style={styles.cardVideoFallback} />;
  }
  return createElement('video', {
    src: CARD1_VIDEO_SRC,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    // Garantiza muted+play (React a veces no aplica el atributo muted, y sin muted no hay autoplay).
    ref: (el: any) => {
      if (el) {
        el.muted = true;
        el.playbackRate = 0.7; // 30% más lento
        const p = el.play && el.play();
        if (p && p.catch) p.catch(() => {});
      }
    },
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      backgroundColor: '#0E1726',
    },
  });
}

function CardsSection({ isWide }: { isWide: boolean; isTablet: boolean }) {
  const { width } = useResponsive();
  const canvas = landingCanvasForWidth(width);
  const wide = isWide;
  const contentMax = canvas === 'ultra' ? 2180 : canvas === 'large' ? 1560 : 1160;
  const sidePad = Math.max(24, (width - contentMax) / 2);
  const cardW = wide ? (canvas === 'ultra' ? 500 : canvas === 'large' ? 440 : 420) : Math.min(342, width - sidePad * 2);
  const gap = 16;
  // Ancho de UNA tanda completa de cards (incluye el gap entre cada una).
  const setW = CARDS.length * (cardW + gap);
  const x = useSharedValue(0);
  const dragging = useSharedValue(false);

  // Auto-scroll continuo por frame: avanza a MARQUEE_SPEED px/seg y "envuelve" en (-setW, 0]
  // para loop infinito sin saltos. Mientras se arrastra (dragging), no avanza solo.
  useFrameCallback((frame) => {
    if (dragging.value) return;
    const dt = Math.min(frame.timeSincePreviousFrame ?? 16, 64) / 1000;
    let nx = x.value - MARQUEE_SPEED * dt;
    if (nx <= -setW) nx += setW;
    x.value = nx;
  });

  // Arrastre con mouse/touch. activeOffsetX => solo agarra en gestos horizontales;
  // failOffsetY => deja pasar el scroll vertical de la página. Al soltar, vuelve a andar solo.
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-14, 14])
    .onStart(() => {
      dragging.value = true;
    })
    .onChange((e) => {
      let nx = (x.value + e.changeX) % setW;
      if (nx > 0) nx -= setW;
      x.value = nx;
    })
    .onFinalize(() => {
      dragging.value = false;
    });

  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const renderCard = (c: typeof CARDS[number], i: number, key: string | number) => {
    const num = `0${(i % CARDS.length) + 1}`;
    if (c.video) {
      return (
        <View
          key={key}
          style={[
            styles.bigCard,
            wide ? null : styles.bigCardMobile,
            styles.bigCardVideoCard,
            { width: cardW },
          ]}
        >
          <View style={styles.bigCardVideoLayer}>
            <CardVideo />
          </View>
          <View style={styles.bigCardVideoVeil} />
          <View style={[styles.bigCardVideoBody, wide ? null : styles.bigCardVideoBodyMobile]}>
            <Text color="rgba(255,253,247,0.7)" weight="700" style={styles.bigCardNum}>
              {num}
            </Text>
            <View style={{ gap: 12 }}>
              <Text color={PAPER} weight="800" style={wide ? styles.bigCardTitle : styles.bigCardTitleMobile}>
                {c.title}
              </Text>
              <Text color="rgba(255,253,247,0.76)" weight="500" style={wide ? styles.bigCardBody : styles.bigCardBodyMobile}>
                {c.body}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    if (c.image) {
      return (
        <ImageBackground
          key={key}
          source={c.image}
          resizeMode="cover"
          style={[
            styles.bigCard,
            wide ? null : styles.bigCardMobile,
            styles.bigCardImageCard,
            { width: cardW },
          ]}
          imageStyle={styles.bigCardImage}
        >
          {c.imageVeil === 'signal-dark' ? (
            <View style={styles.bigCardImageSignalVeil} />
          ) : (
            <View
              style={
                c.imageVeil === 'soft-dark'
                  ? styles.bigCardImageSoftVeil
                  : c.dark
                    ? styles.bigCardImageVeil
                    : styles.bigCardImageLightVeil
              }
            />
          )}
          <Text color={c.dark ? 'rgba(255,253,247,0.68)' : 'rgba(14,23,38,0.68)'} weight="700" style={styles.bigCardNum}>
            {num}
          </Text>
          <View style={{ gap: 12 }}>
            <Text color={c.dark ? PAPER : INK} weight="800" style={wide ? styles.bigCardTitle : styles.bigCardTitleMobile}>
              {c.title}
            </Text>
            <Text color={c.dark ? 'rgba(255,253,247,0.76)' : MUTED} weight="500" style={wide ? styles.bigCardBody : styles.bigCardBodyMobile}>
              {c.body}
            </Text>
          </View>
        </ImageBackground>
      );
    }
    return (
      <View
        key={key}
        style={[
          styles.bigCard,
          wide ? null : styles.bigCardMobile,
          c.dark ? styles.bigCardDark : null,
          { width: cardW },
        ]}
      >
        <Text color={c.dark ? 'rgba(255,255,255,0.5)' : MUTED} weight="700" style={styles.bigCardNum}>
          {num}
        </Text>
        <View style={{ gap: 12 }}>
          <Text color={c.dark ? PAPER : INK} weight="800" style={wide ? styles.bigCardTitle : styles.bigCardTitleMobile}>
            {c.title}
          </Text>
          <Text color={c.dark ? 'rgba(255,255,255,0.7)' : MUTED} weight="500" style={wide ? styles.bigCardBody : styles.bigCardBodyMobile}>
            {c.body}
          </Text>
        </View>
      </View>
    );
  };

  if (!wide) {
    return (
      <View style={[styles.cardsSection, styles.cardsSectionMobile]}>
        <View style={[styles.cardsHead, { paddingHorizontal: sidePad }]}>
          <Text color={MUTED} weight="700" style={styles.cardsKicker}>
            WHY MUSA
          </Text>
          <Text color={INK} weight="800" style={styles.cardsTitleMobile}>
            Built so a song reaches everyone.
          </Text>
        </View>
        <View style={[styles.mobileCardsStack, { paddingHorizontal: sidePad }]}>
          {CARDS.map((c, i) => renderCard(c, i, c.title))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardsSection}>
      <View style={[styles.cardsHead, { paddingHorizontal: sidePad }]}>
        <Text color={MUTED} weight="700" style={styles.cardsKicker}>
          WHY MUSA
        </Text>
        <Text
          color={INK}
          weight="800"
          style={wide ? styles.cardsTitle : styles.cardsTitleMobile}
        >
          Built so a song reaches everyone.
        </Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          style={[
            styles.marqueeViewport,
            canvas === 'large' ? styles.marqueeViewportLarge : canvas === 'ultra' ? styles.marqueeViewportUltra : null,
          ]}
      >
          <Animated.View style={[styles.marqueeTrack, { paddingLeft: gap, gap }, trackStyle]}>
            {[...CARDS, ...CARDS].map((c, i) => renderCard(c, i, i))}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FBFDFD',
  },
  scroll: {
    minHeight: '100%',
    backgroundColor: '#FBFDFD',
  },
  bootLoader: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: '#FBFDFD',
  },
  bootLoaderBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F7F4',
  },
  bootLoaderVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bootLoaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    transform: [{ translateY: -10 }],
  },
  bootLoaderLogo: {
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: 1.2,
  },
  bootLoaderPulse: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
  },
  bootLoaderBar: {
    width: 8,
    borderRadius: 999,
    backgroundColor: '#0E1425',
  },
  shell: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  shellLarge: {
    maxWidth: 1560,
    paddingHorizontal: 36,
  },
  shellUltra: {
    maxWidth: 2180,
    paddingHorizontal: 44,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    pointerEvents: 'box-none',
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(14,23,38,0)',
  },
  heroFrame: {
    width: '100%',
    minHeight: 720,
    overflow: 'hidden',
    backgroundColor: '#E8F7F4',
  },
  heroFrameTablet: {
    minHeight: 760,
  },
  heroFrameMobile: {
    minHeight: 820,
  },
  heroFrameImage: {
    opacity: 1,
    width: '100%',
    height: '100%',
  },
  heroVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  heroFrameInner: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 34,
  },
  heroFrameInnerTablet: {
    paddingBottom: 34,
  },
  heroFrameInnerMobile: {
    paddingBottom: 24,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  logo: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  navText: {
    fontSize: 14.5,
    lineHeight: 18,
  },
  headerCta: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1425',
  },
  headerCtaText: {
    fontSize: 14,
    lineHeight: 17,
  },
  hero: {
    minHeight: 600,
    overflow: 'visible',
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 48,
    gap: 38,
  },
  heroWideLarge: {
    gap: 78,
  },
  heroWideUltra: {
    gap: 96,
  },
  heroTablet: {
    minHeight: 590,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 46,
    gap: 24,
  },
  heroMobile: {
    minHeight: 0,
    paddingTop: 30,
    paddingBottom: 44,
    gap: 26,
  },
  heroCopyColumn: {
    zIndex: 2,
    gap: 22,
  },
  heroCopyWide: {
    flex: 0.95,
    maxWidth: 560,
  },
  heroCopyWideUltra: {
    maxWidth: 720,
  },
  heroCopyTablet: {
    flex: 1,
    maxWidth: 430,
  },
  heroTitle: {
    fontSize: 76,
    lineHeight: 78,
    letterSpacing: -2.2,
  },
  heroTitleUltra: {
    fontSize: 92,
    lineHeight: 95,
  },
  heroTitleTablet: {
    fontSize: 52,
    lineHeight: 55,
    letterSpacing: -1.4,
  },
  heroTitleMobile: {
    fontSize: 43,
    lineHeight: 46,
    letterSpacing: -1.1,
  },
  heroBody: {
    maxWidth: 500,
    fontSize: 19,
    lineHeight: 29,
  },
  heroBodyUltra: {
    maxWidth: 640,
    fontSize: 22,
    lineHeight: 34,
  },
  heroBodyTablet: {
    maxWidth: 430,
    fontSize: 17,
    lineHeight: 26,
  },
  heroBodyMobile: {
    fontSize: 17,
    lineHeight: 25,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  ctaRowMobile: {
    alignItems: 'stretch',
  },
  primaryCta: {
    minHeight: 54,
    borderRadius: 999,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#0E1425',
  },
  primaryCtaUltra: {
    minHeight: 60,
    paddingHorizontal: 28,
  },
  ctaText: {
    fontSize: 15,
    lineHeight: 18,
  },
  ctaTextUltra: {
    fontSize: 16.5,
    lineHeight: 20,
  },
  heroSponsors: {
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 26,
  },
  heroSponsorsMobile: {
    gap: 9,
    marginTop: 22,
  },
  sponsorLabel: {
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
    marginRight: 3,
  },
  sponsorLabelUltra: {
    fontSize: 14,
    lineHeight: 17,
  },
  sponsorLabelMobile: {
    fontSize: 11.5,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginRight: 3,
  },
  sponsorName: {
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  sponsorNameUltra: {
    fontSize: 18.5,
    lineHeight: 23,
  },
  sponsorNameMobile: {
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  sponsorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(14,23,38,0.42)',
  },
  phoneStage: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneStageWide: {
    flex: 1.05,
    minHeight: 620,
  },
  phoneStageTablet: {
    flex: 0.84,
    minHeight: 540,
  },
  waveField: {
    position: 'absolute',
    width: '118%',
    height: '118%',
    pointerEvents: 'none',
  },
  phoneShadow: {
    alignItems: 'center',
    gap: 20,
    transform: [{ rotate: '-4deg' }],
  },
  phoneShadowCompact: {
    transform: [{ rotate: '-2deg' }],
  },
  phone: {
    width: 256,
    height: 503,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#0B0B0D',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#0A1020',
    shadowOpacity: 0.36,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 30 },
  },
  phoneCompact: {
    width: 220,
    height: 432,
    borderRadius: 44,
    padding: 9,
  },
  phoneBtnPower: {
    position: 'absolute',
    right: -3,
    top: 148,
    width: 3,
    height: 72,
    borderRadius: 3,
    backgroundColor: '#08080A',
  },
  phoneBtnVolUp: {
    position: 'absolute',
    left: -3,
    top: 130,
    width: 3,
    height: 46,
    borderRadius: 3,
    backgroundColor: '#08080A',
  },
  phoneBtnVolDown: {
    position: 'absolute',
    left: -3,
    top: 186,
    width: 3,
    height: 46,
    borderRadius: 3,
    backgroundColor: '#08080A',
  },
  phoneBtnMute: {
    position: 'absolute',
    left: -3,
    top: 98,
    width: 3,
    height: 26,
    borderRadius: 3,
    backgroundColor: '#08080A',
  },
  phoneScreen: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 42,
    backgroundColor: '#050506',
  },
  phoneScreenImage: {
    width: '100%',
    height: '100%',
  },
  heroPhoneScreenHole: {
    borderRadius: 32,
    backgroundColor: '#F7FAFA',
  },
  phoneFrameWrap: {
    width: 248,
    aspectRatio: 636 / 1312,
    borderRadius: 39,
    position: 'relative',
    shadowColor: '#0A1020',
    shadowOpacity: 0.3,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 26 },
  },
  phoneFrameWrapCompact: {
    width: 210,
    borderRadius: 40,
  },
  phoneFrameWrapLarge: {
    width: 286,
  },
  phoneFrameWrapUltra: {
    width: 392,
  },
  // Latido de música (hero). Detrás del marco; emanan hacia afuera al escalar.
  beatRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(49,91,255,0.18)',
  },
  beatGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 42,
    backgroundColor: 'rgba(49,91,255,0.012)',
    shadowColor: BLUE,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  phoneScreenHole: {
    position: 'absolute',
    top: '1.68%',
    left: '4.09%',
    width: '91.82%',
    height: '96.65%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  phoneFrameImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  phoneIsland: {
    position: 'absolute',
    zIndex: 4,
    top: 14,
    alignSelf: 'center',
    width: 92,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
  },
  phoneIslandCam: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#101A22',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120,160,200,0.4)',
  },
  phoneTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneTitle: {
    fontSize: 15,
    lineHeight: 18,
  },
  lyricStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  phoneContext: {
    fontSize: 13,
    lineHeight: 18,
  },
  phoneLyric: {
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.4,
  },
  phoneSignal: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 22,
  },
  signalBar: {
    width: 8,
    borderRadius: 5,
    backgroundColor: PAPER,
  },
  phoneTimeline: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  phoneTimelineFill: {
    width: '54%',
    height: 3,
    borderRadius: 2,
    backgroundColor: PAPER,
  },
  phoneTimelineDot: {
    position: 'absolute',
    left: '54%',
    top: -4,
    width: 11,
    height: 11,
    marginLeft: -5,
    borderRadius: 6,
    backgroundColor: PAPER,
  },
  phoneControls: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  phonePlay: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAPER,
  },
  phoneCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  captionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: MINT,
  },
  captionLive: {
    fontSize: 11.5,
    lineHeight: 14,
    letterSpacing: 1.8,
  },
  captionDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(14,23,38,0.2)',
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 16,
  },
  featureBand: {
    flexDirection: 'row',
    gap: 0,
    paddingTop: 42,
    paddingBottom: 18,
  },
  featureBandTablet: {
    paddingTop: 36,
    paddingBottom: 8,
  },
  featureBandMobile: {
    flexDirection: 'column',
  },
  featureItem: {
    flex: 1,
    minHeight: 204,
    paddingHorizontal: 30,
    paddingVertical: 22,
    gap: 13,
    backgroundColor: 'transparent',
  },
  featureItemTablet: {
    minHeight: 214,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  featureDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: LINE,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LINE,
  },
  featureTitle: {
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.4,
  },
  featureCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  miniStrip: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingTop: 10,
  },
  miniBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: INK,
    opacity: 0.22,
  },
  storyBand: {
    width: '100%',
    marginTop: 54,
    backgroundColor: '#F3FAF8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.08)',
  },
  story: {
    minHeight: 620,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 52,
    paddingTop: 72,
    paddingBottom: 72,
  },
  storyTablet: {
    minHeight: 600,
    gap: 28,
    paddingTop: 60,
    paddingBottom: 60,
  },
  storyMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 30,
    paddingTop: 52,
    paddingBottom: 52,
  },
  storyCopy: {
    gap: 24,
  },
  storyCopyWide: {
    flex: 0.98,
  },
  storyCopyTablet: {
    flex: 0.92,
  },
  storyCopyMobile: {
    width: '100%',
  },
  sectionTitle: {
    maxWidth: 560,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: -1.6,
  },
  sectionTitleTablet: {
    maxWidth: 420,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
  },
  sectionTitleMobile: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  sectionBody: {
    maxWidth: 580,
    fontSize: 18,
    lineHeight: 28,
  },
  sectionBodyTablet: {
    maxWidth: 430,
    fontSize: 16,
    lineHeight: 25,
  },
  translationSteps: {
    gap: 12,
  },
  translationStep: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.08)',
  },
  translationStepIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.08)',
  },
  translationStepTitle: {
    fontSize: 17,
    lineHeight: 21,
  },
  translationStepCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  translationPreview: {
    minHeight: 456,
    gap: 18,
    padding: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.1)',
  },
  translationPreviewWide: {
    flex: 1.02,
  },
  translationPreviewTablet: {
    flex: 1,
    minHeight: 500,
    padding: 20,
  },
  translationPreviewMobile: {
    width: '100%',
    minHeight: 560,
    padding: 22,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  translationHeaderMobile: {
    alignItems: 'flex-start',
  },
  translationTitle: {
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.4,
  },
  translationSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  translationStatus: {
    minHeight: 34,
    minWidth: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.08)',
  },
  currentLineCard: {
    gap: 8,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#0B0B0D',
  },
  currentLineLabel: {
    fontSize: 12,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentLineText: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  layerStack: {
    gap: 10,
  },
  translationLane: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,22,21,0.08)',
  },
  translationLaneText: {
    width: 94,
    gap: 3,
  },
  translationLaneLabel: {
    fontSize: 15,
    lineHeight: 18,
  },
  translationLaneValue: {
    fontSize: 12,
    lineHeight: 16,
  },
  translationBars: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
  },
  translationBar: {
    width: 10,
    borderRadius: 6,
  },
  translationLaneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  translationFooter: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(23,22,21,0.1)',
  },
  translationFooterText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footerBand: {
    width: '100%',
    marginTop: 0,
    minHeight: 620,
    overflow: 'hidden',
    backgroundColor: '#E8F7F4',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(14,23,38,0.08)',
  },
  footerBackgroundImage: {
    opacity: 0.55,
  },
  footerSoftVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    pointerEvents: 'none',
  },
  finalFooter: {
    gap: 44,
    position: 'relative',
    zIndex: 1,
  },
  finalFooterMobile: {
    gap: 28,
  },
  footerMegaBrand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -44,
    zIndex: 0,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 198,
    lineHeight: 202,
    letterSpacing: -4,
    textAlign: 'center',
  },
  footerMegaBrandTablet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -34,
    zIndex: 0,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 146,
    lineHeight: 150,
    letterSpacing: -3,
    textAlign: 'center',
  },
  footerMegaBrandMobile: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -22,
    zIndex: 0,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 88,
    lineHeight: 92,
    letterSpacing: -2,
    textAlign: 'center',
  },
  footerContentGrid: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 56,
  },
  footerContentGridMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 34,
  },
  footerIntro: {
    flex: 1,
    maxWidth: 620,
    gap: 16,
  },
  footerSmallBrand: {
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 2,
  },
  footerMinimalTitle: {
    maxWidth: 620,
    fontSize: 50,
    lineHeight: 54,
    letterSpacing: -1.4,
  },
  footerMinimalTitleTablet: {
    maxWidth: 420,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1,
  },
  footerMinimalTitleMobile: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  footerMinimalText: {
    maxWidth: 540,
    fontSize: 18,
    lineHeight: 28,
  },
  footerMinimalTextTablet: {
    maxWidth: 440,
    fontSize: 16,
    lineHeight: 25,
  },
  footerBuiltByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  footerBuiltBy: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  footerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  finalActionsMobile: {
    alignItems: 'stretch',
  },
  footerStatusText: {
    fontSize: 12,
    lineHeight: 15,
  },
  translatingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
  scoreTracks: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 2,
  },
  scoreLabels: {
    width: 104,
  },
  trackLabelRow: {
    height: 56,
    justifyContent: 'center',
    gap: 2,
  },
  trackLabelText: {
    fontSize: 15,
    lineHeight: 18,
  },
  trackLabelSub: {
    fontSize: 12,
    lineHeight: 15,
  },
  scoreStrips: {
    flex: 1,
    position: 'relative',
  },
  scoreStrip: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(23,22,21,0.07)',
  },
  scoreTick: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: INK,
  },
  scoreRiseBar: {
    width: 7,
    borderRadius: 3,
    backgroundColor: MUTED,
  },
  scorePulse: {
    borderRadius: 12,
    backgroundColor: BLUE,
  },
  playhead: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: '62%',
    width: 2,
    borderRadius: 2,
    backgroundColor: BLUE,
    opacity: 0.5,
  },
  playheadDot: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
  },
  footerNavColumn: {
    zIndex: 1,
    minWidth: 210,
    gap: 18,
    alignItems: 'flex-start',
  },
  footerNavLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 4,
  },
  footerBottom: {
    zIndex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  footerBottomMobile: {
    minHeight: 96,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
  },
  footerFinePrint: {
    maxWidth: 520,
    fontSize: 11.5,
    lineHeight: 18,
    letterSpacing: 1.6,
  },
  footerLinkText: {
    fontSize: 16,
    lineHeight: 21,
  },

  /* ---- Get-the-app modal ---- */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(6,8,12,0.66)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 908,
    flexDirection: 'row',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0C0E13',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 30 },
  },
  modalCardStacked: {
    maxWidth: 440,
    flexDirection: 'column',
  },
  modalClose: {
    position: 'absolute',
    zIndex: 5,
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalLeft: {
    flex: 1.2,
    padding: 46,
    gap: 20,
    justifyContent: 'center',
  },
  modalLeftStacked: {
    flex: 0,
    width: '100%',
    padding: 28,
    gap: 16,
  },
  modalEyebrow: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 2,
  },
  modalTitle: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  modalBody: {
    maxWidth: 430,
    fontSize: 15.5,
    lineHeight: 23,
  },
  modalSteps: {
    gap: 14,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  stepNumText: {
    fontSize: 13,
    lineHeight: 16,
  },
  stepTitle: {
    fontSize: 15,
    lineHeight: 19,
  },
  stepCopy: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  storeBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIcon: {
    width: 32,
    height: 32,
  },
  modalUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  modalUrlPill: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalUrlText: {
    flex: 1,
    fontSize: 14.5,
  },
  modalCopyBtn: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: PAPER,
  },
  modalCopyText: {
    fontSize: 14,
    lineHeight: 17,
  },
  modalStoresText: {
    marginTop: 2,
    fontSize: 12.5,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  modalRight: {
    width: 348,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  modalRightStacked: {
    width: '100%',
    borderLeftWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 24,
    paddingBottom: 28,
  },
  qrPanel: {
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 20,
    backgroundColor: PAPER,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,23,38,0.1)',
  },
  qrLabel: {
    fontSize: 11.5,
    lineHeight: 14,
    letterSpacing: 2,
  },
  qrBox: {
    width: 188,
    height: 188,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  qrImage: {
    width: 188,
    height: 188,
  },
  qrFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrFootText: {
    fontSize: 13,
    lineHeight: 16,
  },
  qrDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(14,23,38,0.5)',
  },

  /* ---- Pinned phone section ---- */
  pinSection: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  pinSticky: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    zIndex: 1,
  },
  pinnedPhone: {
    width: 310,
    aspectRatio: 636 / 1312,
    position: 'relative',
    // borderRadius para que el box-shadow siga la silueta redondeada del cel (no un rectángulo).
    borderRadius: 49,
    shadowColor: '#0A1020',
    shadowOpacity: 0.16,
    shadowRadius: 46,
    shadowOffset: { width: 0, height: 22 },
  },
  pinnedPhoneLarge: {
    width: 350,
    borderRadius: 55,
  },
  pinnedPhoneUltra: {
    width: 430,
    borderRadius: 68,
  },
  pinnedPhoneMobile: {
    width: 268,
    borderRadius: 43,
    shadowOpacity: 0.12,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
  },
  pinnedScreenHole: {
    position: 'absolute',
    top: '1.68%',
    left: '4.09%',
    width: '91.82%',
    height: '96.65%',
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#E8EEF2',
  },
  pinnedVideoLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#F7FAFA',
  },
  // Caption "en tu bolsillo" (parte 3). Flota sobre la parte baja de la pantalla.
  pocketCueWrap: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    bottom: '15%',
    alignItems: 'center',
    zIndex: 3,
  },
  pocketCue: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(10,16,32,0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#0A1020',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  pocketCueText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  phoneTouchLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    paddingHorizontal: 18,
    paddingTop: 78,
    paddingBottom: 30,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,250,250,0.9)',
  },
  phoneMomentBadge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,23,38,0.1)',
  },
  phoneMomentBadgeText: {
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 1.1,
  },
  touchCard: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,23,38,0.1)',
  },
  touchTitle: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  touchRow: {
    gap: 7,
  },
  touchLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  touchTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(14,23,38,0.1)',
  },
  touchFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: MINT,
  },
  touchFooterPill: {
    alignSelf: 'center',
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,23,38,0.08)',
  },
  touchFooterText: {
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  phoneLyricsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    paddingHorizontal: 22,
    paddingTop: 78,
    paddingBottom: 34,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5,8,13,0.9)',
  },
  lyricsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lyricsKicker: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.7,
  },
  lyricsCenter: {
    alignItems: 'center',
    gap: 12,
  },
  lyricsMainLine: {
    textAlign: 'center',
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.7,
  },
  lyricsNextLine: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
  },
  lyricsSignal: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  lyricsSignalBar: {
    width: 10,
    borderRadius: 999,
    backgroundColor: PAPER,
    opacity: 0.68,
  },
  lyricsRail: {
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,253,247,0.16)',
  },
  lyricsRailFill: {
    width: '58%',
    height: 3,
    borderRadius: 999,
    backgroundColor: PAPER,
  },
  lyricsRailDot: {
    position: 'absolute',
    left: '58%',
    top: -5,
    width: 13,
    height: 13,
    marginLeft: -6,
    borderRadius: 999,
    backgroundColor: PAPER,
  },
  pinRow: {
    width: '100%',
    maxWidth: 1240,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  pinRowLarge: {
    maxWidth: 1560,
    gap: 58,
  },
  pinRowUltra: {
    maxWidth: 2180,
    gap: 96,
  },
  pinCol: {
    flex: 1,
    alignSelf: 'stretch',
    position: 'relative',
  },
  colLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    maxWidth: 380,
    justifyContent: 'flex-start',
    gap: 18,
  },
  colRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    maxWidth: 380,
    justifyContent: 'flex-start',
    gap: 18,
  },
  colWideLarge: {
    maxWidth: 410,
  },
  colWideUltra: {
    maxWidth: 470,
  },
  beatTitle: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.6,
  },
  beatTitleLarge: {
    fontSize: 48,
    lineHeight: 52,
  },
  beatTitleUltra: {
    fontSize: 52,
    lineHeight: 56,
  },
  beatBody: {
    maxWidth: 380,
    fontSize: 18,
    lineHeight: 27,
  },
  beatBodyLarge: {
    maxWidth: 410,
    fontSize: 18.5,
    lineHeight: 28,
  },
  beatBodyUltra: {
    maxWidth: 460,
    fontSize: 20,
    lineHeight: 30,
  },
  beatTitleMobile: {
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  beatBodyMobile: {
    maxWidth: 430,
    fontSize: 15.5,
    lineHeight: 23,
  },
  pinMobile: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingTop: 76,
    paddingBottom: 52,
    gap: 18,
    alignItems: 'center',
  },
  pinMobileTablet: {
    paddingTop: 116,
  },
  mobileScrollMoment: {
    width: '100%',
    maxWidth: 460,
    minHeight: 820,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  mobileScrollMomentTablet: {
    minHeight: 900,
  },
  mobileMomentPhoneWrap: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 10,
  },
  mobileMomentNumber: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  mobileMomentNumberText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 1,
  },
  mobileMomentCopy: {
    width: '100%',
    gap: 10,
  },
  mobileMomentKicker: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  pinMobilePhone: {
    width: '100%',
    alignItems: 'center',
  },
  beatMobile: {
    width: '100%',
    maxWidth: 460,
    gap: 12,
  },
  scrollIndic: {
    position: 'absolute',
    right: 30,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  scrollTrack: {
    width: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(14,23,38,0.14)',
    position: 'relative',
  },
  scrollFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    borderRadius: 3,
    backgroundColor: INK,
  },
  scrollDot: {
    position: 'absolute',
    left: -2.5,
    width: 8,
    height: 8,
    marginTop: -4,
    borderRadius: 4,
    backgroundColor: PAPER,
    borderWidth: 1.5,
    borderColor: 'rgba(14,23,38,0.28)',
  },
  scrollThumb: {
    position: 'absolute',
    top: 0,
    left: -4.5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: INK,
    borderWidth: 2,
    borderColor: PAPER,
  },

  /* ---- Big horizontal cards ---- */
  cardsSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(14,23,38,0.07)',
  },
  cardsSectionMobile: {
    paddingTop: 52,
    paddingBottom: 54,
  },
  cardsHead: {
    width: '100%',
  },
  cardsKicker: {
    fontSize: 12.5,
    lineHeight: 15,
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  cardsTitle: {
    maxWidth: 620,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.6,
  },
  cardsTitleMobile: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  cardsScroll: {
    gap: 16,
    paddingTop: 36,
    paddingRight: 24,
  },
  marqueeViewport: {
    width: '100%',
    overflow: 'hidden',
    paddingTop: 36,
  },
  marqueeViewportLarge: {
    maxWidth: 1560,
    alignSelf: 'center',
  },
  marqueeViewportUltra: {
    maxWidth: 2180,
    alignSelf: 'center',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  mobileCardsStack: {
    width: '100%',
    paddingTop: 30,
    gap: 16,
    alignItems: 'center',
  },
  bigCard: {
    width: 420,
    height: 600,
    borderRadius: 30,
    padding: 40,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(14,23,38,0.08)',
  },
  bigCardMobile: {
    width: 336,
    height: 520,
    padding: 30,
  },
  bigCardVideoCard: {
    padding: 0,
    backgroundColor: '#05070A',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  bigCardVideoLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bigCardVideoVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,7,12,0.28)',
  },
  bigCardVideoBody: {
    flex: 1,
    padding: 40,
    justifyContent: 'flex-end',
    gap: 12,
  },
  bigCardVideoBodyMobile: {
    padding: 30,
  },
  cardVideoFallback: {
    flex: 1,
    backgroundColor: '#0E1726',
  },
  bigCardDark: {
    backgroundColor: '#0E1726',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bigCardImageCard: {
    backgroundColor: '#0E1726',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  bigCardImage: {
    borderRadius: 30,
  },
  bigCardImageVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,18,14,0.58)',
  },
  bigCardImageSoftVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,18,14,0.34)',
  },
  bigCardImageSignalVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,7,12,0.54)',
  },
  bigCardImageLightVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,253,247,0.44)',
  },
  bigCardNum: {
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 1,
  },
  bigCardTitle: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.1,
  },
  bigCardTitleMobile: {
    fontSize: 29,
    lineHeight: 33,
    letterSpacing: -0.7,
  },
  bigCardBody: {
    fontSize: 18,
    lineHeight: 27,
  },
  bigCardBodyMobile: {
    fontSize: 16,
    lineHeight: 23,
  },
});
