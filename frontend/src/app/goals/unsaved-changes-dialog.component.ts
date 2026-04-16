import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Unsaved changes</h2>
    <mat-dialog-content>You have unsaved changes.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="'discard'">Discard</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="'save'">Save</button>
    </mat-dialog-actions>
  `,
})
export class UnsavedChangesDialogComponent {}
