// src/paginas/PaginaPerfil.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contextos/AuthContext';
import utilizadorServico from '../servicos/utilizadorServico';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ListGroup, InputGroup } from 'react-bootstrap'; // Badge não está a ser usado aqui
import { ShieldLockFill, BookmarkPlusFill, StarFill } from 'react-bootstrap-icons';

const PaginaPerfil = () => {
  const { idUtilizador, funcaoUtilizador } = useAuth();

  const [detalhesPerfil, setDetalhesPerfil] = useState(null);
  const [aCarregarPerfil, setACarregarPerfil] = useState(true);
  const [erroPagina, setErroPagina] = useState('');

  const [palavraPasseAtual, setPalavraPasseAtual] = useState('');
  const [novaPalavraPasse, setNovaPalavraPasse] = useState('');
  const [confirmarNovaPalavraPasse, setConfirmarNovaPalavraPasse] = useState('');
  const [mensagemSucessoPasse, setMensagemSucessoPasse] = useState('');
  const [erroAlteracaoPasse, setErroAlteracaoPasse] = useState('');
  const [aSubmeterPasse, setASubmeterPasse] = useState(false);

  const [competencias, setCompetencias] = useState([]);
  const [aCarregarCompetencias, setACarregarCompetencias] = useState(false);
  const [erroCompetencias, setErroCompetencias] = useState('');
  const [novaCompetenciaNome, setNovaCompetenciaNome] = useState('');
  const [aAdicionarCompetencia, setAAdicionarCompetencia] = useState(false);


  const carregarDetalhesECompetencias = useCallback(async () => {
    if (!idUtilizador) {
      setErroPagina("ID do utilizador não encontrado. Faça login novamente.");
      setACarregarPerfil(false);
      setACarregarCompetencias(false);
      return;
    }
    
    setACarregarPerfil(true);
    setErroPagina('');
    try {
      const dadosPerfil = await utilizadorServico.buscarUtilizadorPorId(idUtilizador);
      setDetalhesPerfil(dadosPerfil);
    } catch (err) {
      setErroPagina(err.mensagem || "Não foi possível carregar os detalhes do perfil.");
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setACarregarPerfil(false);
    }

    if (funcaoUtilizador === 'programador') {
      setACarregarCompetencias(true);
      setErroCompetencias('');
      try {
        const dadosCompetencias = await utilizadorServico.buscarCompetenciasUtilizador(idUtilizador);
        setCompetencias(dadosCompetencias);
      } catch (err) {
        setErroCompetencias(err.mensagem || "Não foi possível carregar as suas competências.");
        console.error("Erro ao carregar competências:", err);
      } finally {
        setACarregarCompetencias(false);
      }
    }
  }, [idUtilizador, funcaoUtilizador]);

  useEffect(() => {
    carregarDetalhesECompetencias();
  }, [carregarDetalhesECompetencias]);

  const tratarAlteracaoPalavraPasse = async (e) => {
    e.preventDefault();
    setErroAlteracaoPasse('');
    setMensagemSucessoPasse('');

    if (!palavraPasseAtual || !novaPalavraPasse || !confirmarNovaPalavraPasse) {
      setErroAlteracaoPasse('Todos os campos de palavra-passe são obrigatórios.');
      return;
    }
    if (novaPalavraPasse !== confirmarNovaPalavraPasse) {
      setErroAlteracaoPasse('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }

    setASubmeterPasse(true);
    try {
      const resposta = await utilizadorServico.alterarPalavraPasse(idUtilizador, {
        palavra_passe_atual: palavraPasseAtual,
        nova_palavra_passe: novaPalavraPasse,
      });
      setMensagemSucessoPasse(resposta.mensagem || 'Palavra-passe alterada com sucesso!');
      setPalavraPasseAtual('');
      setNovaPalavraPasse('');
      setConfirmarNovaPalavraPasse('');
    } catch (err) {
      setErroAlteracaoPasse(err.mensagem || 'Falha ao alterar a palavra-passe.');
    } finally {
      setASubmeterPasse(false);
    }
  };

  const tratarAdicionarCompetencia = async (e) => {
    e.preventDefault();
    if (!novaCompetenciaNome.trim()) {
      setErroCompetencias("O nome da competência não pode estar vazio.");
      return;
    }
    setAAdicionarCompetencia(true);
    setErroCompetencias('');
    try {
      const competenciasAtualizadas = await utilizadorServico.adicionarCompetenciaUtilizador(idUtilizador, novaCompetenciaNome.trim());
      setCompetencias(competenciasAtualizadas);
      setNovaCompetenciaNome('');
    } catch (err) {
      setErroCompetencias(err.mensagem || "Falha ao adicionar competência.");
      console.error("Erro ao adicionar competência:", err);
    } finally {
      setAAdicionarCompetencia(false);
    }
  };

  if (aCarregarPerfil) {
    return (
        <Container className="text-center mt-5">
            <Spinner animation="border" /> <p>A carregar dados do perfil...</p>
        </Container>
    );
  }

  if (erroPagina) {
    return <Container className="mt-3"><Alert variant="danger">{erroPagina}</Alert></Container>;
  }
  
  if (!detalhesPerfil) {
    return <Container className="mt-3"><Alert variant="warning">Não foi possível carregar os dados do perfil.</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="mb-4">
            <Card.Header as="h4">O Meu Perfil</Card.Header>
            <Card.Body>
              <p><strong>ID:</strong> {detalhesPerfil.id}</p>
              <p><strong>Nome de Utilizador:</strong> {detalhesPerfil.nome_utilizador}</p>
              <p><strong>Email:</strong> {detalhesPerfil.email}</p>
              <p><strong>Função:</strong> {detalhesPerfil.funcao}</p>
              <p><strong>Membro desde:</strong> {new Date(detalhesPerfil.criado_em).toLocaleDateString('pt-PT')}</p>
            </Card.Body>
          </Card>

          {/* Secção de Competências - Apenas para Programador */}
          {funcaoUtilizador === 'programador' && (
            <Card className="mb-4"> {/* Este Card envolve a secção de competências */}
              <Card.Header as="h5">
                <StarFill className="me-2" /> Minhas Competências
              </Card.Header>
              <Card.Body>
                {erroCompetencias && <Alert variant="danger">{erroCompetencias}</Alert>}
                {aCarregarCompetencias ? (
                  <div className="text-center"><Spinner animation="border" size="sm" /> A carregar competências...</div>
                ) : competencias.length > 0 ? (
                  <ListGroup variant="flush" className="mb-3">
                    {competencias.map(comp => (
                      <ListGroup.Item key={comp.id} className="d-flex justify-content-between align-items-center">
                        {comp.nome}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted">Ainda não adicionou competências.</p>
                )}

                <Form onSubmit={tratarAdicionarCompetencia}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Adicionar nova competência (ex: React, Node.js)"
                      value={novaCompetenciaNome}
                      onChange={(e) => setNovaCompetenciaNome(e.target.value)}
                      disabled={aAdicionarCompetencia}
                      required
                    />
                    <Button variant="outline-primary" type="submit" disabled={aAdicionarCompetencia}>
                      {aAdicionarCompetencia ? <Spinner as="span" animation="border" size="sm" /> : <BookmarkPlusFill />}
                       Adicionar
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Body>
            </Card> // Fechamento correto do Card de competências
          )} {/* Fim da condição para mostrar secção de competências */}

          <Card> {/* Card para Alterar Palavra-passe */}
            <Card.Header as="h5"><ShieldLockFill className="me-2" /> Alterar Palavra-passe</Card.Header>
            <Card.Body>
              {mensagemSucessoPasse && <Alert variant="success">{mensagemSucessoPasse}</Alert>}
              {erroAlteracaoPasse && <Alert variant="danger">{erroAlteracaoPasse}</Alert>}
              <Form onSubmit={tratarAlteracaoPalavraPasse}>
                <Form.Group className="mb-3" controlId="formPalavraPasseAtual"><Form.Label>Palavra-passe Atual</Form.Label><Form.Control type="password" value={palavraPasseAtual} onChange={(e) => setPalavraPasseAtual(e.target.value)} disabled={aSubmeterPasse} required /></Form.Group>
                <Form.Group className="mb-3" controlId="formNovaPalavraPasse"><Form.Label>Nova Palavra-passe</Form.Label><Form.Control type="password" value={novaPalavraPasse} onChange={(e) => setNovaPalavraPasse(e.target.value)} disabled={aSubmeterPasse} required placeholder="Mín. 8 caracteres, complexa"/></Form.Group>
                <Form.Group className="mb-3" controlId="formConfirmarNovaPalavraPasse"><Form.Label>Confirmar Nova Palavra-passe</Form.Label><Form.Control type="password" value={confirmarNovaPalavraPasse} onChange={(e) => setConfirmarNovaPalavraPasse(e.target.value)} disabled={aSubmeterPasse} required/></Form.Group>
                <Button variant="primary" type="submit" disabled={aSubmeterPasse}>{aSubmeterPasse && <Spinner as="span" animation="border" size="sm" className="me-1" />}Alterar Palavra-passe</Button>
              </Form>
            </Card.Body>
          </Card> {/* Fim do Card de Alterar Palavra-passe */}
        </Col>
      </Row>
    </Container>
  );
};

export default PaginaPerfil;