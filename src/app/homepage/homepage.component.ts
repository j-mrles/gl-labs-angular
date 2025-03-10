// homepage.component.ts

import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from "../navbar/navbar.component";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, NavbarComponent, MatFormFieldModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
contactForm: any;
onSubmit() {
throw new Error('Method not implemented.');
}
  services = [
    { icon: 'computer', title: 'Software Development', description: 'We offer custom software development services.' },
    { icon: 'settings', title: 'IT Consulting', description: 'Our experts provide top-notch IT consulting services.' },
    { icon: 'cloud', title: 'Cloud Solutions', description: 'We deliver scalable cloud solutions to meet your business needs.' }
  ];

  constructor() {}
}
