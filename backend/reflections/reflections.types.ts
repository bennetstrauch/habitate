export type Reflection = {
    _id: string;
    user_id: string;

    type: 'daily' | 'weekly';
    date: Date
    completed: boolean;

    intention?: string;
    whatWentWell?: string;

    dailyReflectionsCompleted?: number
}