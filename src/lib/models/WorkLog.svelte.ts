import { Clock, Calendar, Smile, FileText } from 'lucide-svelte';
import { formatDate } from '$lib/utils/format.js';

export type WorkLogType = 'work' | 'vacation' | 'sick_leave' | 'permit';

export const WorkLogTypeMap: Record<WorkLogType, string> = {
    'work': 'Work',
    'vacation': 'Vacation',
    'sick_leave': 'Sick Leave',
    'permit': 'Permit'
};

export const WorkLogTypeColors: Record<WorkLogType, string> = {
    'work': 'bg-emerald-500',
    'vacation': 'bg-blue-500',
    'sick_leave': 'bg-red-500',
    'permit': 'bg-amber-500'
};

export class WorkLog {
    id: string;
    user_id: string;
    position_id: string;
    date: string;
    hours_worked: number;
    type: WorkLogType;
    notes: string | null;
    mood_rating: number | null;
    created_at: string;

    constructor(workLog: any) {
        this.id = workLog.id;
        this.user_id = workLog.user_id;
        this.position_id = workLog.position_id;
        this.date = workLog.date;
        this.hours_worked = workLog.hours_worked || 0;
        this.type = workLog.type || 'work';
        this.notes = workLog.notes;
        this.mood_rating = workLog.mood_rating;
        this.created_at = workLog.created_at;
    }

    public getMoodEmoji(): string {
        const moods = ['😢', '😕', '😐', '🙂', '😄'];
        return this.mood_rating ? moods[this.mood_rating - 1] : '—';
    }

    public static dataColumns: any[] = [
        {
            label: 'Date',
            key: 'date',
            sortable: true,
            icon: Calendar,
            display: (log: WorkLog) => formatDate(log.date, 'full')
        },
        {
            label: 'Hours',
            key: 'hours_worked',
            sortable: true,
            icon: Clock,
            display: (log: WorkLog) => `${log.hours_worked}h`
        },
        {
            label: 'Type',
            key: 'type',
            sortable: true,
            icon: FileText,
            display: (log: WorkLog) => {
                return `<span class="inline-flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full ${WorkLogTypeColors[log.type]}"></span>
                    ${WorkLogTypeMap[log.type]}
                </span>`;
            }
        },
        {
            label: 'Mood',
            key: 'mood_rating',
            sortable: true,
            icon: Smile,
            display: (log: WorkLog) => log.getMoodEmoji()
        }
    ];
}
