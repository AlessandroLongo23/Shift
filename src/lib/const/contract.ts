export enum ContractType {
    FULL_TIME = 'full-time',
    PART_TIME = 'part-time',
    FREELANCE = 'freelance',
    STUDENT = 'student'
}

export const ContractTypeMap: Record<ContractType, string> = {
    [ContractType.FULL_TIME]: 'Full-time',
    [ContractType.PART_TIME]: 'Part-time',
    [ContractType.FREELANCE]: 'Freelance',
    [ContractType.STUDENT]: 'Student'
};