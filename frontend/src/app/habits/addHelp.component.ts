import { NgClass } from '@angular/common';
import { Component, NgModule, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Message } from '@global/types/message';


@Component({
  selector: 'app-add-help',
  imports: [NgClass, MatInputModule, FormsModule, MatButtonModule],
  template: `
    <div class="card">

      <div class="messages">
        @for(message of $messages() ; track $index){
        <div [ngClass]="message.role">

          <p>{{ message.content }}</p> 
        </div>
        }
      </div>

      <div class="input-area">
        <mat-form-field>
          <input matInput [(ngModel)]='userInput' placeholder="your message..." />
        </mat-form-field>
        &nbsp;
        <button mat-raised-button (click)="sendMessage()">Send</button>
      </div>
    </div>

  `,
  styles: ``
})
export class AddHelpComponent {
  $messages = signal<Message[]>([]);
  userInput = '';

  sendMessage() {
    
  }
}
