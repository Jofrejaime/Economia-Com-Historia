# Guia Completo: Upload de Avatar - Backend e Frontend

**Data:** 02 de Junho de 2026  
**Objetivo:** Entender fluxo completo de upload, armazenamento e consumo de avatars

---

## 📊 FLUXO GERAL DE UPLOAD

```
Frontend (Browser)
    ↓ (envia arquivo + token)
┌─────────────────────────────────────┐
│  POST /api/profile/avatar           │
│  - Authorization: Bearer {token}    │
│  - Content-Type: multipart/form-data│
│  - Body: avatar file                │
└─────────────────────────────────────┘
    ↓
Backend (Laravel)
    ├─ 1. Valida token (middleware)
    ├─ 2. Valida arquivo (imagem, size, type)
    ├─ 3. Deleta avatar antigo (se existir)
    ├─ 4. Salva novo arquivo em storage/app/public/avatars/{user_id}/{filename}
    ├─ 5. Atualiza BD com path
    └─ 6. Retorna URL pública do arquivo
    ↓
Frontend
    └─ Recebe URL + mensagem de sucesso
    └─ Exibe avatar (img.src = nova URL)
    └─ Atualiza UI
```

---

## 🔍 ENTENDENDO O CÓDIGO ATUAL

### Backend: `app/Http/Controllers/Api/ProfileController.php`

```php
public function updateAvatar(Request $request): JsonResponse
{
    // 1. VALIDAÇÃO
    $validated = $request->validate([
        'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
        //                          ↑ verifica se é imagem
        //                                      ↑ apenas estes formatos
        //                                                            ↑ max 5MB
    ]);

    $userId = $request->user()->id;
    $file = $validated['avatar']; // UploadedFile object

    // 2. REMOVER AVATAR ANTIGO (se existir)
    $oldProfile = DB::table('user_profiles')->where('user_id', $userId)->first();
    if ($oldProfile && $oldProfile->avatar_url) {
        Storage::disk('public')->delete($oldProfile->avatar_url);
        // ⚠️ BUG AQUI! avatar_url é URL, não path
    }

    // 3. SALVAR NOVO ARQUIVO
    $path = $file->store("avatars/{$userId}", 'public');
    // $path agora é: "avatars/{user_id}/xyz789.jpg"
    
    $url = Storage::disk('public')->url($path);
    // $url agora é: "http://localhost/storage/avatars/{user_id}/xyz789.jpg"

    // 4. ATUALIZAR BD
    DB::table('user_profiles')->updateOrInsert(
        ['user_id' => $userId],
        [
            'avatar_url' => $url,  // ⚠️ Salva URL completa (problema)
            'updated_at' => now(),
        ]
    );

    // 5. RETORNAR RESPOSTA
    return response()->json([
        'message' => 'Avatar uploaded successfully.',
        'avatar_url' => $url,
    ]);
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS NO SERVIDOR

```
laravel-project/
├── storage/
│   └── app/
│       └── public/                    ← Arquivos públicos aqui
│           └── avatars/
│               ├── user-id-1/
│               │   ├── xyz789.jpg     ← Arquivo real
│               │   └── abc123.png
│               └── user-id-2/
│                   └── def456.gif
│
└── public/
    └── storage/                       ← Symlink para storage/app/public
        └── avatars/                   ← Aponta para storage/app/public/avatars
            ├── user-id-1/
            ├── user-id-2/
            ...
