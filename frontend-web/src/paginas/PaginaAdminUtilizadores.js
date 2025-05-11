// src/paginas/PaginaAdminUtilizadores.js
import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../contextos/AuthContext'; // Não usado diretamente aqui, mas AuthProvider protege a rota
import utilizadorServico from '../servicos/utilizadorServico';
import { Container, Row, Col, Button, Card, Spinner, Alert, Table, Modal, Form } from 'react-bootstrap';
import { PersonPlusFill, PencilSquare, Trash3 } from 'react-bootstrap-icons';

// Constante para as funções disponíveis, idealmente viria de uma fonte partilhada
const FUNCOES_DISPONIVEIS = ['admin', 'gerente', 'lider_equipa', 'programador'];

const PaginaAdminUtilizadores = () => {
  const [utilizadores, setUtilizadores] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erroPagina, setErroPagina] = useState(''); // Erro geral da página

  // Estado para o modal de Criar/Editar Utilizador
  const [mostrarModalUtilizador, setMostrarModalUtilizador] = useState(false);
  const [modoModal, setModoModal] = useState('criar'); // 'criar' ou 'editar'
  const [utilizadorAtualForm, setUtilizadorAtualForm] = useState({
    id: null,
    nome_utilizador: '',
    email: '',
    palavra_passe: '', // Apenas para criação
    funcao: FUNCOES_DISPONIVEIS[3] // Default para 'programador'
  });
  const [aSubmeterForm, setASubmeterForm] = useState(false);
  const [erroModal, setErroModal] = useState('');

  // Estado para o modal de Confirmação de Eliminação
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [utilizadorParaEliminar, setUtilizadorParaEliminar] = useState(null);
  const [aEliminar, setAEliminar] = useState(false);


  const carregarUtilizadores = useCallback(async () => {
    setACarregar(true);
    setErroPagina('');
    try {
      const dadosUtilizadores = await utilizadorServico.buscarTodos();
      setUtilizadores(dadosUtilizadores);
    } catch (ex) {
      setErroPagina(ex.mensagem || 'Falha ao carregar utilizadores.');
      console.error("Erro ao carregar utilizadores:", ex);
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    carregarUtilizadores();
  }, [carregarUtilizadores]);

  // Funções para o Modal Criar/Editar
  const abrirModalCriar = () => {
    setModoModal('criar');
    setUtilizadorAtualForm({
      id: null,
      nome_utilizador: '',
      email: '',
      palavra_passe: '',
      funcao: FUNCOES_DISPONIVEIS[3]
    });
    setErroModal('');
    setMostrarModalUtilizador(true);
  };

  const abrirModalEditar = (utilizador) => {
    setModoModal('editar');
    setUtilizadorAtualForm({
      id: utilizador.id,
      nome_utilizador: utilizador.nome_utilizador,
      email: utilizador.email,
      palavra_passe: '', // Palavra-passe não é editada aqui
      funcao: utilizador.funcao 
    });
    setErroModal('');
    setMostrarModalUtilizador(true);
  };

  const fecharModalUtilizador = () => setMostrarModalUtilizador(false);

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setUtilizadorAtualForm(prev => ({ ...prev, [name]: value }));
  };

  const submeterFormUtilizador = async (e) => {
    e.preventDefault();
    setASubmeterForm(true);
    setErroModal('');

    // Validações básicas
    if (!utilizadorAtualForm.nome_utilizador.trim() || !utilizadorAtualForm.email.trim()) {
        setErroModal('Nome de utilizador e email são obrigatórios.');
        setASubmeterForm(false);
        return;
    }
    if (modoModal === 'criar' && !utilizadorAtualForm.palavra_passe) {
        setErroModal('Palavra-passe é obrigatória para criar utilizador.');
        setASubmeterForm(false);
        return;
    }
    // Validação de email (simples)
    if (!/\S+@\S+\.\S+/.test(utilizadorAtualForm.email)) {
        setErroModal('Formato de email inválido.');
        setASubmeterForm(false);
        return;
    }


    try {
      if (modoModal === 'criar') {
        const dadosCriacao = {
            nome_utilizador: utilizadorAtualForm.nome_utilizador,
            email: utilizadorAtualForm.email,
            palavra_passe: utilizadorAtualForm.palavra_passe,
            funcao: utilizadorAtualForm.funcao
        };
        await utilizadorServico.criarUtilizador(dadosCriacao);
      } else { // modo 'editar'
        const dadosAtualizacao = {
            nome_utilizador: utilizadorAtualForm.nome_utilizador,
            email: utilizadorAtualForm.email,
            funcao: utilizadorAtualForm.funcao
        };
        // A API PUT não aceita palavra_passe, então não enviamos
        await utilizadorServico.atualizarUtilizador(utilizadorAtualForm.id, dadosAtualizacao);
      }
      fecharModalUtilizador();
      await carregarUtilizadores(); // Recarregar a lista
    } catch (ex) {
      setErroModal(ex.mensagem || `Falha ao ${modoModal === 'criar' ? 'criar' : 'atualizar'} utilizador.`);
      console.error(`Erro ao ${modoModal === 'criar' ? 'criar' : 'atualizar'} utilizador:`, ex);
    } finally {
      setASubmeterForm(false);
    }
  };

  // Funções para o Modal de Eliminação
  const abrirModalEliminar = (utilizador) => {
    setUtilizadorParaEliminar(utilizador);
    setErroModal(''); // Limpar erro de outros modais
    setMostrarModalEliminar(true);
  };
  const fecharModalEliminar = () => setMostrarModalEliminar(false);

  const confirmarEliminacao = async () => {
    if (!utilizadorParaEliminar) return;
    setAEliminar(true);
    setErroModal('');
    try {
      await utilizadorServico.eliminarUtilizador(utilizadorParaEliminar.id);
      fecharModalEliminar();
      setUtilizadorParaEliminar(null);
      await carregarUtilizadores(); // Recarregar a lista
    } catch (ex) {
      setErroModal(ex.mensagem || 'Falha ao eliminar utilizador. Verifique se existem dependências (ex: tarefas).');
      console.error("Erro ao eliminar utilizador:", ex);
      // Não fechar o modal de erro de eliminação para o user ver a msg
    } finally {
      setAEliminar(false);
    }
  };


  if (aCarregar) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> <p>A carregar utilizadores...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2>Gestão de Utilizadores</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={abrirModalCriar}>
            <PersonPlusFill className="me-2" />
            Adicionar Utilizador
          </Button>
        </Col>
      </Row>

      {erroPagina && <Alert variant="danger" onClose={() => setErroPagina('')} dismissible>{erroPagina}</Alert>}

      {utilizadores.length === 0 && !aCarregar ? (
        <Alert variant="info">Não existem utilizadores para apresentar.</Alert>
      ) : (
        <Card>
          <Card.Header>Lista de Utilizadores ({utilizadores.length})</Card.Header>
          <Table striped bordered hover responsive className="m-0 align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome de Utilizador</th>
                <th>Email</th>
                <th>Função</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores.map((utilizador) => (
                <tr key={utilizador.id}>
                  <td>{utilizador.id}</td>
                  <td>{utilizador.nome_utilizador}</td>
                  <td>{utilizador.email}</td>
                  <td>
                    <span className={`badge bg-${utilizador.funcao === 'admin' ? 'danger' : utilizador.funcao === 'gerente' ? 'warning' : utilizador.funcao === 'lider_equipa' ? 'info' : 'secondary'}`}>
                      {utilizador.funcao}
                    </span>
                  </td>
                  <td>{new Date(utilizador.criado_em).toLocaleDateString('pt-PT')}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => abrirModalEditar(utilizador)} title="Editar">
                      <PencilSquare />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminar(utilizador)} title="Eliminar">
                      <Trash3 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Criar/Editar Utilizador */}
      <Modal show={mostrarModalUtilizador} onHide={fecharModalUtilizador} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{modoModal === 'criar' ? 'Adicionar Novo Utilizador' : 'Editar Utilizador'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submeterFormUtilizador}>
          <Modal.Body>
            {erroModal && <Alert variant="danger">{erroModal}</Alert>}
            <Form.Group className="mb-3" controlId="formNomeUtilizador">
              <Form.Label>Nome de Utilizador</Form.Label>
              <Form.Control
                type="text"
                name="nome_utilizador"
                value={utilizadorAtualForm.nome_utilizador}
                onChange={handleChangeForm}
                required
                disabled={aSubmeterForm}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmailUtilizador">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={utilizadorAtualForm.email}
                onChange={handleChangeForm}
                required
                disabled={aSubmeterForm}
              />
            </Form.Group>
            {modoModal === 'criar' && (
              <Form.Group className="mb-3" controlId="formPalavraPasse">
                <Form.Label>Palavra-passe</Form.Label>
                <Form.Control
                  type="password"
                  name="palavra_passe"
                  value={utilizadorAtualForm.palavra_passe}
                  onChange={handleChangeForm}
                  required
                  disabled={aSubmeterForm}
                  placeholder="Mín. 8 caracteres, maiúscula, minúscula, número, especial"
                />
                <Form.Text muted>
                    A password_hash no seu backend usa bcrypt, que é bom. 
                    A validação de complexidade PASSWORD_REGEX está no seu backend.
                </Form.Text>
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formFuncaoUtilizador">
              <Form.Label>Função</Form.Label>
              <Form.Select
                name="funcao"
                value={utilizadorAtualForm.funcao}
                onChange={handleChangeForm}
                disabled={aSubmeterForm}
              >
                {FUNCOES_DISPONIVEIS.map(f => <option key={f} value={f}>{f}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModalUtilizador} disabled={aSubmeterForm}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={aSubmeterForm}>
              {aSubmeterForm ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> : null}
              {modoModal === 'criar' ? 'Criar' : 'Guardar Alterações'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Eliminação */}
      {utilizadorParaEliminar && (
        <Modal show={mostrarModalEliminar} onHide={fecharModalEliminar} centered backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminação</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erroModal && <Alert variant="danger">{erroModal}</Alert>}
            Tem a certeza que deseja eliminar o utilizador <strong>{utilizadorParaEliminar.nome_utilizador}</strong> (ID: {utilizadorParaEliminar.id})?
            <br/>
            <small className="text-muted">Esta ação não pode ser revertida.</small>
            {/* Adicionar aviso sobre dependências se for o caso */}
             {!erroModal && <Alert variant="warning" className="mt-2">Nota: Se este utilizador tiver tarefas associadas ou outras dependências, a eliminação poderá falhar.</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModalEliminar} disabled={aEliminar}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminacao} disabled={aEliminar}>
              {aEliminar ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> : null}
              Eliminar Utilizador
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default PaginaAdminUtilizadores;