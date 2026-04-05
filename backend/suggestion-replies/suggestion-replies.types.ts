export const MAX_REPLY_LENGTH = 120;

export type SuggestionReply = {
  _id: string;
  suggestion_id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;       // the uplifter who sent the original suggestion
  suggestion_text: string;  // snapshot of original suggestion text
  text: string;
  seen: boolean;
};