```

### ⚠️ IMPORTANTE: Symlink

Para avatars serem acessíveis publicamente, precisa criar symlink:

```bash
php artisan storage:link
```

Isso cria:
- `public/storage` → `storage/app/public`

Sem isso, imagens NÃO serão acessíveis via HTTP!

---

## 🛠️ COMO FUNCIONA CADA PARTE

### 1️⃣ VALIDAÇÃO DE ARQUIVO

```php
$file = $request->validate([
    'avatar' => ['required', 'image', 'mimes:jpeg,png,gif,webp', 'max:5120'],
])['avatar'];
```

**O que valida:**
- ✅ `required` - campo é obrigatório
- ✅ `image` - é um arquivo de imagem válido
- ✅ `mimes:jpeg,png,gif,webp` - apenas estes formatos
- ✅ `max:5120` - máximo 5120 KB (5 MB)

**Se falhar, retorna 422:**
```json
{
  "message": "The avatar field must be an image.",
  "errors": {
    "avatar": [
      "The avatar field must be an image.",
      "The avatar field must not be greater than 5120 kilobytes."
    ]
  }
}
```

---

### 2️⃣ SALVAR ARQUIVO

```php
$path = $file->store("avatars/{$userId}", 'public');
```

**O que acontece:**
1. Laravel gera nome aleatório seguro (ex: `LCbh2nDjVQxR6qP9w7z3.jpg`)
2. Salva arquivo em: `storage/app/public/avatars/{user_id}/{nome_aleatorio}.jpg`
3. Retorna o path relativo: `avatars/{user_id}/LCbh2nDjVQxR6qP9w7z3.jpg`

**Resultado:**
```
$path = "avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nDjVQxR6qP9w7z3.jpg"
```

---

### 3️⃣ GERAR URL PÚBLICA

```php
$url = Storage::disk('public')->url($path);
```

**Transforma path em URL acessível:**
```
Input:  "avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nDjVQxR6qP9w7z3.jpg"
Output: "http://localhost/storage/avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nDjVQxR6qP9w7z3.jpg"
```

**URL funciona porque:**
```
http://localhost/storage/...
                ↑ Symlink
                ↓
            public/storage → storage/app/public
```

---

### 4️⃣ SALVAR NA BD

```php
DB::table('user_profiles')->updateOrInsert(
    ['user_id' => $userId],
    [
        'avatar_url' => $url,  // Salva URL completa
        'updated_at' => now(),
    ]
);
```

**O que fica na BD:**
```
user_id:     "550e8400-e29b-41d4-a716-446655440000"
avatar_url:  "http://localhost/storage/avatars/550e8400-e29b-41d4-a716-446655440000/LCbh2nDjVQxR6qP9w7z3.jpg"
created_at:  "2024-01-15 10:00:00"
updated_at:  "2024-06-02 14:25:00"
```

---

## 🌐 COMO O FRONTEND CONSOME

### Exemplo 1: HTML Simples

```html
<!-- Exibir avatar atual -->
<img id="avatar" src="" alt="Avatar do utilizador" />

<!-- Botão para fazer upload -->
<input type="file" id="avatarInput" accept="image/*" />
<button onclick="uploadAvatar()">Fazer Upload</button>
```

### Exemplo 2: JavaScript (Fetch API)

```javascript
async function uploadAvatar() {
    const fileInput = document.getElementById('avatarInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor selecione uma imagem');
        return;
    }

    // Criar FormData (necessário para upload de arquivo)
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        // Fazer POST para /api/profile/avatar
        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // ← Token de autenticação
                // NÃO adicionar Content-Type!
                // Browser adiciona automaticamente: multipart/form-data
            },
            body: formData, // ← FormData com arquivo
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Erro: ${error.message}`);
            return;
        }

        const data = await response.json();
        console.log('Sucesso:', data);
        // data.avatar_url = nova URL do avatar

        // Atualizar IMG com nova URL
        document.getElementById('avatar').src = data.avatar_url;
        
        alert('Avatar atualizado com sucesso!');
    } catch (error) {
        console.error('Erro de conexão:', error);
    }
}
```

### Exemplo 3: Fetch com Validação Prévia

```javascript
async function uploadAvatarWithValidation() {
    const fileInput = document.getElementById('avatarInput');
    const file = fileInput.files[0];

    // 1. Validação no frontend (antes de enviar)
    if (!file) {
        alert('Selecione um arquivo');
        return;
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Apenas JPEG, PNG, GIF ou WebP são permitidos');
        return;
    }

    // Validar tamanho (5MB = 5242880 bytes)
    if (file.size > 5242880) {
        alert('Arquivo muito grande (máx 5MB)');
        return;
    }

    // 2. Validar dimensões (opcional)
    const img = new Image();
    img.onload = async () => {
        if (img.width < 100 || img.height < 100) {
            alert('Imagem muito pequena (mínimo 100x100)');
            return;
        }
        
        // Se passou todas validações, fazer upload
        await doUpload(file);
    };
    img.src = URL.createObjectURL(file);
}

async function doUpload(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload falhou');
        }

        const data = await response.json();
        document.getElementById('avatar').src = data.avatar_url;
        alert('Avatar atualizado!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}
```

### Exemplo 4: Axios (se usar biblioteca)

```javascript
async function uploadAvatarAxios() {
    const file = document.getElementById('avatarInput').files[0];
    
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await axios.post('/api/profile/avatar', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Axios detecta FormData e adiciona Content-Type correto
            },
        });

        document.getElementById('avatar').src = response.data.avatar_url;
        console.log('Sucesso:', response.data);
    } catch (error) {
        console.error('Erro:', error.response.data);
    }
}
```

### Exemplo 5: Angular

```typescript
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-avatar-upload',
  template: `
    <img [src]="avatarUrl" alt="Avatar" />
    <input type="file" #fileInput accept="image/*" />
    <button (click)="uploadAvatar()">Upload</button>
  `
})
export class AvatarUploadComponent {
    avatarUrl: string;

    constructor(private http: HttpClient) {}

    uploadAvatar() {
        const file = document.querySelector('input[type="file"]').files[0];
        
        const formData = new FormData();
        formData.append('avatar', file);

        this.http.post('/api/profile/avatar', formData)
            .subscribe(
                (response: any) => {
                    this.avatarUrl = response.avatar_url;
                    console.log('Avatar atualizado!');
                },
                (error) => {
                    console.error('Erro:', error);
                }
            );
    }
}
```

### Exemplo 6: React

```jsx
import { useState } from 'react';

export function AvatarUpload() {
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload falhou');

            const data = await response.json();
            setAvatarUrl(data.avatar_url);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <img src={avatarUrl} alt="Avatar" />
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload}
                disabled={loading}
            />
            {loading && <p>Enviando...</p>}
        </div>
    );
}
```

### Exemplo 7: Vue.js

