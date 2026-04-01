export const MAX_SUGGESTION_LENGTH = 90;

export type SuggestionStatus = 'pending' | 'accepted' | 'dismissed';

export type ActivitySuggestion = {
  _id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  date: string;
  text: string;
  status: SuggestionStatus;
  completed: boolean;
  goal_id: string | null;
};
