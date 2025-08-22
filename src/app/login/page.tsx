export default function LoginPage() {
  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h1>Login - Página Funcionando!</h1>
      <p>Página de login carregada com sucesso!</p>
      <form>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input type="email" style={{ width: "100%", padding: "8px" }} />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Senha:</label>
          <input type="password" style={{ width: "100%", padding: "8px" }} />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>
          Entrar
        </button>
      </form>
      
      <p style={{ marginTop: "20px" }}>
        <a href="/">← Voltar para a página inicial</a>
      </p>
    </div>
  )
}