```vue
<template>
    <div>
        <img :src="avatarUrl" alt="Avatar" />
        <input 
            type="file" 
            @change="handleUpload"
            accept="image/*"
        />
        <p v-if="loading">Enviando...</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            avatarUrl: '',
            loading: false
        };
    },
    methods: {
        async handleUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.loading = true;
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.$store.state.token}`,
                    },
                    body: formData,
                });

                const data = await response.json();
                this.avatarUrl = data.avatar_url;
            } catch (error) {
                console.error('Erro:', error);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>
```

---

## 📋 FLUXO PASSO A PASSO

### O que acontece quando clica em "Upload Avatar":

```
1. FRONTEND
   ├─ Utilizador seleciona arquivo via input[type="file"]
   ├─ JavaScript lê arquivo (File object)
   └─ Cria FormData com arquivo

2. ENVIO (HTTP POST)
   ├─ URL: http://localhost/api/profile/avatar
   ├─ Method: POST
   ├─ Headers:
   │  ├─ Authorization: Bearer {token}
   │  └─ Content-Type: multipart/form-data (automático)
   └─ Body: FormData { avatar: File }

3. BACKEND - MIDDLEWARE
   ├─ AuthenticateApiSession valida token
   └─ Se inválido, retorna 401 Unauthenticated

4. BACKEND - CONTROLLER
   ├─ Valida arquivo:
   │  ├─ É obrigatório? ✓
   │  ├─ É imagem? ✓
   │  ├─ Formato válido (jpeg/png/gif/webp)? ✓
   │  └─ Tamanho ≤ 5MB? ✓
   │
   ├─ Se falha validação → 422 Validation Error
   │
   ├─ Se passa validação:
   │  ├─ Busca avatar antigo
   │  ├─ Se existir, deleta do storage
   │  ├─ Salva novo arquivo em storage/app/public/avatars/{user_id}/
   │  ├─ Atualiza BD com nova URL
   │  └─ Retorna 200 OK com nova URL

5. RESPOSTA (HTTP 200)
   └─ {
       "message": "Avatar uploaded successfully.",
       "avatar_url": "http://localhost/storage/avatars/550e84.../LCbh2nD.jpg"
      }

6. FRONTEND
   ├─ Recebe JSON com nova URL
   ├─ Atualiza atributo src da img
   ├─ Atualiza UI se necessário
   └─ Mostra mensagem de sucesso
```

---

## 🔄 FLUXO DE ACESSO (GET)

Depois de fazer upload, frontend acessa avatar via URL pública:

```
Frontend: GET http://localhost/storage/avatars/{user_id}/{filename}.jpg
                                       ↓ (symlink)
Web Server (Apache/Nginx):    public/storage/avatars/...
                                       ↓
Sistema Operativo:           /var/www/laravel/storage/app/public/avatars/...
                                       ↓
Arquivo físico retornado para o browser
                                       ↓
Browser exibe em <img src="...">
```

---

## ⚠️ PONTOS IMPORTANTES

### 1. **FormData é Necessário**
```javascript
// ❌ ERRADO - JSON simples
fetch('/api/profile/avatar', {
    body: JSON.stringify({ avatar: file })  // Não funciona!
});

// ✅ CERTO - FormData
const formData = new FormData();
formData.append('avatar', file);
fetch('/api/profile/avatar', {
    body: formData  // Funciona!
});
```

### 2. **Não Adicionar Content-Type Manual**
```javascript
// ❌ ERRADO
headers: {
    'Content-Type': 'multipart/form-data'  // Não faça isso!
}

// ✅ CERTO - Deixar browser adicionar automaticamente
headers: {
    'Authorization': `Bearer ${token}`
    // Sem Content-Type! Browser adiciona com boundary correto
}
```

### 3. **Token de Autenticação é OBRIGATÓRIO**
```javascript
// ❌ ERRADO - Sem token
fetch('/api/profile/avatar', { body: formData });
// Retorna: 401 Unauthenticated

// ✅ CERTO - Com token
fetch('/api/profile/avatar', {
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: formData
});
// Retorna: 200 OK
```

### 4. **Symlink Deve Existir**
```bash
# Se receber erro "arquivo não encontrado"
# Execute no servidor:
php artisan storage:link

# Isso cria: public/storage → storage/app/public
```

---

## 📊 TABELA COMPARATIVA: Métodos de Upload

| Método | Pros | Cons |
|--------|------|------|
| **Fetch API** | Nativo (sem deps), moderno | Um pouco verboso |
| **Axios** | Simples, interceptadores | Dependência extra |
| **jQuery.ajax** | Compatível | Obsoleto |
| **Plugins** (Dropzone, Filepond) | UX melhor, drag-drop | Mais pesado |

**Recomendação:** Fetch API (nativo, moderno, sem deps)

---

## 🧪 TESTE COM cURL

```bash
# 1. Login (obter token)
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Resposta:
# {"message":"Login successful.","token":"abc123xyz...","user":{...}}

# 2. Upload avatar
curl -X POST http://localhost/api/profile/avatar \
  -H "Authorization: Bearer abc123xyz..." \
  -F "avatar=@/path/to/photo.jpg"

# Resposta:
# {
#   "message":"Avatar uploaded successfully.",
#   "avatar_url":"http://localhost/storage/avatars/550e84.../LCbh2nD.jpg"
# }

# 3. Verificar no browser
# Abrir: http://localhost/storage/avatars/550e84.../LCbh2nD.jpg
# Deve mostrar a imagem
```

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "File not found" (404)
```
Causa: Symlink não criado
Solução: php artisan storage:link
```

### Problema 2: "Maximum file size exceeded"
```
Causa: Arquivo > 5MB
Solução: Comprimir imagem antes de enviar
```

### Problema 3: "The avatar field must be an image"
```
Causa: Formato não suportado ou arquivo corrompido
Solução: Usar apenas JPEG, PNG, GIF, WebP
```

### Problema 4: "Unauthenticated"
```
Causa: Token ausente ou inválido
Solução: Incluir header Authorization com token válido
```

### Problema 5: URL retornada não funciona
```
Causa: Servidor é HTTPS mas backend é HTTP
Solução: Configurar APP_URL no .env com protocolo correto
```

---

## 📐 DIAGRAMA DE FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. User seleciona arquivo via <input type="file" />      │  │
│  │ 2. JavaScript lê File object                            │  │
│  │ 3. Cria FormData                                        │  │
│  │ 4. Fetch POST com token no header                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓ HTTP POST                          │
│                 /api/profile/avatar (multipart)                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Middleware: Valida token                             │  │
│  │    ├─ Token inválido? → 401                             │  │
│  │    └─ OK? Continua                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. ProfileController@updateAvatar                        │  │
│  │    ├─ Validar arquivo                                   │  │
│  │    │  ├─ Tipo correto? ✓                               │  │
│  │    │  ├─ Tamanho ≤ 5MB? ✓                              │  │
│  │    │  └─ Se falha → 422                                 │  │
│  │    │                                                     │  │
│  │    ├─ Deletar avatar antigo (se existir)               │  │
│  │    │  └─ storage/app/public/avatars/{old}/...          │  │
│  │    │                                                     │  │
│  │    ├─ Salvar novo arquivo                              │  │
│  │    │  ├─ store("avatars/{user_id}", 'public')          │  │
│  │    │  └─ path: "avatars/{id}/LCbh2nD.jpg"              │  │
│  │    │                                                     │  │
│  │    ├─ Gerar URL pública                                │  │
│  │    │  └─ url: "http://localhost/storage/avatars/..."   │  │
│  │    │                                                     │  │
│  │    └─ Atualizar BD (user_profiles.avatar_url)          │  │
│  │       └─ UPDATE user_profiles SET avatar_url = url      │  │
│  │                                                          │  │
│  │ 3. Retornar JSON com 200 OK                             │  │
│  │    └─ { message: "...", avatar_url: "http://..." }     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓ HTTP 200 JSON
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Parse JSON response                                  │  │
│  │ 2. Extrair nova avatar_url                              │  │
│  │ 3. Atualizar img.src = avatar_url                       │  │
│  │ 4. Browser carrega nova imagem                          │  │
│  │    ├─ GET http://localhost/storage/avatars/.../X.jpg   │  │
│  │    ├─ Symlink mapeia para storage/app/public/...       │  │
│  │    └─ Arquivo retornado ao browser                     │  │
│  │ 5. <img> exibe nova imagem                              │  │
│  │ 6. Mostrar mensagem "Avatar atualizado!"                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST PARA IMPLEMENTAR NO FRONTEND

- [ ] Input file para selecionar imagem
- [ ] Button para disparar upload
- [ ] Validar tipo de arquivo (JPEG/PNG/GIF/WebP)
- [ ] Validar tamanho (máx 5MB)
- [ ] Mostrar loading durante upload
- [ ] Capturar token do localStorage/sessionStorage
- [ ] Fazer POST para /api/profile/avatar com FormData
- [ ] Incluir header Authorization com token
- [ ] Atualizar img.src com avatar_url retornado
- [ ] Mostrar mensagem de sucesso
- [ ] Tratar erros e mostrar mensagens
- [ ] Limpar input file após upload bem-sucedido

---

## 📚 REFERÊNCIAS

- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Laravel: File Storage](https://laravel.com/docs/11.x/filesystem)
- [Laravel: Validation File](https://laravel.com/docs/11.x/validation#available-validation-rules)

---

**Última Atualização:** 02/06/2026  
**Próxima Revisão:** Após implementação no frontend
