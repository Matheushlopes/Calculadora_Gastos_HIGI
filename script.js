const formulario = document.getElementById("formulario");
const listaProdutos = document.getElementById("listaProdutos");
const btnAdicionarProduto = document.getElementById("btnAdicionarProduto");
const btnCalcular = document.getElementById("btnCalcular");
const btnLimpar = document.getElementById("btnLimpar");

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

criarProdutoCard();
atualizarPercentualTaxa();
resetarResultados();