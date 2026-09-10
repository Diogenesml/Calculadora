const display = document.getElementById('resultado');
let expressao = '';

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

const calcular = () => {
  if (!expressao) {
    atualizarTela('Sem cálculo');
    return;
  }

  // Só permite números, operadores básicos e parênteses — evita executar código arbitrário
  const expressaoValida = /^[0-9+\-*/.() ]+$/.test(expressao);

  if (!expressaoValida) {
    atualizarTela('Erro');
    expressao = '';
    return;
  }

  try {
    // eslint-disable-next-line no-new-func
    const resultado = Function(`"use strict"; return (${expressao});`)();

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
    if (value !== undefined) return inserir(value);
  });
});

// Suporte ao teclado
document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/[0-9.+\-*/]/.test(key)) {
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