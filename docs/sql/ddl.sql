-- Tabela de referência para unidade_prefixo (comum a várias tabelas)
CREATE TABLE UNIDADE_PREFIXO (
    pk SERIAL PRIMARY KEY,
    prefixo VARCHAR(4) UNIQUE NOT NULL,
    descricao VARCHAR(32) NOT NULL
);

-- Referências para AGENDAMENTO
CREATE TABLE AGENDAMENTO_SALA (
    pk SERIAL PRIMARY KEY,
    sala VARCHAR(16) UNIQUE NOT NULL,
    descricao VARCHAR(64),
    localizacao VARCHAR(64), -- Adicionado atributo localização
    unidade_prefixo_pk INTEGER NOT NULL REFERENCES UNIDADE_PREFIXO(pk) -- Adicionado referência a UNIDADE_PREFIXO
);

CREATE TABLE AGENDAMENTO_TIPO (
    pk SERIAL PRIMARY KEY,
    tipo VARCHAR(64) UNIQUE NOT NULL,
    descricao VARCHAR(128)
);

CREATE TABLE AGENDAMENTO_STATUS (
    pk SERIAL PRIMARY KEY,
    status VARCHAR(16) UNIQUE NOT NULL,
    descricao VARCHAR(64)
);

-- Referências para COLABORADOR
CREATE TABLE COLABORADOR_SETOR (
    pk SERIAL PRIMARY KEY,
    setor VARCHAR(64) UNIQUE NOT NULL,
    descricao VARCHAR(128)
);

CREATE TABLE COLABORADOR_FUNCAO (
    pk SERIAL PRIMARY KEY,
    funcao VARCHAR(64) UNIQUE NOT NULL,
    descricao VARCHAR(128)
);

CREATE TABLE COLABORADOR_ESPECIALIDADE (
    pk SERIAL PRIMARY KEY,
    especialidade VARCHAR(64) UNIQUE NOT NULL,
    descricao VARCHAR(128)
);

-- Referências para DOCUMENTO
CREATE TABLE DOCUMENTO_TIPO (
    pk SERIAL PRIMARY KEY,
    tipo VARCHAR(64) UNIQUE NOT NULL,
    descricao VARCHAR(128)
);

-- Referências para USUARIO
CREATE TABLE USUARIO_PERFIL (
    pk SERIAL PRIMARY KEY,
    perfil VARCHAR(16) UNIQUE NOT NULL,
    descricao VARCHAR(64)
);

