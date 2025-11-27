import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import MemoryRepositoryFactory from "../source/infra/repository/MemoryRepositoryFactory";
import CreateUser from "../source/useCases/createUser/CreateUser";
import LoginUser from "../source/useCases/loginUser/LoginUser";

describe("LoginUser use case", () => {
    let loginUser: LoginUser;
    let repositoryFactory: RepositoryFactoryInterface;

    beforeEach(() => {
        repositoryFactory = new MemoryRepositoryFactory();
        loginUser = new LoginUser(repositoryFactory);
    });

    test("Deve gerar um token para usuário válido", async () => {
        const createUser = new CreateUser(repositoryFactory);
        const userInput = {
            name: "John",
            email: "john.doe@gmail.com.br",
            password: "senha123",
        };
        await createUser.execute(userInput);
        const loginOutput = await loginUser.execute({
            email: "john.doe@gmail.com.br",
            password: "senha123",
        });

        expect(loginOutput.accessToken).toBeDefined();
    });

    test("Deve falhar se o usuário não existir", async () => {
        await expect(
            loginUser.execute({ email: "no.user@gmail.com.br", password: "123456" })
        ).rejects.toThrow("Credenciais inválidas");
    });

    test("Deve falhar se a senha estiver incorreta", async () => {
        const createUser = new CreateUser(repositoryFactory);
        const userInput = {
            name: "John",
            email: "john.doe@gmail.com.br",
            password: "senha123",
        };
        await createUser.execute(userInput);
        await expect(
            loginUser.execute({ email: "jane.doe@gmail.com.br", password: "senhaErrada" })
        ).rejects.toThrow("Credenciais inválidas");
    });
});
