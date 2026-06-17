# 📘 Diagrama de Classes — Sistema "Economia com História"

---

## 🧱 Classes do Sistema

### 👤 User

* id: int
* nome: string
* email: string

---

### 🏷️ Tema

* id: int
* nome: string
* descricao: string

---

### 📚 Conteudo

* id: int
* titulo: string
* tipo: string (video, texto, podcast)

---

### 💬 Comentario

* id: int
* texto: string
* data: datetime

---

### 🧠 Quiz

* id: int
* titulo: string

---

### ❓ Pergunta

* id: int
* enunciado: string

---

### 🔘 Opcao

* id: int
* texto: string
* correta: bool

---

### 🎯 QuizAttempt

* id: int
* data_inicio: datetime
* data_fim: datetime

---

### 🧾 RespostaUser

* id: int
* correta: bool

---

### 🏆 Resultado

* pontuacao: int
* total_perguntas: int

---

### 🗣️ Topico

* id: int
* titulo: string
* descricao: string
* data: datetime

---

### 💬 RespostaTopico

* id: int
* texto: string
* data: datetime

---

## 🔗 Relacionamentos

### 📌 Tema

* Tema 1 → N Conteudo
* Tema 1 → N Quiz
* Tema 1 → N Pergunta
* Tema 1 → N Topico

---

### 👤 User

* User 1 → N Comentario
* User 1 → N Topico
* User 1 → N RespostaTopico
* User 1 → N QuizAttempt

---

### 📚 Conteudo

* Conteudo 1 → N Comentario

---

### 🧠 Quiz

* Quiz 1 → N Pergunta
* Pergunta 1 → N Opcao
* Quiz 1 → N QuizAttempt

---

### 🎯 Execução do Quiz

* QuizAttempt 1 → N RespostaUser
* Pergunta 1 → N RespostaUser
* Opcao 1 → N RespostaUser
* QuizAttempt 1 → 1 Resultado

---

### 🗣️ Fórum

* Topico 1 → N RespostaTopico

---

## 🧭 Estrutura Geral

```
User
 ├── Conteudo → Comentario
 ├── Quiz → Pergunta → Opcao → RespostaUser → Resultado
 ├── Forum → Topico → RespostaTopico
 └── Tema (organiza tudo)
```

---

## 🎯 Observações de Design

* O sistema é modular e escalável
* O Quiz é apenas um dos componentes
* A classe Tema organiza conteúdos, quizzes e discussões
* Não foi utilizada herança desnecessária (ex: Publicacao)

---