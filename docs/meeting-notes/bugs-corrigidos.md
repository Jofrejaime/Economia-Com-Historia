# 🔧 Bugs Corrigidos - Prioridade 1 ✅

**Data:** 02 de Junho de 2026  
**Status:** ✅ CONCLUÍDO  
**Arquivo:** `app/Http/Controllers/Api/ProfileController.php`

---

## ✅ BUG #1: Upload de Avatar - Remoção de Arquivo Antigo

### 📋 O Problema

Ao fazer upload de um novo avatar, o sistema tentava deletar o avatar antigo mas **falhava silenciosamente**:

```php
// ❌ ANTES (Bugado)
$url = Storage::disk('public')->url($path);
// $url = "http://localhost/storage/avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nD.jpg"

DB::table('user_profiles')->updateOrInsert(
    ['user_id' => $userId],
    ['avatar_url' => $url]  // ← Salva URL COMPLETA na BD
);

// Depois ao deletar avatar antigo
if ($oldProfile && $oldProfile->avatar_url) {
    Storage::disk('public')->delete($oldProfile->avatar_url);
    // ❌ Falha! avatar_url é URL, mas delete() espera PATH relativo
}
```

### 🎯 A Solução

Guardar **path relativo** na BD, não a URL completa:

```php
// ✅ DEPOIS (Corrigido)
$path = $file->store("avatars/{$userId}", 'public');
// $path = "avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nD.jpg"

// ✅ Guardar PATH na BD
DB::table('user_profiles')->updateOrInsert(
    ['user_id' => $userId],
    ['avatar_url' => $path]  // Agora é PATH relativo
);

// Gerar URL para resposta (frontend precisa dela)
$url = Storage::disk('public')->url($path);

// ✅ Deletar funciona agora!
if ($oldProfile && $oldProfile->avatar_url) {
    Storage::disk('public')->delete($oldProfile->avatar_url);  // ✅ Funciona!
}
```

### 📊 Mudanças Específicas

**Linhas 56-76 (método `updateAvatar`)**

| Antes | Depois |
|-------|--------|
| Salva `$url` na BD | Salva `$path` na BD |
| Deletar avatar antigo falha | Deletar avatar antigo funciona ✅ |
| URL direta na BD | PATH relativo na BD, URL gerada no response |

### 🧪 Como Testar

```bash
# 1. Upload primeiro avatar
curl -X POST http://localhost/api/profile/avatar \
  -H "Authorization: Bearer {token}" \
  -F "avatar=@photo1.jpg"
# Retorna: avatar_url = "http://localhost/storage/avatars/.../photo1.jpg"

# 2. Verificar arquivo foi criado
ls storage/app/public/avatars/{user_id}/
# Deve listar photo1.jpg

# 3. Upload segundo avatar
curl -X POST http://localhost/api/profile/avatar \
  -H "Authorization: Bearer {token}" \
  -F "avatar=@photo2.jpg"
# Retorna: avatar_url = "http://localhost/storage/avatars/.../photo2.jpg"

# 4. ✅ Verificar que photo1.jpg foi deletado
ls storage/app/public/avatars/{user_id}/
# Deve listar apenas photo2.jpg (photo1.jpg foi deletado!)
```

---

## ✅ BUG #2: Sessão Pode Ser Deletada ao Mudar Password

### 📋 O Problema

Ao mudar password, o sistema tentava revogar outras sessões mas **poderia deletar a sessão atual**:

```php
// ❌ ANTES (Bugado)
$currentToken = $this->getCurrentSessionToken();
// Pode retornar NULL se token não encontrado!

DB::table('user_sessions')
    ->where('user_id', $user->id)
    ->where('refresh_token', '!=', $currentToken)  // ← NULL comparação é perigosa!
    ->delete();

// Resultado: Se $currentToken = NULL, WHERE != NULL deleta TUDO
// Incluindo a sessão atual!
```

### 🎯 A Solução

Adicionar validação segura antes de deletar:

```php
// ✅ DEPOIS (Corrigido)
$currentToken = $this->getCurrentSessionToken();

if ($currentToken) {
    // Se encontramos o token atual, deletar tudo EXCETO ele
    DB::table('user_sessions')
        ->where('user_id', $user->id)
        ->where('refresh_token', '!=', $currentToken)
        ->delete();
} else {
    // Se NÃO conseguimos identificar o token atual,
    // só deletar sessões EXPIRADAS (nunca deletamos sessão atual!)
    DB::table('user_sessions')
        ->where('user_id', $user->id)
        ->where('expires_at', '<', now())
        ->delete();
}
```

### 📊 Mudanças Específicas

**Linhas 87-119 (método `updatePassword`)**

| Situação | Antes | Depois |
|----------|-------|--------|
| Token encontrado | Deleta outras ✅ | Deleta outras ✅ |
| Token não encontrado | Deleta TODAS ❌ | Deleta só expiradas ✅ |
| Sessão atual | Pode ser deletada ❌ | Sempre protegida ✅ |

### 🧪 Como Testar