CREATE TABLE EMPRESA (
    pk SERIAL PRIMARY KEY,
    id SERIAL UNIQUE NOT NULL,
    diretor_colaborador_id INTEGER,
    ativo BOOLEAN NOT NULL,
    cnpj VARCHAR(16) NOT NULL,
    razao_social VARCHAR(128) NOT NULL,
    nome_fantasia VARCHAR(64) NOT NULL,
    cep VARCHAR(8) NOT NULL,
    uf CHAR(2) NOT NULL,
    cidade VARCHAR(64) NOT NULL,
    bairro VARCHAR(64) NOT NULL,
    logradouro VARCHAR(128) NOT NULL,
    numero VARCHAR(8) NOT NULL,
    complemento VARCHAR(256),
    unidade_prefixo_pk INTEGER NOT NULL REFERENCES UNIDADE_PREFIXO(pk),
    unidade_nome VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE COLABORADOR (
    pk SERIAL PRIMARY KEY,
    id SERIAL UNIQUE NOT NULL,
    empresa_unidade_prefixo_pk INTEGER NOT NULL REFERENCES UNIDADE_PREFIXO(pk),
    ativo BOOLEAN NOT NULL,
    nome VARCHAR(128) NOT NULL,
    sexo CHAR(1) NOT NULL,
    data_nascimento DATE NOT NULL,
    local_nascimento VARCHAR(128) NOT NULL,
    nome_pai VARCHAR(128) NOT NULL, 
    nome_mae VARCHAR(128) NOT NULL,
    estado_civil VARCHAR(16) NOT NULL,
    certidao_casamento VARCHAR(32) NOT NULL,
    cpf VARCHAR(16) UNIQUE NOT NULL,
    rg VARCHAR(32) NOT NULL,
    cnh VARCHAR(16) UNIQUE,
    numero_reservista VARCHAR(8),
    celular VARCHAR(16) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    modo_trabalho VARCHAR(64) NOT NULL,
    cep VARCHAR(8) NOT NULL,
    uf CHAR(2) NOT NULL,
    cidade VARCHAR(64) NOT NULL,
    bairro VARCHAR(64) NOT NULL,
    logradouro VARCHAR(128) NOT NULL,
    numero VARCHAR(8) NOT NULL,
    complemento VARCHAR(256),
    titulo_profissional VARCHAR(64) NOT NULL,
    registro_profissional VARCHAR(64),
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    pis VARCHAR(16) UNIQUE,
    setor_pk INTEGER NOT NULL REFERENCES COLABORADOR_SETOR(pk),
    funcao_pk INTEGER NOT NULL REFERENCES COLABORADOR_FUNCAO(pk),
    especialidade_pk INTEGER REFERENCES COLABORADOR_ESPECIALIDADE(pk)
);

CREATE TABLE USUARIO (
    pk SERIAL PRIMARY KEY,
    colaborador_id INTEGER UNIQUE REFERENCES COLABORADOR(id),
    ativo BOOLEAN NOT NULL,
    "online" BOOLEAN NOT NULL,
    nome VARCHAR(64) NOT NULL,
    senha VARCHAR(128) NOT NULL,
    nome_computador VARCHAR(64) NOT NULL,
    perfil_pk INTEGER NOT NULL REFERENCES USUARIO_PERFIL(pk)
);

CREATE TABLE PACIENTE (
    pk SERIAL PRIMARY KEY,
    id SERIAL UNIQUE NOT NULL,
    empresa_unidade_prefixo_pk INTEGER NOT NULL REFERENCES UNIDADE_PREFIXO(pk),
    convenio_pk INTEGER NOT NULL REFERENCES CONVENIO(pk),
    codigo VARCHAR(64) UNIQUE NOT NULL,
    ativo BOOLEAN NOT NULL,
    nome VARCHAR(256) NOT NULL,
    nome_curto VARCHAR(64) NOT NULL,
    sexo CHAR(1) NOT NULL,
    data_nascimento DATE NOT NULL,
    local_nascimento VARCHAR(32) NOT NULL,
    certidao_nascimento VARCHAR(32) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    numero_convenio VARCHAR(32),
    observacoes TEXT
);

CREATE TABLE AGENDAMENTO (
    pk SERIAL PRIMARY KEY,
    especialista_colaborador_id INTEGER NOT NULL REFERENCES COLABORADOR(id),
    paciente_id INTEGER NOT NULL REFERENCES PACIENTE(id),
    recepcionista_colaborador_id INTEGER REFERENCES COLABORADOR(id),
    responsavel_id INTEGER REFERENCES RESPONSAVEL(id),
    unidade_prefixo_pk INTEGER NOT NULL REFERENCES UNIDADE_PREFIXO(pk),
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    data_hora TIMESTAMPTZ NOT NULL,
    sala_pk INTEGER NOT NULL REFERENCES AGENDAMENTO_SALA(pk),
    tipo_pk INTEGER NOT NULL REFERENCES AGENDAMENTO_TIPO(pk),
    status_pk INTEGER NOT NULL REFERENCES AGENDAMENTO_STATUS(pk), -- Supondo que 'Agendado' seja o valor padrão
    observacoes TEXT
);

CREATE TABLE DOCUMENTO (
    pk SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES PACIENTE(id),
    colaborador_id INTEGER NOT NULL REFERENCES COLABORADOR(id),
    ativo BOOLEAN NOT NULL,
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    tipo_pk INTEGER NOT NULL REFERENCES DOCUMENTO_TIPO(pk),
    caminho VARCHAR(256) NOT NULL
);

CREATE TABLE CONTRATO (
    pk SERIAL PRIMARY KEY,
    responsavel_id INTEGER NOT NULL REFERENCES RESPONSAVEL(id),
    paciente_id INTEGER NOT NULL REFERENCES PACIENTE(id),
    documento_pk INTEGER NOT NULL REFERENCES DOCUMENTO(pk),
    ativo BOOLEAN NOT NULL,
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    cep VARCHAR(8) NOT NULL,
    uf CHAR(2) NOT NULL,
    cidade VARCHAR(64) NOT NULL,
    bairro VARCHAR(64) NOT NULL,
    logradouro VARCHAR(128) NOT NULL,
    numero VARCHAR(8) NOT NULL,
    complemento VARCHAR(256)
);

CREATE TABLE CAMINHO (
    pk SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES USUARIO(pk),
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    ativo BOOLEAN NOT NULL,
    caminho VARCHAR(256) NOT NULL,  
    editavel BOOLEAN NOT NULL,
    leitura BOOLEAN NOT NULL
);

CREATE TABLE PAGAMENTO (
    pk SERIAL PRIMARY KEY,
    responsavel_id INTEGER NOT NULL REFERENCES RESPONSAVEL(id),
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(64) NOT NULL,
    descricao TEXT
);

CREATE TABLE LACO (
    pk SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES PACIENTE(id),
    responsavel_id INTEGER NOT NULL REFERENCES RESPONSAVEL(id),
    data_hora_criacao TIMESTAMPTZ NOT NULL,
    tipo VARCHAR(16) NOT NULL
);

CREATE TABLE RESPONSAVEL (
    pk SERIAL PRIMARY KEY,
    id SERIAL UNIQUE NOT NULL,
    ativo BOOLEAN NOT NULL,
    nome VARCHAR(128) NOT NULL,
    estado_civil VARCHAR(16) NOT NULL,
    profissao VARCHAR(64) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    rg VARCHAR(20) UNIQUE NOT NULL,
    celular VARCHAR(16) UNIQUE NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    contatos_extras TEXT
);

CREATE TABLE CONVENIO (
    pk SERIAL PRIMARY KEY,
    ativo BOOLEAN NOT NULL,
    nome VARCHAR(64) NOT NULL,
    nome_curto VARCHAR(16) NOT NULL
);

ALTER TABLE EMPRESA
ADD CONSTRAINT fk_diretor_colaborador
FOREIGN KEY (diretor_colaborador_id)
REFERENCES COLABORADOR(id);