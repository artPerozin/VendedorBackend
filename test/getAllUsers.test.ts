import RepositoryFactoryInterface from "../source/domain/Interfaces/RepositoryFactoryInterface";
import MemoryRepositoryFactory from "../source/infra/repository/MemoryRepositoryFactory";
import CreateUser from "../source/useCases/createUser/CreateUser";
import GetAllUsers from "../source/useCases/getAllUsers/GetAllUsers";

let repositoryFactory: RepositoryFactoryInterface;

beforeEach(() => {
  repositoryFactory = new MemoryRepositoryFactory();
});

describe("GetAllUsers", () => {

  test("Deve retornar array vazio quando não houver usuários", async () => {
    const getAllUsers = new GetAllUsers(repositoryFactory);

    const output = await getAllUsers.execute();

    expect(output.data).toEqual([]);
    expect(output.data).toHaveLength(0);
  });

  test("Deve retornar todos os usuários quando existirem usuários cadastrados", async () => {
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

    const getAllUsers = new GetAllUsers(repositoryFactory);
    const output = await getAllUsers.execute();

    expect(output.data).toHaveLength(3);
    expect(output.data[0].email).toBe("user1@example.com");
    expect(output.data[1].email).toBe("user2@example.com");
    expect(output.data[2].email).toBe("user3@example.com");
  });

  test("Deve retornar um único usuário quando houver apenas um cadastrado", async () => {
    const createUser = new CreateUser(repositoryFactory);
    await createUser.execute({
      name: "Single User",
      email: "single@example.com",
      password: "senha123",
    });

    const getAllUsers = new GetAllUsers(repositoryFactory);
    const output = await getAllUsers.execute();

    expect(output.data).toHaveLength(1);
    expect(output.data[0].email).toBe("single@example.com");
  });

  test("Deve verificar se há registros no repositório antes e depois de criar usuários", async () => {
    const userRepository = repositoryFactory.createUserRepository();
    expect(await userRepository.getAll()).toHaveLength(0);

    const createUser = new CreateUser(repositoryFactory);
    const input = {
      name: "John",
      email: "john.doe@konvex.com.br",
      password: "senha123",
    };

    await createUser.execute(input);

    expect(await userRepository.getAll()).toHaveLength(1);

    const getAllUsers = new GetAllUsers(repositoryFactory);
    const output = await getAllUsers.execute();
    expect(output.data).toHaveLength(1);
  });

  test("Deve retornar usuários na ordem correta de criação", async () => {
    const createUser = new CreateUser(repositoryFactory);
    const emails = [
      "first@example.com",
      "second@example.com",
      "third@example.com",
    ];

    for (const email of emails) {
      await createUser.execute({
        name: email.split("@")[0],
        email: email,
        password: "senha123",
      });
    }

    const getAllUsers = new GetAllUsers(repositoryFactory);
    const output = await getAllUsers.execute();

    expect(output.data).toHaveLength(3);
    output.data.forEach((user, index) => {
      expect(user.email).toBe(emails[index]);
    });
  });

  test("Deve retornar usuários com todas as propriedades esperadas", async () => {
    const createUser = new CreateUser(repositoryFactory);
    await createUser.execute({
      name: "Test User",
      email: "test@example.com",
      password: "senha123",
    });

    const getAllUsers = new GetAllUsers(repositoryFactory);
    const output = await getAllUsers.execute();

    expect(output.data).toHaveLength(1);
    expect(output.data[0]).toHaveProperty("id");
    expect(output.data[0]).toHaveProperty("email");
    expect(output.data[0]).toHaveProperty("password");
    expect(output.data[0].id).toBeTruthy();
    expect(output.data[0].email).toBe("test@example.com");
  });
});