const formulario = document.getElementById("formulario");
const listaProdutos = document.getElementById("listaProdutos");
const btnAdicionarProduto = document.getElementById("btnAdicionarProduto");
const btnCalcular = document.getElementById("btnCalcular");
const btnLimpar = document.getElementById("btnLimpar");
const btnGerarPdf = document.getElementById("btnGerarPdf");

const formaPagamento = document.getElementById("formaPagamento");
const percentualTaxaEl = document.getElementById("percentualTaxa");
const totalProdutosUsadosEl = document.getElementById("totalProdutosUsados");

// Veículo
const kmRodadoInput = document.getElementById("kmRodado");
const consumoVeiculoInput = document.getElementById("consumoVeiculo");
const precoGasolinaInput = document.getElementById("precoGasolina");
const desgasteKmInput = document.getElementById("desgasteKm");

const gastoCombustivelEl = document.getElementById("gastoCombustivel");
const custoDesgasteVeiculoEl = document.getElementById("custoDesgasteVeiculo");
const custoVeiculoTotalEl = document.getElementById("custoVeiculoTotal");

// Outros custos
const maoDeObraInput = document.getElementById("maoDeObra");
const outrosCustosInput = document.getElementById("outrosCustos");
const valorCobradoInput = document.getElementById("valorCobrado");
const valorTaxaMaquinaEl = document.getElementById("valorTaxaMaquina");

// Resumo
const resProdutoEl = document.getElementById("resProduto");
const resCombustivelEl = document.getElementById("resCombustivel");
const resDesgasteEl = document.getElementById("resDesgaste");
const resVeiculoEl = document.getElementById("resVeiculo");
const resMaoDeObraEl = document.getElementById("resMaoDeObra");
const resTaxaEl = document.getElementById("resTaxa");
const resOutrosEl = document.getElementById("resOutros");
const resCobradoEl = document.getElementById("resCobrado");

// Resultado final
const custoTotalEl = document.getElementById("custoTotal");
const lucroFinalEl = document.getElementById("lucroFinal");
const margemLucroEl = document.getElementById("margemLucro");
const mensagemLucroEl = document.getElementById("mensagemLucro");

let contadorProdutos = 0;

const TAXAS_MAQUININHA = {
  dinheiro: 0,
  pix: 0,
  debito: 1.99,
  credito: 4.99
};

function numero(valor) {
  const n = parseFloat(valor);
  return isNaN(n) ? 0 : n;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarPercentual(valor) {
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function obterTaxaMaquininha() {
  return TAXAS_MAQUININHA[formaPagamento.value] ?? 0;
}

function atualizarPercentualTaxa() {
  percentualTaxaEl.textContent = formatarPercentual(obterTaxaMaquininha());
}

function criarProdutoCard() {
  contadorProdutos += 1;

  const card = document.createElement("div");
  card.className = "produto-card";
  card.dataset.produtoId = contadorProdutos;

  card.innerHTML = `
    <div class="produto-card-topo">
      <h3>Produto ${contadorProdutos}</h3>
      <button type="button" class="btn remover btn-remover-produto">Remover</button>
    </div>

    <div class="grid">
      <div class="campo full">
        <label>Nome do produto</label>
        <input type="text" class="produto-nome" placeholder="Ex: Extractus, Bactran..." />
      </div>

      <div class="campo">
        <label>Valor pago no produto (R$)</label>
        <input type="number" class="produto-valor" min="0" step="0.01" placeholder="60.00" />
      </div>

      <div class="campo">
        <label>Quantidade total da embalagem (ml)</label>
        <input type="number" class="produto-embalagem" min="1" step="0.01" placeholder="5000" />
      </div>

      <div class="campo">
        <label>Quantidade usada no serviço (ml)</label>
        <input type="number" class="produto-usado" min="0" step="0.01" placeholder="100" />
      </div>

      <div class="campo caixa-resultado">
        <span class="mini-titulo">Custo por ml</span>
        <strong class="produto-custo-ml">R$ 0,00</strong>
      </div>

      <div class="campo caixa-resultado">
        <span class="mini-titulo">Custo do produto usado</span>
        <strong class="produto-custo-usado">R$ 0,00</strong>
      </div>
    </div>
  `;

  listaProdutos.appendChild(card);

  const removerBtn = card.querySelector(".btn-remover-produto");
  removerBtn.addEventListener("click", () => {
    if (document.querySelectorAll(".produto-card").length === 1) {
      card.querySelectorAll("input").forEach((input) => (input.value = ""));
      calcularTudo();
      return;
    }

    card.remove();
    recalcularTitulosProdutos();
    calcularTudo();
  });

  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", calcularTudo);
  });
}

