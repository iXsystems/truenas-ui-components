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

@Component({
  selector: 'ix-particle-progress-bar',
  standalone: true,
  templateUrl: './particle-progress-bar.component.html',
  styleUrls: ['./particle-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ix-particle-progress-bar'
  }
})
export class IxParticleProgressBarComponent implements AfterViewInit, OnDestroy {
  speed = input<'slow' | 'medium' | 'fast' | 'ludicrous'>('medium');
  color = input<string>('hsla(198, 100%, 42%, 1)');
  height = input<number>(40);
  width = input<number>(600);
  fill = input<number>(300);

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

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

      if (p.x > 50 + this.fill() - 12 || p.opacity <= 0) {
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
      x: 50,
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

