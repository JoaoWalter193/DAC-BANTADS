const routePermissions = {
    "/logout": ["CLIENTE", "GERENTE", "ADMIN"],
    "/clientes": ["GERENTE", "ADMIN"],
    "/clientes/:cpf": ["GERENTE", "ADMIN"],
    "/clientes/:cpf/aprovar": ["GERENTE", "ADMIN"],
}