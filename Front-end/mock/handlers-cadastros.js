// Rotas mock de cliente, fornecedor e equipamento, espelhando Back-end/server (controllers, services, repositories).
// Erros são devolvidos como { status, body: { message } } (não por throw), porque o core.js monta o erro lançado
// com a chave "error", e o front lê "message".
(function () {
  const Mock = window.Mock;

  const erro = (status, message) => ({ status, body: { message } });
  const same = (a, b) => String(a) === String(b);

  // ---------------- CLIENTE ----------------
  Mock.route('GET', '/api/cliente', ({ db }) => db.cliente);

  Mock.route('GET', '/api/cliente/:cpf', ({ params, db }) =>
    db.cliente.find((c) => same(c.cpf, params.cpf)) || {});

  Mock.route('POST', '/api/cliente/cadastrar', ({ body, db }) => {
    const { cpf, nome, cep, numero, complemento, telefone, senha } = body;
    if (cpf != null && db.cliente.some((c) => same(c.cpf, cpf))) return erro(400, 'CPF já cadastrado.');
    // NOT NULL do CREATE TABLE, na ordem das colunas
    for (const [col, v] of [['cpf', cpf], ['nome', nome], ['cep', cep], ['numero', numero]]) {
      if (v == null) return erro(400, `Erro ao cadastrar cliente: null value in column "${col}" of relation "cliente" violates not-null constraint`);
    }
    db.cliente.push({ cpf, nome, cep, numero, complemento: complemento ?? null, telefone: telefone ?? null, senha: senha ?? null });
    return { status: 201, body: { message: 'Cliente cadastrado com sucesso!' } };
  });

  Mock.route('POST', '/api/cliente/login', ({ body, db }) => {
    const cliente = db.cliente.find((c) => same(c.cpf, body.cpf));
    if (!cliente) return erro(400, 'CPF não cadastrado.');
    if (cliente.senha !== body.senha) return erro(400, 'Senha incorreta.');
    return { status: 200, body: cliente };
  });

  Mock.route('PUT', '/api/cliente/:cpf', ({ params, body, db }) => {
    const cpfAntigo = params.cpf;
    const { cpf: cpfNovo, nome, cep, numero, complemento, telefone, senha } = body;
    if (!cpfNovo || !nome || !cep || !numero || !telefone || !senha) return erro(400, 'Todos os campos são obrigatórios.');
    const atual = db.cliente.find((c) => same(c.cpf, cpfAntigo));
    if (!atual) return erro(400, 'CPF não encontrado.');
    if (!same(cpfNovo, cpfAntigo) && db.cliente.some((c) => same(c.cpf, cpfNovo))) {
      return erro(400, 'Erro ao atualizar cliente: duplicate key value violates unique constraint "cliente_pkey"');
    }
    Object.assign(atual, { cpf: cpfNovo, nome, cep, numero, complemento: complemento ?? null, telefone, senha });
    // ON UPDATE CASCADE de ALUGUEL.CPF_CLIENTE
    db.aluguel.forEach((a) => { if (same(a.cpf_cliente, cpfAntigo)) a.cpf_cliente = cpfNovo; });
    return { message: 'Cliente atualizado com sucesso!', cliente: atual };
  });

  Mock.route('DELETE', '/api/cliente/:cpf', ({ params, db }) => {
    const cliente = db.cliente.find((c) => same(c.cpf, params.cpf));
    if (!cliente) return erro(400, 'Erro ao deletar cliente: Cliente não encontrado.');
    const ids = db.aluguel.filter((a) => same(a.cpf_cliente, cliente.cpf)).map((a) => a.id);
    const doCliente = (r) => ids.some((i) => same(i, r.id_aluguel));
    // Trigger BEFORE DELETE em ALUGUEISATIVOS devolve o estoque (o registro de saída não é recriado)
    db.alugueisativos.filter(doCliente).forEach((x) => {
      const eq = db.equipamento.find((e) => same(e.id, x.id_equipamento));
      if (eq) eq.quantidade = Number(eq.quantidade || 0) + Number(x.quantidade);
    });
    // ON DELETE CASCADE de ALUGUEL
    db.alugueisativos = db.alugueisativos.filter((r) => !doCliente(r));
    db.registrodealugueis = db.registrodealugueis.filter((r) => !doCliente(r));
    db.pagamento = db.pagamento.filter((r) => !doCliente(r));
    db.aluguel = db.aluguel.filter((a) => !ids.some((i) => same(i, a.id)));
    db.cliente = db.cliente.filter((c) => c !== cliente);
    return { message: 'Cliente deletado com sucesso!', cliente };
  });

  // ---------------- FORNECEDOR ----------------
  Mock.route('GET', '/api/fornecedor', ({ db }) => db.fornecedor);

  Mock.route('GET', '/api/fornecedor/:cnpj', ({ params, db }) =>
    db.fornecedor.find((f) => same(f.cnpj, params.cnpj)) || {});

  Mock.route('POST', '/api/fornecedor/cadastrar', ({ body, db }) => {
    const { cnpj, nomeFantasia, telefone, email } = body;
    if (!cnpj || !nomeFantasia || !telefone || !email) return erro(400, 'Todos os campos são obrigatórios.');
    if (db.fornecedor.some((f) => same(f.cnpj, cnpj))) {
      return erro(400, 'Erro ao adicionar fornecedor: duplicate key value violates unique constraint "fornecedor_pkey"');
    }
    db.fornecedor.push({ cnpj, nome_fantasia: nomeFantasia, telefone, email });
    return { status: 201, body: { message: 'Fornecedor cadastrado com sucesso!' } };
  });

  Mock.route('PUT', '/api/fornecedor/:cnpj', ({ params, body, db }) => {
    const cnpjAntigo = params.cnpj;
    const { cnpj: cnpjNovo, nomeFantasia, telefone, email } = body;
    if (!cnpjNovo || !nomeFantasia || !telefone || !email) return erro(400, 'Todos os campos são obrigatórios.');
    const atual = db.fornecedor.find((f) => same(f.cnpj, cnpjAntigo));
    if (!atual) return erro(400, 'Erro ao atualizar fornecedor: Fornecedor não encontrado.');
    if (!same(cnpjNovo, cnpjAntigo) && db.fornecedor.some((f) => same(f.cnpj, cnpjNovo))) {
      return erro(400, 'Erro ao atualizar fornecedor: duplicate key value violates unique constraint "fornecedor_pkey"');
    }
    Object.assign(atual, { cnpj: cnpjNovo, nome_fantasia: nomeFantasia, telefone, email });
    // ON UPDATE CASCADE de EQUIPAMENTO.CNPJ_FORNECEDOR
    db.equipamento.forEach((e) => { if (same(e.cnpj_fornecedor, cnpjAntigo)) e.cnpj_fornecedor = cnpjNovo; });
    return { status: 200, body: { message: 'Fornecedor atualizado com sucesso!' } };
  });

  Mock.route('DELETE', '/api/fornecedor/:cnpj', ({ params, db }) => {
    const fornecedor = db.fornecedor.find((f) => same(f.cnpj, params.cnpj));
    if (!fornecedor) return erro(400, 'Erro ao remover fornecedor: Fornecedor não encontrado.');
    // FK sem ON DELETE: com equipamentos vinculados, o banco bloqueia a remoção
    if (db.equipamento.some((e) => same(e.cnpj_fornecedor, fornecedor.cnpj))) {
      return erro(400, 'Erro ao remover fornecedor: update or delete on table "fornecedor" violates foreign key constraint "equipamento_cnpj_fornecedor_fkey" on table "equipamento"');
    }
    db.fornecedor = db.fornecedor.filter((f) => f !== fornecedor);
    // Mensagem igual à do original (inclusive o typo "removcnpjo")
    return { status: 200, body: { message: 'Fornecedor removcnpjo com sucesso!' } };
  });

  // ---------------- EQUIPAMENTO ----------------
  Mock.route('GET', '/api/equipamento', ({ db }) => db.equipamento);

  Mock.route('GET', '/api/equipamento/:id', ({ params, db }) =>
    db.equipamento.find((e) => same(e.id, params.id)) || {});

  Mock.route('POST', '/api/equipamento/cadastrar', ({ body, db }) => {
    const { nome, cnpj_fornecedor, quantidade, descricao, valor_diaria, url_imagem } = body;
    // NOT NULL do CREATE TABLE, na ordem das colunas
    for (const [col, v] of [['nome', nome], ['descricao', descricao], ['valor_diaria', valor_diaria]]) {
      if (v == null) return erro(400, `Erro ao cadastrar equipamento: null value in column "${col}" of relation "equipamento" violates not-null constraint`);
    }
    if (cnpj_fornecedor != null && !db.fornecedor.some((f) => same(f.cnpj, cnpj_fornecedor))) {
      return erro(400, 'Erro ao cadastrar equipamento: insert or update on table "equipamento" violates foreign key constraint "equipamento_cnpj_fornecedor_fkey"');
    }
    // SERIAL: maior id + 1
    const id = Math.max(0, ...db.equipamento.map((e) => Number(e.id))) + 1;
    db.equipamento.push({ id, nome, cnpj_fornecedor: cnpj_fornecedor ?? null, quantidade, descricao, valor_diaria, url_imagem: url_imagem ?? null });
    return { status: 201, body: { message: 'Equipamento cadastrado com sucesso!' } };
  });

  Mock.route('PUT', '/api/equipamento/:id', ({ params, body, db }) => {
    const { nome, cnpj_fornecedor, quantidade, descricao, valor_diaria, url_imagem } = body;
    if (!nome || !cnpj_fornecedor || !quantidade || !descricao || !valor_diaria || !url_imagem) {
      return erro(400, 'Todos os campos são obrigatórios.');
    }
    const atual = db.equipamento.find((e) => same(e.id, params.id));
    if (!atual) return erro(400, 'Equipamento não encontrado.');
    if (!db.fornecedor.some((f) => same(f.cnpj, cnpj_fornecedor))) {
      return erro(400, 'Erro ao atualizar equipamento: insert or update on table "equipamento" violates foreign key constraint "equipamento_cnpj_fornecedor_fkey"');
    }
    Object.assign(atual, { nome, cnpj_fornecedor, quantidade, descricao, valor_diaria, url_imagem });
    return { message: 'Equipamento atualizado com sucesso!', equipamento: atual };
  });

  Mock.route('DELETE', '/api/equipamento/:id', ({ params, db }) => {
    const equipamento = db.equipamento.find((e) => same(e.id, params.id));
    if (!equipamento) return erro(400, 'Erro ao deletar equipamento: Equipamento não encontrado.');
    // FKs sem ON DELETE: equipamento em uso em aluguel ou histórico não pode ser apagado
    if (db.alugueisativos.some((x) => same(x.id_equipamento, equipamento.id))) {
      return erro(400, 'Erro ao deletar equipamento: update or delete on table "equipamento" violates foreign key constraint "alugueisativos_id_equipamento_fkey" on table "alugueisativos"');
    }
    if (db.registrodealugueis.some((x) => same(x.id_equipamento, equipamento.id))) {
      return erro(400, 'Erro ao deletar equipamento: update or delete on table "equipamento" violates foreign key constraint "registrodealugueis_id_equipamento_fkey" on table "registrodealugueis"');
    }
    db.equipamento = db.equipamento.filter((e) => e !== equipamento);
    return { message: 'Equipamento deletado com sucesso!' };
  });
})();
