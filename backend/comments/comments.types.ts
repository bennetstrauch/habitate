export type Comment = {
  _id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  habit_id: string;
  habit_name: string;
  date: Date;
  text: string;
};

export const MAX_COMMENT_LENGTH = 120;
