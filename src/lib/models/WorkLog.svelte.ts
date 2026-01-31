import { Clock, Calendar, Smile, FileText } from 'lucide-svelte';
import { formatDate, formatHours } from '$lib/utils/format.js';
import { moodsOptions } from '$lib/const/moods';

export enum WorkLogType {
    WORK = 'work',
    VACATION = 'vacation',
    SICK_LEAVE = 'sick_leave',
    PERMIT = 'permit'
}

export const WorkLogTypeMap: Record<WorkLogType, string> = {
    [WorkLogType.WORK]: 'Work',
    [WorkLogType.VACATION]: 'Vacation',
    [WorkLogType.SICK_LEAVE]: 'Sick Leave',
    [WorkLogType.PERMIT]: 'Permit'
};

export const WorkLogTypeColors: Record<WorkLogType, string> = {
    [WorkLogType.WORK]: 'bg-emerald-500',
    [WorkLogType.VACATION]: 'bg-blue-500',
    [WorkLogType.SICK_LEAVE]: 'bg-red-500',
    [WorkLogType.PERMIT]: 'bg-amber-500'
};

export class WorkLog {
    id: string;
    user_id: string;
    position_id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    break_minutes: number;
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
        this.check_in = workLog.check_in;
        this.check_out = workLog.check_out;
        this.break_minutes = workLog.break_minutes || 0;
        // Calculate hours_worked from check_in/check_out if available, otherwise use stored value
        this.hours_worked = workLog.hours_worked || this.calculateHoursWorked();
        this.type = workLog.type || WorkLogType.WORK;
        this.notes = workLog.notes;
        this.mood_rating = workLog.mood_rating;
        this.created_at = workLog.created_at;
    }

    public calculateHoursWorked(): number {
        if (!this.check_in || !this.check_out) return 0;
        
        const [inHours, inMinutes] = this.check_in.split(':').map(Number);
        const [outHours, outMinutes] = this.check_out.split(':').map(Number);
        
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes) - this.break_minutes;
        return Math.max(0, totalMinutes / 60);
    }

    public getMoodEmoji(): string {
        const moods = moodsOptions;
        return this.mood_rating ? moods.find(m => m.value === this.mood_rating)?.emoji || '—' : '—';
    }

    public getTimeRange(): string {
        if (!this.check_in || !this.check_out) return '—';
        return `${this.check_in} - ${this.check_out}`;
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
            display: (log: WorkLog) => formatHours(log.hours_worked)
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
