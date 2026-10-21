import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Sparkles, Coins, Zap, X } from 'lucide-react';
import { HogwartsHouse } from '../types';
import { sound } from '../utils/audio';

export interface D3ScoreCascadeProps {
  points: number | null;
  challengeTitle?: string;
  house?: HogwartsHouse;
  teamName?: string;
  onComplete?: () => void;
}

interface CoinData {
  id: number;
  startX: number;
  startY: number;
  targetY: number;
  radius: number;
  delay: number;
  duration: number;
  swayAmp: number;
  swayFreq: number;
  rotSpeed: number;
  spinAngle: number;
  scaleFactor: number;
  hasBounced: boolean;
  valueSymbol: string;
}

export const D3ScoreCascade: React.FC<D3ScoreCascadeProps> = ({
  points,
  challengeTitle,
  house = 'Gryffindor',
  teamName,
  onComplete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [displayPoints, setDisplayPoints] = useState<number>(0);

  useEffect(() => {
    if (!points || points <= 0 || !svgRef.current) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    setDisplayPoints(points);

    // Audio cue: Cascade of wizarding gold coins
    sound.playGoldCoinsCascade(Math.min(24, Math.max(10, Math.round(points * 0.25))));
    sound.playSparkle();

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // 1. Defs: Gradients, Filters & Crest
    const defs = svg.append('defs');

    // Rich antique gold coin radial gradient
    const goldGrad = defs
      .append('radialGradient')
      .attr('id', 'd3-galleon-gold-face')
      .attr('cx', '35%')
      .attr('cy', '35%')
      .attr('r', '70%');
    goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fffde7');
    goldGrad.append('stop').attr('offset', '20%').attr('stop-color', '#ffd700');
    goldGrad.append('stop').attr('offset', '65%').attr('stop-color', '#c59b27');
    goldGrad.append('stop').attr('offset', '90%').attr('stop-color', '#8b6914');
    goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#503808');

    // Milled rim linear gradient for specular reflections
    const rimGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-galleon-rim')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    rimGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ffe57f');
    rimGrad.append('stop').attr('offset', '45%').attr('stop-color', '#996515');
    rimGrad.append('stop').attr('offset', '75%').attr('stop-color', '#ffd700');
    rimGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4a3608');

    // Filter for golden luminescence aura
    const filter = defs
      .append('filter')
      .attr('id', 'd3-coin-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 2. Generate Coin Data based on Points Earned
    const coinCount = Math.min(85, Math.max(22, Math.round(points * 0.42)));
    const symbols = ['⚡', 'G', '⚯͛', '✦', '7', 'G'];

    const coins: CoinData[] = Array.from({ length: coinCount }, (_, i) => {
      const radius = d3.randomUniform(15, 24)();
      const startX = d3.randomUniform(width * 0.08, width * 0.92)();
      const startY = -40 - Math.random() * 260; // Staggered drop from above viewport
      const targetY = height * (0.80 + Math.random() * 0.14); // Ground landing plane

      return {
        id: i,
        startX,
        startY,
        targetY,
        radius,
        delay: Math.random() * 850, // Staggered release
        duration: 1300 + Math.random() * 900,
        swayAmp: 25 + Math.random() * 45,
        swayFreq: 2 + Math.random() * 3,
        rotSpeed: 3 + Math.random() * 5,
        spinAngle: (Math.random() - 0.5) * 60,
        scaleFactor: 0.8 + Math.random() * 0.4,
        hasBounced: false,
        valueSymbol: symbols[i % symbols.length],
      };
    });

    // 3. Container layers
    const sparkLayer = svg.append('g').attr('class', 'spark-layer');
    const coinLayer = svg.append('g').attr('class', 'coin-layer');
    const uiLayer = svg.append('g').attr('class', 'ui-layer');

    // 4. Center Banner using D3
    const bannerGroup = uiLayer
      .append('g')
      .attr('class', 'score-banner')
      .attr('transform', `translate(${width / 2}, ${height * 0.36})`)
      .attr('opacity', 0);

    // Banner Backdrop Card
    bannerGroup
      .append('rect')
      .attr('x', -240)
      .attr('y', -75)
      .attr('width', 480)
      .attr('height', 150)
      .attr('rx', 24)
      .attr('fill', '#07101f')
      .attr('fill-opacity', 0.92)
      .attr('stroke', '#c59b27')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#d3-coin-glow)');

    // Inner decorative dashed border
    bannerGroup
      .append('rect')
      .attr('x', -232)
      .attr('y', -67)
      .attr('width', 464)
      .attr('height', 134)
      .attr('rx', 18)
      .attr('fill', 'none')
      .attr('stroke', '#f3d069')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6 4')
      .attr('stroke-opacity', 0.6);

    // Title: Arithmancy Challenge Solved
    bannerGroup
      .append('text')
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3d069')
      .attr('font-family', 'Cinzel, Georgia, serif')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '3px')
      .text('✦ D3 SCORE CASCADE: GALLEONS RAINING ✦');

    // Main Score Headline: +{points} GALLEONS
    bannerGroup
      .append('text')
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff9c4')
      .attr('font-family', 'Cinzel, Georgia, serif')
      .attr('font-size', '38px')
      .attr('font-weight', '900')
      .attr('filter', 'drop-shadow(0px 0px 10px rgba(254, 240, 138, 0.7))')
      .text(`+${points} GALLEONS!`);

    // House & Team attribution subtext
    bannerGroup
      .append('text')
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'serif')
      .attr('font-style', 'italic')
      .attr('font-size', '13px')
      .text(
        challengeTitle
          ? `"${challengeTitle}" unsealed · +${points} XP added`
          : `Arithmancy Cipher Solved · +${points} XP added`
      );

    // Animate banner appearance with D3 transition
    bannerGroup
      .transition()
      .duration(700)
      .ease(d3.easeBackOut.overshoot(1.4))
      .attr('opacity', 1)
      .attr('transform', `translate(${width / 2}, ${height * 0.34})`);

    // 5. Append Coin SVG groups
    const coinElements = coinLayer
      .selectAll<SVGGElement, CoinData>('.galleon-coin')
      .data(coins, (d) => d.id)
      .enter()
      .append('g')
      .attr('class', 'galleon-coin')
      .attr('transform', (d) => `translate(${d.startX}, ${d.startY})`);

    // Drop shadow under coin
    coinElements
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#000000')
      .attr('fill-opacity', 0.4)
      .attr('cy', 3);

    // Outer milled coin rim
    coinElements
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', 'url(#d3-galleon-rim)')
      .attr('stroke', '#aa771c')
      .attr('stroke-width', 1.2);

    // Inner coin face
    coinElements
      .append('circle')
      .attr('r', (d) => d.radius * 0.84)
      .attr('fill', 'url(#d3-galleon-gold-face)')
      .attr('stroke', '#fef08a')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '3 1.5');

    // Wizarding numeral / crest insignia inside coin
    coinElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#452a03')
      .attr('font-family', 'Cinzel, Georgia, serif')
      .attr('font-size', (d) => `${d.radius * 0.95}px`)
      .attr('font-weight', 'bold')
      .text((d) => d.valueSymbol);

    // Specular top highlight crescent
    coinElements
      .append('path')
      .attr('d', (d) => {
        const r = d.radius * 0.72;
        return `M ${-r * 0.7} ${-r * 0.4} A ${r} ${r} 0 0 1 ${r * 0.7} ${-r * 0.4} Z`;
      })
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0.35);

    // Helper: spawn golden D3 spark particles at ground impact
    const spawnImpactSparks = (x: number, y: number) => {
      const sparkCount = 6;
      for (let s = 0; s < sparkCount; s++) {
        const angle = (s / sparkCount) * 2 * Math.PI + (Math.random() - 0.5);
        const dist = 25 + Math.random() * 35;
        const tx = x + Math.cos(angle) * dist;
        const ty = y + Math.sin(angle) * dist * 0.6;

        sparkLayer
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 2 + Math.random() * 2)
          .attr('fill', '#fef08a')
          .attr('opacity', 1)
          .transition()
          .duration(500 + Math.random() * 300)
          .ease(d3.easeCubicOut)
          .attr('cx', tx)
          .attr('cy', ty)
          .attr('opacity', 0)
          .attr('r', 0.5)
          .remove();
      }
    };

    // 6. D3 Animation Loop via d3.timer
    const startTime = performance.now();
    let isTerminated = false;

    const animTimer = d3.timer((elapsed) => {
      if (isTerminated) return;

      let allDone = true;

      coinElements.each(function (d) {
        const coinElapsed = elapsed - d.delay;
        if (coinElapsed < 0) {
          allDone = false;
          return;
        }

        const rawProgress = Math.min(1, coinElapsed / d.duration);
        if (rawProgress < 1) {
          allDone = false;
        }

        // Falling kinematics with gravitational easing
        const fallEase = d3.easeQuadIn(rawProgress);
        let currY = d.startY + (d.targetY - d.startY) * fallEase;

        // Horizontal atmospheric sway
        const currX =
          d.startX + Math.sin(rawProgress * Math.PI * d.swayFreq) * d.swayAmp;

        // 3D Coin Tumbling scaleX flip illusion
        const flipX = Math.cos(rawProgress * d.rotSpeed * Math.PI);
        const rotationDeg = d.spinAngle + rawProgress * 120;

        // Ground bounce handling
        if (rawProgress >= 0.95 && !d.hasBounced) {
          d.hasBounced = true;
          spawnImpactSparks(currX, d.targetY);
        }

        // When nearing completion, slight bounce up
        if (rawProgress >= 0.95) {
          const bounceProgress = (rawProgress - 0.95) / 0.05;
          const bounceOffset = Math.sin(bounceProgress * Math.PI) * 16;
          currY -= bounceOffset;
        }

        // Fade out slightly as animation finishes
        const opacity = rawProgress > 0.85 ? 1 - (rawProgress - 0.85) / 0.15 : 1;

        d3.select(this)
          .attr('opacity', opacity)
          .attr(
            'transform',
            `translate(${currX}, ${currY}) rotate(${rotationDeg}) scale(${flipX * d.scaleFactor}, ${d.scaleFactor})`
          );
      });

      // Once all coins finish landing (~3.8s total runtime), fade out banner and cleanup
      if (allDone && elapsed > 3400) {
        isTerminated = true;
        animTimer.stop();

        bannerGroup
          .transition()
          .duration(600)
          .attr('opacity', 0)
          .attr('transform', `translate(${width / 2}, ${height * 0.32})`)
          .on('end', () => {
            setIsActive(false);
            svg.selectAll('*').remove();
            if (onComplete) onComplete();
          });
      }
    });

    // Cleanup timer on unmount or re-render
    return () => {
      isTerminated = true;
      animTimer.stop();
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
    };
  }, [points, challengeTitle, house, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Background radial gold aura pulse */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* D3 Canvas/SVG for Rendering Cascade */}
      <svg
        ref={svgRef}
        className="w-full h-full pointer-events-none"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      />

      {/* Dismiss Button (Interactive Escape Hatch) */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button
          onClick={() => {
            setIsActive(false);
            if (svgRef.current) {
              d3.select(svgRef.current).selectAll('*').remove();
            }
            if (onComplete) onComplete();
          }}
          className="p-2 rounded-xl bg-[#060c18]/80 hover:bg-[#060c18] border border-amber-400/50 text-amber-300 hover:text-amber-100 transition shadow-lg flex items-center gap-1.5 text-xs font-cinzel font-semibold cursor-pointer"
          title="Dismiss Score Cascade"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Dismiss Cascade</span>
        </button>
      </div>
    </div>
  );
};
