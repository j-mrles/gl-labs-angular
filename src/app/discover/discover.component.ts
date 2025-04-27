import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [    CommonModule],
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
    { project: 'GreenHarvest App', summary: 'Built an e-commerce platform for produce delivery with 25k users.' },
    { project: 'ShiftPro CRM', summary: 'Custom CRM for staffing agencies, reducing hiring time by 30%.' }
  ];
  
}
