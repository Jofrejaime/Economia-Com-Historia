# 🎯 Plano de Ação - Jofre Jaime (Pessoa 1)

**Data:** 02 de Junho de 2026  
**Objetivo:** Finalizar e otimizar o trabalho de Core e Autenticação

---

## 📊 SITUAÇÃO ATUAL

### ✅ O QUE JÁ ESTÁ PRONTO (85%)
- Autenticação completa (registo, login, logout, refresh)
- Recuperação de conta (forgot password, reset password)
- Gestão de perfis (visualizar, atualizar, avatar, password)
- Níveis de acesso (pedidos, aprovações, grants)
- Middleware de segurança
- 12 testes automatizados
- Todas as migrações
- Rotas de API

### ⚠️ O QUE FALTA (15%)
- 2 bugs críticos para corrigir
- Seeders (dados de teste)
- Documentação formal
- Melhorias de validação

---

## 🔴 PRIORIDADE 1: CORRIGIR BUGS CRÍTICOS (2-3 horas)

### Bug #1: Upload de Avatar - Remoção de Arquivo Antigo 🐛

**Problema:**
```php
// Backend salva URL completa na BD
$url = Storage::disk('public')->url($path);
// $url = "http://localhost/storage/avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nD.jpg"

DB::table('user_profiles')->updateOrInsert(
    ['user_id' => $userId],
    ['avatar_url' => $url]  // ← URL completa
);

// Depois ao deletar, tenta usar URL como path
Storage::disk('public')->delete($oldProfile->avatar_url);
// ← Falha! Precisa de path, não URL
```

**Solução:**
```php
// Opção A: Salvar PATH em vez de URL
$path = $file->store("avatars/{$userId}", 'public');

DB::table('user_profiles')->updateOrInsert(
    ['user_id' => $userId],
    ['avatar_url' => $path]  // ← Salvar "avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nD.jpg"
);

// No retorno, converter path para URL
return response()->json([
    'avatar_url' => Storage::disk('public')->url($path)
]);

// Ao deletar, funciona porque temos o path
Storage::disk('public')->delete($oldProfile->avatar_url);  // ✅

// OU Opção B: Converter URL de volta para path antes de deletar
if ($oldProfile && $oldProfile->avatar_url) {
    $path = str_replace(Storage::disk('public')->url(''), '', $oldProfile->avatar_url);
    Storage::disk('public')->delete($path);
}
```

**Arquivo:** `app/Http/Controllers/Api/ProfileController.php`  
**Linhas:** 59-72

---

### Bug #2: Sessão Atual Pode Ser Deletada ao Mudar Password 🐛

**Problema:**
```php
public function updatePassword(Request $request): JsonResponse
{
    // ...validações...

    DB::transaction(function () use ($user, $validated): void {
        $user->forceFill(['password_hash' => Hash::make($validated['password'])])->save();

        $currentToken = $this->getCurrentSessionToken();  // ← Pode retornar NULL!
        
        // Se NULL, WHERE != NULL deleta TUDO, incluindo sessão atual
        DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->where('refresh_token', '!=', $currentToken)  // ← Problema aqui
            ->delete();
    });
}

private function getCurrentSessionToken(): ?string
{
    $token = request()->bearerToken() ?? request()->header('X-Session-Token');
    
    if ($token) {
        $session = DB::table('user_sessions')
            ->where('refresh_token', $token)
            ->first();
        
        return $session?->refresh_token;  // ← Pode retornar NULL
    }
    
    return null;  // ← Retorna NULL aqui
}
```

**Solução:**
```php
DB::transaction(function () use ($user, $validated): void {
    $user->forceFill([
        'password_hash' => Hash::make($validated['password'])
    ])->save();

    $currentToken = $this->getCurrentSessionToken();
    
    // ✅ Se não encontrar token atual, manter todas as sessões
    if ($currentToken) {
        DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->where('refresh_token', '!=', $currentToken)
            ->delete();
    } else {
        // Fallback: só deletar sessões EXPIRADAS (não a atual)
        DB::table('user_sessions')
            ->where('user_id', $user->id)
            ->where('expires_at', '<', now())
            ->delete();
    }
});
```

**Arquivo:** `app/Http/Controllers/Api/ProfileController.php`  
**Linhas:** 97-108, 123-131

---

## 🟡 PRIORIDADE 2: ADICIONAR VALIDAÇÕES (1-2 horas)

