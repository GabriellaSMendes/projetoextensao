//valida a senha
export function validarSenha(senha) {
  const tamanhoMinimo = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);

  return {
    ok: tamanhoMinimo && temMaiuscula && temEspecial,
    erros: {
      tamanhoMinimo,
      temMaiuscula,
      temEspecial,
    },
  };
}

export function calcularForcaSenha(senha) {
  let forca = 0;

  if (senha.length >= 8) forca++;
  if (/[A-Z]/.test(senha)) forca++;
  if (/[a-z]/.test(senha)) forca++;
  if (/[0-9]/.test(senha)) forca++;
  if (/[^A-Za-z0-9]/.test(senha)) forca++;

  // força final varia de 0 a 5
  return Math.min(forca, 5);
}


export function gerarMensagensErro(erros) {
  const mensagens = [];

  if (!erros.tamanhoMinimo)
    mensagens.push("• Pelo menos 8 caracteres");

  if (!erros.temMaiuscula)
    mensagens.push("• Pelo menos 1 letra maiúscula");

  if (!erros.temEspecial)
    mensagens.push("• Pelo menos 1 caractere especial");

  return mensagens;
}
