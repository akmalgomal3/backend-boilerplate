import { Module } from "@nestjs/common";
import { UserRepository } from "./repository/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controller/user.controller";
import { RolesModule } from "src/roles/roles.module";
import { RolesRepository } from "src/roles/repository/roles.repository";

@Module({
    providers: [
        UserRepository,
        UserService, 
        RolesRepository
    ],
    controllers: [UserController],
    exports: [UserService]
})
export class UsersModule { }