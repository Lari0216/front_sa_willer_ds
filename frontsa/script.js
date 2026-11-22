const btnLogin = document.getElementById('btn-login'); 
const btnCadastrar = document.getElementById('btn-cadastrar'); 
const linkEsqueciSenha = document.getElementById('link-esqueci-senha');

const inputEmail = document.getElementById('EMAIL');
const inputSenha = document.getElementById('SENHA');
const toggleSenha = document.getElementById('toggle-senha'); 

const popup = document.getElementById('meu-popup');
const popupTitulo = document.getElementById('popup-titulo');
const popupMensagem = document.getElementById('popup-mensagem');
const btnFecharPopup = document.getElementById('btn-fechar-popup');
let redirecionarAoFechar = false;

function mostrarPopup(titulo, mensagem, redirecionar = false) {
  popupTitulo.innerText = titulo;
  popupMensagem.innerText = mensagem;
  popup.style.display = 'flex';
  redirecionarAoFechar = redirecionar;
}


btnFecharPopup.addEventListener('click', () => {
  popup.style.display = 'none';
  if (redirecionarAoFechar) window.location.href = "home.html";
});

toggleSenha.addEventListener('click', () => {
  if (inputSenha.type === 'password') {
    inputSenha.type = 'text'; 
    toggleSenha.style.opacity = '0.5'; 
  } else {
    inputSenha.type = 'password';
    toggleSenha.style.opacity = '1'; 
  }
});

// Validação
function validarDados() {
  const email = inputEmail.value.trim();
  const senha = inputSenha.value.trim();

  if (!email || !senha) {
    mostrarPopup('Aviso', 'Por favor, preencha todos os campos.', false);
    return null;
  }
  if (!email.includes('@') || !email.includes('.')) {
    mostrarPopup('Aviso', 'Por favor, insira um e-mail válido.', false);
    return null;
  }
  return { email: email, password: senha };
}

// Login
btnLogin.addEventListener('click', async (e) => {
  e.preventDefault(); 
  const dados = validarDados();
  if (!dados) return;

  try {
    const resposta = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (resposta.ok) {
      mostrarPopup('Sucesso!', 'Login realizado com sucesso.', true);
    } else {
      mostrarPopup('Acesso Negado', 'E-mail ou senha inválidos.', false);
    }
  } catch (error) {
    mostrarPopup('Erro de Conexão', 'O servidor back-end não está rodando.', false);
  }
});

// Cadastro
btnCadastrar.addEventListener('click', async (e) => {
  e.preventDefault();
  const dados = validarDados();
  if (!dados) return;

  try {
    const resposta = await fetch('http://localhost:3000/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (resposta.ok) {
      mostrarPopup('Bem-vindo!', 'Cadastro realizado! Agora você pode fazer Login.', false);
    } else {
      mostrarPopup('Ops!', 'Esse e-mail já está cadastrado.', false);
    }
  } catch (error) {
    mostrarPopup('Erro de Conexão', 'O servidor back-end não está rodando.', false);
  }
});

linkEsqueciSenha.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarPopup('Recuperação de Senha', 'Entre em contato com caetano_r_oliveira@estudante.sesisenai.org.br para recuperar a senha.', false);
});