import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  contactForm: any;


  // Hero Section
  heroText = 'Custom Software, Websites and more!';
  phoneLink = 'tel:+1234567890';
  textOrCallButton = 'Text or Call Us';
  estimateLink = '/estimate';
  freeEstimateButton = 'Free Estimate';
  videoFallback = 'Your browser does not support the video tag.';

  // Vision Section
  visionTitle = 'Our Vision';
  visionDescription = 'At GalaxyLabs, we are dedicated to pushing the boundaries of technology to create innovative solutions that improve lives. Our team of experts is passionate about developing cutting-edge software and hardware to meet the needs of our clients and drive the tech industry forward.';

  // Services / Portfolio Section
  servicesTitle = 'Our Services';
  servicesSubtitle = 'Explore the range of services we offer to elevate your business.';
  portfolioItems = [
    { image: 'images/mobileapp.png', title: 'Mobile App Development', description: 'Designed a mobile app that increased engagement by 50%.' },
    { image: 'images/analytics.png', title: 'E-commerce Platform', description: 'Developed a scalable e-commerce solution for businesses.' },
    { image: 'images/solutions.png', title: 'Consulting', description: 'Expert advice for tech-driven growth.' }
  ];

  // Why Choose Us Section
  whyChooseTitle = 'Why Choose';
  whyChooseSubtitle = 'We prioritize customer satisfaction and technological excellence.';
  featureCards = [
    { title: 'Expert Team', description: 'Our team leads the industry with deep technical expertise and innovation.'},
    { title: 'Client Focused', description: 'We design solutions around your needs.No hidden costs—just clear pricing and honest communication.' },
    { title: 'Scalable Solutions', description: 'We build scalable, future-ready solutions tailored to your business needs.' }
  ];

  // Pricing Section
  pricingTitle = 'Our Pricing';
  pricingSubtitle = 'Simple, transparent pricing tailored to your needs.';
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
  getStartedText = 'Get Started';

  // Reviews Section
  reviewsTitle = 'What Our Clients Say';
  reviewsSubtitle = 'Real feedback from real customers.';
  reviews = [
    { text: 'GalaxyLabs transformed our business. Highly recommended!', author: 'John Doe' },
    { text: 'Professional and reliable service from start to finish.', author: 'Jane Smith' },
    { text: 'They truly care about the success of their clients.', author: 'Mike Johnson' }
  ];

  // Careers Section
  careerTitle = 'Join Our Team';
  careerDescription = 'We are always looking for passionate individuals to join GalaxyLabs.';
  careerQuote = 'The best way to predict the future is to create it.';
  contactLink = '/contact';
  contactButtonText = 'Contact Us';
}
