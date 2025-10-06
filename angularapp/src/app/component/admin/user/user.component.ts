import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,          // Mark as standalone if you’re using Angular 15+
  imports: [CommonModule],   // You can add FormsModule, RouterModule etc. if needed
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']  // ✅ plural
})
export class UserComponent {

}
