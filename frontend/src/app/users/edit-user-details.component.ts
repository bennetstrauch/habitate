import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from './users.service';
import { User } from '@backend/users/users.types';
import { CommonModule } from '@angular/common';
import { validationRulesRegister } from '@global/auth/validationRules';
import { catchError, tap } from 'rxjs/operators';
import { lastValueFrom, of } from 'rxjs';
import {
  MatSnackBar,
  MatSnackBarRef,
  SimpleSnackBar,
} from '@angular/material/snack-bar';
import { animate, style, transition, trigger } from '@angular/animations';
import { ReflectionReminderComponent } from '../reflections/reflection-reminder/reflection-reminder.component';
import { PushSubscription as WebPushSubscription } from 'web-push';
import { ReflectionReminderService } from '../reflections/reflection-reminder/reflection-reminder.service';
import { UpliftersService } from '../uplifters/uplifters.service';

@Component({
  selector: 'app-edit-user-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    ReflectionReminderComponent,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  template: `
    <form [formGroup]="editUserForm" class="form">
      <h2>Edit Your Details</h2>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
        @if (editUserForm.get('name')?.hasError('required')) {
        <mat-error>Required</mat-error>
        } @else if (editUserForm.get('name')?.hasError('minlength')) {
        <mat-error
          >Minimum {{ validationRules.name.minLength }} characters</mat-error
        >
        } @else if (editUserForm.get('name')?.hasError('maxlength')) {
        <mat-error
          >Maximum {{ validationRules.name.maxLength }} characters</mat-error
        >
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required />
        @if (editUserForm.get('email')?.hasError('required')) {
        <mat-error>Required</mat-error>
        } @else if (editUserForm.get('email')?.hasError('email')) {
        <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Modified Password</mat-label>
        <input
          matInput
          type="password"
          formControlName="password"
          autocomplete="new-password"
        />
        @if (editUserForm.get('password')?.hasError('minlength')) {
        <mat-error
          >Minimum
          {{ validationRules.password.minLength }} characters</mat-error
        >
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Reflection Trigger</mat-label>
        <input matInput formControlName="reflectionTrigger" />
      </mat-form-field>

      <app-reflection-reminder [userDetailsForm]="editUserForm" />
    </form>

    @if(this.error){
      {{error}}
    }

    <!-- ── Uplifters ── -->
    <section class="uplifters-section">
      <h2>Uplifters</h2>

      <div class="invite-code-row">
        <span class="invite-label">Your invite code:</span>
        @if ($inviteCode()) {
          <strong class="invite-code">{{ $inviteCode() }}</strong>
          <button mat-icon-button (click)="copyInviteCode()" title="Copy">
            <mat-icon>content_copy</mat-icon>
          </button>
          <button mat-icon-button (click)="regenerateCode()" title="Get new code">
            <mat-icon>refresh</mat-icon>
          </button>
        } @else {
          <button mat-button (click)="loadInviteCode()">Show my code</button>
        }
      </div>

      <div class="add-row">
        <mat-form-field appearance="outline" class="code-input">
          <mat-label>Add Uplifter by code</mat-label>
          <input matInput [value]="$connectCode()" (input)="$connectCode.set($any($event.target).value.toUpperCase())" maxlength="6" />
        </mat-form-field>
        <button mat-raised-button (click)="connectByCode()" [disabled]="$connectCode().length < 6">
          Add
        </button>
      </div>
      @if ($connectError()) {
        <p class="connect-error">{{ $connectError() }}</p>
      }

      <ul class="connections-list">
        @for (c of upliftersService.$connections(); track c._id) {
        <li>
          <span>{{ c.name }}</span>
          <button mat-icon-button (click)="removeUplifter(c._id)" title="Remove">
            <mat-icon>close</mat-icon>
          </button>
        </li>
        }
        @if (upliftersService.$connections().length === 0) {
          <li class="empty-note">No Uplifters yet.</li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .form-field {
        width: 100%;
        max-width: 400px;
        margin-bottom: 8px;
      }

      :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar {
        margin: 0 !important;
        padding: 0 !important;
        min-width: unset !important;
        width: auto !important;
        bottom: 24px !important;
        top: auto !important;
      }

      :host
        ::ng-deep
        .mat-mdc-snack-bar-container.custom-snackbar
        .mdc-snack-bar__surface {
        padding: 4px !important;
        min-width: unset !important;
        width: auto !important;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #323232 !important;
        border-radius: 4px !important;
        flex-wrap: nowrap !important;
      }

      :host
        ::ng-deep
        .mat-mdc-snack-bar-container.custom-snackbar
        .mat-mdc-snack-bar-label {
        padding: 0 !important;
        margin: 0 4px 0 0 !important;
        text-align: center;
        flex-grow: 0;
        color: #fff !important;
        line-height: normal !important;
        min-width: unset !important;
      }

      :host
        ::ng-deep
        .mat-mdc-snack-bar-container.custom-snackbar
        .mdc-snack-bar__actions {
        margin: 0 !important;
        padding: 0 !important;
        flex-grow: 0;
      }

      :host
        ::ng-deep
        .mat-mdc-snack-bar-container.custom-snackbar
        .mdc-snack-bar__action {
        padding: 0 !important;
        margin: 0 !important;
        color: #bb86fc !important;
        line-height: normal !important;
        min-width: unset !important;
      }

      .uplifters-section {
        width: 100%;
        max-width: 400px;
        margin: 24px auto 0;
      }

      .invite-code-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .invite-label {
        color: gray;
        font-size: 0.9em;
      }

      .invite-code {
        letter-spacing: 3px;
        font-size: 1.1em;
      }

      .add-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .code-input {
        flex: 1;
      }

      .connect-error {
        color: red;
        font-size: 0.85em;
        margin: 0 0 8px;
      }

      .connections-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .connections-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 0;
      }

      .empty-note {
        color: gray;
        font-size: 0.9em;
      }
    `,
  ],
})
export class EditUserDetailsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);
  private reflectionReminderService = inject(ReflectionReminderService);
  readonly upliftersService = inject(UpliftersService);

  $inviteCode = signal<string>('');
  $connectCode = signal<string>('');
  $connectError = signal<string>('');

  private unsavedChangesSnackBar: MatSnackBarRef<SimpleSnackBar> | null = null;

  editUserForm = this.formBuilder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(validationRulesRegister.name.minLength),
        Validators.maxLength(validationRulesRegister.name.maxLength),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.minLength(validationRulesRegister.password.minLength)],
    ],
    reflectionTrigger: [''],
    enablePush: [false],
    enableEmail: [false],
    hour: ['08'],
    minute: ['15'],
    period: ['PM'],
  });

  firstEmailReceived = true;

  validationRules = validationRulesRegister;
  private initialFormValue: any = null;
  hasChanges = false;

  error = '';

  ngOnInit(){
    this.loadUserDetails();
    this.upliftersService.loadConnections().subscribe();
  }

  async loadUserDetails() {
  try {
    const response = await lastValueFrom(this.usersService.getUserDetails());
    const user = response.data;
    const isDeviceSubscribed = await this.reflectionReminderService.isCurrentDeviceSubscribed(
      user.reflectionDetails.pushSubscriptions || []
    );

    let hour = '08',
          minute = '15',
          period = 'PM';
        if (user.reflectionDetails.reflectionReminderTime) {
          const time = user.reflectionDetails.reflectionReminderTime;
          [hour, minute] = time.split(':');
          if (parseInt(hour) > 12) {
            hour = (parseInt(hour) - 12).toString().padStart(2, '0');
            period = 'PM';
          } else if (parseInt(hour) === 12) {
            period = 'PM';
          } else if (parseInt(hour) === 0) {
            hour = '12';
            period = 'AM';
          }
        }

    this.editUserForm.patchValue({
          name: user.name,
          email: user.email,
          password: '',
          reflectionTrigger: user.reflectionTrigger,
          enablePush: isDeviceSubscribed,
          enableEmail: user.reflectionDetails.enableEmail,
          hour,
          minute,
          period,
        });
        this.initialFormValue = this.editUserForm.getRawValue();

        this.firstEmailReceived =
          user.reflectionDetails.firstEmailReceived ?? true;
      

  } catch (err) {
     console.error('User details fetch failed', err);
     this.error = err instanceof Error ? err.message : 'Unknown error';
    this.snackBar.open('Failed to load user details', 'Close', {
      duration: 30000,
    });
  }
// ##factor out
  this.editUserForm.valueChanges.subscribe(() => {
      if (this.editUserForm.valid && this.hasFormChanged()) {
        if (!this.hasChanges) {
          this.showSavePrompt();
          this.hasChanges = true;
        }
      } else if (this.hasChanges && !this.hasFormChanged()) {
        if (this.unsavedChangesSnackBar) {
          this.unsavedChangesSnackBar.dismiss();
          this.unsavedChangesSnackBar = null;
        }
        this.hasChanges = false;
      }
    });
}




  // async ngOnInit() {
  //   // Load user details
  //   this.usersService.getUserDetails().subscribe({
  //     next: async (response) => {
  //       const user = response.data;
  //       let hour = '08',
  //         minute = '15',
  //         period = 'PM';
  //       if (user.reflectionDetails.reflectionReminderTime) {
  //         const time = user.reflectionDetails.reflectionReminderTime;
  //         [hour, minute] = time.split(':');
  //         if (parseInt(hour) > 12) {
  //           hour = (parseInt(hour) - 12).toString().padStart(2, '0');
  //           period = 'PM';
  //         } else if (parseInt(hour) === 12) {
  //           period = 'PM';
  //         } else if (parseInt(hour) === 0) {
  //           hour = '12';
  //           period = 'AM';
  //         }
  //       }
  //       const isDeviceSubscribed =
  //         await this.reflectionReminderService.isCurrentDeviceSubscribed(
  //           user.reflectionDetails.pushSubscriptions || []
  //         );
  //       this.editUserForm.patchValue({
  //         name: user.name,
  //         email: user.email,
  //         password: '',
  //         reflectionTrigger: user.reflectionTrigger,
  //         enablePush: isDeviceSubscribed,
  //         enableEmail: user.reflectionDetails.enableEmail,
  //         hour,
  //         minute,
  //         period,
  //       });
  //       this.initialFormValue = this.editUserForm.getRawValue();

  //       this.firstEmailReceived =
  //         user.reflectionDetails.firstEmailReceived ?? true;
  //     },
  //     error: () => {
  //       this.snackBar.open('Failed to load user details', 'Close', {
  //         duration: 3000,
  //       });
  //     },
  //   });

  //   // Watch for form value changes
  //   this.editUserForm.valueChanges.subscribe(() => {
  //     if (this.editUserForm.valid && this.hasFormChanged()) {
  //       if (!this.hasChanges) {
  //         this.showSavePrompt();
  //         this.hasChanges = true;
  //       }
  //     } else if (this.hasChanges && !this.hasFormChanged()) {
  //       if (this.unsavedChangesSnackBar) {
  //         this.unsavedChangesSnackBar.dismiss();
  //         this.unsavedChangesSnackBar = null;
  //       }
  //       this.hasChanges = false;
  //     }
  //   });
  // }

  private showSavePrompt() {
    if (!this.unsavedChangesSnackBar) {
      this.unsavedChangesSnackBar = this.snackBar.open(
        'Unsaved changes',
        'Save',
        {
          duration: 0,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar'],
        }
      );

      this.unsavedChangesSnackBar.onAction().subscribe(() => {
        this.saveChanges();
      });

      this.unsavedChangesSnackBar.afterDismissed().subscribe(() => {
        this.unsavedChangesSnackBar = null;
      });
    }
  }

  private hasFormChanged(): boolean {
    if (!this.initialFormValue) {
      return false;
    }

    const currentValue = this.editUserForm.getRawValue();
    const initialFormKeys = Object.keys(this.initialFormValue);

    for (const key of initialFormKeys) {
      const typedKey = key as keyof typeof currentValue;
      const initialVal = this.initialFormValue[typedKey];
      const currentVal = currentValue[typedKey];

      if (initialVal != currentVal) {
        if (
          typedKey === 'password' &&
          !this.editUserForm.get('password')?.touched
        ) {
          continue;
        }
        console.log(
          `Field changed: ${key} from ${initialVal} to ${currentVal}`
        );
        return true;
      }
    }
    return false;
  }

  loadInviteCode() {
    this.upliftersService.getInviteCode().subscribe(r => {
      if (r.success) this.$inviteCode.set(r.data.inviteCode ?? '');
    });
  }

  regenerateCode() {
    this.upliftersService.regenerateInviteCode().subscribe(r => {
      if (r.success) this.$inviteCode.set(r.data.inviteCode ?? '');
    });
  }

  copyInviteCode() {
    navigator.clipboard.writeText(this.$inviteCode());
    this.snackBar.open('Code copied!', '', { duration: 1500 });
  }

  connectByCode() {
    this.$connectError.set('');
    this.upliftersService.connect(this.$connectCode()).subscribe({
      next: r => {
        if (r.success) {
          this.$connectCode.set('');
          this.snackBar.open(`${r.data.name} added as Uplifter`, '', { duration: 2500 });
        }
      },
      error: err => {
        this.$connectError.set(err?.error?.message ?? 'Could not connect. Check the code.');
      }
    });
  }

  removeUplifter(friendId: string) {
    this.upliftersService.removeConnection(friendId).subscribe();
  }

  async saveChanges() {
    if (this.editUserForm.valid) {
      const enablePush = this.editUserForm.get('enablePush')?.value || false;
      const existingSubscriptions =
        (await this.usersService.getUserDetails().toPromise())?.data
          .reflectionDetails.pushSubscriptions || [];
      const pushSubscriptions =
        await this.reflectionReminderService.handlePushSubscription(
          enablePush,
          existingSubscriptions
        );
      const reflectionReminderTime =
        this.reflectionReminderService.getReflectionReminderTime(
          this.editUserForm
        );

      const enableEmail = this.editUserForm.get('enableEmail')?.value || false;
      const name = this.editUserForm.get('name')?.value || undefined;

      const email = this.editUserForm.get('email')?.value || undefined;

      const updatedUser: Partial<User> = {
        name: name,
        email: email,
        password: this.editUserForm.get('password')?.touched
          ? this.editUserForm.get('password')?.value || undefined
          : undefined,
        reflectionTrigger:
          this.editUserForm.get('reflectionTrigger')?.value ?? undefined,
        reflectionDetails: {
          enablePush: pushSubscriptions.length > 0,
          enableEmail: enableEmail,
          reflectionReminderTime,
          pushSubscriptions,
          
        },
      };

       if (
              !this.firstEmailReceived &&
              enableEmail &&
              !this.initialFormValue.enableEmail
              && email && name
            ) {
              this.usersService.sendTestEmail(email, name).subscribe({
                next: () => {
                  this.snackBar.open(
                    // #better english
                    'We have sent you a test email. Please check if you received one, or if it landed in the SpamFolder. If so, please unspam it, for successful receival of future reminders.',
                    'Close',
                    { duration: 10000 }
                  );
                  this.firstEmailReceived = true;

                  if (updatedUser.reflectionDetails) {
                    updatedUser.reflectionDetails.firstEmailReceived = true;
                  }
                },
                error: () => {
                  this.snackBar.open('Failed to send test email', 'Close', {
                    duration: 5000,
                  });
                },
              });
            }

      this.usersService
        .updateUser(updatedUser)
        .pipe(
          tap(() => {
            this.snackBar.open('User details updated successfully', 'Close', {
              duration: 3000,
            });
            this.hasChanges = false;
            this.editUserForm.markAsPristine();
            this.initialFormValue = this.editUserForm.getRawValue();

           
          }),
          catchError((error) => {
            this.snackBar.open('Failed to update user details', 'Close', {
              duration: 3000,
            });
            return of(null);
          })
        )
        .subscribe();
    }
  }
}
