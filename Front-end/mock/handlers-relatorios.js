// Rotas /api/relatorio/* do mock. Espelha as queries de Back-end/server/repositories/RelatorioRepository.js
// calculando sobre o db na hora. Mesmos aliases do SQL; numeric/bigint saem como string (como o driver pg faz).
(function () {
  'use strict';

  const rows = (db, tabela) => (db && db[tabela]) || [];
  const semNulo = (v) => v !== null && v !== undefined && v !== '';
  // SUM/AVG ignoram NULL; sem valores -> null
  const soma = (valores) => {
    let total = null;
    for (const v of valores) if (semNulo(v)) total = (total || 0) + Number(v);
    return total;
  };
  const decimal = (n) => (n === null ? null : (Math.round(n * 100) / 100).toFixed(2)); // NUMERIC(x,2)
  const inteiro = (n) => (n === null ? null : String(n)); // bigint
  const mesDe = (d) => (semNulo(d) ? String(d instanceof Date ? d.toISOString() : d).slice(0, 7) : null); // TO_CHAR(DATE_TRUNC('month'), 'YYYY-MM')
  const alugueisDo = (db, cpf) => rows(db, 'aluguel').filter((a) => a.cpf_cliente === cpf);
  const registrosDo = (db, cpf) => {
    const ids = alugueisDo(db, cpf).map((a) => a.id);
    return rows(db, 'registrodealugueis').filter((r) => ids.includes(r.id_aluguel));
  };

  // 1. Cliente com maior valor em aluguéis
  Mock.route('GET', '/api/relatorio/clienteMaiorValor', ({ db }) =>
    rows(db, 'cliente')
      .map((c) => ({ c, regs: registrosDo(db, c.cpf) }))
      .filter((x) => x.regs.length > 0) // JOIN: precisa ter ao menos um registro
      .map((x) => ({ c: x.c, total: soma(x.regs.map((r) => r.valor)) }))
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 1)
      .map((x) => ({ cpf: x.c.cpf, nome: x.c.nome, total_aluguel: decimal(x.total) }))
  );

  // 2. Cliente que já alugou todos os equipamentos
  Mock.route('GET', '/api/relatorio/clienteTodosEquipamentos', ({ db }) => {
    const total = rows(db, 'equipamento').length;
    return rows(db, 'cliente')
      .filter((c) => {
        const regs = registrosDo(db, c.cpf);
        const distintos = new Set(regs.map((r) => r.id_equipamento).filter(semNulo));
        return regs.length > 0 && distintos.size === total;
      })
      .map((c) => ({ cpf: c.cpf, nome: c.nome }));
  });

  // 3. Equipamento mais alugado (por quantidade)
  Mock.route('GET', '/api/relatorio/equipamentoMaisAlugado', ({ db }) => {
    const regs = rows(db, 'registrodealugueis');
    return rows(db, 'equipamento')
      .map((e) => {
        const rs = regs.filter((r) => r.id_equipamento === e.id);
        return { e, qtd: rs.length, total: soma(rs.map((r) => r.quantidade)) };
      })
      .filter((x) => x.qtd > 0) // JOIN
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 1)
      .map((x) => ({ id: x.e.id, nome: x.e.nome, total_alugado: inteiro(x.total) }));
  });

  // 4. Receita total de aluguéis por mês
  Mock.route('GET', '/api/relatorio/receitaPorMes', ({ db }) => {
    const alugueis = rows(db, 'aluguel');
    const grupos = new Map();
    for (const r of rows(db, 'registrodealugueis')) {
      const a = alugueis.find((x) => x.id === r.id_aluguel);
      if (!a) continue;
      const mes = mesDe(a.data_inicio);
      if (!grupos.has(mes)) grupos.set(mes, []);
      grupos.get(mes).push(r.valor);
    }
    return [...grupos]
      .map(([mes, valores]) => ({ mes, receita_total: decimal(soma(valores)) }))
      .sort((a, b) => (a.mes === null) - (b.mes === null) || (a.mes || '').localeCompare(b.mes || '')); // ORDER BY mes (NULL por último)
  });

  // 5. Clientes com pagamentos atrasados
  Mock.route('GET', '/api/relatorio/clientesPagamentosAtrasados', ({ db }) => {
    const vencidos = rows(db, 'pagamento').filter((p) => p.status === 'VENCIDO' && semNulo(p.id_aluguel));
    return rows(db, 'cliente')
      .map((c) => {
        const ids = new Set(alugueisDo(db, c.cpf).map((a) => a.id));
        return { c, qtd: vencidos.filter((p) => ids.has(p.id_aluguel)).length };
      })
      .filter((x) => x.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd)
      .map((x) => ({ cpf: x.c.cpf, nome: x.c.nome, qtd_atrasados: String(x.qtd) }));
  });

  // 6. Equipamentos com estoque abaixo da média
  Mock.route('GET', '/api/relatorio/equipamentosEstoqueAbaixoMedia', ({ db }) => {
    const equip = rows(db, 'equipamento');
    const qtds = equip.map((e) => e.quantidade).filter(semNulo);
    if (!qtds.length) return [];
    const media = soma(qtds) / qtds.length; // AVG(QUANTIDADE)
    return equip
      .filter((e) => semNulo(e.quantidade) && Number(e.quantidade) < media)
      .sort((a, b) => Number(a.quantidade) - Number(b.quantidade))
      .map((e) => ({ id: e.id, nome: e.nome, quantidade: e.quantidade }));
  });

  // 7. Clientes e quantidade de aluguéis ativos (inclui clientes sem aluguel, com 0)
  Mock.route('GET', '/api/relatorio/clientesAlugueisAtivos', ({ db }) => {
    const ativos = new Set(rows(db, 'alugueisativos').map((x) => x.id_aluguel).filter(semNulo));
    return rows(db, 'cliente')
      .slice()
      .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'))
      .map((c) => ({
        cpf: c.cpf,
        nome: c.nome,
        quantidade_alugueis_ativos: String(alugueisDo(db, c.cpf).filter((a) => ativos.has(a.id)).length),
      }));
  });
})();
