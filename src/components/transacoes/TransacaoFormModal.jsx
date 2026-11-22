import { useId, useState } from 'react'
import Modal from '../feedback/Modal'
import Button from '../ui/Button'
import SegmentedControl from '../filters/SegmentedControl'
import { useToast } from '../../hooks/useToast'
import { atualizarTransacao, criarTransacao } from '../../services/transacoesService'
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, STATUS_LABEL } from '../../utils/categorias'
import { parseValor, toISODate, valorParaCampo } from '../../utils/format'

const OPCOES_TIPO = [
  { value: 'despesa', label: 'Despesa' },
  { value: 'receita', label: 'Receita' },
]

const categoriasDo = (tipo) => (tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA)

/**
 * Modal para cadastrar ou editar uma transação.
 * transacao = null → nova transação · transacao = objeto → edição.
 * onSaved(transacao) é chamado após salvar com sucesso.
 */
export default function TransacaoFormModal({ open, transacao, onClose, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title={transacao ? 'Editar transação' : 'Nova transação'} icon={transacao ? 'pencil' : 'plus'} size="md">
      {/* `key` remonta o formulário a cada abertura, já com os valores iniciais certos. */}
      <TransacaoForm key={transacao?.id ?? 'nova'} transacao={transacao} onCancel={onClose} onSaved={onSaved} />
    </Modal>
  )
}

function valoresIniciais(transacao) {
  if (!transacao) {
    return { tipo: 'despesa', descricao: '', valor: '', categoria: '', data: toISODate(new Date()), status: 'concluida' }
  }
  return { ...transacao, valor: valorParaCampo(transacao.valor) }
}

function validar(form) {
  const erros = {}
  if (!form.descricao.trim()) erros.descricao = 'Informe uma descrição.'
  else if (form.descricao.trim().length > 80) erros.descricao = 'Use no máximo 80 caracteres.'
  const valor = parseValor(form.valor)
  if (!form.valor.trim()) erros.valor = 'Informe o valor.'
  else if (Number.isNaN(valor)) erros.valor = 'Valor inválido. Exemplo: 150,90'
  else if (valor <= 0) erros.valor = 'O valor deve ser maior que zero.'
  else if (valor >= 1e9) erros.valor = 'Valor muito alto.'
  if (!form.categoria) erros.categoria = 'Escolha uma categoria.'
  if (!form.data) erros.data = 'Informe a data.'
  return erros
}

function TransacaoForm({ transacao, onCancel, onSaved }) {
  const toast = useToast()
  const id = useId()
  const [form, setForm] = useState(() => valoresIniciais(transacao))
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  const alterarTipo = (tipo) => {
    setForm((atual) => ({ ...atual, tipo, categoria: categoriasDo(tipo).includes(atual.categoria) ? atual.categoria : '' }))
  }

  async function salvar(event) {
    event.preventDefault()
    const encontrados = validar(form)
    if (Object.keys(encontrados).length) {
      setErros(encontrados)
      document.getElementById(`${id}-${Object.keys(encontrados)[0]}`)?.focus()
      return
    }

    setSalvando(true)
    const dados = { ...form, valor: parseValor(form.valor) }
    try {
      const salva = transacao ? await atualizarTransacao(transacao.id, dados) : await criarTransacao(dados)
      toast.success(transacao ? 'As alterações foram salvas.' : `"${dados.descricao.trim()}" foi adicionada.`, {
        title: transacao ? 'Transação atualizada' : 'Transação cadastrada',
      })
      onSaved?.(salva)
    } catch (error) {
      toast.error(error?.message || 'Não foi possível salvar a transação.', { title: 'Erro ao salvar' })
      setSalvando(false)
    }
  }

  const campo = (nome) => ({
    id: `${id}-${nome}`,
    'aria-invalid': erros[nome] ? true : undefined,
    'aria-describedby': erros[nome] ? `${id}-${nome}-erro` : undefined,
  })
  const mensagem = (nome) =>
    erros[nome] && (
      <span id={`${id}-${nome}-erro`} className="form-field__error">
        {erros[nome]}
      </span>
    )

  return (
    <form className="transacao-form" onSubmit={salvar} noValidate>
      <div className="form-field form-field--full">
        <span className="form-field__label" id={`${id}-tipo-label`}>
          Tipo
        </span>
        <SegmentedControl label="Tipo da transação" value={form.tipo} onChange={alterarTipo} options={OPCOES_TIPO} />
      </div>

      <div className="form-field form-field--full">
        <label htmlFor={`${id}-descricao`}>Descrição</label>
        <input
          {...campo('descricao')}
          type="text"
          value={form.descricao}
          onChange={(e) => alterar('descricao', e.target.value)}
          placeholder={form.tipo === 'receita' ? 'Ex.: Salário de novembro' : 'Ex.: Supermercado'}
          maxLength={80}
          autoComplete="off"
          data-autofocus
        />
        {mensagem('descricao')}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-valor`}>Valor (R$)</label>
        <input
          {...campo('valor')}
          type="text"
          inputMode="decimal"
          value={form.valor}
          onChange={(e) => alterar('valor', e.target.value)}
          placeholder="0,00"
          autoComplete="off"
        />
        {mensagem('valor')}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-data`}>Data</label>
        <input {...campo('data')} type="date" value={form.data} onChange={(e) => alterar('data', e.target.value)} />
        {mensagem('data')}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-categoria`}>Categoria</label>
        <select {...campo('categoria')} value={form.categoria} onChange={(e) => alterar('categoria', e.target.value)}>
          <option value="">Selecione…</option>
          {categoriasDo(form.tipo).map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        {mensagem('categoria')}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-status`}>Status</label>
        <select id={`${id}-status`} value={form.status} onChange={(e) => alterar('status', e.target.value)}>
          {Object.entries(STATUS_LABEL).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="modal__footer form-field--full">
        <Button variant="secondary" onClick={onCancel} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" icon={transacao ? 'checkCircle' : 'plus'} loading={salvando}>
          {transacao ? 'Salvar alterações' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
