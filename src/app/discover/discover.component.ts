import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';
import { AnalyticsTrackerService } from '../analytics-tracker.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  private readonly locale = inject(LocaleService);
  private readonly tracker = inject(AnalyticsTrackerService);

  ngOnInit(): void {
    this.tracker.trackProductView('/discover');
  }
  private solutionsEn = [
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
  private solutionsEs = [
    { image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', title: 'Sitios web empresariales', description: 'Sitios modernos, con marca y SEO.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png', title: 'Tiendas e-commerce', description: 'Shopify, WooCommerce o desarrollo a medida.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/906/906175.png', title: 'Plataformas SaaS', description: 'Aplicaciones por suscripción con backend.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png', title: 'Sistemas de reservas', description: 'Plataformas de citas para servicios.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/888/888879.png', title: 'Apps móviles nativas', description: 'Swift, Kotlin para apps rápidas.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/888/888879.png', title: 'Apps multiplataforma', description: 'Flutter y React Native.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', title: 'Diseño UI/UX', description: 'Wireframes, prototipos y diseños finales.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', title: 'Planes de mantenimiento', description: 'Actualizaciones, hosting y escalado.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/2942/2942651.png', title: 'Desarrollo de APIs', description: 'REST y GraphQL para integraciones.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png', title: 'Migración a la nube', description: 'AWS, Azure o Google Cloud.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', title: 'Bases de datos', description: 'Diseño y optimización SQL y NoSQL.' },
    { image: 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png', title: 'IA y aprendizaje automático', description: 'Soluciones de IA e integración de modelos.' }
  ];
  get solutions() { return this.locale.currentLang() === 'es' ? this.solutionsEs : this.solutionsEn; }
  
  private packagesEn = [
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
  private packagesEs = [
    { name: 'Kit de lanzamiento', description: 'Sitio + App + 6 meses de soporte.', image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { name: 'E-commerce Booster', description: 'Tienda + App + SEO + Marketing.', image: 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png' },
    { name: 'Transformación digital enterprise', description: 'Sistemas a medida, CRM, nube.', image: 'https://cdn-icons-png.flaticon.com/512/906/906175.png' }
  ];
  get packages() { return this.locale.currentLang() === 'es' ? this.packagesEs : this.packagesEn; }
  get pricingPackages() {
    const t = (k: string) => this.locale.t(k);
    return [
      { name: t('discover.starter'), description: t('discover.starterDesc'), price: '$149', features: [t('discover.basicSupport'), t('discover.customLanding'), t('discover.monthlyUpdates')], color: '#3498db', link: '/contact' },
      { name: t('discover.professional'), description: t('discover.professionalDesc'), price: '$349', features: [t('discover.prioritySupport'), t('discover.fullWebsite'), t('discover.biweeklyUpdates')], color: '#2ecc71', link: '/contact' },
      { name: t('discover.enterprise'), description: t('discover.enterpriseDesc'), price: '$749', features: [t('discover.dedicatedManager'), t('discover.customApps'), t('discover.weeklyUpdates')], color: '#e74c3c', link: '/contact' }
    ];
  }
  
  techStack = [
    'Angular', 'React', 'Vue', 'Node.js', '.NET', 'Django',
    'Flutter', 'AWS', 'Azure', 'PostgreSQL', 'MongoDB'
  ];
  
  caseStudiesEn = [
    { project: 'Coastal Garden Designs', summary: 'Custom website and online presence for a landscape design business, showcasing beautiful coastal garden projects.', stat: '+40% inquiries', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/coastal-garden-designs/homepage/index.html' },
    { project: 'Little Bee\'s Creations', summary: 'E-commerce platform for handmade crafts and custom creations, featuring an intuitive shopping experience.', stat: '+60% sales', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/littlebee%27s-creations/home/index.html' },
    { project: 'Gum-Gum Cards', summary: 'Custom Linktree-style landing page connecting customers to products and social channels.', stat: 'Simplified journey', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/gumgum/gumgum/home.html' }
  ];
  caseStudiesEs = [
    { project: 'Coastal Garden Designs', summary: 'Sitio web y presencia online para negocio de diseño de paisajes costeros.', stat: '+40% consultas', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/coastal-garden-designs/homepage/index.html' },
    { project: 'Little Bee\'s Creations', summary: 'Plataforma e-commerce para artesanías con experiencia de compra intuitiva.', stat: '+60% ventas', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/littlebee%27s-creations/home/index.html' },
    { project: 'Gum-Gum Cards', summary: 'Landing tipo Linktree conectando clientes con productos y redes sociales.', stat: 'Recorrido simplificado', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=500&fit=crop', link: 'https://j-mrles.github.io/LinkTree/gumgum/gumgum/home.html' }
  ];
  get caseStudies() { return this.locale.currentLang() === 'es' ? this.caseStudiesEs : this.caseStudiesEn; }
}
