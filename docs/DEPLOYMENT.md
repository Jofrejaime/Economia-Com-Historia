# Guia de Instalação e Deployment

Este documento descreve os requisitos do sistema, os passos detalhados de instalação e a configuração das variáveis de ambiente (`.env`) necessárias para colocar o backend do portal **Economia Com História** a funcionar localmente ou em produção.

---

## 1. Requisitos do Sistema

* **PHP**: Versão `8.2` ou superior (com extensões ativas: `pdo_mysql`, `openssl`, `mbstring`, `xml`, `curl`, `zip`).
* **Gestor de Dependências**: Composer `2.x`.
* **Base de Dados**: MySQL `8.0` ou superior (suporta os Triggers e a Stored Procedure do Scheduler de Leaderboard) ou SQLite para fins de testes rápidos.
* **Serviço de Correio Eletrónico (E-mail)**: Conta ativa no **Resend** (ou SMTP compatível) para o envio de e-mails de registo e recuperação de palavras-passe.

---

## 2. Passos de Instalação (Local / Staging)

1. **Obter o Código**:
   Aceda ao diretório do backend no seu terminal:
   ```bash
   cd backend
   ```

2. **Instalar Dependências**:
   Execute o instalador do Composer para descarregar todos os pacotes PHP necessários:
   ```bash
   composer install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Duplique o ficheiro de exemplo e edite as variáveis para a sua configuração local:
   ```bash
   cp .env.example .env
   ```

4. **Gerar a Chave de Aplicação**:
   ```bash
   php artisan key:generate
   ```

5. **Configurar e Executar as Migrações e População de Dados (Seeders)**:
   Garante que a base de dados indicada no `.env` foi previamente criada. De seguida, corra:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(Nota: O parâmetro `--seed` executa o `DatabaseSeeder`, populando utilizadores de teste, níveis de acesso, quizzes, categorias da comunidade e documentos).*

6. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   php artisan serve
   ```
   O backend estará disponível em `http://localhost:8000`.

---

## 3. Especificação das Variáveis de Ambiente (`.env`)

Abaixo estão descritas as variáveis cruciais no ficheiro `.env` para a integração:

### Configuração da Aplicação
* `APP_NAME`: Nome da aplicação (ex: "Economia Com História").
* `APP_ENV`: Ambiente executado (`local`, `testing`, `production`).
* `APP_KEY`: Chave criptográfica única gerada pelo Artisan (usada para encriptação interna).
* `APP_URL`: URL do backend (ex: `http://localhost:8000`).
* `FRONTEND_URL`: URL do painel Angular (ex: `http://localhost:4200` para dev).

### Definições de Autenticação da API
* `AUTH_REQUIRE_EMAIL_VERIFICATION`: Se definido como `true`, impede o login de utilizadores que não confirmaram o e-mail.
* `AUTH_EXPOSE_VERIFICATION_TOKEN`: Se definido como `true` (padrão em `local` e `testing`), devolve o token de verificação na resposta de registo para facilitar testes sem e-mail real.

### Base de Dados (MySQL/SQLite)
* `DB_CONNECTION`: Drive de base de dados (`mysql` ou `sqlite`).
* `DB_HOST`: Endereço IP do servidor de BD (normalmente `127.0.0.1`).
* `DB_PORT`: Porta de escuta (normalmente `3306`).
* `DB_DATABASE`: Nome da base de dados (ex: `economia_com_historia`).
* `DB_USERNAME`: Utilizador de ligação.
* `DB_PASSWORD`: Senha de ligação.

### Envio de E-mails (Resend)
* `MAIL_MAILER`: Deve ser configurado como `resend`.
* `RESEND_API_KEY`: A sua chave API gerada no painel do Resend (ex: `re_123456789`).
* `MAIL_FROM_ADDRESS`: O remetente do e-mail (deve coincidir com o domínio verificado no Resend).
* `MAIL_FROM_NAME`: Nome exibido na caixa de entrada (ex: "Portal Economia Com História").
