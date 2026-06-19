import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';
import { AnalyticsTrackerService } from '../analytics-tracker.service';

@Component({
  selector: 'app-our-products',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.css']
})
export class OurProductsComponent implements OnInit {
  private readonly locale = inject(LocaleService);
  private readonly tracker = inject(AnalyticsTrackerService);

  ngOnInit(): void {
    this.tracker.trackProductView('/products');
  }
  private productsEn = [
    { name: 'StockBoss', description: 'An all-in-one inventory one-stop shop for your small business — track stock, manage products, and stay on top of sales with a simple dashboard.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60', link: '/services' },
    { name: 'Red Otter', description: 'AI-powered real estate analysis platform. Paste a property listing URL, and Otis — our AI assistant — generates a detailed report with an Otis Score, value analysis, cost breakdown, red flags, and negotiation tips.', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop', link: '/red-otter' },
    { name: 'STOCKR', description: 'STOCKR is a microservices-based platform that aggregates stock news from multiple sources, analyzes sentiment using AI/ML models, and presents results through an intuitive dashboard. Built with Angular 17, ASP.NET Core, and Python FastAPI for real-time market intelligence.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/STOCKR' }
  ];
  private productsEs = [
    { name: 'StockBoss', description: 'Todo en uno para tu pequeño negocio — controla stock, productos y ventas desde un solo panel.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60', link: '/services' },
    { name: 'Red Otter', description: 'Plataforma de análisis inmobiliario con IA. Pega la URL de un listado y Otis — nuestro asistente IA — genera un informe detallado con puntuación Otis, análisis de valor, desglose de costos, alertas y consejos de negociación.', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop', link: '/red-otter' },
    { name: 'STOCKR', description: 'Plataforma basada en microservicios que agrega noticias bursátiles, analiza sentimiento con IA/ML y presenta resultados en un dashboard intuitivo. Angular 17, ASP.NET Core y Python FastAPI.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/STOCKR' }
  ];
  get products() { return this.locale.currentLang() === 'es' ? this.productsEs : this.productsEn; }

  processSteps = [
    { title: 'Discovery', description: 'We learn your business, users, and goals — then define exactly what to build.' },
    { title: 'Design & Prototype', description: 'Clean wireframes and interactive prototypes before a single line of code.' },
    { title: 'Build & Ship', description: 'Modern stack, tested code, deployed fast — with ongoing support after launch.' }
  ];

  techStack = [
    'Angular', 'React', 'Node.js', '.NET', 'Python',
    'Flutter', 'AWS', 'Firebase', 'PostgreSQL', 'MongoDB',
    'Stripe', 'Claude AI'
  ];
}
