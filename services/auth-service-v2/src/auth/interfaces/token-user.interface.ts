export interface TokenUser {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    agencyId: string;
    status: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  };
}
