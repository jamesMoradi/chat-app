import { User } from "src/modules/user/user.types";

declare global {
    namespace Express {
        interface Request {
            user? : {
                sub: number,
                username: string
            }
        }
    }
}