export enum WorkLogType {
    WORK = 'work',
    VACATION = 'vacation',
    SICK_LEAVE = 'sick_leave',
    PERMIT = 'permit'
}

export const workLogTypeOptions = [
    { value: WorkLogType.WORK, label: 'Work' },
    { value: WorkLogType.VACATION, label: 'Vacation' },
    { value: WorkLogType.SICK_LEAVE, label: 'Sick Leave' },
    { value: WorkLogType.PERMIT, label: 'Permit' }
];

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