import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-our-products',
  standalone: true,
  imports: [
    CommonModule],
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.css']
})
export class OurProductsComponent {
  products = [
    {
      name: 'StockBoss',
      description: 'An all-in-one inventory one-stop shop for your small business — track stock, manage products, and stay on top of sales with a simple dashboard.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60',
      link: '/discover'
    },
    {
      name: 'STOCKR',
      description: 'STOCKR is a microservices-based platform that aggregates stock news from multiple sources, analyzes sentiment using AI/ML models, and presents results through an intuitive dashboard. Built with Angular 17, ASP.NET Core, and Python FastAPI for real-time market intelligence.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
      link: 'https://github.com/j-mrles/STOCKR'
    },
    {
      name: 'Vista',
      description: 'A feature-rich social media platform built with Flutter and Dart using MVC architecture. Leverages Google Firebase for secure authentication, content moderation, and personalized content discovery. Features real-time posts, interactive feeds, direct messaging, and custom profiles.',
      image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&h=600&fit=crop',
      link: 'https://github.com/j-mrles/Vista-Mobile-App'
    }
  ];  
}
