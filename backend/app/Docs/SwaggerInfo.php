<?php

namespace App\Docs;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Economia Com História API",
 *      description="Documentação completa da API para a plataforma de gamificação educacional Economia Com História. Utiliza autenticação via Bearer Token (Sanctum).",
 *      @OA\Contact(
 *          email="suporte@economiacomhistoria.ao"
 *      ),
 *      @OA\License(
 *          name="MIT",
 *          url="https://opensource.org/licenses/MIT"
 *      )
 * )
 *
 * @OA\Server(
 *      url="/api",
 *      description="Servidor API principal"
 * )
 *
 * @OA\SecurityScheme(
 *      securityScheme="bearer_token",
 *      type="http",
 *      scheme="bearer",
 *      bearerFormat="JWT",
 *      description="Token de autenticação Sanctum. Envie no cabeçalho: Authorization: Bearer {token}"
 * )
 *
 * @OA\SecurityScheme(
 *      securityScheme="session_token",
 *      type="apiKey",
 *      in="header",
 *      name="X-Session-Token",
 *      description="Token de sessão enviado no cabeçalho X-Session-Token"
 * )
 *
 * @OA\Tag(
 *      name="Authentication",
 *      description="Registo, login, logout e gestão de sessões"
 * )
 *
 * @OA\Tag(
 *      name="Profile",
 *      description="Gestão do perfil do utilizador autenticado"
 * )
 *
 * @OA\Tag(
 *      name="Access",
 *      description="Gestão de acesso a módulos (compra, verificação)"
 * )
 *
 * @OA\Tag(
 *      name="Documents",
 *      description="Gestão de documentos e conteúdos de aprendizagem"
 * )
 *
 * @OA\Tag(
 *      name="Quiz",
 *      description="Criação, resposta e gestão de quizzes"
 * )
 *
 * @OA\Tag(
 *      name="Community",
 *      description="Fórum da comunidade: posts, respostas e votações"
 * )
 *
 * @OA\Tag(
 *      name="Notifications",
 *      description="Gestão de notificações do utilizador"
 * )
 *
 * @OA\Tag(
 *      name="Reports",
 *      description="Relatórios de progresso e desempenho (Admin)"
 * )
 *
 * @OA\Tag(
 *      name="Leaderboard",
 *      description="Tabela de classificações e ranking"
 * )
 *
 * @OA\Tag(
 *      name="Gamification",
 *      description="Conquistas e recompensas de gamificação"
 * )
 *
 * @OA\Schema(
 *      schema="Setting",
 *      title="Setting",
 *      description="Configuração global da plataforma",
 *      required={"id", "key", "value", "type", "group", "is_public"},
 *      @OA\Property(property="id", type="string", format="uuid", example="019f21a6-c469-70fd-8cff-bef624fdcf28"),
 *      @OA\Property(property="key", type="string", example="site_name"),
 *      @OA\Property(property="value", type="string", example="Economia com História"),
 *      @OA\Property(property="type", type="string", enum={"string", "integer", "boolean", "json", "float"}, example="string"),
 *      @OA\Property(property="group", type="string", example="general"),
 *      @OA\Property(property="description", type="string", example="Nome oficial da plataforma"),
 *      @OA\Property(property="is_public", type="boolean", example=true),
 *      @OA\Property(property="created_at", type="string", format="date-time"),
 *      @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *      schema="LevelDefinition",
 *      title="Level Definition",
 *      description="Definição de nível para gamificação",
 *      required={"level", "name", "min_points"},
 *      @OA\Property(property="level", type="integer", example=1),
 *      @OA\Property(property="name", type="string", example="Iniciante"),
 *      @OA\Property(property="min_points", type="integer", example=0),
 *      @OA\Property(property="max_points", type="integer", nullable=true, example=100),
 *      @OA\Property(property="color_hex", type="string", nullable=true, example="#94a3b8"),
 *      @OA\Property(property="icon_url", type="string", nullable=true, example="http://example.com/icons/level1.png"),
 *      @OA\Property(property="perks", type="array", @OA\Items(type="string"), nullable=true, example={"Pode criar tópicos"})
 * )
 *
 * @OA\Schema(
 *      schema="AccessLevel",
 *      title="Access Level",
 *      description="Nível de acesso/privilégios de documentos/categorias",
 *      required={"id", "name", "requires_approval", "auto_grant"},
 *      @OA\Property(property="id", type="string", example="restricted"),
 *      @OA\Property(property="name", type="string", example="Restrito"),
 *      @OA\Property(property="description", type="string", nullable=true, example="Requer validação manual"),
 *      @OA\Property(property="icon", type="string", nullable=true, example="🔒"),
 *      @OA\Property(property="color_bg", type="string", nullable=true, example="#ffb3ba"),
 *      @OA\Property(property="color_text", type="string", nullable=true, example="#5c0011"),
 *      @OA\Property(property="requires_approval", type="boolean", example=true),
 *      @OA\Property(property="auto_grant", type="boolean", example=false)
 * )
 */
class SwaggerInfo
{
    // Esta classe serve apenas como âncora para as anotações OpenAPI globais.
}