### Validação #1: Províncias Angolanas

**Arquivo:** `app/Http/Controllers/Api/ProfileController.php`  
**Método:** `update()`

```php
// Antes
'province' => ['sometimes', 'nullable', 'string', 'max:50'],

// Depois
'province' => [
    'sometimes', 
    'nullable', 
    'string',
    'in:' . implode(',', [
        'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
        'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
        'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
        'Namibe', 'Uíge', 'Zaire'
    ])
],
```

---

### Validação #2: Limite em Bio

```php
// Antes
'bio' => ['sometimes', 'nullable', 'string'],

// Depois
'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
```

---

### Validação #3: Dimensões de Avatar

**Instalar Intervention Image:**
```bash
composer require intervention/image
```

**Atualizar validação:**
```php
'avatar' => [
    'required', 
    'image', 
    'mimes:jpeg,png,gif,webp', 
    'max:5120',
    'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
],
```

---

### Validação #4: Password Complexity (Opcional)

```php
// Antes
'password' => ['required', 'string', 'min:8', 'confirmed'],

// Depois
use Illuminate\Validation\Rules\Password;

'password' => [
    'required',
    Password::min(8)
        ->mixedCase()      // A-Z e a-z
        ->numbers()        // 0-9
        ->symbols()        // !@#$%^&*
        ->uncompromised()  // Verificar se está em vazamentos
        ->confirmed(),
],
```

---

## 🟢 PRIORIDADE 3: CRIAR SEEDERS (3-4 horas)

### Seeder #1: LevelDefinitionsSeeder ⭐ IMPORTANTE

**Arquivo:** `database/seeders/LevelDefinitionsSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LevelDefinitionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('level_definitions')->insert([
            [
                'level' => 1,
                'name' => 'Iniciante',
                'min_points' => 0,
                'max_points' => 100,
                'color_hex' => '#808080',  // Cinzento
                'icon_url' => null,
                'perks' => json_encode(['can_view_public' => true]),
            ],
            [
                'level' => 2,
                'name' => 'Aprendiz',
                'min_points' => 101,
                'max_points' => 250,
                'color_hex' => '#4CAF50',  // Verde
                'icon_url' => null,
                'perks' => json_encode(['can_participate_community' => true]),
            ],
            [
                'level' => 3,
                'name' => 'Estudioso',
                'min_points' => 251,
                'max_points' => 500,
                'color_hex' => '#2196F3',  // Azul
                'icon_url' => null,
                'perks' => json_encode(['can_create_topics' => true]),
            ],
            [
                'level' => 4,
                'name' => 'Pesquisador',
                'min_points' => 501,
                'max_points' => 1000,
                'color_hex' => '#FF9800',  // Laranja
                'icon_url' => null,
                'perks' => json_encode(['can_upload_documents' => true]),
            ],
            [
                'level' => 5,
                'name' => 'Mestre',
                'min_points' => 1001,
                'max_points' => 2000,
                'color_hex' => '#9C27B0',  // Roxo
                'icon_url' => null,
                'perks' => json_encode(['can_moderate' => true, 'can_create_quizzes' => true]),
            ],
        ]);
    }
}
```

---

### Seeder #2: UserSeeder

**Arquivo:** `database/seeders/UserSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@example.com',
                'password_hash' => bcrypt('Admin123!'),
                'role' => 'admin',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Administrador',
                'full_name' => 'Administrador do Sistema',
                'institution' => 'ISPTEC',
                'province' => 'Luanda',
            ],
            [
                'email' => 'professor@example.com',
                'password_hash' => bcrypt('Professor123!'),
                'role' => 'professor',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Prof. João Silva',
                'full_name' => 'João Pedro da Silva',
                'institution' => 'ISPTEC',
                'province' => 'Luanda',
            ],
            [
                'email' => 'researcher@example.com',
                'password_hash' => bcrypt('Researcher123!'),
                'role' => 'investigador',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'Dr. Maria Neves',
                'full_name' => 'Maria Neves dos Santos',
                'institution' => 'Universidade Agostinho Neto',
                'province' => 'Benguela',
            ],
            [
                'email' => 'student@example.com',
                'password_hash' => bcrypt('Student123!'),
                'role' => 'estudante',
                'email_verified' => true,
                'is_active' => true,
                'display_name' => 'António Cabral',
                'full_name' => 'António Cabral Ferreira',
                'institution' => 'ISPTEC',
                'province' => 'Huambo',
            ],
        ];

        foreach ($users as $userData) {
            $displayName = $userData['display_name'];
            $fullName = $userData['full_name'];
            $institution = $userData['institution'];
            $province = $userData['province'];
            unset($userData['display_name'], $userData['full_name'], $userData['institution'], $userData['province']);

            $user = User::create($userData);

            // Criar perfil
            DB::table('user_profiles')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'display_name' => $displayName,
                'full_name' => $fullName,
                'institution' => $institution,
                'province' => $province,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Granting access levels
            DB::table('user_access_grants')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'access_level_id' => 'public',
                'granted_at' => now(),
            ]);

            // Set user level
            DB::table('user_levels')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'current_level' => 1,
                'total_points' => 0,
            ]);
        }
    }
}
```

