// Rotas mock de aluguel, alugueisAtivos, registrodeAlugueis e pagamento.
// Replica Back-end/server (controllers/services/repositories) e as triggers do bd.txt:
//  - dar_baixa_no_estoque_trg: valida e baixa estoque ao inserir em ALUGUEISATIVOS
//  - set_valor_aluguel_trg: VALOR = quantidade * dias * valor_diaria
//  - atualizar_pagamentos_trg: gera parcelas (30 * i dias) a partir do total
//  - registra_saida_aluguel_trg + atualiza_estoque_trg: ao excluir de ALUGUEISATIVOS,
//    grava em REGISTRODEALUGUEIS e repõe o estoque
// Erros usam { status, body: { message } }, como o original, para o front ler data.message.
(function () {
  const Mock = window.Mock;

  const eq = (a, b) => String(a) === String(b);
  const r2 = (n) => Math.round(Number(n) * 100) / 100; // NUMERIC(x,2)
  const money = (v) => (v == null ? null : Number(v).toFixed(2)); // pg devolve NUMERIC como string
  const fail = (status, message) => ({ status, body: { message } });
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const hojeStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const addDias = (s, n) => { const d = new Date(String(s).slice(0, 10) + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const diasEntre = (a, b) => Math.round((new Date(String(b).slice(0, 10) + 'T00:00:00Z') - new Date(String(a).slice(0, 10) + 'T00:00:00Z')) / DAY);
  const nextId = (rows) => rows.reduce((m, x) => Math.max(m, Number(x.id)), 0) + 1;
  const aluguelDe = (db, id) => db.aluguel.find((a) => eq(a.id, id));
  const equipDe = (db, id) => db.equipamento.find((e) => eq(e.id, id));
  const cpfDoAluguel = (db, idAluguel) => { const a = aluguelDe(db, idAluguel); return a ? a.cpf_cliente : null; };

  // ---------- aluguel ----------
  Mock.route('GET', '/api/aluguel/:cpfCliente', ({ params, db }) =>
    db.aluguel.filter((a) => eq(a.cpf_cliente, params.cpfCliente)));

  Mock.route('POST', '/api/aluguel/:cpfCliente', ({ params, body, db }) => {
    const cpf = params.cpfCliente;
    const equipamentos = Array.isArray(body.equipamentos) ? body.equipamentos : [];
    const parcelas = body.parcelas == null ? null : parseInt(body.parcelas, 10);

    if (!db.cliente.some((c) => eq(c.cpf, cpf)))
      return fail(500, 'insert or update on table "aluguel" violates foreign key constraint "aluguel_cpf_cliente_fkey"');

    // Valida tudo antes de gravar (o original deixava aluguel órfão se faltasse estoque)
    const necessario = {};
    const itens = [];
    for (const it of equipamentos) {
      const eqp = equipDe(db, it.id);
      if (!eqp) return fail(500, 'insert or update on table "alugueisativos" violates foreign key constraint "alugueisativos_id_equipamento_fkey"');
      const q = Number(it.quantidade);
      necessario[eqp.id] = (necessario[eqp.id] || 0) + q;
      if (Number(eqp.quantidade) < necessario[eqp.id]) return fail(500, 'A quantidade solicitada excede a quantidade em estoque');
      itens.push({ eqp, quantidade: q });
    }

    // Período: dias do primeiro equipamento (ou 30 se não houver itens)
    const dias = equipamentos.length > 0 ? Number(equipamentos[0].diarias) : 30;
    const hoje = hojeStr();
    const id = nextId(db.aluguel);
    db.aluguel.push({ id, cpf_cliente: cpf, qtde_parcelas: parcelas, data_inicio: hoje, data_fim: addDias(hoje, dias) });

    for (const { eqp, quantidade } of itens) {
      eqp.quantidade = Number(eqp.quantidade) - quantidade; // dar_baixa_no_estoque_trg
      db.alugueisativos.push({
        id_aluguel: id,
        id_equipamento: eqp.id,
        quantidade,
        valor: r2(quantidade * dias * Number(eqp.valor_diaria)), // set_valor_aluguel_trg
      });
    }

    // atualizar_pagamentos_trg: o original recalcula a cada item; o resultado final equivale a calcular uma vez
    if (itens.length > 0 && parcelas > 0) {
      const total = db.alugueisativos
        .filter((a) => eq(a.id_aluguel, id))
        .reduce((s, a) => s + Number(a.valor), 0);
      const valorParcela = r2(total / parcelas);
      for (let i = 1; i <= parcelas; i++) {
        db.pagamento.push({
          id_aluguel: id,
          parcela_numero: i,
          valor_parcela: valorParcela,
          data_vencimento: addDias(hoje, 30 * i),
          status: 'A PAGAR',
        });
      }
    }

    return { status: 201, body: { idAluguel: id } };
  });

  // ---------- alugueisAtivos ----------
  Mock.route('GET', '/api/alugueisAtivos/:cpfCliente', ({ params, db }) =>
    db.alugueisativos
      .filter((aa) => eq(cpfDoAluguel(db, aa.id_aluguel), params.cpfCliente) && equipDe(db, aa.id_equipamento))
      .map((aa) => {
        const a = aluguelDe(db, aa.id_aluguel);
        const e = equipDe(db, aa.id_equipamento);
        return {
          id_aluguel: a.id,
          id_equipamento: aa.id_equipamento,
          nome: e.nome,
          quantidade: aa.quantidade,
          valor: money(aa.valor),
          data_inicio: a.data_inicio,
          data_fim: a.data_fim,
          url_imagem: e.url_imagem,
          qtde_parcelas: a.qtde_parcelas,
        };
      }));

  Mock.route('PUT', '/api/alugueisAtivos/:idAluguel', ({ params, body, db }) => {
    if (!body.novaDataFim) return fail(400, 'Nova data final é obrigatória.');
    const linhas = db.alugueisativos.filter((a) => eq(a.id_aluguel, params.idAluguel));
    const aluguel = aluguelDe(db, params.idAluguel);
    if (linhas.length === 0 || !aluguel) return fail(500, 'Aluguel não encontrado.');

    const totalDias = diasEntre(aluguel.data_inicio, aluguel.data_fim);
    const extraDias = diasEntre(aluguel.data_fim, body.novaDataFim);
    if (!(extraDias > 0)) return fail(500, 'A nova data final deve ser posterior à data final atual.');

    // Igual ao original: a valor de partida é a da primeira linha e todas as linhas do aluguel recebem o novo valor
    const valorNum = Number(linhas[0].valor);
    const novoValor = valorNum + (valorNum / totalDias) * extraDias;
    linhas.forEach((l) => { l.valor = r2(novoValor); });
    aluguel.data_fim = String(body.novaDataFim).slice(0, 10);
    return { message: 'Aluguel atualizado com sucesso!', novoValor };
  });

  Mock.route('DELETE', '/api/alugueisAtivos/:idAluguel', ({ params, db }) => {
    const saindo = db.alugueisativos.filter((a) => eq(a.id_aluguel, params.idAluguel));
    for (const l of saindo) {
      db.registrodealugueis.push({ id_aluguel: l.id_aluguel, id_equipamento: l.id_equipamento, quantidade: l.quantidade, valor: l.valor }); // registra_saida_aluguel_trg
      const e = equipDe(db, l.id_equipamento);
      if (e) e.quantidade = Number(e.quantidade) + Number(l.quantidade); // atualiza_estoque_trg
    }
    for (let i = db.alugueisativos.length - 1; i >= 0; i--) {
      if (eq(db.alugueisativos[i].id_aluguel, params.idAluguel)) db.alugueisativos.splice(i, 1);
    }
    return { message: 'Aluguel ativo removido com sucesso!' };
  });

  // ---------- registrodeAlugueis ----------
  Mock.route('GET', '/api/registrodeAlugueis/:cpfCliente', ({ params, db }) =>
    db.registrodealugueis
      .filter((ra) => eq(cpfDoAluguel(db, ra.id_aluguel), params.cpfCliente) && equipDe(db, ra.id_equipamento))
      .map((ra) => {
        const a = aluguelDe(db, ra.id_aluguel);
        const e = equipDe(db, ra.id_equipamento);
        return {
          id_equipamento: ra.id_equipamento,
          nome: e.nome,
          quantidade: ra.quantidade,
          valor: money(ra.valor),
          data_inicio: a.data_inicio,
          data_fim: a.data_fim,
          url_imagem: e.url_imagem,
        };
      }));

  // ---------- pagamento ----------
  Mock.route('POST', '/api/pagamento', ({ body, db }) => {
    const { idAluguel, qtdeParcelas, valorTotal, dataVencimentoInicial } = body;
    if (!idAluguel || !qtdeParcelas || !valorTotal || !dataVencimentoInicial)
      return fail(400, 'Dados insuficientes para criar pagamento.');
    if (!aluguelDe(db, idAluguel))
      return fail(500, 'insert or update on table "pagamento" violates foreign key constraint "pagamento_id_aluguel_fkey"');

    const n = parseInt(qtdeParcelas, 10);
    const valorParcela = parseFloat(valorTotal) / n;
    const novos = [];
    for (let i = 1; i <= n; i++) {
      // Mesmo cálculo do PagamentoService: uma parcela por mês a partir da data inicial
      const d = new Date(dataVencimentoInicial);
      d.setMonth(d.getMonth() + (i - 1));
      novos.push({
        id_aluguel: Number(idAluguel),
        parcela_numero: i,
        valor_parcela: r2(valorParcela),
        data_vencimento: d.toISOString().split('T')[0],
        status: 'A PAGAR',
      });
    }
    if (novos.some((p) => db.pagamento.some((x) => eq(x.id_aluguel, p.id_aluguel) && eq(x.parcela_numero, p.parcela_numero))))
      return fail(500, 'duplicate key value violates unique constraint "pagamento_pkey"');
    db.pagamento.push(...novos);
    return { status: 201, body: { message: 'Pagamentos criados com sucesso.' } };
  });

  Mock.route('GET', '/api/pagamento/:cpfCliente', ({ params, db }) =>
    db.pagamento
      .filter((p) => eq(cpfDoAluguel(db, p.id_aluguel), params.cpfCliente))
      .sort((a, b) => (Number(a.id_aluguel) - Number(b.id_aluguel)) || (Number(a.parcela_numero) - Number(b.parcela_numero)))
      .map((p) => ({ ...p, valor_parcela: money(p.valor_parcela), cpf_cliente: cpfDoAluguel(db, p.id_aluguel) })));

  Mock.route('PUT', '/api/pagamento/:idAluguel/:parcelaNumero', ({ params, body, db }) => {
    if (!body.status) return fail(400, 'Status é obrigatório.');
    if (!['PAGO', 'VENCIDO', 'A PAGAR'].includes(body.status))
      return fail(500, 'new row for relation "pagamento" violates check constraint "pagamento_status_check"');
    const p = db.pagamento.find((x) => eq(x.id_aluguel, params.idAluguel) && eq(x.parcela_numero, params.parcelaNumero));
    if (!p) return {}; // original devolve 200 sem corpo quando não acha
    p.status = body.status;
    return { ...p, valor_parcela: money(p.valor_parcela) };
  });

  Mock.route('DELETE', '/api/pagamento/:idAluguel/:parcelaNumero', ({ params, db }) => {
    let n = 0;
    for (let i = db.pagamento.length - 1; i >= 0; i--) {
      const p = db.pagamento[i];
      if (eq(p.id_aluguel, params.idAluguel) && eq(p.parcela_numero, params.parcelaNumero)) { db.pagamento.splice(i, 1); n++; }
    }
    return { message: 'Pagamento removido com sucesso!', result: { command: 'DELETE', rowCount: n, rows: [] } };
  });
})();
