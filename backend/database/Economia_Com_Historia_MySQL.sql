-- ================================================================
-- ECONOMIA COM HISTÓRIA – ANGOLA
-- Base de Dados MySQL 8.0+
-- Convertido de PostgreSQL por: Jofre Jaime Jamuinda Mutumbungo
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS economia_historia_angola
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE economia_historia_angola;

-- ================================================================
-- MÓDULO 1: AUTENTICAÇÃO & UTILIZADORES
-- ================================================================

-- Tabela principal de utilizadores
CREATE TABLE users (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,           -- bcrypt/argon2
  email_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  role            VARCHAR(20)  NOT NULL DEFAULT 'estudante',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at   DATETIME     NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_role
    CHECK (role IN ('estudante','investigador','professor','admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Perfil detalhado do utilizador
-- NOTA: TEXT[] (array) → JSON. A validação dos valores é feita
--       pela aplicação ou por um trigger (ver abaixo).
CREATE TABLE user_profiles (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  full_name       VARCHAR(255) NULL,
  institution     VARCHAR(255) NULL,               -- universidade/organização
  province        VARCHAR(50)  NULL,               -- 18 províncias de Angola
  avatar_url      VARCHAR(500) NULL,
  bio             TEXT         NULL,
  website_url     VARCHAR(500) NULL,
  research_areas  JSON         NULL,               -- ex: ["Petróleo","História Colonial"]
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_profiles_user (user_id),
  CONSTRAINT fk_user_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_user_profiles_province
    CHECK (province IN (
      'Bengo','Benguela','Bié','Cabinda','Cuando Cubango',
      'Cuanza Norte','Cuanza Sul','Cunene','Huambo','Huíla',
      'Luanda','Lunda Norte','Lunda Sul','Malanje','Moxico',
      'Namibe','Uíge','Zaire'
    ) OR province IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessões (para JWT refresh tokens)
-- NOTA: INET → VARCHAR(45) para suportar IPv4 e IPv6.
CREATE TABLE user_sessions (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  refresh_token   VARCHAR(500) NOT NULL,
  ip_address      VARCHAR(45)  NULL,               -- IPv4 ou IPv6
  user_agent      TEXT         NULL,
  expires_at      DATETIME     NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (refresh_token),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens de verificação (email, reset password)
CREATE TABLE verification_tokens (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  token           VARCHAR(255) NOT NULL,
  type            VARCHAR(30)  NOT NULL,
  expires_at      DATETIME     NOT NULL,
  used_at         DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_vtokens_token (token),
  CONSTRAINT fk_vtokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_vtokens_type
    CHECK (type IN ('email_verification','password_reset','invite'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 2: GAMIFICAÇÃO (Níveis, Pontos, Badges)
-- ================================================================

-- Definição dos níveis (configurável via painel admin)
-- NOTA: JSONB → JSON  (MySQL 8.0 tem JSON nativo)
CREATE TABLE level_definitions (
  level           INT          NOT NULL,
  name            VARCHAR(100) NOT NULL,           -- "Investigador Avançado"
  min_points      INT          NOT NULL DEFAULT 0,
  max_points      INT          NULL,               -- NULL no último nível
  color_hex       VARCHAR(7)   NULL,
  icon_url        VARCHAR(500) NULL,
  perks           JSON         NULL,               -- benefícios do nível

  PRIMARY KEY (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progresso e pontos do utilizador
CREATE TABLE user_levels (
  id                  CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id             CHAR(36)  NOT NULL,
  current_level       INT       NOT NULL DEFAULT 1,
  total_points        INT       NOT NULL DEFAULT 0,
  weekly_points       INT       NOT NULL DEFAULT 0,
  monthly_points      INT       NOT NULL DEFAULT 0,
  quizzes_completed   INT       NOT NULL DEFAULT 0,
  documents_read      INT       NOT NULL DEFAULT 0,
  topics_created      INT       NOT NULL DEFAULT 0,
  replies_posted      INT       NOT NULL DEFAULT 0,
  updated_at          DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_levels_user (user_id),
  CONSTRAINT fk_user_levels_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_levels_level
    FOREIGN KEY (current_level) REFERENCES level_definitions(level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de pontos ganhos
-- NOTA: reference_id é CHAR(36) mas sem FK (referencia tabelas variadas).
CREATE TABLE point_transactions (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  points          INT          NOT NULL,
  reason          VARCHAR(50)  NOT NULL,
  reference_id    CHAR(36)     NULL,
  reference_type  VARCHAR(50)  NULL,
  description     TEXT         NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_point_tx_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_point_tx_reason
    CHECK (reason IN (
      'quiz_completion','quiz_bonus_accuracy',
      'quiz_bonus_speed','document_upload',
      'topic_created','reply_posted',
      'document_liked','admin_adjustment'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Definição dos badges
CREATE TABLE badges (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  name            VARCHAR(100) NOT NULL,
  description     TEXT         NOT NULL,
  icon_url        VARCHAR(500) NULL,
  color_hex       VARCHAR(7)   NULL,
  category        VARCHAR(50)  NULL,
  criteria_type   VARCHAR(50)  NOT NULL,
  criteria_value  JSON         NOT NULL,           -- ex: {"quizzes_completed": 5}
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_badges_name (name),
  CONSTRAINT chk_badges_category
    CHECK (category IN ('quiz','content','community','special') OR category IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Badges conquistados pelos utilizadores
CREATE TABLE user_badges (
  id              CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)  NOT NULL,
  badge_id        CHAR(36)  NOT NULL,
  earned_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reference_id    CHAR(36)  NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_badges (user_id, badge_id),
  CONSTRAINT fk_user_badges_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge
    FOREIGN KEY (badge_id) REFERENCES badges(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 3: CONTROLO DE ACESSO
-- ================================================================

-- Níveis de acesso disponíveis na plataforma
CREATE TABLE access_levels (
  id                VARCHAR(20)  NOT NULL,
  name              VARCHAR(100) NOT NULL,
  description       TEXT         NULL,
  icon              VARCHAR(10)  NULL,             -- emoji: 🔥, 🔒
  color_bg          VARCHAR(7)   NULL,
  color_text        VARCHAR(7)   NULL,
  requires_approval TINYINT(1)   NOT NULL DEFAULT 0,
  auto_grant        TINYINT(1)   NOT NULL DEFAULT 0,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção dos níveis padrão
INSERT INTO access_levels VALUES
  ('public',     'Público',  'Acesso automático ao solicitar', NULL,  NULL,       NULL,       0, 1),
  ('jindungo',   'Jindungo', 'Conteúdo premium/privado',       '🔥', '#ffd6a5',  '#4a2c00',  0, 0),
  ('restricted', 'Restrito', 'Requer validação manual',        '🔒', '#ffb3ba',  '#5c0011',  1, 0);

-- Pedidos de acesso dos utilizadores
CREATE TABLE user_access_requests (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  access_level_id VARCHAR(20)  NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'pending',
  justification   TEXT         NULL,
  reviewed_by     CHAR(36)     NULL,
  reviewed_at     DATETIME     NULL,
  review_notes    TEXT         NULL,
  expires_at      DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_access_req_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_access_req_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
  CONSTRAINT fk_access_req_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
  CONSTRAINT chk_access_req_status
    CHECK (status IN ('pending','approved','rejected','revoked'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Acessos concedidos
-- NOTA: BOOLEAN GENERATED ALWAYS AS ... STORED com NOW()
--   → Coluna calculada MySQL. Porém, MySQL não permite NOW() em
--     colunas geradas (funções não-deterministas são proibidas).
--   SOLUÇÃO: is_active é uma coluna normal TINYINT(1) actualizada
--     por triggers BEFORE INSERT e BEFORE UPDATE.
CREATE TABLE user_access_grants (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  access_level_id VARCHAR(20)  NOT NULL,
  granted_by      CHAR(36)     NULL,
  request_id      CHAR(36)     NULL,
  granted_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME     NULL,
  revoked_at      DATETIME     NULL,
  -- Calculado por trigger (não pode usar NOW() em coluna gerada no MySQL)
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  UNIQUE KEY uq_access_grants (user_id, access_level_id),
  CONSTRAINT fk_access_grants_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_access_grants_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
  CONSTRAINT fk_access_grants_grantor
    FOREIGN KEY (granted_by) REFERENCES users(id),
  CONSTRAINT fk_access_grants_request
    FOREIGN KEY (request_id) REFERENCES user_access_requests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger que recalcula is_active ao inserir
DELIMITER $$
CREATE TRIGGER trg_access_grants_before_insert
BEFORE INSERT ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR
     (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW())
  THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END$$

-- Trigger que recalcula is_active ao actualizar
CREATE TRIGGER trg_access_grants_before_update
BEFORE UPDATE ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR
     (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW())
  THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END$$
DELIMITER ;


-- ================================================================
-- MÓDULO 4: DOCUMENTOS / ARQUIVO
-- ================================================================

-- Categorias temáticas dos documentos (suporte a subcategorias)
CREATE TABLE document_categories (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug        VARCHAR(100) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  color_bg    VARCHAR(7)   NULL,
  color_text  VARCHAR(7)   NULL,
  icon        VARCHAR(10)  NULL,
  parent_id   CHAR(36)     NULL,                  -- subcategorias
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_categories_slug (slug),
  CONSTRAINT fk_doc_categories_parent
    FOREIGN KEY (parent_id) REFERENCES document_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela principal de documentos
CREATE TABLE documents (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  title             VARCHAR(500) NOT NULL,
  slug              VARCHAR(500) NULL,
  author            VARCHAR(255) NOT NULL,
  institution       VARCHAR(255) NULL,
  category_id       CHAR(36)     NULL,
  document_type     VARCHAR(20)  NOT NULL,
  academic_level    VARCHAR(20)  NOT NULL DEFAULT 'intro',
  access_level_id   VARCHAR(20)  NOT NULL DEFAULT 'public',
  publication_date  DATE         NULL,
  period_start      INT          NULL,
  period_end        INT          NULL,
  summary           TEXT         NOT NULL,
  content           LONGTEXT     NULL,             -- Markdown (TEXT = 64KB, LONGTEXT = 4GB)
  cover_image_url   VARCHAR(500) NULL,
  pdf_url           VARCHAR(500) NULL,
  unique_id         VARCHAR(50)  NULL,
  physical_location VARCHAR(255) NULL,
  record_type       VARCHAR(100) NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_by        CHAR(36)     NOT NULL,
  reviewed_by       CHAR(36)     NULL,
  published_at      DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  views_count       INT          NOT NULL DEFAULT 0,
  likes_count       INT          NOT NULL DEFAULT 0,
  downloads_count   INT          NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_documents_slug (slug),
  CONSTRAINT fk_documents_category
    FOREIGN KEY (category_id) REFERENCES document_categories(id),
  CONSTRAINT fk_documents_access_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
  CONSTRAINT fk_documents_created_by
    FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_documents_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
  CONSTRAINT chk_documents_type
    CHECK (document_type IN ('manuscript','article','report','thesis','archive')),
  CONSTRAINT chk_documents_level
    CHECK (academic_level IN ('intro','advanced','doctorate')),
  CONSTRAINT chk_documents_status
    CHECK (status IN ('draft','published','archived','flagged')),

  -- Índice FULLTEXT para pesquisa (equivale ao GIN/tsvector do PostgreSQL)
  FULLTEXT KEY ft_documents_search (title, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags dos documentos
CREATE TABLE tags (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_name (name),
  UNIQUE KEY uq_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_tags (
  document_id CHAR(36) NOT NULL,
  tag_id      CHAR(36) NOT NULL,

  PRIMARY KEY (document_id, tag_id),
  CONSTRAINT fk_doc_tags_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interacções com documentos
CREATE TABLE document_likes (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  document_id CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_likes (document_id, user_id),
  CONSTRAINT fk_doc_likes_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_downloads (
  id          CHAR(36)    NOT NULL DEFAULT (UUID()),
  document_id CHAR(36)    NOT NULL,
  user_id     CHAR(36)    NOT NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_doc_downloads_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_downloads_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_views (
  id          CHAR(36)    NOT NULL DEFAULT (UUID()),
  document_id CHAR(36)    NOT NULL,
  user_id     CHAR(36)    NULL,                    -- NULL = utilizador anónimo
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_doc_views_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_views_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favoritos / Guardados
CREATE TABLE user_favorites (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)  NOT NULL,
  document_id CHAR(36)  NOT NULL,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_favorites (user_id, document_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Citações geradas pelos utilizadores
CREATE TABLE document_citations (
  id              CHAR(36)    NOT NULL DEFAULT (UUID()),
  document_id     CHAR(36)    NOT NULL,
  user_id         CHAR(36)    NOT NULL,
  citation_format VARCHAR(20) NOT NULL DEFAULT 'apa',
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_citations_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_citations_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_citations_format
    CHECK (citation_format IN ('apa','mla','chicago','abnt'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 5: QUIZZES
-- ================================================================

-- Quizzes disponíveis
-- NOTA: avg_score NUMERIC(5,2) → DECIMAL(5,2)
CREATE TABLE quizzes (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  title             VARCHAR(255)  NOT NULL,
  module            VARCHAR(255)  NULL,
  description       TEXT          NULL,
  cover_image_url   VARCHAR(500)  NULL,
  difficulty        VARCHAR(20)   NOT NULL DEFAULT 'Básico',
  base_points       INT           NOT NULL DEFAULT 100,
  time_limit_secs   INT           NULL,
  access_level_id   VARCHAR(20)   NOT NULL DEFAULT 'public',
  is_featured       TINYINT(1)    NOT NULL DEFAULT 0,
  status            VARCHAR(20)   NOT NULL DEFAULT 'published',
  category_id       CHAR(36)      NULL,
  created_by        CHAR(36)      NOT NULL,
  published_at      DATETIME      NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  attempts_count    INT           NOT NULL DEFAULT 0,
  completions_count INT           NOT NULL DEFAULT 0,
  avg_score         DECIMAL(5,2)  NOT NULL DEFAULT 0.00,

  PRIMARY KEY (id),
  CONSTRAINT fk_quizzes_access_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
  CONSTRAINT fk_quizzes_category
    FOREIGN KEY (category_id) REFERENCES document_categories(id),
  CONSTRAINT fk_quizzes_created_by
    FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT chk_quizzes_difficulty
    CHECK (difficulty IN ('Básico','Intermédio','Avançado')),
  CONSTRAINT chk_quizzes_status
    CHECK (status IN ('draft','published','archived'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Perguntas dos quizzes
CREATE TABLE quiz_questions (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  quiz_id         CHAR(36)     NOT NULL,
  question_order  INT          NOT NULL,
  title           TEXT         NOT NULL,
  subtitle        TEXT         NULL,
  module_label    VARCHAR(255) NULL,
  question_type   VARCHAR(20)  NOT NULL DEFAULT 'multiple_choice',
  points          INT          NOT NULL DEFAULT 10,
  hint_title      VARCHAR(255) NULL,
  hint_quote      TEXT         NULL,
  expert_name     VARCHAR(255) NULL,
  expert_role     VARCHAR(255) NULL,
  reading_title   VARCHAR(255) NULL,
  reading_text    TEXT         NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_quiz_questions_order (quiz_id, question_order),
  CONSTRAINT fk_quiz_questions_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  CONSTRAINT chk_quiz_questions_type
    CHECK (question_type IN ('multiple_choice','true_false','open'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opções de resposta
-- NOTA: CHAR(1) com CHECK em MySQL 8.0+ funciona normalmente.
CREATE TABLE quiz_options (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  question_id CHAR(36)  NOT NULL,
  option_key  CHAR(1)   NOT NULL,
  text        TEXT      NOT NULL,
  is_correct  TINYINT(1) NOT NULL DEFAULT 0,
  explanation TEXT      NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_quiz_options (question_id, option_key),
  CONSTRAINT fk_quiz_options_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  CONSTRAINT chk_quiz_options_key
    CHECK (option_key IN ('A','B','C','D','E'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tentativas de quiz
CREATE TABLE quiz_attempts (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  quiz_id            CHAR(36)     NOT NULL,
  user_id            CHAR(36)     NOT NULL,
  status             VARCHAR(20)  NOT NULL DEFAULT 'in_progress',
  score              INT          NULL,
  correct_answers    INT          NULL,
  total_questions    INT          NULL,
  time_spent_secs    INT          NULL,
  points_earned      INT          NOT NULL DEFAULT 0,
  bonus_points       INT          NOT NULL DEFAULT 0,
  performance_rating VARCHAR(30)  NULL,
  started_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at       DATETIME     NULL,

  PRIMARY KEY (id),
  CONSTRAINT fk_quiz_attempts_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  CONSTRAINT fk_quiz_attempts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_quiz_attempts_status
    CHECK (status IN ('in_progress','completed','abandoned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respostas individuais por tentativa
CREATE TABLE quiz_attempt_answers (
  id                 CHAR(36)   NOT NULL DEFAULT (UUID()),
  attempt_id         CHAR(36)   NOT NULL,
  question_id        CHAR(36)   NOT NULL,
  selected_option_id CHAR(36)   NULL,
  is_correct         TINYINT(1) NULL,
  time_spent_secs    INT        NULL,
  answered_at        DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_attempt_answers (attempt_id, question_id),
  CONSTRAINT fk_attempt_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_answers_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
  CONSTRAINT fk_attempt_answers_option
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 6: COMUNIDADE / FÓRUM
-- ================================================================

-- Categorias da comunidade
CREATE TABLE community_categories (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug            VARCHAR(100) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT         NULL,
  access_level_id VARCHAR(20)  NOT NULL DEFAULT 'public',
  color_bg        VARCHAR(7)   NULL,
  color_text      VARCHAR(7)   NULL,
  cover_image_url VARCHAR(500) NULL,
  sort_order      INT          NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  members_count   INT          NOT NULL DEFAULT 0,
  topics_count    INT          NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_community_categories_slug (slug),
  CONSTRAINT fk_community_categories_access
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tópicos de discussão
CREATE TABLE discussion_topics (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  category_id     CHAR(36)     NOT NULL,
  author_id       CHAR(36)     NOT NULL,
  title           VARCHAR(500) NOT NULL,
  content         LONGTEXT     NOT NULL,           -- Markdown
  status          VARCHAR(20)  NOT NULL DEFAULT 'open',
  is_pinned       TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_reply_at   DATETIME     NULL,
  replies_count   INT          NOT NULL DEFAULT 0,
  views_count     INT          NOT NULL DEFAULT 0,
  likes_count     INT          NOT NULL DEFAULT 0,
  followers_count INT          NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  CONSTRAINT fk_disc_topics_category
    FOREIGN KEY (category_id) REFERENCES community_categories(id),
  CONSTRAINT fk_disc_topics_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_disc_topics_status
    CHECK (status IN ('open','closed','archived','flagged'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Respostas aos tópicos (suporte a respostas aninhadas)
CREATE TABLE topic_replies (
  id              CHAR(36)   NOT NULL DEFAULT (UUID()),
  topic_id        CHAR(36)   NOT NULL,
  author_id       CHAR(36)   NOT NULL,
  parent_reply_id CHAR(36)   NULL,                 -- self-reference para respostas aninhadas
  content         LONGTEXT   NOT NULL,
  is_accepted     TINYINT(1) NOT NULL DEFAULT 0,
  is_flagged      TINYINT(1) NOT NULL DEFAULT 0,
  created_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  likes_count     INT        NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  CONSTRAINT fk_topic_replies_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_replies_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_replies_parent
    FOREIGN KEY (parent_reply_id) REFERENCES topic_replies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Likes nos tópicos
CREATE TABLE topic_likes (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  topic_id   CHAR(36)  NOT NULL,
  user_id    CHAR(36)  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_topic_likes (topic_id, user_id),
  CONSTRAINT fk_topic_likes_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Likes nas respostas
CREATE TABLE reply_likes (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  reply_id   CHAR(36)  NOT NULL,
  user_id    CHAR(36)  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_reply_likes (reply_id, user_id),
  CONSTRAINT fk_reply_likes_reply
    FOREIGN KEY (reply_id) REFERENCES topic_replies(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seguidores de tópicos (para notificações)
CREATE TABLE topic_followers (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  topic_id   CHAR(36)  NOT NULL,
  user_id    CHAR(36)  NOT NULL,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_topic_followers (topic_id, user_id),
  CONSTRAINT fk_topic_followers_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_followers_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membros de categorias restritas
CREATE TABLE category_members (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  category_id CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  joined_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_category_members (category_id, user_id),
  CONSTRAINT fk_category_members_category
    FOREIGN KEY (category_id) REFERENCES community_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_category_members_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 7: LEADERBOARD / RANKINGS
-- ================================================================

-- Snapshots diários do leaderboard
-- NOTA: NUMERIC(5,2) → DECIMAL(5,2)
CREATE TABLE leaderboard_snapshots (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)     NOT NULL,
  snapshot_date     DATE         NOT NULL,
  scope             VARCHAR(20)  NOT NULL DEFAULT 'nacional',
  province          VARCHAR(50)  NULL,
  rank_position     INT          NOT NULL,
  total_points      INT          NOT NULL,
  quizzes_completed INT          NOT NULL,
  accuracy_pct      DECIMAL(5,2) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_leaderboard_snapshots (user_id, snapshot_date, scope, province),
  CONSTRAINT fk_leaderboard_snapshots_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_leaderboard_scope
    CHECK (scope IN ('nacional','provincial'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaderboard nacional em cache
-- NOTA: MATERIALIZED VIEW não existe no MySQL.
--   Solução: tabela física actualizada por EVENT agendado (ver abaixo).
CREATE TABLE leaderboard_nacional_cache (
  rank_position   INT          NOT NULL,
  user_id         CHAR(36)     NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  province        VARCHAR(50)  NULL,
  avatar_url      VARCHAR(500) NULL,
  total_points    INT          NOT NULL DEFAULT 0,
  quizzes_completed INT        NOT NULL DEFAULT 0,
  weekly_points   INT          NOT NULL DEFAULT 0,
  current_level   INT          NOT NULL DEFAULT 1,
  prev_rank       INT          NOT NULL DEFAULT 0,  -- posição do dia anterior
  refreshed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  KEY idx_leaderboard_cache_rank (rank_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procedure que reconstrói o cache do leaderboard
DELIMITER $$
CREATE PROCEDURE sp_refresh_leaderboard_nacional()
BEGIN
  TRUNCATE TABLE leaderboard_nacional_cache;

  INSERT INTO leaderboard_nacional_cache (
    rank_position, user_id, display_name, province,
    avatar_url, total_points, quizzes_completed,
    weekly_points, current_level, prev_rank, refreshed_at
  )
  SELECT
    @rank := @rank + 1                        AS rank_position,
    u.id                                      AS user_id,
    up.display_name,
    up.province,
    up.avatar_url,
    ul.total_points,
    ul.quizzes_completed,
    ul.weekly_points,
    ul.current_level,
    COALESCE((
      SELECT ls.rank_position
      FROM leaderboard_snapshots ls
      WHERE ls.user_id = u.id
        AND ls.scope   = 'nacional'
        AND ls.snapshot_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      LIMIT 1
    ), 0)                                     AS prev_rank,
    NOW()                                     AS refreshed_at
  FROM
    users u
    JOIN user_profiles up ON up.user_id = u.id
    JOIN user_levels   ul ON ul.user_id = u.id,
    (SELECT @rank := 0) AS r
  WHERE u.is_active = 1
  ORDER BY ul.total_points DESC, ul.quizzes_completed DESC;
END$$
DELIMITER ;

-- EVENT que actualiza o cache de hora em hora
-- (Requer SET GLOBAL event_scheduler = ON no servidor)
CREATE EVENT IF NOT EXISTS evt_refresh_leaderboard
  ON SCHEDULE EVERY 1 HOUR
  DO CALL sp_refresh_leaderboard_nacional();

-- Vista de estatísticas por província
-- NOTA: AVG()::INT e AVG()::NUMERIC → CAST(AVG(...) AS UNSIGNED)
CREATE VIEW province_stats AS
SELECT
  up.province,
  COUNT(u.id)                              AS total_users,
  SUM(ul.total_points)                     AS total_points,
  CAST(AVG(ul.total_points) AS UNSIGNED)   AS avg_points,
  MAX(ul.total_points)                     AS max_points,
  SUM(ul.quizzes_completed)                AS total_quizzes,
  CAST(AVG(ul.current_level) AS DECIMAL(3,2)) AS avg_level
FROM users u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels   ul ON ul.user_id = u.id
WHERE u.is_active = 1
  AND up.province IS NOT NULL
GROUP BY up.province;


-- ================================================================
-- MÓDULO 8: NOTIFICAÇÕES
-- ================================================================

CREATE TABLE notifications (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id        CHAR(36)     NOT NULL,
  type           VARCHAR(50)  NOT NULL,
  title          VARCHAR(255) NOT NULL,
  message        TEXT         NULL,
  reference_id   CHAR(36)     NULL,
  reference_type VARCHAR(50)  NULL,
  is_read        TINYINT(1)   NOT NULL DEFAULT 0,
  read_at        DATETIME     NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_notifications_type
    CHECK (type IN (
      'quiz_completed','badge_earned','level_up',
      'topic_reply','topic_like','reply_like',
      'access_granted','access_rejected',
      'document_liked','document_downloaded',
      'mention','system_announcement'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- MÓDULO 9: MODERAÇÃO
-- ================================================================

CREATE TABLE content_reports (
  id           CHAR(36)    NOT NULL DEFAULT (UUID()),
  reporter_id  CHAR(36)    NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content_id   CHAR(36)    NOT NULL,
  reason       VARCHAR(50) NOT NULL,
  description  TEXT        NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by  CHAR(36)    NULL,
  reviewed_at  DATETIME    NULL,
  action_taken TEXT        NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users(id),
  CONSTRAINT fk_reports_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
  CONSTRAINT chk_reports_content_type
    CHECK (content_type IN ('document','topic','reply','user')),
  CONSTRAINT chk_reports_reason
    CHECK (reason IN (
      'spam','inappropriate','misinformation',
      'copyright','off_topic','other'
    )),
  CONSTRAINT chk_reports_status
    CHECK (status IN ('pending','reviewed','dismissed','actioned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- ÍNDICES DE PERFORMANCE
-- ================================================================

-- Utilizadores
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_profiles_province  ON user_profiles(province);

-- Documentos
CREATE INDEX idx_documents_status        ON documents(status);
CREATE INDEX idx_documents_access_level  ON documents(access_level_id);
CREATE INDEX idx_documents_category      ON documents(category_id);
CREATE INDEX idx_documents_academic_level ON documents(academic_level);
CREATE INDEX idx_documents_created_by    ON documents(created_by);
CREATE INDEX idx_documents_published_at  ON documents(published_at DESC);
-- FULLTEXT já criado na definição da tabela (ft_documents_search)

-- Quizzes
CREATE INDEX idx_quizzes_difficulty   ON quizzes(difficulty);
CREATE INDEX idx_quizzes_status       ON quizzes(status);
CREATE INDEX idx_quiz_attempts_user   ON quiz_attempts(user_id, completed_at DESC);
CREATE INDEX idx_quiz_attempts_quiz   ON quiz_attempts(quiz_id, status);

-- Comunidade
CREATE INDEX idx_topics_category      ON discussion_topics(category_id);
CREATE INDEX idx_topics_author        ON discussion_topics(author_id);
CREATE INDEX idx_topics_pinned        ON discussion_topics(is_pinned, created_at DESC);
CREATE INDEX idx_topics_recent        ON discussion_topics(last_reply_at DESC);
CREATE INDEX idx_replies_topic        ON topic_replies(topic_id, created_at ASC);

-- Leaderboard
CREATE INDEX idx_user_levels_points   ON user_levels(total_points DESC);
CREATE INDEX idx_user_levels_weekly   ON user_levels(weekly_points DESC);
CREATE INDEX idx_snapshots_date       ON leaderboard_snapshots(snapshot_date DESC, scope);

-- Notificações
-- NOTA: PostgreSQL usava índice parcial (WHERE is_read = FALSE).
--   MySQL não suporta índices parciais.
--   Alternativa: índice composto normal (o optimizador filtra is_read=0 eficientemente).
CREATE INDEX idx_notifications_user   ON notifications(user_id, is_read, created_at DESC);


-- ================================================================
-- REACTIVAR VERIFICAÇÃO DE FKs
-- ================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- FIM DO SCRIPT
-- Economia com História – Angola · MySQL 8.0+
-- ================================================================