---

### Seeder #3: BadgesSeeder

**Arquivo:** `database/seeders/BadgesSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BadgesSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'name' => 'First Steps',
                'description' => 'Complete your first quiz',
                'icon_url' => null,
                'color_hex' => '#4CAF50',
                'category' => 'achievement',
                'criteria_type' => 'quiz_completed',
                'criteria_value' => json_encode(['count' => 1]),
            ],
            [
                'name' => 'Quiz Master',
                'description' => 'Complete 10 quizzes',
                'icon_url' => null,
                'color_hex' => '#2196F3',
                'category' => 'achievement',
                'criteria_type' => 'quiz_completed',
                'criteria_value' => json_encode(['count' => 10]),
            ],
            [
                'name' => 'Community Voice',
                'description' => 'Create your first topic',
                'icon_url' => null,
                'color_hex' => '#FF9800',
                'category' => 'achievement',
                'criteria_type' => 'topic_created',
                'criteria_value' => json_encode(['count' => 1]),
            ],
            [
                'name' => 'Helpful Member',
                'description' => 'Get 5 of your replies marked as helpful',
                'icon_url' => null,
                'color_hex' => '#9C27B0',
                'category' => 'achievement',
                'criteria_type' => 'reply_accepted',
                'criteria_value' => json_encode(['count' => 5]),
            ],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->insert(array_merge(
                $badge,
                [
                    'id' => (string) Str::uuid(),
                    'is_active' => true,
                    'created_at' => now(),
                ]
            ));
        }
    }
}
```

---

### Registar Seeders

**Arquivo:** `database/seeders/DatabaseSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Seeders de Pessoa 1 (Jofre) - Core e Autenticação
        $this->call([
            LevelDefinitionsSeeder::class,
            UserSeeder::class,
            BadgesSeeder::class,
        ]);

        // Aqui irão seeders de Pessoa 2 (Abel)
        // $this->call([
        //     DocumentSeeder::class,
        //     QuizSeeder::class,
        //     CommunitySeeder::class,
        // ]);
    }
}
```

---

## 📚 PRIORIDADE 4: DOCUMENTAÇÃO (2-3 horas)

### Documentação #1: API de Autenticação

**Arquivo:** `docs/api/authentication.md`

Documentar:
- Endpoints de autenticação
- Schemas de request/response
- Códigos de erro esperados
- Exemplos com cURL

### Documentação #2: API de Perfis

**Arquivo:** `docs/api/profiles.md`

Documentar:
- Endpoints de perfil
- Upload de avatar (guia completo)
- Fluxo de mudança de password

### Documentação #3: API de Controle de Acesso

**Arquivo:** `docs/api/access-control.md`

Documentar:
- Níveis de acesso
- Fluxo de pedidos
- Aprovação/Rejeição

---

## 🧪 PRIORIDADE 5: TESTES ADICIONAIS (2-3 horas)

### Testes #1: Edge Cases de Avatar

```php
// No ProfileTest.php adicionar:

public function test_delete_old_avatar_on_new_upload()
{
    // Fazer upload primeiro avatar
    // Verificar que arquivo foi criado
    // Fazer upload segundo avatar
    // Verificar que arquivo antigo foi removido
    // Verificar que só existe novo arquivo
}

public function test_avatar_path_is_correct()
{
    // Upload avatar
    // Verificar que avatar_url começa com http://localhost/storage/
    // Verificar que consegue acessar via GET direto
}
```

