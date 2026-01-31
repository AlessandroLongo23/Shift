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