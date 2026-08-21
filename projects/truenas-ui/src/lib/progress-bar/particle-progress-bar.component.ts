import type {
  AfterViewInit,
  ElementRef,
  OnDestroy
} from '@angular/core';
import {
  Component,
  input,
  computed,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { tnAccessibleName } from '../a11y/accessible-name';

/**
 * The accessible name this bar falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#209).
 *
 * The same string and the same reasoning as `TN_PROGRESS_BAR_DEFAULT_LABEL`
 * next door, and deliberately a separate constant rather than an import of it:
 * `tnAccessibleName` takes a fallback PER COMPONENT because the least-bad
 * generic name differs by what the component is ("Progress" for a bar,
 * "Loading" for a spinner), and sharing the binding would make a future
 * divergence in one a silent change to the other. Exported so specs assert
 * against it by name rather than by a copied string literal.
 */
export const TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL = 'Progress';

/**
 * The gap in px between the edge of the SVG and each end of the track, on both
 * sides — the `x` the two rects are drawn at, and half of what is subtracted
 * from `width` to size the background.
 *
 * Named rather than left as the literal `50`/`100` it was, because `fill` is
 * measured in these same px and the ARIA value is `fill` as a proportion of the
 * track. Drawing and announcing now read the one number: an edit to the inset
 * that missed the other would leave a bar that says "60%" while showing
 * something else, which is the class of defect this ticket is about.
 */
const TRACK_INSET = 50;

/**
 * THE DECISION #209 ASKED FOR: THIS IS A PROGRESSBAR, NOT DECORATION
 * ------------------------------------------------------------------
 * Both readings were open. Before the change the host carried a class and
 * nothing else — no role, no name, no value — and because it never claimed
 * `role="progressbar"` it could not fail `aria-progressbar-name` either, so
 * every axe-based check in this library was silent on it by construction.
 * Measured on the unchanged component under jsdom, over the five rules a
 * progressbar can fail: 0 violations, 0 passes, 0 incomplete. Not clean —
 * unexamined. `particle-progress-bar-a11y.spec.ts` keeps that measurement as a
 * test.
 *
 * It is a progressbar because it is a WHOLE indicator rather than an overlay on
 * someone else's. The SVG draws its own background track and its own fill rect,
 * and `fill` sizes the second against the first; that is a determinate progress
 * value, whatever the particles on top of it are doing. The alternative reading
 * — an ambient flourish shown BESIDE a real indicator, where a role would be
 * the redundant second announcement #203 was about — needs the real indicator
 * to exist, and nothing here provides one.
 *
 * The usage evidence points the same way, weakly but only in one direction. Its
 * only consumer in this repository is its own Storybook story: it has never
 * been placed next to a `tn-progress-bar`, so the redundancy risk is
 * hypothetical. It IS exported from `public-api.ts`, so consumers outside this
 * repository may already be showing it as the only progress on a screen — and
 * that asymmetry is what settles it. Choosing `aria-hidden` would assert a
 * usage constraint the library cannot enforce, and when that assertion is wrong
 * a screen-reader user gets nothing at all where a sighted user sees a bar
 * filling — strictly worse than the unnamed progressbars #202/#205/#206 fixed.
 * Choosing the role when the component really is ambient costs a redundant
 * announcement a consumer can silence with `aria-hidden` on its own wrapper.
 * The two errors are not the same size.
 *
 * The canvas IS decoration, and that is a separate question from what the host
 * is. It draws particles and carries no information the fill rect does not, so
 * the whole drawing is hidden and the ARIA value is what conveys the progress —
 * see the `aria-hidden` on the `<svg>` in the template.
 *
 * WHY THE VALUE IS A PERCENTAGE AND `fill` IS NOT
 * ----------------------------------------------
 * `fill` is a px length along the track, not a percentage — the story's control
 * runs it 0–600 while `width` runs 200–800, so the same `fill` means different
 * progress at different widths. `aria-valuenow` is reported on 0–100 instead,
 * matching `tn-progress-bar`, so that two bars from one library do not announce
 * on two different scales and no layout px reaches the accessibility tree.
 * Assistive technology derives the percentage from the range either way; what
 * this fixes is which range a consumer reads in the DOM.
 */
@Component({
  selector: 'tn-particle-progress-bar',
  standalone: true,
  templateUrl: './particle-progress-bar.component.html',
  styleUrls: ['./particle-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tn-particle-progress-bar',
    'role': 'progressbar',
    '[attr.aria-valuenow]': 'valuePercent()',
    '[attr.aria-valuemin]': 'valuePercent() === null ? null : 0',
    '[attr.aria-valuemax]': 'valuePercent() === null ? null : 100',
    '[attr.aria-label]': 'resolvedAriaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null'
  }
})
export class TnParticleProgressBarComponent implements AfterViewInit, OnDestroy {
  speed = input<'slow' | 'medium' | 'fast' | 'ludicrous'>('medium');
  color = input<string>('hsla(198, 100%, 42%, 1)');
  height = input<number>(40);
  width = input<number>(600);
  fill = input<number>(300);
  ariaLabel = input<string | null>(null);
  ariaLabelledby = input<string | null>(null);

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /** Exposed to the template so the rects and the ARIA value share one inset. */
  readonly trackInset = TRACK_INSET;

  /**
   * The name to render, or `null` to render no `aria-label` at all — and the
   * dev-mode warning when the caller named neither input.
   *
   * Both halves live in `../a11y/accessible-name`, shared with the other three
   * progressbars in this library (#206), where the reasoning for each is set
   * out: why an explicit `ariaLabel` always survives, and why the generic
   * fallback is withheld beside an `ariaLabelledby`. Routed through that helper
   * rather than given a rule of its own, which is what #209 asked for — a
   * fourth naming rule is how `tn-branded-spinner` ended up divergent.
   *
   * A field initializer rather than the constructor, because it registers an
   * `effect` and so needs an injection context; this is one, and it keeps the
   * signal beside the inputs it reads.
   */
  resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-particle-progress-bar',
    fallback: TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL,
    activity: 'progressing',
    ariaLabel: this.ariaLabel,
    ariaLabelledby: this.ariaLabelledby
  });

  /** The drawable length of the track: the SVG width less the inset at each end. */
  trackLength = computed(() => this.width() - TRACK_INSET * 2);

  /**
   * `fill` as a percentage of the track, or `null` when there is no track to
   * measure against.
   *
   * Clamped, because `fill` is not: the story alone can drive it to 600 against
   * a 500px track, where the fill rect simply overflows. `aria-valuenow` may not
   * exceed `aria-valuemax`, and 100 is also what such a bar visually reads as —
   * a track filled end to end. The clamp is on the announcement only; nothing
   * here changes what is drawn.
   *
   * `null` on a non-positive track — `width` at or below twice the inset — is
   * what makes the host announce as an INDETERMINATE progressbar rather than
   * carrying a value derived from a division by zero or a negative range. The
   * role stays either way, because "something is in progress" is true even when
   * how far is not answerable.
   */
  valuePercent = computed<number | null>(() => {
    const track = this.trackLength();
    if (track <= 0) {
      return null;
    }
    return Math.max(0, Math.min(100, (this.fill() / track) * 100));
  });

  private ctx!: CanvasRenderingContext2D;
  private particles: Array<{
    x: number;
    y: number;
    radius: number;
    speed: number;
    opacity: number;
    color: string;
  }> = [];
  private shades: string[] = [];
  private animationId?: number;

  private speedConfig = computed(() => {
    const baseConfig = {
      slow: { speedMin: 0.5, speedMax: 1.5 },
      medium: { speedMin: 1, speedMax: 2.5 },
      fast: { speedMin: 2, speedMax: 4 },
      ludicrous: { speedMin: 4, speedMax: 8 }
    }[this.speed()];

    // Calculate dynamic fade rate based on travel distance
    // Particles should fade out over the full travel distance (minus border radius buffer)
    const travelDistance = Math.max(this.fill() - 12, 20); // Distance from x=50 to x=50+fill-12 (avoid border radius), minimum 20px
    const averageSpeed = (baseConfig.speedMin + baseConfig.speedMax) / 2;
    const estimatedFrames = travelDistance / averageSpeed; // Approximate frames to travel the distance
    const fadeRate = 1 / estimatedFrames; // Fade from 1 to 0 over the travel distance

    return {
      ...baseConfig,
      fadeRate: Math.max(fadeRate, 0.001) // Minimum fade rate to prevent too slow fading
    };
  });

  /**
   * Calculate the gradient offset so the transition only happens in the last 100px
   */
  gradientTransitionStart = computed(() => {
    if (this.fill() <= 100) {
      return 0; // If fill is 100px or less, transition starts immediately
    }
    return ((this.fill() - 100) / this.fill()) * 100; // Transparent until last 100px
  });

  /**
   * Get the color for the progress bar (uses the exact same color as input)
   */
  progressBarColor = computed(() => {
    return this.color();
  });

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef().nativeElement.getContext('2d')!;
    this.shades = this.generateDarkerShades(this.color(), 4);
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.width(), this.height());

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      // If color contains ALPHA placeholder, replace it; otherwise use the color with current opacity
      if (p.color.includes('ALPHA')) {
        this.ctx.fillStyle = p.color.replace('ALPHA', p.opacity.toFixed(2));
      } else {
        // Parse the color and apply current opacity
        const parsed = this.parseHSLA(p.color);
        this.ctx.fillStyle = `hsla(${parsed.h}, ${(parsed.s * 100).toFixed(0)}%, ${(parsed.l * 100).toFixed(0)}%, ${p.opacity.toFixed(2)})`;
      }
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      p.x += p.speed;
      p.opacity -= this.speedConfig().fadeRate;

      if (p.x > TRACK_INSET + this.fill() - 12 || p.opacity <= 0) {
        this.particles.splice(i, 1);
        i--;
      }
    }

    for (let j = 0; j < 3; j++) {
      if (Math.random() < 0.8) {this.spawnParticle();}
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private spawnParticle() {
    const { speedMin, speedMax } = this.speedConfig();
    const color = this.shades[Math.floor(Math.random() * this.shades.length)];
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    this.particles.push({
      x: TRACK_INSET,
      y: this.height() / 2 + (Math.random() * (this.height() / 2) - this.height() / 4),
      radius: Math.random() * 2 + 1,
      speed,
      opacity: 1,
      color
    });
  }

  private parseHSLA(hsla: string): { h: number; s: number; l: number; a: number } {
    const match = hsla.match(/hsla?\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)/i);
    if (!match) {throw new Error('Invalid HSLA color');}
    return {
      h: parseFloat(match[1]),
      s: parseFloat(match[2]) / 100,
      l: parseFloat(match[3]) / 100,
      a: match[4] !== undefined ? parseFloat(match[4]) : 1
    };
  }

  /**
   * Convert any color format to HSLA
   */
  private convertToHSLA(color: string): { h: number; s: number; l: number; a: number } {
    // Already HSLA format
    if (color.startsWith('hsla') || color.startsWith('hsl')) {
      return this.parseHSLA(color);
    }

    // Create a temporary element to get computed color
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Parse RGB/RGBA from computed style
    const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!rgbaMatch) {
      throw new Error('Invalid color format');
    }

    const r = parseInt(rgbaMatch[1]) / 255;
    const g = parseInt(rgbaMatch[2]) / 255;
    const b = parseInt(rgbaMatch[3]) / 255;
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    let h = 0;
    let s = 0;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;

      switch (max) {
        case r:
          h = ((g - b) / diff) + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100) / 100,
      l: Math.round(l * 100) / 100,
      a
    };
  }

  /**
   * Generate darker shades of the input color for particle depth effect
   */
  private generateDarkerShades(color: string, count: number): string[] {
    const baseHSLA = this.convertToHSLA(color);
    const shades: string[] = [];

    // Include the original color as the brightest shade
    shades.push(`hsla(${baseHSLA.h}, ${(baseHSLA.s * 100).toFixed(0)}%, ${(baseHSLA.l * 100).toFixed(0)}%, ALPHA)`);

    // Generate darker shades by reducing lightness
    for (let i = 1; i < count; i++) {
      const darkeningFactor = 0.85 - (i * 0.1); // More conservative darkening: 85%, 75%, 65%
      const newLightness = Math.max(baseHSLA.l * darkeningFactor, Math.max(baseHSLA.l * 0.4, 0.2)); // Limit darkness to 40% of original or 20% minimum
      shades.push(`hsla(${baseHSLA.h}, ${(baseHSLA.s * 100).toFixed(0)}%, ${(newLightness * 100).toFixed(0)}%, ALPHA)`);
    }

    return shades;
  }

}

