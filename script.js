const display = document.getElementById('resultado');
const botaoModo = document.getElementById('toggle-modo');

let expressao = '';
let modoAngular = 'DEG'; // 'DEG' ou 'RAD'

const atualizarTela = (texto) => {
  display.textContent = texto === '' ? '0' : texto;
};

const limpar = () => {
  expressao = '';
  atualizarTela(expressao);
};

const apagar = () => {
  expressao = expressao.slice(0, -1);
  atualizarTela(expressao);
};

const inserir = (valor) => {
  expressao += valor;
  atualizarTela(expressao);
};

const elevarAoQuadrado = () => {
  if (!expressao) return;
  expressao += '^2';
  atualizarTela(expressao);
};

const alternarModoAngular = () => {
  modoAngular = modoAngular === 'DEG' ? 'RAD' : 'DEG';
  botaoModo.textContent = modoAngular;
  botaoModo.setAttribute('aria-pressed', String(modoAngular === 'RAD'));
};

const factorial = (n) => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // evita estourar o limite de ponto flutuante
  let resultado = 1;
  for (let i = 2; i <= n; i += 1) resultado *= i;
  return resultado;
};

const converterParaJs = (texto) => {
  let convertido = texto;

  // Postfix: 5! -> factorial(5) | 50% -> (50/100)
  convertido = convertido.replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');
  convertido = convertido.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Símbolos -> identificadores válidos em JS
  convertido = convertido.replaceAll('√', 'sqrt');
  convertido = convertido.replaceAll('π', 'PI');
  convertido = convertido.replaceAll('^', '**');

  return convertido;
};

const calcular = () => {
  if (!expressao) {
    atualizarTela('Sem cálculo');
    return;
  }

  const convertido = converterParaJs(expressao);

  // Checagem de sanidade: só permite dígitos, operadores, parênteses e os
  // nomes de função conhecidos que a própria calculadora insere.
  const seguro = /^[0-9+\-*/.()a-zA-Z,\s]+$/.test(convertido);

  if (!seguro) {
    atualizarTela('Erro');
    expressao = '';
    return;
  }

  const grausParaRadianos = (x) => (x * Math.PI) / 180;

  const escopo = {
    sin: (x) => Math.sin(modoAngular === 'DEG' ? grausParaRadianos(x) : x),
    cos: (x) => Math.cos(modoAngular === 'DEG' ? grausParaRadianos(x) : x),
    tan: (x) => Math.tan(modoAngular === 'DEG' ? grausParaRadianos(x) : x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    sqrt: (x) => Math.sqrt(x),
    factorial,
    PI: Math.PI,
    E: Math.E,
  };

  try {
    const nomes = Object.keys(escopo);
    const valores = Object.values(escopo);
    // eslint-disable-next-line no-new-func
    const resultado = Function(...nomes, `"use strict"; return (${convertido});`)(...valores);

    if (!Number.isFinite(resultado)) {
      atualizarTela('Erro');
      expressao = '';
      return;
    }

    expressao = String(resultado);
    atualizarTela(expressao);
  } catch (erro) {
    atualizarTela('Erro');
    expressao = '';
  }
};

document.querySelectorAll('.keys button').forEach((botao) => {
  botao.addEventListener('click', () => {
    const { action, value } = botao.dataset;

    if (action === 'clear') return limpar();
    if (action === 'backspace') return apagar();
    if (action === 'calculate') return calcular();
    if (action === 'square') return elevarAoQuadrado();
    if (action === 'toggle-mode') return alternarModoAngular();
    if (value !== undefined) return inserir(value);
  });
});

// Suporte ao teclado (funções científicas ficam só nos botões, por segurança)
document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/[0-9.+\-*/^]/.test(key)) {
    inserir(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calcular();
    return;
  }

  if (key === 'Backspace') {
    apagar();
    return;
  }

  if (key === 'Escape') {
    limpar();
  }
});