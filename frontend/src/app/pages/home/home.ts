import { Component } from '@angular/core';
import { HeroSlider } from './hero-slider/hero-slider';
import { ProductGrid } from './product-grid/product-grid';
import { BestSellers } from './best-sellers/best-sellers';
import { AboutSection } from './about-section/about-section';
import { CustomerStories } from './customer-stories/customer-stories';

/**
 * Home page content (Sample/FreshOMill.html, everything below the shared
 * navbar/search chrome the shell already provides). Composed from small,
 * single-section components in the same top-to-bottom order as the
 * mockup: hero banner → category grid → best sellers → "More Than a
 * Store!" → customer stories. The site footer is *not* rendered here — it
 * moved to the shared shell (see shared/footer/footer.ts) since
 * Sample/Store.html ships the identical footer markup too.
 */
@Component({
  selector: 'app-home-page',
  imports: [HeroSlider, ProductGrid, BestSellers, AboutSection, CustomerStories],
  templateUrl: './home.html',
})
export class Home {}
