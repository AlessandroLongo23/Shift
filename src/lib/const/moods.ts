export enum Mood {
    VERY_BAD = 1,
    BAD = 2,
    OKAY = 3,
    GOOD = 4,
    GREAT = 5
}

export const moodsOptions = [
    { value: Mood.VERY_BAD, emoji: '😢', label: 'Very Bad' },
    { value: Mood.BAD, emoji: '😕', label: 'Bad' },
    { value: Mood.OKAY, emoji: '😐', label: 'Okay' },
    { value: Mood.GOOD, emoji: '🙂', label: 'Good' },
    { value: Mood.GREAT, emoji: '😄', label: 'Great' }
];