import type { OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { ElementRef, Component, input, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'tn-branded-spinner',
  standalone: true,
  templateUrl: './branded-spinner.component.html',
  styleUrls: ['./branded-spinner.component.scss'],  
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-branded-spinner',
    'role': 'progressbar',
    '[attr.aria-label]': 'ariaLabel() || "Loading..."'
  }
})
export class TnBrandedSpinnerComponent implements OnInit, OnDestroy, AfterViewInit {
  ariaLabel = input<string | null>(null);

  private paths: SVGPathElement[] = [];
  private animationId: number | null = null;
  private isAnimating = false;

  // Animation timing constants from reference implementation
  private readonly duration = 300; // time to draw each individual path
  private readonly delayStep = 500; // delay between starting each path
  private readonly cyclePause = 1200; // pause after all paths are drawn
  private readonly emptyPause = 100; // brief pause with no strokes

  private elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.isAnimating = true;
  }

  ngAfterViewInit(): void {
    this.paths = Array.from(this.elementRef.nativeElement.querySelectorAll('path.exploded'));
    this.startProgressLoop();
  }

  ngOnDestroy(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private startProgressLoop(): void {
    if (!this.isAnimating || this.paths.length === 0) {return;}

    // Reset all paths to invisible
    this.paths.forEach((path) => {
      // Check if getTotalLength exists (not available in Jest/JSDom)
      const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;
      path.style.strokeDasharray = length.toString();
      path.style.strokeDashoffset = length.toString();
      path.style.fillOpacity = '0';
    });

    this.animateSequence();
  }

  private animateSequence(): void {
    if (!this.isAnimating) {return;}

    let startTime: number;

    const animate = (timestamp: number) => {
      if (!this.isAnimating) {return;}

      if (!startTime) {startTime = timestamp;}
      const elapsed = timestamp - startTime;

      let allDone = true;

      // Animate each path with staggered delays
      this.paths.forEach((path, index) => {
        const delay = index * this.delayStep;
        // Check if getTotalLength exists (not available in Jest/JSDom)
        const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;

        if (elapsed < delay) {
          allDone = false;
          return;
        }

        const progress = Math.min((elapsed - delay) / this.duration, 1);
        const offset = this.tween(length, 0, progress);
        path.style.strokeDashoffset = offset.toString();

        if (progress < 1) {
          allDone = false;
        }
      });

      if (!allDone) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        // All paths drawn, now pause with complete logo
        setTimeout(() => {
          if (this.isAnimating) {
            // Hide all paths briefly
            this.paths.forEach((path) => {
              // Check if getTotalLength exists (not available in Jest/JSDom)
              const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;
              path.style.strokeDashoffset = length.toString();
            });

            // Start next cycle after brief empty pause
            setTimeout(() => {
              if (this.isAnimating) {
                this.startProgressLoop();
              }
            }, this.emptyPause);
          }
        }, this.cyclePause);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private tween(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }
}