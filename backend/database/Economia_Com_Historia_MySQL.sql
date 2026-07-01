-- ================================================================
-- ECONOMIA COM HISTÓRIA – ANGOLA
-- Base de Dados MySQL 8.0+
-- Gerado a partir do estado ATUAL das migrations Laravel
-- (backend/database/migrations/*.php, até 2026_06_30_000001)
--
-- Este ficheiro substitui a versão anterior (conceptual/PostgreSQL),
-- que estava desatualizada e não refletia o schema real (usava
-- password_hash/UUID de forma inconsistente e faltavam tabelas como
-- document_subscriptions, quiz_documents, discussion_topic_members,
-- badges, user_badges, is_pinned, media_type/media_url, etc.).
--
-- Convenções observadas no código real:
--  - Quase todas as PKs são CHAR(36) com DEFAULT (UUID()) (Laravel uuid()).
--  - Exceções: access_levels.id (VARCHAR(20)), level_definitions.level
--    (INTEGER), leaderboard_nacional_cache (PK = user_id), quiz_documents
--    (PK composta quiz_id+document_id, ambos VARCHAR(255) — ver nota
--    de inconsistência junto à tabela).
--  - Enums não têm CHECK constraints na BD: são validados apenas na
--    camada aplicacional (Laravel Form Requests / Enums PHP). Os
--    valores válidos estão documentados em comentário junto de cada
--    coluna para referência.
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

CREATE TABLE users (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  email_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  role            VARCHAR(20)  NOT NULL DEFAULT 'estudante', -- valores válidos (app-level): estudante | investigador | professor | admin
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at   DATETIME     NULL,

  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  KEY idx_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_profiles (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  full_name       VARCHAR(255) NULL,
  institution     VARCHAR(255) NULL,
  province        VARCHAR(50)  NULL, -- uma das 18 províncias de Angola (não validado por CHECK/FK — apenas em texto livre)
  avatar_url      VARCHAR(500) NULL,
  bio             TEXT         NULL,
  website_url     VARCHAR(500) NULL,
  research_areas  JSON         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY user_profiles_user_id_unique (user_id),
  KEY idx_profiles_province (province),
  CONSTRAINT fk_user_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_sessions (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  refresh_token   VARCHAR(500) NOT NULL,
  ip_address      VARCHAR(45)  NULL,
  user_agent      TEXT         NULL,
  expires_at      DATETIME     NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY user_sessions_refresh_token_unique (refresh_token),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE verification_tokens (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  token           VARCHAR(255) NOT NULL,
  type            VARCHAR(30)  NOT NULL, -- email_verification | password_reset (uso observado na app)
  expires_at      DATETIME     NOT NULL,
  used_at         DATETIME     NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY verification_tokens_token_unique (token),
  CONSTRAINT fk_verification_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 2: ACESSO & GAMIFICAÇÃO
-- ================================================================

CREATE TABLE access_levels (
  id                 VARCHAR(20)  NOT NULL,
  name               VARCHAR(100) NOT NULL,
  description        TEXT         NULL,
  icon               VARCHAR(10)  NULL,
  color_bg           VARCHAR(7)   NULL,
  color_text         VARCHAR(7)   NULL,
  requires_approval  TINYINT(1)   NOT NULL DEFAULT 0,
  auto_grant         TINYINT(1)   NOT NULL DEFAULT 0,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO access_levels (id, name, description, icon, color_bg, color_text, requires_approval, auto_grant) VALUES
  ('public',     'Público',   'Acesso automático ao solicitar', NULL,  NULL,      NULL,      0, 1),
  ('jindungo',   'Jindungo',  'Conteúdo premium/privado',       '🔥',  '#ffd6a5', '#4a2c00', 0, 0),
  ('restricted', 'Restrito',  'Requer validação manual',        '🔒',  '#ffb3ba', '#5c0011', 1, 0);

CREATE TABLE user_access_requests (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)     NOT NULL,
  access_level_id   VARCHAR(20)  NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  justification     TEXT         NULL,
  reviewed_by       CHAR(36)     NULL,
  reviewed_at       DATETIME     NULL,
  review_notes      TEXT         NULL,
  expires_at        DATETIME     NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_access_requests_user_level (user_id, access_level_id),
  CONSTRAINT fk_access_requests_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_access_requests_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users (id),
  CONSTRAINT fk_access_requests_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_access_grants (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)     NOT NULL,
  access_level_id   VARCHAR(20)  NOT NULL,
  granted_by        CHAR(36)     NULL,
  request_id        CHAR(36)     NULL,
  granted_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at        DATETIME     NULL,
  revoked_at        DATETIME     NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1, -- GERIDO PELOS TRIGGERS abaixo; a aplicação não deve escrever este campo diretamente

  PRIMARY KEY (id),
  UNIQUE KEY uq_access_grants (user_id, access_level_id),
  CONSTRAINT fk_access_grants_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_access_grants_granted_by
    FOREIGN KEY (granted_by) REFERENCES users (id),
  CONSTRAINT fk_access_grants_request
    FOREIGN KEY (request_id) REFERENCES user_access_requests (id),
  CONSTRAINT fk_access_grants_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER trg_access_grants_before_insert
BEFORE INSERT ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW()) THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END$$

CREATE TRIGGER trg_access_grants_before_update
BEFORE UPDATE ON user_access_grants
FOR EACH ROW
BEGIN
  IF NEW.revoked_at IS NOT NULL OR (NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW()) THEN
    SET NEW.is_active = 0;
  ELSE
    SET NEW.is_active = 1;
  END IF;
END$$
DELIMITER ;

CREATE TABLE level_definitions (
  level        INT          NOT NULL,
  name         VARCHAR(100) NOT NULL,
  min_points   INT          NOT NULL DEFAULT 0,
  max_points   INT          NULL,
  color_hex    VARCHAR(7)   NULL,
  icon_url     VARCHAR(500) NULL,
  perks        JSON         NULL,

  PRIMARY KEY (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY user_levels_user_id_unique (user_id),
  KEY idx_user_levels_points (total_points DESC),
  KEY idx_user_levels_weekly (weekly_points DESC),
  CONSTRAINT fk_user_levels_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_levels_level
    FOREIGN KEY (current_level) REFERENCES level_definitions (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE point_transactions (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  points          INT          NOT NULL,
  reason          VARCHAR(50)  NOT NULL,
  reference_id    CHAR(36)     NULL, -- referência polimórfica manual (sem FK); ver reference_type
  reference_type  VARCHAR(50)  NULL,
  description     TEXT         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_point_transactions_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE badges (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  name            VARCHAR(100) NOT NULL,
  description     TEXT         NOT NULL,
  icon_url        VARCHAR(500) NULL,
  color_hex       VARCHAR(7)   NULL,
  category        VARCHAR(50)  NULL,
  criteria_type   VARCHAR(50)  NOT NULL,
  criteria_value  JSON         NOT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY badges_name_unique (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_badges (
  id              CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)  NOT NULL,
  badge_id        CHAR(36)  NOT NULL,
  earned_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reference_id    CHAR(36)  NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_badges (user_id, badge_id),
  CONSTRAINT fk_user_badges_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge
    FOREIGN KEY (badge_id) REFERENCES badges (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 3: DOCUMENTOS
-- ================================================================

CREATE TABLE document_categories (
  id                      CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug                    VARCHAR(100) NOT NULL,
  name                    VARCHAR(255) NOT NULL,
  description             TEXT         NULL,
  color_bg                VARCHAR(7)   NULL,
  color_text              VARCHAR(7)   NULL,
  icon                    VARCHAR(10)  NULL,
  parent_id               CHAR(36)     NULL,
  sort_order              INT          NOT NULL DEFAULT 0,
  created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  requires_subscription   TINYINT(1)   NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY document_categories_slug_unique (slug),
  CONSTRAINT fk_document_categories_parent
    FOREIGN KEY (parent_id) REFERENCES document_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  title               VARCHAR(500) NOT NULL,
  slug                VARCHAR(500) NULL,
  author              VARCHAR(255) NOT NULL,
  institution         VARCHAR(255) NULL,
  category_id         CHAR(36)     NULL,
  document_type       VARCHAR(20)  NOT NULL,
  academic_level      VARCHAR(20)  NOT NULL DEFAULT 'intro',
  access_level_id     VARCHAR(20)  NOT NULL DEFAULT 'public',
  publication_date    DATE         NULL,
  period_start        INT          NULL,
  period_end          INT          NULL,
  summary             TEXT         NOT NULL,
  content             LONGTEXT     NULL,
  cover_image_url     VARCHAR(500) NULL,
  pdf_url             VARCHAR(500) NULL, -- mantido por compatibilidade; ver media_url
  media_type          VARCHAR(20)  NULL, -- contrato oficial (Sprint 14.3): TEXT | IMAGE | VIDEO | AUDIO | PDF
  media_url           VARCHAR(500) NULL, -- substitui semanticamente pdf_url a partir da Sprint 14.3
  unique_id           VARCHAR(50)  NULL,
  physical_location   VARCHAR(255) NULL,
  record_type         VARCHAR(100) NULL,
  status              VARCHAR(20)  NOT NULL DEFAULT 'draft', -- draft | published | archived (App\Enums\DocumentStatus)
  created_by          CHAR(36)     NOT NULL,
  reviewed_by         CHAR(36)     NULL,
  published_at        DATETIME     NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  views_count         INT          NOT NULL DEFAULT 0,
  likes_count         INT          NOT NULL DEFAULT 0,
  downloads_count     INT          NOT NULL DEFAULT 0,
  is_pinned           TINYINT(1)   NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY documents_slug_unique (slug),
  KEY idx_documents_status (status),
  KEY idx_documents_access_level (access_level_id),
  KEY idx_documents_category (category_id),
  KEY idx_documents_academic_level (academic_level),
  KEY idx_documents_created_by (created_by),
  KEY idx_documents_published_at (published_at),
  KEY idx_documents_pinned (is_pinned),
  KEY idx_documents_media_type (media_type),
  FULLTEXT KEY ft_documents_search (title, summary),
  CONSTRAINT fk_documents_category
    FOREIGN KEY (category_id) REFERENCES document_categories (id),
  CONSTRAINT fk_documents_access_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels (id),
  CONSTRAINT fk_documents_created_by
    FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT fk_documents_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY tags_name_unique (name),
  UNIQUE KEY tags_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_tags (
  document_id   CHAR(36)  NOT NULL,
  tag_id        CHAR(36)  NOT NULL,

  PRIMARY KEY (document_id, tag_id),
  CONSTRAINT fk_document_tags_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_likes (
  id            CHAR(36)   NOT NULL DEFAULT (UUID()),
  document_id   CHAR(36)   NOT NULL,
  user_id       CHAR(36)   NOT NULL,
  created_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_likes (document_id, user_id),
  CONSTRAINT fk_document_likes_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_likes_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_downloads (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  document_id   CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_document_downloads_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_downloads_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_views (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  document_id   CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_document_views_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_views_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_favorites (
  id            CHAR(36)   NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)   NOT NULL,
  document_id   CHAR(36)   NOT NULL,
  created_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_favorites (user_id, document_id),
  CONSTRAINT fk_user_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_favorites_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_citations (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  document_id        CHAR(36)     NOT NULL,
  user_id            CHAR(36)     NOT NULL,
  citation_format    VARCHAR(20)  NOT NULL DEFAULT 'apa', -- apa | mla | abnt | chicago
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_document_citations_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_citations_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- document_subscriptions — fluxo de aprovação de acesso a documentos/categorias
-- que exigem subscrição (document_categories.requires_subscription = 1).
-- NOTA: a coluna `expires_at` chegou a existir (Sprint 15.2) mas foi removida:
-- subscrições temporárias/expiráveis não fazem parte do MVP.
CREATE TABLE document_subscriptions (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)     NOT NULL,
  document_id   CHAR(36)     NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | ACTIVE | REJECTED | CANCELLED (App\Enums\SubscriptionStatus)
  approved_by   CHAR(36)     NULL,
  rejected_by   CHAR(36)     NULL,
  cancelled_by  CHAR(36)     NULL,
  started_at    DATETIME     NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_doc_subs_status (status),
  KEY idx_doc_subs_user_doc (user_id, document_id),
  CONSTRAINT fk_doc_subs_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_subs_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_subs_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_doc_subs_rejected_by
    FOREIGN KEY (rejected_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_doc_subs_cancelled_by
    FOREIGN KEY (cancelled_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 4: QUIZZES
-- ================================================================

CREATE TABLE quizzes (
  id                   CHAR(36)      NOT NULL DEFAULT (UUID()),
  title                VARCHAR(255)  NOT NULL,
  module               VARCHAR(255)  NULL,
  description          TEXT          NULL,
  cover_image_url      VARCHAR(500)  NULL,
  difficulty           VARCHAR(20)   NOT NULL DEFAULT 'Básico',
  base_points          INT           NOT NULL DEFAULT 100,
  time_limit_secs      INT           NULL,
  access_level_id      VARCHAR(20)   NOT NULL DEFAULT 'public',
  is_featured          TINYINT(1)    NOT NULL DEFAULT 0,
  status               VARCHAR(20)   NOT NULL DEFAULT 'published',
  category_id          CHAR(36)      NULL,
  created_by           CHAR(36)      NOT NULL,
  published_at         DATETIME      NULL,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  attempts_count       INT           NOT NULL DEFAULT 0,
  completions_count    INT           NOT NULL DEFAULT 0,
  avg_score            DECIMAL(5,2)  NOT NULL DEFAULT 0.00,

  PRIMARY KEY (id),
  KEY idx_quizzes_difficulty (difficulty),
  KEY idx_quizzes_status (status),
  CONSTRAINT fk_quizzes_category
    FOREIGN KEY (category_id) REFERENCES document_categories (id),
  CONSTRAINT fk_quizzes_access_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels (id),
  CONSTRAINT fk_quizzes_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_questions (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  quiz_id          CHAR(36)     NOT NULL,
  question_order   INT          NOT NULL,
  title            TEXT         NOT NULL,
  subtitle         TEXT         NULL,
  module_label     VARCHAR(255) NULL,
  question_type    VARCHAR(20)  NOT NULL DEFAULT 'multiple_choice',
  points           INT          NOT NULL DEFAULT 10,
  hint_title       VARCHAR(255) NULL,
  hint_quote       TEXT         NULL,
  expert_name      VARCHAR(255) NULL,
  expert_role      VARCHAR(255) NULL,
  reading_title    VARCHAR(255) NULL,
  reading_text     TEXT         NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_quiz_questions_order (quiz_id, question_order),
  CONSTRAINT fk_quiz_questions_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_options (
  id             CHAR(36)   NOT NULL DEFAULT (UUID()),
  question_id    CHAR(36)   NOT NULL,
  option_key     CHAR(1)    NOT NULL,
  text           TEXT       NOT NULL,
  is_correct     TINYINT(1) NOT NULL DEFAULT 0,
  explanation    TEXT       NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_quiz_options (question_id, option_key),
  CONSTRAINT fk_quiz_options_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_attempts (
  id                    CHAR(36)     NOT NULL DEFAULT (UUID()),
  quiz_id               CHAR(36)     NOT NULL,
  user_id               CHAR(36)     NOT NULL,
  status                VARCHAR(20)  NOT NULL DEFAULT 'in_progress', -- in_progress | completed | abandoned
  score                 INT          NULL,
  correct_answers       INT          NULL,
  total_questions       INT          NULL,
  time_spent_secs       INT          NULL,
  points_earned         INT          NOT NULL DEFAULT 0,
  bonus_points          INT          NOT NULL DEFAULT 0,
  performance_rating    VARCHAR(30)  NULL,
  started_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at          DATETIME     NULL,

  PRIMARY KEY (id),
  KEY idx_quiz_attempts_user (user_id, completed_at),
  KEY idx_quiz_attempts_quiz (quiz_id, status),
  CONSTRAINT fk_quiz_attempts_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
  CONSTRAINT fk_quiz_attempts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_attempt_answers (
  id                   CHAR(36)   NOT NULL DEFAULT (UUID()),
  attempt_id           CHAR(36)   NOT NULL,
  question_id          CHAR(36)   NOT NULL,
  selected_option_id   CHAR(36)   NULL,
  is_correct           TINYINT(1) NULL,
  time_spent_secs      INT        NULL,
  answered_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_attempt_answers (attempt_id, question_id),
  CONSTRAINT fk_attempt_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_answers_question
    FOREIGN KEY (question_id) REFERENCES quiz_questions (id),
  CONSTRAINT fk_attempt_answers_option
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- quiz_documents — tabela pivot que liga quizzes a documentos relacionados.
-- ATENÇÃO (inconsistência conhecida, ver relatório de auditoria):
-- quiz_id/document_id foram criadas como VARCHAR(255) simples na migration
-- original (`$table->string(...)`), e não como uuid()/foreignUuid() como
-- em todas as outras FKs do schema. As FKs abaixo foram adicionadas numa
-- migration posterior (sprint17). Funciona em MySQL porque VARCHAR(255)
-- e CHAR(36) são tipos de string compatíveis, mas está fora do padrão
-- do resto do schema — recomenda-se alinhar para CHAR(36) numa migration futura.
CREATE TABLE quiz_documents (
  quiz_id       VARCHAR(255)        NOT NULL,
  document_id   VARCHAR(255)        NOT NULL,
  sort_order    SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP           NULL,
  updated_at    TIMESTAMP           NULL,

  PRIMARY KEY (quiz_id, document_id),
  CONSTRAINT fk_quiz_documents_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_documents_document
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 5: COMUNIDADE
-- ================================================================

-- community_categories.access_level_id é NULLABLE e IGNORADO na lógica
-- de autorização desde a Sprint 13 (ver comentário na migration
-- sprint13_rename_topic_visibility_values): categorias de organização não
-- podem ser responsáveis por autorização — isso é exclusividade de
-- discussion_topics.visibility. A coluna é mantida só por compatibilidade
-- histórica.
CREATE TABLE community_categories (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug              VARCHAR(100) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT         NULL,
  access_level_id   VARCHAR(20)  NULL,
  color_bg          VARCHAR(7)   NULL,
  color_text        VARCHAR(7)   NULL,
  cover_image_url   VARCHAR(500) NULL,
  sort_order        INT          NOT NULL DEFAULT 0,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  members_count     INT          NOT NULL DEFAULT 0,
  topics_count      INT          NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY community_categories_slug_unique (slug),
  CONSTRAINT fk_community_categories_access_level
    FOREIGN KEY (access_level_id) REFERENCES access_levels (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO community_categories
  (id, slug, name, description, access_level_id, color_bg, color_text, cover_image_url, sort_order, is_active, members_count, topics_count)
VALUES
  (UUID(), 'sala-privada', 'Sala Privada', 'Espaço de discussão restrito a membros seleccionados pelo autor.', 'restricted', '#FFB3BA', '#5C0011', NULL, 99, 1, 0, 0);

-- discussion_topics.visibility valores atuais (pós Sprint 13):
--   CATEGORY     (antigo 'RESTRICTED') — herda o contexto da categoria
--   INVITE_ONLY  (antigo 'PRIVATE')    — apenas membros convidados (discussion_topic_members)
CREATE TABLE discussion_topics (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  category_id      CHAR(36)     NOT NULL,
  author_id        CHAR(36)     NOT NULL,
  title            VARCHAR(500) NOT NULL,
  content          LONGTEXT     NOT NULL,
  visibility       VARCHAR(20)  NOT NULL DEFAULT 'CATEGORY', -- CATEGORY | INVITE_ONLY
  status           VARCHAR(20)  NOT NULL DEFAULT 'open',
  is_pinned        TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_reply_at    DATETIME     NULL,
  replies_count    INT          NOT NULL DEFAULT 0,
  views_count      INT          NOT NULL DEFAULT 0,
  likes_count      INT          NOT NULL DEFAULT 0,
  followers_count  INT          NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  KEY idx_topics_category (category_id),
  KEY idx_topics_author (author_id),
  KEY idx_topics_pinned (is_pinned, created_at),
  KEY idx_topics_recent (last_reply_at),
  KEY idx_topics_visibility (visibility),
  CONSTRAINT fk_discussion_topics_category
    FOREIGN KEY (category_id) REFERENCES community_categories (id),
  CONSTRAINT fk_discussion_topics_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE discussion_topic_members (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  topic_id      CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'member', -- member | moderator
  invited_by    CHAR(36)     NULL,
  accepted_at   TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_discussion_topic_members (topic_id, user_id),
  KEY idx_discussion_topic_members_topic_role (topic_id, role),
  KEY idx_discussion_topic_members_user (user_id),
  CONSTRAINT fk_discussion_topic_members_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_topic_members_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_discussion_topic_members_invited_by
    FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE topic_replies (
  id                 CHAR(36)   NOT NULL DEFAULT (UUID()),
  topic_id           CHAR(36)   NOT NULL,
  author_id          CHAR(36)   NOT NULL,
  parent_reply_id    CHAR(36)   NULL,
  content            LONGTEXT   NOT NULL,
  is_accepted        TINYINT(1) NOT NULL DEFAULT 0,
  is_flagged         TINYINT(1) NOT NULL DEFAULT 0,
  created_at         TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  likes_count        INT        NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  KEY idx_replies_topic (topic_id, created_at),
  CONSTRAINT fk_topic_replies_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_replies_author
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_replies_parent
    FOREIGN KEY (parent_reply_id) REFERENCES topic_replies (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE topic_likes (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  topic_id    CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_topic_likes (topic_id, user_id),
  CONSTRAINT fk_topic_likes_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_likes_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reply_likes (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  reply_id    CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_reply_likes (reply_id, user_id),
  CONSTRAINT fk_reply_likes_reply
    FOREIGN KEY (reply_id) REFERENCES topic_replies (id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_likes_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE topic_followers (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  topic_id    CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_topic_followers (topic_id, user_id),
  CONSTRAINT fk_topic_followers_topic
    FOREIGN KEY (topic_id) REFERENCES discussion_topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_topic_followers_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE category_members (
  id            CHAR(36)  NOT NULL DEFAULT (UUID()),
  category_id   CHAR(36)  NOT NULL,
  user_id       CHAR(36)  NOT NULL,
  joined_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_category_members (category_id, user_id),
  CONSTRAINT fk_category_members_category
    FOREIGN KEY (category_id) REFERENCES community_categories (id) ON DELETE CASCADE,
  CONSTRAINT fk_category_members_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 6: LEADERBOARD / ESTATÍSTICAS
-- ================================================================

CREATE TABLE leaderboard_snapshots (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id             CHAR(36)     NOT NULL,
  snapshot_date       DATE         NOT NULL,
  scope               VARCHAR(20)  NOT NULL DEFAULT 'nacional', -- nacional | provincial
  province            VARCHAR(50)  NULL,
  rank_position       INT          NOT NULL,
  total_points        INT          NOT NULL,
  quizzes_completed   INT          NOT NULL,
  accuracy_pct        DECIMAL(5,2) NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_leaderboard_snapshots (user_id, snapshot_date, scope, province),
  KEY idx_snapshots_date (snapshot_date, scope),
  CONSTRAINT fk_leaderboard_snapshots_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cache materializado do ranking nacional. PK é `user_id`
-- (não existe coluna `id`). Repopulada integralmente pela procedure
-- sp_refresh_leaderboard_nacional (TRUNCATE + INSERT).
CREATE TABLE leaderboard_nacional_cache (
  rank_position       INT          NOT NULL,
  user_id             CHAR(36)     NOT NULL,
  display_name        VARCHAR(100) NOT NULL,
  province            VARCHAR(50)  NULL,
  avatar_url          VARCHAR(500) NULL,
  total_points        INT          NOT NULL DEFAULT 0,
  quizzes_completed   INT          NOT NULL DEFAULT 0,
  weekly_points       INT          NOT NULL DEFAULT 0,
  current_level       INT          NOT NULL DEFAULT 1,
  prev_rank           INT          NOT NULL DEFAULT 0,
  refreshed_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  KEY idx_leaderboard_cache_rank (rank_position),
  CONSTRAINT fk_leaderboard_cache_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIEW: estatísticas agregadas por província (sem PK própria — é uma VIEW).
DROP VIEW IF EXISTS province_stats;
CREATE VIEW province_stats AS
SELECT
  up.province,
  COUNT(u.id) AS total_users,
  SUM(ul.total_points) AS total_points,
  CAST(AVG(ul.total_points) AS UNSIGNED) AS avg_points,
  MAX(ul.total_points) AS max_points,
  SUM(ul.quizzes_completed) AS total_quizzes,
  CAST(AVG(ul.current_level) AS DECIMAL(3,2)) AS avg_level
FROM users u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_levels ul ON ul.user_id = u.id
WHERE u.is_active = 1
  AND up.province IS NOT NULL
GROUP BY up.province;

-- PROCEDURE: repopula leaderboard_nacional_cache a partir dos dados atuais.
-- Recomendado ser chamada por um scheduler (Laravel Scheduler), não por
-- um MySQL EVENT (decisão explícita registada na migration original).
DROP PROCEDURE IF EXISTS sp_refresh_leaderboard_nacional;
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
    @rank := @rank + 1,
    u.id,
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
        AND ls.scope = 'nacional'
        AND ls.snapshot_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      LIMIT 1
    ), 0),
    NOW()
  FROM users u
  JOIN user_profiles up ON up.user_id = u.id
  JOIN user_levels ul ON ul.user_id = u.id,
  (SELECT @rank := 0) AS r
  WHERE u.is_active = 1
  ORDER BY ul.total_points DESC, ul.quizzes_completed DESC;
END$$
DELIMITER ;

-- ================================================================
-- MÓDULO 7: NOTIFICAÇÕES & MODERAÇÃO
-- ================================================================

CREATE TABLE notifications (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id         CHAR(36)     NOT NULL,
  type            VARCHAR(50)  NOT NULL,
  title           VARCHAR(255) NOT NULL,
  message         TEXT         NULL,
  reference_id    CHAR(36)     NULL, -- referência polimórfica manual (sem FK); ver reference_type
  reference_type  VARCHAR(50)  NULL,
  is_read         TINYINT(1)   NOT NULL DEFAULT 0,
  read_at         DATETIME     NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- content_reports.content_id/content_type é uma referência polimórfica
-- manual (sem FK real): a aplicação é responsável por validar que o
-- conteúdo referenciado existe antes de gravar a denúncia.
CREATE TABLE content_reports (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  reporter_id    CHAR(36)     NOT NULL,
  content_type   VARCHAR(20)  NOT NULL, -- document | topic | reply | user
  content_id     CHAR(36)     NOT NULL,
  reason         VARCHAR(50)  NOT NULL,
  description    TEXT         NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | resolved | dismissed
  reviewed_by    CHAR(36)     NULL,
  reviewed_at    DATETIME     NULL,
  action_taken   TEXT         NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_content_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users (id),
  CONSTRAINT fk_content_reports_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MÓDULO 8: INFRAESTRUTURA LARAVEL (cache, filas)
-- ================================================================

CREATE TABLE cache (
  `key`        VARCHAR(255) NOT NULL,
  value        MEDIUMTEXT   NOT NULL,
  expiration   INT          NOT NULL,

  PRIMARY KEY (`key`),
  KEY cache_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cache_locks (
  `key`        VARCHAR(255) NOT NULL,
  owner        VARCHAR(255) NOT NULL,
  expiration   INT          NOT NULL,

  PRIMARY KEY (`key`),
  KEY cache_locks_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  queue         VARCHAR(255)    NOT NULL,
  payload       LONGTEXT        NOT NULL,
  attempts      SMALLINT UNSIGNED NOT NULL,
  reserved_at   INT UNSIGNED    NULL,
  available_at  INT UNSIGNED    NOT NULL,
  created_at    INT UNSIGNED    NOT NULL,

  PRIMARY KEY (id),
  KEY jobs_queue_index (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_batches (
  id              VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  total_jobs      INT          NOT NULL,
  pending_jobs    INT          NOT NULL,
  failed_jobs     INT          NOT NULL,
  failed_job_ids  LONGTEXT     NOT NULL,
  options         MEDIUMTEXT   NULL,
  cancelled_at    INT          NULL,
  created_at      INT          NOT NULL,
  finished_at     INT          NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE failed_jobs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid         VARCHAR(255)    NOT NULL,
  connection   TEXT            NOT NULL,
  queue        TEXT            NOT NULL,
  payload      LONGTEXT        NOT NULL,
  exception    LONGTEXT        NOT NULL,
  failed_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY failed_jobs_uuid_unique (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
