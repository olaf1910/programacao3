// src/paginas/PaginaLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Removido useLocation, pois não será mais usado para redirecionar para 'from'
import { useAuth } from '../contextos/AuthContext';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

const PaginaLogin = () => {
  const [nomeUtilizador, setNomeUtilizador] = useState('');
  const [palavraPasse, setPalavraPasse] = useState('');
  const [erro, setErro] = useState('');
  const [aCarregar, setACarregar] = useState(false);
  
  const navigate = useNavigate();
  const { login, estaAutenticado } = useAuth();

  // Redirecionar se já estiver autenticado (leva sempre para a página inicial)
  useEffect(() => {
    if (estaAutenticado) {
      navigate('/', { replace: true }); // Sempre redireciona para a página inicial
    }
  }, [estaAutenticado, navigate]);


  const tratarSubmissao = async (evento) => {
    evento.preventDefault();
    setErro('');
    setACarregar(true);

    if (!nomeUtilizador || !palavraPasse) {
      setErro('Por favor, preencha o nome de utilizador e a palavra-passe.');
      setACarregar(false);
      return;
    }

    try {
      await login({
        nome_utilizador: nomeUtilizador,
        palavra_passe: palavraPasse,
      });
      // O AuthProvider trata de guardar o token.
      // O useEffect acima tratará do redirecionamento para a página inicial.
      // Não é necessário um navigate() explícito aqui para '/' após o login,
      // pois a mudança de estaAutenticado irá acionar o useEffect.
    } catch (excecao) {
      setErro(excecao.mensagem || 'Credenciais inválidas ou erro no servidor.');
      console.error("Exceção no login (PaginaLogin):", excecao);
    } finally {
      setACarregar(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Header as="h4" className="text-center">Login</Card.Header>
            <Card.Body>
              {erro && <Alert variant="danger">{erro}</Alert>}
              <Form onSubmit={tratarSubmissao}>
                <Form.Group className="mb-3" controlId="formNomeUtilizador">
                  <Form.Label>Nome de Utilizador</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Insira o nome de utilizador"
                    value={nomeUtilizador}
                    onChange={(e) => setNomeUtilizador(e.target.value)}
                    disabled={aCarregar}
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPalavraPasse">
                  <Form.Label>Palavra-passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Insira a palavra-passe"
                    value={palavraPasse}
                    onChange={(e) => setPalavraPasse(e.target.value)}
                    disabled={aCarregar}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={aCarregar}>
                    {aCarregar ? 'A entrar...' : 'Entrar'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaginaLogin;