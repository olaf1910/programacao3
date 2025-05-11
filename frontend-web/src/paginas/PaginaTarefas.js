// src/paginas/PaginaTarefas.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contextos/AuthContext';
import tarefaServico from '../servicos/tarefaServico';
import utilizadorServico from '../servicos/utilizadorServico'; 
import atribuicaoServico from '../servicos/atribuicaoServico';
import { Card, ListGroup, Spinner, Alert, Container, Row, Col, Badge, Button, Modal, Form } from 'react-bootstrap';
import { 
    PlusCircleFill, PencilSquare, Trash3, PersonCheckFill, 
    PlayCircleFill, CheckCircleFill, StarFill
} from 'react-bootstrap-icons';

const PaginaTarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erroPagina, setErroPagina] = useState('');
  const { idUtilizador, funcaoUtilizador } = useAuth();

  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [descricaoNovaTarefa, setDescricaoNovaTarefa] = useState('');
  const [aSubmeterCriacao, setASubmeterCriacao] = useState(false);
  const [erroModalCriar, setErroModalCriar] = useState('');

  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [descricaoEdicaoTarefa, setDescricaoEdicaoTarefa] = useState('');
  const [aSubmeterEdicao, setASubmeterEdicao] = useState(false);
  const [erroModalEditar, setErroModalEditar] = useState('');

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [tarefaParaEliminar, setTarefaParaEliminar] = useState(null);
  const [aSubmeterEliminacao, setASubmeterEliminacao] = useState(false);
  const [erroModalEliminar, setErroModalEliminar] = useState('');
  
  const [mostrarModalAtribuir, setMostrarModalAtribuir] = useState(false);
  const [tarefaParaAtribuir, setTarefaParaAtribuir] = useState(null);
  const [programadores, setProgramadores] = useState([]);
  const [programadorSelecionadoId, setProgramadorSelecionadoId] = useState('');
  const [competenciasProgramadorSel, setCompetenciasProgramadorSel] = useState([]);
  const [aCarregarProgramadores, setACarregarProgramadores] = useState(false);
  const [aCarregarCompProgSel, setACarregarCompProgSel] = useState(false);
  const [aSubmeterAtribuicao, setASubmeterAtribuicao] = useState(false);
  const [erroModalAtribuir, setErroModalAtribuir] = useState('');

  const [aProcessarAcaoProgramador, setAProcessarAcaoProgramador] = useState(null);


  const carregarTarefas = useCallback(async () => {
    setACarregar(true);
    setErroPagina('');
    try {
      const dadosTarefas = await tarefaServico.buscarTodasAsTarefas();
      setTarefas(dadosTarefas);
    } catch (excecao) {
      setErroPagina(excecao.mensagem || 'Não foi possível carregar as tarefas.');
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const formatarEstado = (estado) => {
    switch (estado) {
      case 'nao_atribuida': return { texto: 'Não Atribuída', bg: 'secondary' };
      case 'atribuida': return { texto: 'Atribuída', bg: 'info' };
      case 'em_progresso': return { texto: 'Em Progresso', bg: 'primary' };
      case 'concluida': return { texto: 'Concluída', bg: 'success' };
      default: return { texto: estado, bg: 'light' };
    }
  };
  
  const abrirModalCriar = () => { 
    setDescricaoNovaTarefa('');
    setErroModalCriar('');
    setMostrarModalCriar(true);
  };
  const fecharModalCriar = () => setMostrarModalCriar(false);
  const submeterNovaTarefa = async (evento) => { 
    evento.preventDefault();
    if (!descricaoNovaTarefa.trim()) {
      setErroModalCriar('A descrição não pode estar vazia.');
      return;
    }
    setASubmeterCriacao(true);
    setErroModalCriar('');
    try {
      await tarefaServico.criarTarefa({ descricao: descricaoNovaTarefa });
      fecharModalCriar();
      await carregarTarefas();
    } catch (excecao) {
      setErroModalCriar(excecao.mensagem || 'Não foi possível criar a tarefa.');
    } finally {
      setASubmeterCriacao(false);
    }
  };

  const abrirModalEditar = (tarefa) => { 
    setTarefaParaEditar(tarefa);
    setDescricaoEdicaoTarefa(tarefa.descricao);
    setErroModalEditar('');
    setMostrarModalEditar(true);
  };
  const fecharModalEditar = () => setMostrarModalEditar(false);
  const submeterEdicaoTarefa = async (evento) => { 
    evento.preventDefault();
    if (!tarefaParaEditar || !descricaoEdicaoTarefa.trim()) {
      setErroModalEditar('A descrição não pode estar vazia.');
      return;
    }
    setASubmeterEdicao(true);
    setErroModalEditar('');
    try {
      await tarefaServico.atualizarTarefa(tarefaParaEditar.id, { descricao: descricaoEdicaoTarefa });
      fecharModalEditar();
      await carregarTarefas();
    } catch (excecao) {
      setErroModalEditar(excecao.mensagem || 'Não foi possível atualizar a tarefa.');
    } finally {
      setASubmeterEdicao(false);
    }
  };

  const abrirModalEliminar = (tarefa) => { 
    setTarefaParaEliminar(tarefa);
    setErroModalEliminar('');
    setMostrarModalEliminar(true);
  };
  const fecharModalEliminar = () => setMostrarModalEliminar(false);
  const submeterEliminacaoTarefa = async () => { 
    if (!tarefaParaEliminar) return;
    setASubmeterEliminacao(true);
    setErroModalEliminar('');
    try {
      await tarefaServico.eliminarTarefa(tarefaParaEliminar.id);
      fecharModalEliminar();
      await carregarTarefas();
    } catch (excecao) {
      setErroModalEliminar(excecao.mensagem || 'Não foi possível eliminar a tarefa. Verifique se já foi atribuída.');
    } finally {
      setASubmeterEliminacao(false);
    }
  };

  const carregarProgramadoresParaAtribuicao = async () => {
    setACarregarProgramadores(true);
    setErroModalAtribuir('');
    setProgramadores([]); 
    setCompetenciasProgramadorSel([]); 
    try {
      const todosUtilizadores = await utilizadorServico.buscarTodos();
      const apenasProgramadores = todosUtilizadores.filter(u => u.funcao === 'programador');
      setProgramadores(apenasProgramadores);
      if (apenasProgramadores.length > 0) {
        setProgramadorSelecionadoId(''); 
      } else {
        setProgramadorSelecionadoId('');
        setErroModalAtribuir('Não existem programadores disponíveis para atribuição.');
      }
    } catch (ex) {
      setErroModalAtribuir('Falha ao carregar lista de programadores.');
      console.error("Erro ao carregar programadores:", ex);
    } finally {
      setACarregarProgramadores(false);
    }
  };

  const abrirModalAtribuir = (tarefa) => {
    setTarefaParaAtribuir(tarefa);
    setProgramadorSelecionadoId('');
    setCompetenciasProgramadorSel([]); 
    setErroModalAtribuir('');
    setMostrarModalAtribuir(true);
    carregarProgramadoresParaAtribuicao();
  };
  const fecharModalAtribuir = () => setMostrarModalAtribuir(false);

  const handleProgramadorSelectChange = async (e) => {
    const progId = e.target.value;
    setProgramadorSelecionadoId(progId);
    setCompetenciasProgramadorSel([]); 
    if (progId) {
      setACarregarCompProgSel(true);
      setErroModalAtribuir(''); 
      try {
        const comps = await utilizadorServico.buscarCompetenciasUtilizador(parseInt(progId));
        setCompetenciasProgramadorSel(comps);
      } catch (ex) {
        console.error("Erro ao buscar competências do programador:", ex);
        setErroModalAtribuir("Não foi possível carregar as competências deste programador.");
        setCompetenciasProgramadorSel([]); 
      } finally {
        setACarregarCompProgSel(false);
      }
    }
  };

  const submeterAtribuicaoTarefa = async (evento) => {
    evento.preventDefault();
    if (!tarefaParaAtribuir || !programadorSelecionadoId) {
      setErroModalAtribuir('Selecione um programador.');
      return;
    }
    setASubmeterAtribuicao(true);
    setErroModalAtribuir('');
    try {
      await atribuicaoServico.atribuirTarefa({
        tarefa_id: tarefaParaAtribuir.id,
        atribuido_a: parseInt(programadorSelecionadoId)
      });
      fecharModalAtribuir();
      await carregarTarefas();
    } catch (excecao) {
      setErroModalAtribuir(excecao.mensagem || 'Não foi possível atribuir a tarefa.');
      console.error("Erro ao atribuir tarefa:", excecao);
    } finally {
      setASubmeterAtribuicao(false);
    }
  };

  const tratarIniciarTarefa = async (tarefa) => {
    if (!tarefa.atribuicao_id) {
        setErroPagina(`Erro: ID da atribuição não encontrado para a tarefa ${tarefa.id}. Verifique a API.`);
        return;
    }
    setAProcessarAcaoProgramador(tarefa.id);
    setErroPagina('');
    try {
      const agora = new Date().toISOString();
      await atribuicaoServico.atualizarProgressoAtribuicao(tarefa.atribuicao_id, { inicio: agora });
      await carregarTarefas();
    } catch (ex) {
      setErroPagina(ex.mensagem || `Falha ao iniciar tarefa ${tarefa.id}.`);
    } finally {
      setAProcessarAcaoProgramador(null);
    }
  };
  const tratarConcluirTarefa = async (tarefa) => {
    if (!tarefa.atribuicao_id) {
        setErroPagina(`Erro: ID da atribuição não encontrado para a tarefa ${tarefa.id}. Verifique a API.`);
        return;
    }
    setAProcessarAcaoProgramador(tarefa.id);
    setErroPagina('');
    try {
      const agora = new Date().toISOString();
      await atribuicaoServico.atualizarProgressoAtribuicao(tarefa.atribuicao_id, { fim: agora });
      await carregarTarefas();
    } catch (ex) {
      setErroPagina(ex.mensagem || `Falha ao concluir tarefa ${tarefa.id}.`);
    } finally {
      setAProcessarAcaoProgramador(null);
    }
  };

  if (aCarregar && tarefas.length === 0) {
    return (
        <Container className="text-center mt-5">
            <Spinner animation="border" role="status">
            <span className="visually-hidden">A carregar tarefas...</span>
            </Spinner>
            <p>A carregar tarefas...</p>
        </Container>
    );
  }

  return (
    <Container className="mt-3">
      <Row className="mb-3 align-items-center">
        <Col><h2>Lista de Tarefas</h2></Col>
        {funcaoUtilizador === 'gerente' && (
          <Col xs="auto">
            <Button variant="success" onClick={abrirModalCriar} disabled={aCarregar}>
              <PlusCircleFill className="me-2" /> Criar Nova Tarefa
            </Button>
          </Col>
        )}
      </Row>
      
      {erroPagina && <Alert variant="danger" onClose={() => setErroPagina('')} dismissible>{erroPagina}</Alert>}
      {aCarregar && tarefas.length > 0 && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Recarregando...</div>}

      {!aCarregar && tarefas.length === 0 ? (
        <Alert variant="info">De momento, não existem tarefas para apresentar.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {tarefas.map((tarefa) => {
            const estadoFormatado = formatarEstado(tarefa.estado);
            const podeGerenteModificar = funcaoUtilizador === 'gerente' && tarefa.criado_por === idUtilizador && tarefa.estado === 'nao_atribuida';
            const podeLiderAtribuir = funcaoUtilizador === 'lider_equipa' && tarefa.estado === 'nao_atribuida';
            const ehMinhaTarefaProgramador = funcaoUtilizador === 'programador' && tarefa.utilizador_atribuido_id === idUtilizador;

            return (
              <Col key={tarefa.id}>
                <Card className="h-100">
                  <Card.Header as="h5"> Tarefa #{tarefa.id} <Badge bg={estadoFormatado.bg} className="ms-2 float-end">{estadoFormatado.texto}</Badge> </Card.Header>
                  <Card.Body> <Card.Text style={{ minHeight: '60px' }}>{tarefa.descricao}</Card.Text> <ListGroup variant="flush"> <ListGroup.Item> <strong>Criada em:</strong> {new Date(tarefa.criado_em).toLocaleDateString('pt-PT')} </ListGroup.Item> {tarefa.utilizador_atribuido_nome && ( <ListGroup.Item> <strong>Atribuída a:</strong> {tarefa.utilizador_atribuido_nome} </ListGroup.Item> )} {tarefa.inicio && ( <ListGroup.Item><strong>Início:</strong> {new Date(tarefa.inicio).toLocaleString('pt-PT')}</ListGroup.Item> )} {tarefa.fim && ( <ListGroup.Item><strong>Fim:</strong> {new Date(tarefa.fim).toLocaleString('pt-PT')}</ListGroup.Item> )} </ListGroup> </Card.Body>
                  <Card.Footer className="d-flex justify-content-end flex-wrap gap-1">
                    {podeGerenteModificar && ( <> <Button variant="outline-primary" size="sm" onClick={() => abrirModalEditar(tarefa)} title="Editar Tarefa"> <PencilSquare /> </Button> <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminar(tarefa)} title="Eliminar Tarefa"> <Trash3 /> </Button> </> )}
                    {podeLiderAtribuir && ( <Button variant="outline-info" size="sm" onClick={() => abrirModalAtribuir(tarefa)} title="Atribuir Tarefa" disabled={aProcessarAcaoProgramador === tarefa.id}> <PersonCheckFill className="me-1"/> Atribuir </Button> )}
                    {ehMinhaTarefaProgramador && tarefa.estado === 'atribuida' && !tarefa.inicio && ( <Button variant="outline-success" size="sm" onClick={() => tratarIniciarTarefa(tarefa)} disabled={aProcessarAcaoProgramador === tarefa.id} title="Iniciar Tarefa"> {aProcessarAcaoProgramador === tarefa.id ? <Spinner as="span" animation="border" size="sm" /> : <PlayCircleFill className="me-1"/>} Iniciar </Button> )}
                    {/* LINHA CORRIGIDA ABAIXO */}
                    {ehMinhaTarefaProgramador && tarefa.estado === 'em_progresso' && tarefa.inicio && !tarefa.fim && ( <Button variant="outline-primary" size="sm" onClick={() => tratarConcluirTarefa(tarefa)} disabled={aProcessarAcaoProgramador === tarefa.id} title="Concluir Tarefa"> {aProcessarAcaoProgramador === tarefa.id ? <Spinner as="span" animation="border" size="sm" /> : <CheckCircleFill className="me-1"/>} Concluir </Button> )}
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal Criar Tarefa */}
      <Modal show={mostrarModalCriar} onHide={fecharModalCriar} centered backdrop="static"><Modal.Header closeButton><Modal.Title>Criar Nova Tarefa</Modal.Title></Modal.Header><Form onSubmit={submeterNovaTarefa}><Modal.Body>{erroModalCriar && <Alert variant="danger">{erroModalCriar}</Alert>}<Form.Group className="mb-3" controlId="formDescricaoNovaTarefa"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} value={descricaoNovaTarefa} onChange={(e) => setDescricaoNovaTarefa(e.target.value)} required disabled={aSubmeterCriacao} /></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={fecharModalCriar} disabled={aSubmeterCriacao}>Cancelar</Button><Button variant="primary" type="submit" disabled={aSubmeterCriacao}>{aSubmeterCriacao && <Spinner as="span" animation="border" size="sm" className="me-1"/>} Criar</Button></Modal.Footer></Form></Modal>
      {/* Modal Editar Tarefa */}
      {tarefaParaEditar && ( <Modal show={mostrarModalEditar} onHide={fecharModalEditar} centered backdrop="static"><Modal.Header closeButton><Modal.Title>Editar Tarefa #{tarefaParaEditar.id}</Modal.Title></Modal.Header><Form onSubmit={submeterEdicaoTarefa}><Modal.Body>{erroModalEditar && <Alert variant="danger">{erroModalEditar}</Alert>}<Form.Group className="mb-3" controlId="formDescricaoEdicaoTarefa"><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={3} value={descricaoEdicaoTarefa} onChange={(e) => setDescricaoEdicaoTarefa(e.target.value)} required disabled={aSubmeterEdicao} /></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={fecharModalEditar} disabled={aSubmeterEdicao}>Cancelar</Button><Button variant="primary" type="submit" disabled={aSubmeterEdicao}>{aSubmeterEdicao && <Spinner as="span" animation="border" size="sm" className="me-1"/>} Guardar Alterações</Button></Modal.Footer></Form></Modal> )}
      {/* Modal Eliminar Tarefa */}
      {tarefaParaEliminar && ( <Modal show={mostrarModalEliminar} onHide={fecharModalEliminar} centered backdrop="static"><Modal.Header closeButton><Modal.Title>Confirmar Eliminação</Modal.Title></Modal.Header><Modal.Body>{erroModalEliminar && <Alert variant="danger">{erroModalEliminar}</Alert>}Tem a certeza que deseja eliminar a tarefa: <strong>"{tarefaParaEliminar.descricao.substring(0,50)}{tarefaParaEliminar.descricao.length > 50 ? '...' : ''}"</strong> (ID: {tarefaParaEliminar.id})?</Modal.Body><Modal.Footer><Button variant="secondary" onClick={fecharModalEliminar} disabled={aSubmeterEliminacao}>Cancelar</Button><Button variant="danger" onClick={submeterEliminacaoTarefa} disabled={aSubmeterEliminacao}>{aSubmeterEliminacao && <Spinner as="span" animation="border" size="sm" className="me-1"/>} Eliminar</Button></Modal.Footer></Modal> )}
      {/* Modal Atribuir Tarefa */}
      {tarefaParaAtribuir && ( <Modal show={mostrarModalAtribuir} onHide={fecharModalAtribuir} centered backdrop="static" size="lg"><Modal.Header closeButton><Modal.Title>Atribuir Tarefa #{tarefaParaAtribuir.id}</Modal.Title></Modal.Header><Form onSubmit={submeterAtribuicaoTarefa}><Modal.Body>{erroModalAtribuir && <Alert variant="danger" onClose={() => setErroModalAtribuir('')} dismissible>{erroModalAtribuir}</Alert>}<p><strong>Descrição da Tarefa:</strong> {tarefaParaAtribuir.descricao}</p><hr/><Form.Group controlId="formProgramadorAtribuir" className="mb-3"><Form.Label><strong>Atribuir a Programador:</strong></Form.Label>{aCarregarProgramadores ? (<div className="text-center"><Spinner animation="border" size="sm" /> A carregar programadores...</div>) : programadores.length === 0 && !erroModalAtribuir ? (<Alert variant="info">Não foram encontrados programadores disponíveis.</Alert>) : (<Form.Select value={programadorSelecionadoId} onChange={handleProgramadorSelectChange} disabled={aSubmeterAtribuicao || programadores.length === 0} required><option value="">-- Selecione um programador --</option>{programadores.map(prog => (<option key={prog.id} value={prog.id.toString()}>{prog.nome_utilizador} (ID: {prog.id})</option>))}</Form.Select>)}</Form.Group>{programadorSelecionadoId && (<div className="mt-3"><h6><StarFill className="me-1" />Competências de {programadores.find(p=>p.id.toString() === programadorSelecionadoId)?.nome_utilizador || 'Programador Selecionado'}:</h6>{aCarregarCompProgSel ? (<div className="text-center"><Spinner animation="border" size="sm" /> A carregar competências...</div>) : competenciasProgramadorSel.length > 0 ? (<ListGroup horizontal className="flex-wrap">{competenciasProgramadorSel.map(comp => (<ListGroup.Item key={comp.id} as="span" className="p-0 m-1 border-0"><Badge pill bg="primary">{comp.nome}</Badge></ListGroup.Item>))}</ListGroup>) : (<p className="text-muted"><em>Este programador não possui competências registadas ou não foi possível carregá-las.</em></p>)}</div>)}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={fecharModalAtribuir} disabled={aSubmeterAtribuicao}>Cancelar</Button><Button variant="primary" type="submit" disabled={aSubmeterAtribuicao || aCarregarProgramadores || !programadorSelecionadoId}>{aSubmeterAtribuicao && <Spinner as="span" animation="border" size="sm" className="me-1"/>}Confirmar Atribuição</Button></Modal.Footer></Form></Modal> )}
    </Container>
  );
};

export default PaginaTarefas;