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
      name: 'Chatbot Therapist',
      description: 'A chatbot that acts as a therapist, providing mental health support with AI-driven conversations.',
      image: 'https://images.pexels.com/photos/16380906/pexels-photo-16380906.jpeg',
      link: '/chatbot-therapist'
    },
    {
      name: 'Stock Market Notification Bot',
      description: 'Get real-time notifications about the latest stock market movements and stock refresh data.',
      image: 'https://images.unsplash.com/photo-1518981334267-4572b0640879',
      link: '/stock-notification-bot'
    },
    {
      name: 'Stock Market Analyzer',
      description: 'A deep analysis tool for specific stocks to help you make informed decisions based on market data.',
      image: 'https://images.pexels.com/photos/890508/pexels-photo-890508.jpeg',
      link: '/stock-analyzer'
    }
  ];  
}