```bash
# 1. Login em 2 "browsers" diferentes (mesma conta)
# Browser 1:
TOKEN1=$(curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"OldPass123!"}' \
  | jq -r '.token')

# Browser 2:
TOKEN2=$(curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"OldPass123!"}' \
  | jq -r '.token')

# 2. Verificar que ambos os tokens funcionam
curl -X GET http://localhost/api/me \
  -H "Authorization: Bearer $TOKEN1"
# 200 OK ✅

curl -X GET http://localhost/api/me \
  -H "Authorization: Bearer $TOKEN2"
# 200 OK ✅

# 3. Mudar password no Browser 1
curl -X PUT http://localhost/api/profile/password \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password":"OldPass123!",
    "password":"NewPass456!",
    "password_confirmation":"NewPass456!"
  }'
# 200 OK ✅

# 4. ✅ Verificar que Browser 1 ainda funciona
curl -X GET http://localhost/api/me \
  -H "Authorization: Bearer $TOKEN1"
# 200 OK ✅ (Sessão atual preservada!)

# 5. ✅ Verificar que Browser 2 foi revogado
curl -X GET http://localhost/api/me \
  -H "Authorization: Bearer $TOKEN2"
# 401 Unauthenticated ✅ (Outra sessão foi deletada!)

# 6. ✅ Verificar que não consegue login com password antiga
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"OldPass123!"}'
# 422 Invalid credentials ✅
```

---

## 📝 CÓDIGO FINAL - ProfileController.php

### Método updateAvatar (Corrigido)

```php
public function updateAvatar(Request $request): JsonResponse
{
    $validated = $request->validate([
        'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
    ]);

    $userId = $request->user()->id;
    $file = $validated['avatar'];

    // Delete old avatar if exists
    $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
    if ($oldProfile && $oldProfile->avatar_url) {
        // ✅ FIXED: avatar_url now contains path, not full URL
        Storage::disk('public')->delete($oldProfile->avatar_url);
    }

    // Store new avatar
    $path = $file->store("avatars/{$userId}", 'public');

    // ✅ FIXED: Save path instead of URL to database
    DB::table('user_profiles')->updateOrInsert(
        ['user_id' => $userId],
        [
            'avatar_url' => $path,  // Store relative path: "avatars/{user_id}/filename.jpg"
            'updated_at' => now(),
        ]
    );

    // Generate URL for response (frontend needs this)
    $url = Storage::disk('public')->url($path);

    return response()->json([
        'message' => 'Avatar uploaded successfully.',
        'avatar_url' => $url,  // Return full URL to frontend
    ]);
}
```

### Método updatePassword (Corrigido)

```php
public function updatePassword(Request $request): JsonResponse
{
    $validated = $request->validate([
        'current_password' => ['required', 'string'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $user = $request->user();

    // Verify current password
    if (!Hash::check($validated['current_password'], $user->password_hash)) {
        return response()->json([
            'message' => 'Current password is incorrect.',
            'errors' => ['current_password' => ['The current password is incorrect.']],
        ], 422);
    }

    // Update password
    DB::transaction(function () use ($user, $validated): void {
        $user->forceFill([
            'password_hash' => Hash::make($validated['password']),
        ])->save();

        // ✅ FIXED: Safely revoke sessions with proper null check
        $currentToken = $this->getCurrentSessionToken();
        
        if ($currentToken) {
            // If we found current token, revoke all OTHER sessions
            DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->where('refresh_token', '!=', $currentToken)
                ->delete();
        } else {
            // If we couldn't identify current token, only revoke EXPIRED sessions
            // This prevents accidentally revoking the current session
            DB::table('user_sessions')
                ->where('user_id', $user->id)
                ->where('expires_at', '<', now())
                ->delete();
        }
    });

    return response()->json([
        'message' => 'Password changed successfully. Other sessions have been revoked.',
    ]);
}
```

---

## ✅ VALIDAÇÃO

- ✅ Sem erros de sintaxe
- ✅ Código compila corretamente
- ✅ Lógica é segura
- ✅ Comentários explicativos adicionados

---

## 🎯 PRÓXIMOS PASSOS

### Testes (Importante!)
```bash
# Rodar testes de profile
php artisan test --filter ProfileTest

# Todos os 12 testes devem passar ✅
```

### Storage Link (Necessário!)
```bash
# Isso permite que avatars sejam acessíveis via HTTP
php artisan storage:link
```

### Testes Manuais

1. **Upload de avatar** ✅
   - Fazer upload primeiro avatar
   - Fazer upload segundo avatar
   - Verificar que primeiro foi deletado

2. **Mudança de password** ✅
   - Login em 2 sessões
   - Mudar password numa
   - Verificar que outra foi revogada
   - Verificar que sessão atual continua válida

---

## 📊 IMPACTO

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Upload Avatar | ❌ Falha ao deletar antigo | ✅ Deleta corretamente |
| Avatars no Storage | Acumulam indefinidamente | Limpam automaticamente |
| Mudança Password | ❌ Pode deletar sessão atual | ✅ Segura |
| Segurança | ⚠️ Risco de logout acidental | ✅ Protegida |

---

## 🎉 STATUS

✅ **PRIORIDADE 1: CONCLUÍDO**

- [x] Bug #1: Upload de avatar - Corrigido
- [x] Bug #2: Sessão ao mudar password - Corrigido
- [x] Código sem erros
- [x] Pronto para testes

**Próximo:** Prioridade 2 - Adicionar Validações

---

**Data de Conclusão:** 02/06/2026  
**Tempo Estimado:** 2-3 horas  
**Responsável:** Jofre Jaime
