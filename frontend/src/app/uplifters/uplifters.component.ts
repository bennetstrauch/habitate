import { Component, inject, OnInit, signal } from '@angular/core';
import { UpliftersService } from './uplifters.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '../goals/goals.service';

@Component({
  selector: 'app-uplifters',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatInputModule, MatFormFieldModule, FormsModule],
  template: `
    <div class="container">
      <h2>Uplifters</h2>

      <!-- Invite code -->
      <mat-card>
        <mat-card-content>
          <p class="section-label">Your invite code</p>
          @if ($inviteCode()) {
            <div class="code-row">
              <span class="code">{{ $inviteCode() }}</span>
              <button mat-icon-button (click)="copyCode()" title="Copy">
                <mat-icon>content_copy</mat-icon>
              </button>
              <button mat-icon-button (click)="regenerate()" title="Regenerate">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          } @else {
            <button mat-stroked-button (click)="loadCode()">Show my code</button>
          }
        </mat-card-content>
      </mat-card>

      <!-- Connect -->
      <mat-card>
        <mat-card-content>
          <p class="section-label">Connect with someone</p>
          <div class="connect-row">
            <mat-form-field appearance="outline" class="code-input">
              <mat-label>Invite code</mat-label>
              <input matInput [(ngModel)]="connectCode" placeholder="ABC123" (keydown.enter)="connect()" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="connect()" [disabled]="!connectCode || $isConnecting()">
              Connect
            </button>
          </div>
          @if (connectError) { <p class="error">{{ connectError }}</p> }
          @if (connectSuccess) { <p class="success">Connected with {{ connectSuccess }}!</p> }
        </mat-card-content>
      </mat-card>

      <!-- Connections list -->
      <mat-card>
        <mat-card-content>
          <p class="section-label">Connected Uplifters</p>
          @if (upliftersService.$connections().length === 0) {
            <p class="empty">No connections yet.</p>
          } @else {
            @for (c of upliftersService.$connections(); track c._id) {
              <div class="connection-row">
                <span>{{ c.name }}</span>
                <button mat-icon-button color="warn" (click)="remove(c._id)" title="Remove">
                  <mat-icon>person_remove</mat-icon>
                </button>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .container {
      max-width: 480px;
      margin: 24px auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 0 16px;
    }
    h2 { margin: 0 0 4px; }
    .section-label { margin: 0 0 8px; font-weight: 500; color: gray; font-size: 0.85rem; }
    .code-row { display: flex; align-items: center; gap: 4px; }
    .code { font-size: 1.6rem; letter-spacing: 6px; font-weight: 600; }
    .connect-row { display: flex; align-items: center; gap: 12px; }
    .code-input { flex: 1; }
    .connection-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .connection-row:last-child { border-bottom: none; }
    .empty { color: lightgray; margin: 0; }
    .error { color: #c62828; margin: 4px 0 0; }
    .success { color: #2e7d32; margin: 4px 0 0; }
  `
})
export class UpliftersComponent implements OnInit {
  upliftersService = inject(UpliftersService);
  #goalsService = inject(GoalsService);

  $inviteCode = signal('');
  $isConnecting = signal(false);
  connectCode = '';
  connectError = '';
  connectSuccess = '';

  ngOnInit() {
    this.upliftersService.loadConnections().subscribe();
  }

  loadCode() {
    this.upliftersService.getInviteCode().subscribe(r => {
      if (r.success) this.$inviteCode.set(r.data.inviteCode);
    });
  }

  regenerate() {
    this.upliftersService.regenerateInviteCode().subscribe(r => {
      if (r.success) this.$inviteCode.set(r.data.inviteCode);
    });
  }

  copyCode() {
    navigator.clipboard.writeText(this.$inviteCode());
  }

  connect() {
    if (!this.connectCode || this.$isConnecting()) return;
    this.connectError = '';
    this.connectSuccess = '';
    this.$isConnecting.set(true);
    this.upliftersService.connect(this.connectCode).subscribe({
      next: r => {
        this.$isConnecting.set(false);
        if (r.success) {
          this.connectSuccess = r.data.name;
          this.connectCode = '';
        }
      },
      error: err => {
        this.$isConnecting.set(false);
        this.connectError = err.error?.message ?? 'Error connecting';
      }
    });
  }

  remove(friendId: string) {
    const name = this.upliftersService.$connections().find(c => c._id === friendId)?.name ?? 'this person';
    if (!window.confirm(`Remove ${name} as an Uplifter?`)) return;
    if (this.upliftersService.$activeProfileId() === friendId) {
      this.upliftersService.$activeProfileId.set('');
      this.#goalsService.update_goals();
    }
    this.upliftersService.removeConnection(friendId).subscribe();
  }
}
