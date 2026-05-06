import { useState } from "react";
import Notification from "../../components/Notification";
import ConfirmModal from "../../components/ConfirmModal";
import "./style.css";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id_usuario: 1,
      nome_usuario: "Administrador",
      cpf: "000.000.000-00",
      email: "admin@email.com",
      nivel_acesso: "admin",
      ativo: true,
    },
    {
      id_usuario: 2,
      nome_usuario: "Vendedor Teste",
      cpf: "111.111.111-11",
      email: "vendedor@email.com",
      nivel_acesso: "vendedor",
      ativo: true,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    nome_usuario: "",
    cpf: "",
    email: "",
    senha: "",
    nivel_acesso: "vendedor",
    ativo: true,
  });

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const [confirmModal, setConfirmModal] = useState({
    aberto: false,
    usuario: null,
  });

  function mostrarNotificacao(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3500);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const abrirNovoUsuario = () => {
    setEditando(null);
    setFormData({
      nome_usuario: "",
      cpf: "",
      email: "",
      senha: "",
      nivel_acesso: "vendedor",
      ativo: true,
    });
    setModalOpen(true);
  };

  const abrirEdicao = (usuario) => {
    setEditando(usuario);
    setFormData({
      nome_usuario: usuario.nome_usuario || "",
      cpf: usuario.cpf || "",
      email: usuario.email || "",
      senha: "",
      nivel_acesso: usuario.nivel_acesso || "vendedor",
      ativo: usuario.ativo,
    });
    setModalOpen(true);
  };

  const salvarUsuario = () => {
    if (!formData.nome_usuario.trim()) {
      mostrarNotificacao("Informe o nome do usuário.", "warning");
      return;
    }

    if (!formData.email.trim()) {
      mostrarNotificacao("Informe o e-mail do usuário.", "warning");
      return;
    }

    if (!editando && !formData.senha.trim()) {
      mostrarNotificacao("Informe uma senha para o novo usuário.", "warning");
      return;
    }

    if (editando) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === editando.id_usuario
            ? {
                ...u,
                nome_usuario: formData.nome_usuario,
                cpf: formData.cpf,
                email: formData.email,
                nivel_acesso: formData.nivel_acesso,
                ativo: formData.ativo,
              }
            : u
        )
      );

      mostrarNotificacao("Usuário atualizado com sucesso.", "success");
    } else {
      const novoUsuario = {
        id_usuario: Date.now(),
        nome_usuario: formData.nome_usuario,
        cpf: formData.cpf,
        email: formData.email,
        nivel_acesso: formData.nivel_acesso,
        ativo: formData.ativo,
      };

      setUsuarios((prev) => [...prev, novoUsuario]);
      mostrarNotificacao("Usuário cadastrado com sucesso.", "success");
    }

    setModalOpen(false);
    setEditando(null);
  };

  const abrirConfirmacaoStatus = (usuario) => {
    setConfirmModal({
      aberto: true,
      usuario,
    });
  };

  const alterarStatusUsuario = () => {
    const usuario = confirmModal.usuario;

    if (!usuario) return;

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id_usuario === usuario.id_usuario
          ? { ...u, ativo: !u.ativo }
          : u
      )
    );

    setConfirmModal({
      aberto: false,
      usuario: null,
    });

    mostrarNotificacao(
      usuario.ativo
        ? "Usuário desativado com sucesso."
        : "Usuário reativado com sucesso.",
      "success"
    );
  };

  return (
    <div className="usuarios-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <main className="usuarios-main">
        <div className="usuarios-title-row">
          <div className="usuarios-title">
            <h1>USUÁRIOS</h1>
            <small>
              <strong>{usuarios.length}</strong> usuário(s) cadastrado(s)
            </small>
          </div>

          <button className="add-btn" onClick={abrirNovoUsuario}>
            + Adicionar novo
          </button>
        </div>

        <div className="usuarios-table">
          <div className="thead">
            <div className="col">Nome</div>
            <div className="col">E-mail</div>
            <div className="col">CPF</div>
            <div className="col">Nível</div>
            <div className="col">Status</div>
            <div className="col action">Ações</div>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty">Nenhum usuário cadastrado.</div>
          ) : (
            usuarios.map((usuario) => (
              <div
                className={`row ${usuario.ativo ? "" : "row-inativo"}`}
                key={usuario.id_usuario}
              >
                <div className="col">{usuario.nome_usuario}</div>
                <div className="col">{usuario.email}</div>
                <div className="col">{usuario.cpf || "-"}</div>
                <div className="col">
                  <span className={`nivel-badge ${usuario.nivel_acesso}`}>
                    {usuario.nivel_acesso === "admin" ? "Admin" : "Vendedor"}
                  </span>
                </div>
                <div className="col">
                  <span
                    className={`status-badge ${
                      usuario.ativo ? "ativo" : "inativo"
                    }`}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="col action">
                  <button
                    className="edit-btn"
                    onClick={() => abrirEdicao(usuario)}
                  >
                    Editar
                  </button>

                  <button
                    className={usuario.ativo ? "hide-btn" : "restore-btn"}
                    onClick={() => abrirConfirmacaoStatus(usuario)}
                  >
                    {usuario.ativo ? "Desativar" : "Reativar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box usuario-modal-box">
            <div className="modal-header-usuario">
              <div>
                <h2>{editando ? "Editar usuário" : "Novo usuário"}</h2>
                <p>
                  Gerencie os dados de acesso dos usuários do sistema.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-x"
                onClick={() => {
                  setModalOpen(false);
                  setEditando(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-section-title">Dados do usuário</div>

            <div className="form-grid usuario-form-grid">
              <div>
                <label>Nome</label>
                <input
                  name="nome_usuario"
                  value={formData.nome_usuario}
                  onChange={handleChange}
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label>CPF</label>
                <input
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@email.com"
                />
              </div>

              <div>
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder={editando ? "Deixe vazio para manter" : "Senha"}
                />
              </div>

              <div>
                <label>Nível de acesso</label>
                <select
                  name="nivel_acesso"
                  value={formData.nivel_acesso}
                  onChange={handleChange}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="checkbox-status">
                <label>
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                  />
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="modal-actions usuario-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setModalOpen(false);
                  setEditando(null);
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={salvarUsuario}
              >
                {editando ? "Salvar alterações" : "Cadastrar usuário"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.aberto && confirmModal.usuario && (
        <ConfirmModal
          title={
            confirmModal.usuario.ativo
              ? "Desativar usuário"
              : "Reativar usuário"
          }
          message={`Deseja ${
            confirmModal.usuario.ativo ? "desativar" : "reativar"
          } o usuário "${confirmModal.usuario.nome_usuario}"?`}
          confirmText={confirmModal.usuario.ativo ? "Desativar" : "Reativar"}
          cancelText="Cancelar"
          type={confirmModal.usuario.ativo ? "warning" : "info"}
          onConfirm={alterarStatusUsuario}
          onCancel={() =>
            setConfirmModal({
              aberto: false,
              usuario: null,
            })
          }
        />
      )}
    </div>
  );
}

export default Usuarios;