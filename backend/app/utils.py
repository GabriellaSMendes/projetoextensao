from validate_docbr import CPF, CNPJ

def validar_cpf(cpf_string):
    cpf = CPF()
    return cpf.validate(cpf_string)

def validar_cnpj(cnpj_string):
    cnpj = CNPJ()
    return cnpj.validate(cnpj_string)