function coletarProdutosParaRelatorio() {
  const cards = document.querySelectorAll(".produto-card");

  return Array.from(cards).map((card, index) => {
    const nome = card.querySelector(".produto-nome").value || `Produto ${index + 1}`;
    const valor = numero(card.querySelector(".produto-valor").value);
    const embalagem = numero(card.querySelector(".produto-embalagem").value);
    const usado = numero(card.querySelector(".produto-usado").value);

    let custoPorMl = 0;
    let custoUsado = 0;

    if (valor > 0 && embalagem > 0) {
      custoPorMl = valor / embalagem;
      custoUsado = custoPorMl * usado;
    }

    return {
      nome,
      valor,
      embalagem,
      usado,
      custoPorMl,
      custoUsado
    };
  });
}

function obterDadosRelatorio() {
  const produtos = coletarProdutosParaRelatorio();

  const totalProdutos = produtos.reduce((acc, item) => acc + item.custoUsado, 0);

  const kmRodado = numero(kmRodadoInput.value);
  const consumoVeiculo = numero(consumoVeiculoInput.value);
  const precoGasolina = numero(precoGasolinaInput.value);
  const desgasteKm = numero(desgasteKmInput.value);

  const maoDeObra = numero(maoDeObraInput.value);
  const outrosCustos = numero(outrosCustosInput.value);
  const valorCobrado = numero(valorCobradoInput.value);

  const taxaMaquina = obterTaxaMaquininha();

  let gastoCombustivel = 0;
  if (kmRodado > 0 && consumoVeiculo > 0 && precoGasolina > 0) {
    gastoCombustivel = (kmRodado / consumoVeiculo) * precoGasolina;
  }

  const custoDesgasteVeiculo = kmRodado * desgasteKm;
  const custoVeiculoTotal = gastoCombustivel + custoDesgasteVeiculo;
  const valorTaxaMaquina = valorCobrado * (taxaMaquina / 100);

  const custoTotal =
    totalProdutos +
    custoVeiculoTotal +
    maoDeObra +
    valorTaxaMaquina +
    outrosCustos;

  const lucroFinal = valorCobrado - custoTotal;
  const margemLucro = valorCobrado > 0 ? (lucroFinal / valorCobrado) * 100 : 0;

  return {
    dataGeracao: new Date().toLocaleString("pt-BR"),
    formaPagamento: formaPagamento.options[formaPagamento.selectedIndex].text,
    taxaMaquina,
    produtos,
    totalProdutos,
    kmRodado,
    consumoVeiculo,
    precoGasolina,
    desgasteKm,
    gastoCombustivel,
    custoDesgasteVeiculo,
    custoVeiculoTotal,
    maoDeObra,
    outrosCustos,
    valorCobrado,
    valorTaxaMaquina,
    custoTotal,
    lucroFinal,
    margemLucro
  };
}

