import { PushSubscription } from "web-push";

export interface ReflectionDetails {
  reflectionReminderTime?: string;
  latestReflectionDate?: Date;

  enablePush: boolean;
  enableEmail: boolean;
  pushSubscriptions?: PushSubscription[];

  firstEmailReceived?: boolean;
}

export interface User {
  name: string;
  email: string;
  password: string;
  timezone: string;

  reflectionTrigger: string;
  reflectionDetails: ReflectionDetails;

  tourCompleted: boolean;

  inviteCode?: string;
  connections?: string[];
}
