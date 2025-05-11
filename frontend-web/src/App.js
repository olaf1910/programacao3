// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import PaginaInicial from './paginas/PaginaInicial';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaTarefas from './paginas/PaginaTarefas';
import PaginaNaoEncontrada from './paginas/PaginaNaoEncontrada';
import PaginaAdminUtilizadores from './paginas/PaginaAdminUtilizadores';
import PaginaPerfil from './paginas/PaginaPerfil';
import RotaProtegida from './rotas/RotaProtegida';
import RotaAdminProtegida from './rotas/RotaAdminProtegida';
import { useAuth } from './contextos/AuthContext';

import { Navbar, Nav, Container, Offcanvas, Button, NavDropdown } from 'react-bootstrap';
import { 
  List as IconeMenu, 
  BoxArrowRight as IconeLogout, 
  PeopleFill as IconeAdminUtilizadores,
  HouseDoorFill as IconePaginaInicial,
  ListTask as IconeTarefas,
  PersonCircle as IconePerfil
} from 'react-bootstrap-icons';

const AppNavbar = () => {
  const { estaAutenticado, logout, utilizadorAtual, funcaoUtilizador } = useAuth();
  const [mostrarOffcanvas, setMostrarOffcanvas] = useState(false);

  const tratarLogout = () => {
    logout();
    setMostrarOffcanvas(false); 
  };

  const fecharOffcanvas = () => setMostrarOffcanvas(false);
  const abrirOffcanvas = () => setMostrarOffcanvas(true);

  const UserInfoNav = () => {
    if (estaAutenticado) {
      return (
        <NavDropdown 
          title={
            <>
              <IconePerfil size={20} className="me-1 d-none d-sm-inline" />
              Olá, {utilizadorAtual?.nome_utilizador || 'Utilizador'}
            </>
          } 
          id="nav-dropdown-utilizador" 
          align="end"
        >
          {/* Informações simplificadas no dropdown, email completo no perfil */}
          <div className="px-3 pt-2 pb-1">
             <div className="fw-bold">{utilizadorAtual?.nome_utilizador}</div>
             {/* <small className="text-muted">{utilizadorAtual?.email || 'Email não disponível'}</small><br/> */} {/* Email removido daqui */}
             <small className="text-muted">Função: {funcaoUtilizador}</small>
          </div>
          <NavDropdown.Divider />
          <NavDropdown.Item as={RouterLink} to="/perfil"> 
            <IconePerfil className="me-2" /> Ver Perfil Completo
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={tratarLogout}>
            <IconeLogout className="me-2" /> Logout
          </NavDropdown.Item>
        </NavDropdown>
      );
    } else {
      return (
        <Nav.Link as={RouterLink} to="/login">Login</Nav.Link>
      );
    }
  };

  return (
    <>
      <Navbar bg="light" className="mb-4" sticky="top">
        <Container fluid>
          <Button 
            variant="outline-secondary" 
            onClick={abrirOffcanvas} 
            className="me-2"
            aria-label="Abrir menu"
          >
            <IconeMenu size={24} />
          </Button>
          
          <Navbar.Brand as={RouterLink} to="/">FeedzzTrab</Navbar.Brand>
          
          <Nav className="ms-auto d-flex flex-row align-items-center">
              <UserInfoNav />
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={mostrarOffcanvas} onHide={fecharOffcanvas} placement="start" backdrop={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column h-100"> 
          <Nav className="flex-column">
            <Nav.Link as={RouterLink} to="/" onClick={fecharOffcanvas} className="mb-2 d-flex align-items-center">
              <IconePaginaInicial className="me-2" /> Página Inicial
            </Nav.Link>
            
            {estaAutenticado && (
              <Nav.Link as={RouterLink} to="/tarefas" onClick={fecharOffcanvas} className="mb-2 d-flex align-items-center">
                <IconeTarefas className="me-2" /> Tarefas
              </Nav.Link>
            )}

            {estaAutenticado && funcaoUtilizador === 'admin' && (
              <Nav.Link as={RouterLink} to="/admin/utilizadores" onClick={fecharOffcanvas} className="mb-2 d-flex align-items-center">
                <IconeAdminUtilizadores className="me-2" /> Gestão de Utilizadores
              </Nav.Link>
            )}
            
            {estaAutenticado && (
                <Nav.Link as={RouterLink} to="/perfil" onClick={fecharOffcanvas} className="mb-2 d-flex align-items-center">
                    <IconePerfil className="me-2" /> Meu Perfil
                </Nav.Link>
            )}
          </Nav>

          {estaAutenticado && (
            <Button 
              variant="outline-danger" 
              onClick={tratarLogout} 
              className="mt-auto w-100"
            >
              <IconeLogout size={18} className="me-2" />
              Logout
            </Button>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route 
            path="/tarefas" 
            element={
              <RotaProtegida>
                <PaginaTarefas />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/admin/utilizadores"
            element={
              <RotaAdminProtegida>
                <PaginaAdminUtilizadores />
              </RotaAdminProtegida>
            }
          />
          <Route 
            path="/perfil"
            element={
              <RotaProtegida>
                <PaginaPerfil />
              </RotaProtegida>
            }
          />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;