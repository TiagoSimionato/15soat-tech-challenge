# Dicionário de Linguagem Ubíqua
---
## Termos do Domínio

### Serviço (`Service`)

Serviço oferecido pela oficina no catálogo, sem vínculo com nenhuma ordem de serviço. Representa o "o que a oficina sabe fazer".

- **Exemplos:** Troca de óleo, Alinhamento, Revisão completa
- **Atributos principais:** nome, custo base
- **Relação:** Um serviço pode ser solicitado em várias ordens de serviço

---

### Serviço Solicitado (`RequestedService`)

Instância de um serviço vinculada a uma ordem de serviço específica. Representa a execução real de um serviço para um cliente. É criado quando o cliente abre uma OS e solicita que um serviço do catálogo seja realizado no seu veículo.

- **Exemplo:** Cliente João solicitou "Troca de óleo" na OS #42
- **Atributos principais:** status, custo final, data de início, data de fim, funcionário responsável
- **Relação:** Pertence a uma OS, referencia um Service do catálogo

---

### Ordem de Serviço / OS (`ServiceOrder`)

Documento que agrupa todos os serviços solicitados para um veículo em uma visita à oficina. É o contrato entre o cliente e a oficina.

- **Exemplo:** OS #42 — veículo ABC-1234, cliente João, com 3 serviços solicitados
- **Atributos principais:** status, orçamento, custo total, data de chegada do veículo, data de entrega
- **Relação:** Pertence a um cliente, vinculada a um veículo, contém vários serviços solicitados

---

### Status do Serviço Solicitado

Estado de execução de um serviço solicitado individualmente. Reflete o progresso do funcionário naquele serviço específico.

| Status | Significado |
|--------|-------------|
| `RECEBIDA` | Serviço solicitado, ainda não iniciado |
| `AGUARDANDO APROVAÇÃO` | Aguardando aprovação do cliente |
| `APROVADA` | Serviço aprovado pelo cliente |
| `EM EXECUÇÃO` | Funcionário iniciou a execução |
| `FINALIZADA` | Funcionário concluiu o serviço |
| `ENTREGUE` | OS foi entregue ao cliente |
| `CANCELADO` | Serviço foi cancelado individualmente |

---

### Status da Ordem de Serviço

Estado geral da OS, que reflete o conjunto de todos os serviços solicitados vinculados a ela.

| Status | Significado |
|--------|-------------|
| `PENDENTE` | OS criada, nenhum serviço iniciado |
| `APROVADA` | Serviço aprovado pelo cliente |
| `ENTREGUE` | Veículo entregue ao cliente |
| `CANCELADA` | OS cancelada integralmente |

> **Regra de negócio:** A OS só pode ir para `ENTREGUE` quando todos os serviços solicitados estiverem em `FINALIZADA`.

---

### Recurso (`Resource`)

Material, peça ou insumo utilizado na execução de um serviço. Compõe o catálogo de itens gerenciados no estoque.

- **Tipos:**
  - `P` (Parts/Peças): componentes físicos — ex.: filtro de óleo, pastilha de freio
  - `S` (Supplies/Insumos): consumíveis — ex.: óleo de motor, tinta
- **Atributos principais:** nome, tipo, custo unitário, unidade de medida

---

### Unidade de Medida (`UnitType`)

Define como um recurso é quantificado no estoque e no consumo.

| Valor | Significado |
|-------|-------------|
| `U` | Unidade |
| `L` | Litro |
| `ML` | Mililitro |

---

### Recursos por Serviço (`ResourcesByService`)

Vínculo entre um serviço do catálogo e os recursos necessários para executá-lo, incluindo a quantidade mínima exigida. Define o "receituário" de um serviço.

- **Exemplo:** Troca de óleo requer 5L de óleo de motor e 1 filtro de óleo
- **Atributos principais:** serviço, recurso, quantidade mínima

---

### Estoque (`Stock`)

Registro da quantidade disponível de um recurso na oficina. Existe um único registro de estoque por recurso.

- **Atributos principais:** recurso, quantidade atual
- **Regra:** Não pode ser decrementado abaixo de zero — lança erro de estoque insuficiente

---

### Item de Serviço (`ServiceItem`)

Registro do consumo efetivo de um recurso do estoque em um serviço solicitado. É criado automaticamente quando uma OS é aberta e o estoque é decrementado a partir dos registros na tabela de ServiceItem.

- **Exemplo:** Na OS #42, o serviço de troca de óleo consumiu 5L do estoque de óleo
- **Atributos principais:** quantidade consumida, estoque de origem, serviço solicitado vinculado

---

### Veículo (`Vehicle`)

Automóvel cadastrado na plataforma e vinculado a um cliente. É o objeto sobre o qual os serviços são realizados.

- **Atributos principais:** marca, modelo, ano, placa
- **Regra:** A placa é um identificador único no sistema
- **Formatos aceitos de placa:** padrão antigo (ABC-1234) e padrão Mercosul (ABC1D34)

---

### Usuário (`User`)

Pessoa cadastrada na plataforma. Pode atuar como cliente (abre OS) ou como funcionário (executa serviços solicitados).

- **Atributos principais:** nome, username, documento (CPF/CNPJ), natureza jurídica
- **Natureza jurídica:**
  - `F` — Pessoa Física
  - `J` — Pessoa Jurídica

---

### Role / Perfil de Acesso (`Role`)

Define o nível de permissão de um usuário no sistema.

| Role | Permissões |
|------|------------|
| `admin` | Acesso total ao sistema |

---

### Funcionário (`Employee`)

Usuário que executa os serviços solicitados. É referenciado dentro de um serviço solicitado como o responsável pela execução.

> **Observação:** No modelo atual, funcionário e cliente são ambos do tipo `User`, diferenciados pelo contexto de uso na OS.

---

### Cliente (`Client`)

Usuário que abre ordens de serviço e possui veículos cadastrados na plataforma.

---

### Chegada do Veículo (`vehicle_arrived_at`)

Registro do momento em que o veículo do cliente chegou fisicamente à oficina. Marca o início operacional da OS.

---

### Entrega do Veículo (`vehicle_delivered_at`)

Registro do momento em que o veículo foi devolvido ao cliente. Marca o encerramento da OS.

---

### Orçamento (`budget`)

Valor estimado da OS no momento da abertura, antes da execução dos serviços.

---

### Custo Final (`cost`)

Valor real cobrado ao final da OS, após a conclusão dos serviços solicitados. Pode diferir do orçamento.

---

### Autenticação (`Auth`)

Processo de verificação de identidade do usuário via credenciais (username e senha), resultando em um token de acesso JWT.

---

### Token JWT (`accessToken`)

Credencial digital gerada após login bem-sucedido. Deve ser enviado em todas as requisições autenticadas via header `Authorization: Bearer <token>`. Contém as informações de identidade e perfil do usuário.

---

### Migração (`Migration`)

Script versionado que cria, altera ou popula estruturas do banco de dados de forma controlada e rastreável. Garante que todos os ambientes (dev, teste, produção) tenham o mesmo schema.

---

## Resumo Visual

```
Cliente (User)
    └── possui → Veículos (Vehicle)
    └── abre → Ordem de Serviço (ServiceOrder)
                    └── contém → Serviços Solicitados (RequestedService)
                                      └── referencia → Serviço do Catálogo (Service)
                                      └── executado por → Funcionário (User)
                                      └── consome → Itens de Serviço (ServiceItem)
                                                         └── decrementa → Estoque (Stock)
                                                                              └── rastreia → Recurso (Resource)
```