### Testes #2: Sessão ao Mudar Password

```php
public function test_other_sessions_revoked_on_password_change()
{
    // Login user (sessão 1)
    // Em outro "browser", fazer login mesmo user (sessão 2)
    // Mudar password na sessão 1
    // Tentar usar token da sessão 2
    // Deve retornar 401 (sessão revogada)
}

public function test_current_session_still_valid_after_password_change()
{
    // Login (sessão atual)
    // Mudar password
    // Tentar usar mesmo token
    // Deve continuar válido (sessão atual não é revogada)
}
```

### Testes #3: Validação de Províncias

```php
public function test_invalid_province_rejected()
{
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->putJson('/api/profile', [
            'province' => 'Provincia Inexistente'
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['province']);
}
```

---

## ⏱️ CRONOGRAMA ESTIMADO

### Semana 1 (Esta semana)
- [ ] **Seg-Ter:** Corrigir 2 bugs críticos (3h)
- [ ] **Ter-Qua:** Adicionar validações (2h)
- [ ] **Qua-Qui:** Criar seeders (4h)
- [ ] **Qui-Sex:** Documentação API (3h)
- [ ] **Sex:** Testes adicionais + QA (3h)

**Total:** ~15 horas (2 dias de trabalho)

---

## 📋 CHECKLIST FINAL

### Bugs Críticos
- [ ] Corrigir deleção de avatar (salvar PATH, não URL)
- [ ] Proteger sessão atual ao mudar password

### Validações
- [ ] Validar províncias angolanas
- [ ] Limite em bio (max:2000)
- [ ] Dimensões de avatar (min/max)
- [ ] Password complexity (opcional)

### Seeders
- [ ] LevelDefinitionsSeeder (5 níveis)
- [ ] UserSeeder (4 utilizadores de teste)
- [ ] BadgesSeeder (4 badges)
- [ ] Registar em DatabaseSeeder

### Testes
- [ ] Testes de avatar (edge cases)
- [ ] Testes de sessão (mudança password)
- [ ] Testes de validação (províncias)

### Documentação
- [ ] API authentication.md
- [ ] API profiles.md
- [ ] API access-control.md

### Verificação Final
- [ ] Todos os testes passam (verde)
- [ ] Nenhum warning no código
- [ ] Documentação completa
- [ ] Seeders funcionam: `php artisan db:seed`
- [ ] Storage link criado: `php artisan storage:link`

---

## 🚀 DEPOIS DE TUDO PRONTO

1. **Integração com Pessoa 2**
   - Validar rotas de autenticação funcionam com dados de Pessoa 2
   - Testar fluxos cruzados

2. **Integração com Frontend**
   - Validar endpoints com frontend
   - Testar upload de avatar em browser
   - Testar autenticação completa

3. **Deploy**
   - Validar em staging
   - Fazer migrations
   - Executar seeders
   - Criar storage link
   - Validar email config (Resend)

---

## 💡 DICAS IMPORTANTES

### Para testar tudo rapidinho
```bash
# Correr testes de profile
php artisan test --filter Profile

# Rodar seeders
php artisan migrate:fresh --seed

# Ver dados criados
php artisan tinker
# Dentro do tinker:
# >>> DB::table('users')->get()
# >>> DB::table('user_profiles')->get()
# >>> DB::table('level_definitions')->get()
```

### Storage Link (Importante para avatars!)
```bash
php artisan storage:link
# Isso cria: public/storage → storage/app/public
# Sem isso, avatars não são acessíveis!
```

### Verificar se Resend está configurado
```bash
# No .env, verificar:
MAIL_MAILER=resend
RESEND_API_KEY=your-api-key-here

# Se não estiver, emails não serão enviados!
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Ordem sugerida de execução:**

1. ✅ **HOJE:** Corrigir bugs críticos (prioritário)
2. ✅ **AMANHÃ:** Adicionar validações + seeders
3. ✅ **DEPOIS:** Documentação + testes extras
4. ✅ **FINAL:** Integração com Pessoa 2 e frontend

**Tempo total: ~15 horas distribuído em 2-3 dias**

Depois disso, o trabalho de Pessoa 1 estará **100% completo e pronto para produção**! 🎉

---

**Próxima Reunião:** Após completar bugs e seeders (2-3 dias)  
**Responsável:** Jofre Jaime  
**Status Inicial:** 85% → Meta: 100%
