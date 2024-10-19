import { Member } from "./member";

export interface Associate {
    id: number;
    numberId: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    company: string;
    members: Member[];
}