function gerarHtmlRelatorio(dados) {
  const linhasProdutos = dados.produtos.map((produto) => `
    <tr>
      <td>${produto.nome}</td>
      <td>${formatarMoeda(produto.valor)}</td>
      <td>${produto.embalagem.toLocaleString("pt-BR")} ml</td>
      <td>${produto.usado.toLocaleString("pt-BR")} ml</td>
      <td>${formatarMoeda(produto.custoPorMl)}</td>
      <td>${formatarMoeda(produto.custoUsado)}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Relatório de Custos por Serviço</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          margin: 32px;
          color: #1f2937;
        }

        h1, h2 {
          margin: 0 0 12px;
        }

        .topo {
          margin-bottom: 24px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 16px;
        }

        .topo p {
          margin: 4px 0;
          color: #4b5563;
        }

        .bloco {
          margin-bottom: 28px;
        }

        .card {
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 16px;
          background: #f9fafb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }

        th, td {
          border: 1px solid #d1d5db;
          padding: 10px;
          text-align: left;
          font-size: 14px;
        }

        th {
          background: #eff6ff;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .item {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
        }

        .item strong {
          display: block;
          margin-top: 4px;
        }

        .resultado {
          border: 2px solid #2563eb;
          border-radius: 14px;
          padding: 18px;
          background: #eff6ff;
        }

        .resultado .linha {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px solid #bfdbfe;
        }

        .resultado .linha:last-child {
          border-bottom: none;
        }

        .rodape {
          margin-top: 30px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }

        @media print {
          body {
            margin: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="topo">
        <h1>Relatório de Custos por Serviço</h1>
        <p><strong>Data de geração:</strong> ${dados.dataGeracao}</p>
        <p><strong>Forma de pagamento:</strong> ${dados.formaPagamento}</p>
        <p><strong>Taxa aplicada:</strong> ${formatarPercentual(dados.taxaMaquina)}</p>
      </div>

      <div class="bloco">
        <h2>Produtos utilizados</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Valor pago</th>
              <th>Embalagem</th>
              <th>Usado</th>
              <th>Custo por ml</th>
              <th>Custo usado</th>
            </tr>
          </thead>
          <tbody>
            ${linhasProdutos}
          </tbody>
        </table>
      </div>

      <div class="bloco">
        <h2>Veículo e deslocamento</h2>
        <div class="grid">
          <div class="item">KM rodado<strong>${dados.kmRodado.toLocaleString("pt-BR")} km</strong></div>
          <div class="item">Consumo do veículo<strong>${dados.consumoVeiculo.toLocaleString("pt-BR")} km/L</strong></div>
          <div class="item">Preço da gasolina<strong>${formatarMoeda(dados.precoGasolina)}</strong></div>
          <div class="item">Desgaste por km<strong>${formatarMoeda(dados.desgasteKm)}</strong></div>
          <div class="item">Gasto com combustível<strong>${formatarMoeda(dados.gastoCombustivel)}</strong></div>
          <div class="item">Desgaste do veículo<strong>${formatarMoeda(dados.custoDesgasteVeiculo)}</strong></div>
          <div class="item">Custo total do veículo<strong>${formatarMoeda(dados.custoVeiculoTotal)}</strong></div>
        </div>
      </div>

      <div class="bloco">
        <h2>Custos e resultado</h2>
        <div class="grid">
          <div class="item">Total dos produtos<strong>${formatarMoeda(dados.totalProdutos)}</strong></div>
          <div class="item">Mão de obra<strong>${formatarMoeda(dados.maoDeObra)}</strong></div>
          <div class="item">Outros custos<strong>${formatarMoeda(dados.outrosCustos)}</strong></div>
          <div class="item">Taxa da maquininha<strong>${formatarMoeda(dados.valorTaxaMaquina)}</strong></div>
          <div class="item">Valor cobrado<strong>${formatarMoeda(dados.valorCobrado)}</strong></div>
        </div>
      </div>

      <div class="resultado">
        <div class="linha">
          <span><strong>Custo total do serviço</strong></span>
          <span><strong>${formatarMoeda(dados.custoTotal)}</strong></span>
        </div>
        <div class="linha">
          <span><strong>Lucro final</strong></span>
          <span><strong>${formatarMoeda(dados.lucroFinal)}</strong></span>
        </div>
        <div class="linha">
          <span><strong>Margem de lucro</strong></span>
          <span><strong>${formatarPercentual(dados.margemLucro)}</strong></span>
        </div>
      </div>

      <div class="rodape">
        Relatório gerado pelo sistema de controle de custos por serviço.
      </div>
    </body>
    </html>
  `;
}

function gerarRelatorioPdf() {
  calcularTudo();

  const dados = obterDadosRelatorio();
  const relatorioHtml = gerarHtmlRelatorio(dados);

  const janela = window.open("", "_blank", "width=1000,height=800");

  if (!janela) {
    alert("O navegador bloqueou a abertura do relatório. Libere pop-ups para este site.");
    return;
  }

  janela.document.open();
  janela.document.write(relatorioHtml);
  janela.document.close();

  janela.onload = () => {
    janela.focus();
    janela.print();
  };
}


function recalcularTitulosProdutos() {
  const cards = document.querySelectorAll(".produto-card");
  cards.forEach((card, index) => {
    const titulo = card.querySelector("h3");
    titulo.textContent = `Produto ${index + 1}`;
  });
}

function calcularProdutos() {
  const cards = document.querySelectorAll(".produto-card");
  let totalProdutos = 0;

  cards.forEach((card) => {
    const valor = numero(card.querySelector(".produto-valor").value);
    const embalagem = numero(card.querySelector(".produto-embalagem").value);
    const usado = numero(card.querySelector(".produto-usado").value);

    const custoPorMlEl = card.querySelector(".produto-custo-ml");
    const custoUsadoEl = card.querySelector(".produto-custo-usado");

    if (embalagem > 0 && usado > embalagem) {
      custoPorMlEl.textContent = "Erro";
      custoUsadoEl.textContent = "Uso > embalagem";
      return;
    }

    let custoPorMl = 0;
    let custoUsado = 0;

    if (valor > 0 && embalagem > 0) {
      custoPorMl = valor / embalagem;
      custoUsado = custoPorMl * usado;
    }

    custoPorMlEl.textContent = formatarMoeda(custoPorMl);
    custoUsadoEl.textContent = formatarMoeda(custoUsado);

    totalProdutos += custoUsado;
  });

  totalProdutosUsadosEl.textContent = formatarMoeda(totalProdutos);
  return totalProdutos;
}

function calcularTudo() {
  const totalProdutos = calcularProdutos();

  const kmRodado = numero(kmRodadoInput.value);
  const consumoVeiculo = numero(consumoVeiculoInput.value);
  const precoGasolina = numero(precoGasolinaInput.value);
  const desgasteKm = numero(desgasteKmInput.value);

  const maoDeObra = numero(maoDeObraInput.value);
  const outrosCustos = numero(outrosCustosInput.value);
  const valorCobrado = numero(valorCobradoInput.value);

  const taxaMaquina = obterTaxaMaquininha();

  let gastoCombustivel = 0;
  if (kmRodado > 0 && consumoVeiculo > 0 && precoGasolina > 0) {
    gastoCombustivel = (kmRodado / consumoVeiculo) * precoGasolina;
  }

  const custoDesgasteVeiculo = kmRodado * desgasteKm;
  const custoVeiculoTotal = gastoCombustivel + custoDesgasteVeiculo;

  const valorTaxaMaquina = valorCobrado * (taxaMaquina / 100);

  const custoTotal =
    totalProdutos +
    custoVeiculoTotal +
    maoDeObra +
    valorTaxaMaquina +
    outrosCustos;

  const lucroFinal = valorCobrado - custoTotal;
  const margemLucro = valorCobrado > 0 ? (lucroFinal / valorCobrado) * 100 : 0;

  atualizarPercentualTaxa();

  gastoCombustivelEl.textContent = formatarMoeda(gastoCombustivel);
  custoDesgasteVeiculoEl.textContent = formatarMoeda(custoDesgasteVeiculo);
  custoVeiculoTotalEl.textContent = formatarMoeda(custoVeiculoTotal);
  valorTaxaMaquinaEl.textContent = formatarMoeda(valorTaxaMaquina);

  resProdutoEl.textContent = formatarMoeda(totalProdutos);
  resCombustivelEl.textContent = formatarMoeda(gastoCombustivel);
  resDesgasteEl.textContent = formatarMoeda(custoDesgasteVeiculo);
  resVeiculoEl.textContent = formatarMoeda(custoVeiculoTotal);
  resMaoDeObraEl.textContent = formatarMoeda(maoDeObra);
  resTaxaEl.textContent = formatarMoeda(valorTaxaMaquina);
  resOutrosEl.textContent = formatarMoeda(outrosCustos);
  resCobradoEl.textContent = formatarMoeda(valorCobrado);

  custoTotalEl.textContent = formatarMoeda(custoTotal);
  lucroFinalEl.textContent = formatarMoeda(lucroFinal);
  margemLucroEl.textContent = `${margemLucro.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;

  atualizarMensagemLucro(lucroFinal, margemLucro);
}

function atualizarMensagemLucro(lucroFinal, margemLucro) {
  mensagemLucroEl.classList.remove("neutro", "sucesso", "alerta", "perigo");

  if (lucroFinal <= 0) {
    mensagemLucroEl.textContent = "Atenção: custo alto";
    mensagemLucroEl.classList.add("perigo");
    return;
  }

  if (margemLucro < 20) {
    mensagemLucroEl.textContent = "Lucro baixo";
    mensagemLucroEl.classList.add("alerta");
    return;
  }

  mensagemLucroEl.textContent = "Serviço lucrativo";
  mensagemLucroEl.classList.add("sucesso");
}

function resetarResultados() {
  totalProdutosUsadosEl.textContent = "R$ 0,00";
  gastoCombustivelEl.textContent = "R$ 0,00";
  custoDesgasteVeiculoEl.textContent = "R$ 0,00";
  custoVeiculoTotalEl.textContent = "R$ 0,00";
  percentualTaxaEl.textContent = formatarPercentual(obterTaxaMaquininha());
  valorTaxaMaquinaEl.textContent = "R$ 0,00";

  resProdutoEl.textContent = "R$ 0,00";
  resCombustivelEl.textContent = "R$ 0,00";
  resDesgasteEl.textContent = "R$ 0,00";
  resVeiculoEl.textContent = "R$ 0,00";
  resMaoDeObraEl.textContent = "R$ 0,00";
  resTaxaEl.textContent = "R$ 0,00";
  resOutrosEl.textContent = "R$ 0,00";
  resCobradoEl.textContent = "R$ 0,00";

  custoTotalEl.textContent = "R$ 0,00";
  lucroFinalEl.textContent = "R$ 0,00";
  margemLucroEl.textContent = "0,00%";

  mensagemLucroEl.textContent = "Preencha os dados para calcular.";
  mensagemLucroEl.classList.remove("sucesso", "alerta", "perigo");
  mensagemLucroEl.classList.add("neutro");
}

function resetarFormularioCompleto() {
  formulario.reset();
  listaProdutos.innerHTML = "";
  contadorProdutos = 0;
  criarProdutoCard();
  atualizarPercentualTaxa();
  resetarResultados();
}

btnAdicionarProduto.addEventListener("click", () => {
  criarProdutoCard();
});

btnCalcular.addEventListener("click", calcularTudo);

btnLimpar.addEventListener("click", () => {
  setTimeout(() => {
    resetarFormularioCompleto();
  }, 0);
});

formaPagamento.addEventListener("change", () => {
  atualizarPercentualTaxa();
  calcularTudo();
});

[
  kmRodadoInput,
  consumoVeiculoInput,
  precoGasolinaInput,
  desgasteKmInput,
  maoDeObraInput,
  outrosCustosInput,
  valorCobradoInput
].forEach((input) => {
  input.addEventListener("input", calcularTudo);
});
btnGerarPdf.addEventListener("click", gerarRelatorioPdf);
criarProdutoCard();
atualizarPercentualTaxa();
resetarResultados();
