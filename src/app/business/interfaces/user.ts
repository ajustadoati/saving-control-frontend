import { Member } from "./member";
import { Saving } from "./saving";

export interface User {
    id: number;
    numberId: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    company: string;
    totalRecaudado: number;
    savings: Saving[];
    totalSavings: number;
    weeklyPayments:number[];
}