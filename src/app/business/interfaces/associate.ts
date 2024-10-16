import { Member } from "./member";

export interface Associate {
    id: number;
    name: string;
    members: Member[];
}
