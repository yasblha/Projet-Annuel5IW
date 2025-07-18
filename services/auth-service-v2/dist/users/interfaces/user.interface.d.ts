export interface User {
    id: string | null;
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: string | null;
    status: string | null;
    agencyId: string | null;
    password?: string | null;
    activationToken?: string | null;
    resetToken?: string | null;
    passwordLastChanged?: Date | string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
}
