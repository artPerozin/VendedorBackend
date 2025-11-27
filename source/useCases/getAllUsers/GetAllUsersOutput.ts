import User from "../../domain/Entity/User";

export default interface GetAllUsersOutput {
    data: User[];
}