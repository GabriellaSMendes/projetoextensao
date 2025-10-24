import './style.css'
import { useState, useEffect } from 'react'
import api from '../../services/api'

function Home() {

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [users, setUsers] = useState([]); //lista de usuários

  // Atualiza os campos do form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  //funçao pra buscar todos os usuários
  const getUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários: ', error)
    }
  };

  //Atualiza o site automaticamente qnd recarrega o site
  useEffect(() => {
    getUsers()
  }, []);

  //funçao pra login
  const handleLogin = async () => {
    try {
      const response = await api.post('/login', {
        email: formData.email,
        password: formData.password
      });
      alert(response.data.message)
    } catch (error) {
      alert('Erro: ' + (error.response?.data.error || "Erro ao fazer login"));
    }
  };

  //função pra cadastro
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', {
        email: formData.email,
        password: formData.password
      });
      alert(response.data.message);
      getUsers();
    } catch (error) {
      alert('Erro: ' + (error.response?.data.error || "Erro desconhecido"))
    }
  };

  //função pra deletar cadastro
  const deleteUser = async (id) => {
    try {
      await api.delete(`/delete/${id}`);
      alert("Usuário excluído com sucesso!");
      getUsers();
    } catch (error) {
      alert("Falha ao excluir o usuário.");
    }
  };

  //função pra editar a senha
  const updatePassword = async (id) => {
    const newPassword = prompt("Digite a nova senha: ");
    if (!newPassword) return;
    try {
      await api.put(`update/${id}`, { password: newPassword });
      alert("Senha atualizada com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar a senha");
    }
  };

  return (
    <div className='container'>

      {/*formulario principal de cadastro */}
      <form onSubmit={handleSubmit}>
        <h1>Login de Usuário</h1>

        <input
          placeholder='E-mail'
          type="email"
          name='email'
          value={formData.email}
          onChange={handleChange}
        />

        <input
          placeholder='Senha'
          type="password"
          name='password'
          value={formData.password}
          onChange={handleChange}
        />

        <button className='button-login' type='button' onClick={handleLogin}>Login</button>
        <button className='button-register' type='submit'>Cadastrar</button>
      </form>

      {/*Lista de usuários */}
      <div className='userList'>
        {users.map(user => (
          <div key={user.id} className='user-card'>
            <div>
              <p>Email: <span>{user.email}</span></p>
            </div>
            <div className='user-card-buttons'>
            <button onClick={() => updatePassword(user.id)}>✏️</button>
            <button onClick={() => deleteUser(user.id)}>🗑️</button>
            </div>
          </div>
        ))
        }

      </div>


    </div>
  )
}

export default Home