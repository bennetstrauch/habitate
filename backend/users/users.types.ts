import { PushSubscription } from "web-push";

export interface ReflectionDetails {
  reflectionReminderTime?: string;
  latestReflectionDate?: Date;

  enablePush: boolean;
  enableEmail: boolean;
  pushSubscription?: PushSubscription ;
}

export interface User {
  name: string;
  email: string;
  password: string;
  timezone: string;

  reflectionTrigger: string;
  reflectionDetails: ReflectionDetails;
 
  tourCompleted: boolean;
}
