import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-our-products',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.css']
})
export class OurProductsComponent {
  private readonly locale = inject(LocaleService);
  private productsEn = [
    { name: 'StockBoss', description: 'An all-in-one inventory one-stop shop for your small business — track stock, manage products, and stay on top of sales with a simple dashboard.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60', link: '/discover' },
    { name: 'STOCKR', description: 'STOCKR is a microservices-based platform that aggregates stock news from multiple sources, analyzes sentiment using AI/ML models, and presents results through an intuitive dashboard. Built with Angular 17, ASP.NET Core, and Python FastAPI for real-time market intelligence.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/STOCKR' },
    { name: 'Vista', description: 'A feature-rich social media platform built with Flutter and Dart using MVC architecture. Leverages Google Firebase for secure authentication, content moderation, and personalized content discovery. Features real-time posts, interactive feeds, direct messaging, and custom profiles.', image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/Vista-Mobile-App' }
  ];
  private productsEs = [
    { name: 'StockBoss', description: 'Todo en uno para tu pequeño negocio — controla stock, productos y ventas desde un solo panel.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60', link: '/discover' },
    { name: 'STOCKR', description: 'Plataforma basada en microservicios que agrega noticias bursátiles, analiza sentimiento con IA/ML y presenta resultados en un dashboard intuitivo. Angular 17, ASP.NET Core y Python FastAPI.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/STOCKR' },
    { name: 'Vista', description: 'Plataforma de redes sociales con Flutter y Dart (MVC). Firebase para autenticación, moderación y descubrimiento. Posts en tiempo real, feeds, mensajería y perfiles.', image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&h=600&fit=crop', link: 'https://github.com/j-mrles/Vista-Mobile-App' }
  ];
  get products() { return this.locale.currentLang() === 'es' ? this.productsEs : this.productsEn; }
}
