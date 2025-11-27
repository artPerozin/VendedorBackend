import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import MemoryRepositoryFactory from "../source/infra/repository/MemoryRepositoryFactory";
import CreateUser from "../source/useCases/createUser/CreateUser";
import FindUserById from "../source/useCases/findUserById/FindUserById";

let repositoryFactory: RepositoryFactoryInterface;

beforeEach(() => {
  repositoryFactory = new MemoryRepositoryFactory();
});

describe("FindUserById", () => {

  test("Deve encontrar um usuário pelo ID", async () => {
    const createUser = new CreateUser(repositoryFactory);
    const createInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "senha123",
    };
    await createUser.execute(createInput);

    const userRepository = repositoryFactory.createUserRepository();
    const users = await userRepository.getAll();
    const userId = users[0].id;

    const findUserById = new FindUserById(repositoryFactory);
    const output = await findUserById.execute({ userId });

    expect(output.user).toBeDefined();
    expect(output.user.id).toBe(userId);
    expect(output.user.email).toBe("john.doe@example.com");
  });

  test("Deve lançar erro quando o userId não for fornecido", async () => {
    const findUserById = new FindUserById(repositoryFactory);

    await expect(findUserById.execute({ userId: "" })).rejects.toThrow(
      "O campo 'userId' é obrigatório"
    );
  });

  test("Deve lançar erro quando o userId for null", async () => {
    const findUserById = new FindUserById(repositoryFactory);

    await expect(findUserById.execute({ userId: null as any })).rejects.toThrow(
      "O campo 'userId' é obrigatório"
    );
  });

  test("Deve lançar erro quando o userId for undefined", async () => {
    const findUserById = new FindUserById(repositoryFactory);

    await expect(findUserById.execute({ userId: undefined as any })).rejects.toThrow(
      "O campo 'userId' é obrigatório"
    );
  });

  test("Deve lançar erro quando nenhum usuário for encontrado", async () => {
    const findUserById = new FindUserById(repositoryFactory);
    const userId = "id-inexistente-999";

    await expect(findUserById.execute({ userId })).rejects.toThrow(
      "O campo 'userId' deve ser um UUID válido"
    );
  });

  test("Deve verificar se há usuários no repositório antes e depois de criar", async () => {
    const userRepository = repositoryFactory.createUserRepository();
    expect(await userRepository.getAll()).toHaveLength(0);

    const createUser = new CreateUser(repositoryFactory);
    const input = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "senha123",
    };

    await createUser.execute(input);

    expect(await userRepository.getAll()).toHaveLength(1);
    
    const users = await userRepository.getAll();
    const findUserById = new FindUserById(repositoryFactory);
    const output = await findUserById.execute({ userId: users[0].id });
    
    expect(output.user.email).toBe("jane.doe@example.com");
  });

  test("Deve encontrar o usuário correto quando há múltiplos usuários", async () => {
    const createUser = new CreateUser(repositoryFactory);
    
    await createUser.execute({
      name: "User 1",
      email: "user1@example.com",
      password: "senha123",
    });

    await createUser.execute({
      name: "User 2",
      email: "user2@example.com",
      password: "senha123",
    });

    await createUser.execute({
      name: "User 3",
      email: "user3@example.com",
      password: "senha123",
    });

    const userRepository = repositoryFactory.createUserRepository();
    const users = await userRepository.getAll();
    expect(users).toHaveLength(3);

    const findUserById = new FindUserById(repositoryFactory);
    const output = await findUserById.execute({ userId: users[1].id });

    expect(output.user.email).toBe("user2@example.com");
  });
});