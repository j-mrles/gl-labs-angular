import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css'
})
export class DiscoverComponent {
  solutions = [
    {
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      title: 'Custom Business Websites',
      description: 'Modern, branded, SEO-optimized sites.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png',
      title: 'E-Commerce Storefronts',
      description: 'Custom Shopify, WooCommerce, or full custom builds.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/906/906175.png',
      title: 'SaaS Platforms',
      description: 'Subscription-based applications with full backend integration.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png',
      title: 'Booking Systems',
      description: 'Appointment platforms for service industries.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
      title: 'Native Mobile Apps',
      description: 'Swift, Kotlin development for fast, robust apps.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
      title: 'Cross-Platform Apps',
      description: 'Flutter and React Native solutions.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
      title: 'UI/UX Design Packages',
      description: 'Wireframes, prototypes, and final designs.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
      title: 'Maintenance Plans',
      description: 'Security updates, hosting, scaling support.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/2942/2942651.png',
      title: 'API Development',
      description: 'RESTful and GraphQL APIs for seamless integrations.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
      title: 'Cloud Migration',
      description: 'Move your infrastructure to AWS, Azure, or Google Cloud.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      title: 'Database Solutions',
      description: 'SQL and NoSQL database design and optimization.'
    },
    {
      image: 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png',
      title: 'AI & Machine Learning',
      description: 'Custom AI solutions and ML model integration.'
    }
  ];
  
  packages = [
    {
      name: 'Startup Launch Kit',
      description: 'Website + App + 6 Months Support at a bundled rate.',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    {
      name: 'E-Commerce Booster',
      description: 'Storefront + App + SEO + Marketing Setup.',
      image: 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png'
    },
    {
      name: 'Enterprise Digital Transformation',
      description: 'Custom systems, CRM integration, Cloud migration.',
      image: 'https://cdn-icons-png.flaticon.com/512/906/906175.png'
    }
  ];
  pricingPackages = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses.',
      price: '$499',
      features: ['Basic Support', 'Custom Landing Page', 'Monthly Updates'],
      color: '#3498db',
      link: '/contact'
    },
    {
      name: 'Professional',
      description: 'Best for growing companies.',
      price: '$999',
      features: ['Priority Support', 'Full Website', 'Bi-weekly Updates'],
      color: '#2ecc71',
      link: '/contact'
    },
    {
      name: 'Enterprise',
      description: 'Solutions for large businesses.',
      price: '$1999',
      features: ['Dedicated Manager', 'Custom Apps', 'Weekly Updates'],
      color: '#e74c3c',
      link: '/contact'
    }
  ];
  
  techStack = [
    'Angular', 'React', 'Vue', 'Node.js', '.NET', 'Django',
    'Flutter', 'AWS', 'Azure', 'PostgreSQL', 'MongoDB'
  ];
  
  caseStudies = [
    { 
      project: 'Coastal Garden Designs', 
      summary: 'Custom website and online presence for a landscape design business, showcasing beautiful coastal garden projects and increasing client inquiries by 40%.',
      link: 'https://j-mrles.github.io/LinkTree/coastal-garden-designs/homepage/index.html'
    },
    { 
      project: 'Little Bee\'s Creations', 
      summary: 'E-commerce platform for handmade crafts and custom creations, featuring an intuitive shopping experience that boosted online sales by 60%.',
      link: 'https://j-mrles.github.io/LinkTree/littlebee\'s-creations/home/index.html'
    },
    { 
      project: 'Gum-Gum Cards (Linktree)', 
      summary: 'Custom Linktree-style landing page solution connecting customers to multiple product offerings and social media channels, simplifying the customer journey.',
      link: 'https://j-mrles.github.io/LinkTree/gumgum/gumgum/home.html'
    }
  ];
  
}
