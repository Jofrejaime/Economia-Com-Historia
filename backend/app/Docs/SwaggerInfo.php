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
 */
class SwaggerInfo
{
    // Esta classe serve apenas como âncora para as anotações OpenAPI globais.
}
