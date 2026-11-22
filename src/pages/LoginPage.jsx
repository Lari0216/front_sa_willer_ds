import { useState } from 'react'
import Icon from '../components/ui/Icon'
import Spinner from '../components/feedback/Spinner'
import Modal from '../components/feedback/Modal'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { cadastrar } from '../services/authService'
import { USE_MOCK } from '../config'
import { CONTA_DEMO } from '../services/mock/contaDemo'
import '../styles/auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FORM_INICIAL = { nome: '', email: '', senha: '' }

function validar(form, modoCadastro) {
  if (modoCadastro && !form.nome.trim()) return { campo: 'nome', mensagem: 'Informe seu nome.' }
  if (!form.email.trim()) return { campo: 'email', mensagem: 'Informe seu e-mail.' }
  if (!EMAIL_REGEX.test(form.email.trim())) return { campo: 'email', mensagem: 'E-mail inválido.' }
  if (!form.senha) return { campo: 'senha', mensagem: 'Informe sua senha.' }
  if (modoCadastro && form.senha.length < 6) return { campo: 'senha', mensagem: 'A senha deve ter pelo menos 6 caracteres.' }
  return null
}

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState(FORM_INICIAL)
  const [modoCadastro, setModoCadastro] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null) // { campo?, mensagem }
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)

  const atualizarCampo = (event) => {
    const { name, value } = event.target
    setForm((atual) => ({ ...atual, [name]: value }))
    if (erro?.campo === name) setErro(null)
  }

  const preencherContaDemo = () => {
    setForm({ ...FORM_INICIAL, email: CONTA_DEMO.email, senha: CONTA_DEMO.senha })
    setErro(null)
  }

  const alternarModo = () => {
    setModoCadastro((atual) => !atual)
    setErro(null)
    setForm((atual) => ({ ...FORM_INICIAL, email: atual.email }))
  }

  async function enviar(event) {
    event.preventDefault()
    const problema = validar(form, modoCadastro)
    if (problema) {
      setErro(problema)
      document.getElementById(`campo-${problema.campo}`)?.focus()
      return
    }

    setErro(null)
    setCarregando(true)
    const email = form.email.trim()

    try {
      if (modoCadastro) {
        await cadastrar({ nome: form.nome.trim(), email, senha: form.senha })
        toast.success('Conta criada com sucesso! Agora é só fazer login.', { title: 'Cadastro realizado' })
        setModoCadastro(false)
        setForm({ ...FORM_INICIAL, email })
        setCarregando(false)
      } else {
        const usuario = await login({ email, senha: form.senha })
        toast.success(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`, { title: 'Login realizado' })
        // O <PublicOnlyRoute> redireciona automaticamente para o dashboard.
      }
    } catch (error) {
      const mensagem = error?.message || 'Erro inesperado. Tente novamente.'
      setErro({ mensagem })
      toast.error(mensagem, { title: modoCadastro ? 'Falha no cadastro' : 'Não foi possível entrar' })
      setCarregando(false)
    }
  }

  const erroDe = (campo) => erro?.campo === campo

  return (
    <div className="page-wrapper">
      <form className="login-card" onSubmit={enviar} noValidate aria-busy={carregando}>
        <div className="avatar" aria-hidden="true">
          <Icon name="user" size={32} />
        </div>

        <h1 className="login-title">{modoCadastro ? 'CADASTRO' : 'LOGIN'}</h1>

        {modoCadastro && (
          <div className="input-group">
            <label htmlFor="campo-nome" className="sr-only">
              Nome
            </label>
            <input
              id="campo-nome"
              type="text"
              name="nome"
              placeholder="NOME"
              autoComplete="name"
              value={form.nome}
              onChange={atualizarCampo}
              aria-invalid={erroDe('nome') || undefined}
              aria-describedby={erroDe('nome') ? 'mensagem-login' : undefined}
            />
            <span className="input-icon">
              <Icon name="user" />
            </span>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="campo-email" className="sr-only">
            E-mail
          </label>
          <input
            id="campo-email"
            type="email"
            name="email"
            placeholder="E-MAIL"
            autoComplete="email"
            value={form.email}
            onChange={atualizarCampo}
            aria-invalid={erroDe('email') || undefined}
            aria-describedby={erroDe('email') ? 'mensagem-login' : undefined}
          />
          <span className="input-icon">
            <Icon name="mail" />
          </span>
        </div>

        <div className="input-group">
          <label htmlFor="campo-senha" className="sr-only">
            Senha
          </label>
          <input
            id="campo-senha"
            type={mostrarSenha ? 'text' : 'password'}
            name="senha"
            placeholder="SENHA"
            autoComplete={modoCadastro ? 'new-password' : 'current-password'}
            value={form.senha}
            onChange={atualizarCampo}
            aria-invalid={erroDe('senha') || undefined}
            aria-describedby={erroDe('senha') ? 'mensagem-login' : undefined}
          />
          <button
            type="button"
            className="input-icon toggle-senha"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrarSenha}
          >
            <Icon name={mostrarSenha ? 'eyeOff' : 'eye'} />
          </button>
        </div>

        <p id="mensagem-login" className={`mensagem-login ${erro ? 'is-error' : ''}`} role="alert">
          {erro?.mensagem}
        </p>

        <button type="submit" className="btn-login" disabled={carregando}>
          {carregando && <Spinner size={16} label={null} />}
          {carregando ? (modoCadastro ? 'CADASTRANDO…' : 'ENTRANDO…') : modoCadastro ? 'CADASTRAR' : 'LOGIN'}
        </button>

        <button type="button" className="btn-login btn-cadastrar" onClick={alternarModo} disabled={carregando}>
          {modoCadastro ? 'VOLTAR PARA LOGIN' : 'CADASTRAR'}
        </button>

        {!modoCadastro && (
          <button type="button" className="link-esqueci-senha" onClick={() => setModalSenhaAberto(true)}>
            Esqueci minha senha
          </button>
        )}

        {USE_MOCK && !modoCadastro && (
          <div className="login-hint">
            <p>
              Conta de demonstração (com dados de exemplo):
              <br />
              <strong>{CONTA_DEMO.email}</strong> · senha <strong>{CONTA_DEMO.senha}</strong>
            </p>
            <button type="button" className="login-hint__fill" onClick={preencherContaDemo} disabled={carregando}>
              Preencher automaticamente
            </button>
            <p className="login-hint__small">Contas criadas em CADASTRAR começam zeradas.</p>
          </div>
        )}
      </form>

      <Modal
        open={modalSenhaAberto}
        onClose={() => setModalSenhaAberto(false)}
        title="Recuperação de senha"
        icon="info"
        footer={<Button onClick={() => setModalSenhaAberto(false)}>Entendi</Button>}
      >
        <p>Para redefinir sua senha, entre em contato com o administrador do sistema.</p>
      </Modal>
    </div>
  )
}
