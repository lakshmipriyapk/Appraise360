import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manager-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-products.html',
  styleUrls: ['./manager-products.css']
})
export class ManagerProductsComponent {

}