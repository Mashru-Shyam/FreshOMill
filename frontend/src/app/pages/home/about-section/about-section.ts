import { Component, signal } from '@angular/core';
import { Icon } from '../../../shared/icon/icon';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

interface VideoTile {
  src: string;
  label: string;
}

/**
 * "More Than a Store!" — 3 value-prop columns + 3 looping store videos
 * (Sample/FreshOMill.html's `.about-section`, sits between Best Sellers
 * and Customer Stories in the mockup's body markup). Not called out by
 * section number in this pass's brief (the mockup's own CSS comment for
 * it is also unnumbered, sitting between "6. BEST SELLERS" and
 * "7. PROFILE POPOVER"), but it's part of the Home page's actual visual
 * flow, so it's ported here too rather than skipped.
 *
 * Video files aren't bundled (same as every image in this project) — drop
 * exactly these 3 filenames into `public/assets/videos/` and they'll
 * resolve with no further code changes: `inside-the-store.mp4`,
 * `grains-and-spices.mp4`, `fresh-milling.mp4`. Until then each `<video>`
 * keeps the mockup's `onerror`-equivalent fallback: a gradient + Lucide
 * `film` icon tile, shown via the `(error)` event since the referenced
 * .mp4 will 404.
 */
@Component({
  selector: 'app-about-section',
  imports: [Icon],
  templateUrl: './about-section.html',
  styleUrl: './about-section.css',
})
export class AboutSection {
  protected readonly features: Feature[] = [
    {
      icon: 'users',
      title: 'Locally Sourced',
      text: 'Supporting local farmers and producers while delivering authentic quality.',
    },
    {
      icon: 'droplets',
      title: 'Washed & Cleaned',
      text: 'No preservatives or adulterants. The spices & grains are properly washed and cleaned before powdering.',
    },
    {
      icon: 'wheat',
      title: 'Freshly Prepared',
      text: 'Flours, spices & masalas are freshly milled after your order.',
    },
  ];

  protected readonly videos: VideoTile[] = [
    { src: 'assets/videos/inside-the-store.mp4', label: 'Inside the FreshOMill store' },
    { src: 'assets/videos/grains-and-spices.mp4', label: 'Grains and spices at FreshOMill' },
    { src: 'assets/videos/fresh-milling.mp4', label: 'Freshly milling at FreshOMill' },
  ];

  protected readonly failedVideos = signal<Set<number>>(new Set());

  protected onVideoError(index: number): void {
    const next = new Set(this.failedVideos());
    next.add(index);
    this.failedVideos.set(next);
  }
}
