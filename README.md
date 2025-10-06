# ⚡ Acchio

Um cliente HTTP elegante e poderoso para **Node.js** e **browsers**, inspirado no **Axios**, mas com uma pitada de **magia! ✨**

![npm](https://img.shields.io/npm/v/acchio)
![downloads](https://img.shields.io/npm/dm/acchio)
![license](https://img.shields.io/npm/l/acchio)

---

## 🚀 Instalação

```bash
# npm
npm install acchio

# yarn
yarn add acchio

# pnpm
pnpm add acchio

```

💡 Por que Acchio?
✅ Tipagem completa com TypeScript
✅ Universal — funciona no Node.js e browsers
✅ Interceptores poderosos
✅ Cancelamento de requests
✅ Leve e zero dependências
✅ API familiar estilo Axios

### 🎯 Uso Básico

```
import acchio from 'acchio';

// GET simples
const response = await acchio.get('https://api.example.com/users');
console.log(response.data);

// POST com dados
const user = await acchio.post('https://api.example.com/users', {
  name: 'João',
  email: 'joao@example.com'
});

// PUT para atualizar
await acchio.put('https://api.example.com/users/1', {
  name: 'João Silva'
});
```

# 🔧 Exemplos Práticos

### 🎨 Interceptores

```
// Adicionar token de autenticação
acchio.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

// Tratar erros globalmente
acchio.interceptors.response.use(
  response => response,
  error => {
    console.error('😵 Ops! Algo deu errado:', error);
    return Promise.reject(error);
  }
);
```

### 🎪 Cancelamento de Requests

```
const source = acchio.CancelToken.source();

// Fazer request com possibilidade de cancelar
acchio.get('/api/data', {
  cancelToken: source.token
});

// Cancelar quando quiser!
source.cancel('Usuário cancelou a requisição');
```

### 🎭 Diferentes Ambientes

#### Node.js:

```
import acchio from 'acchio';

const response = await acchio.get('https://api.github.com/users');
```

#### React:

```
import { useEffect, useState } from 'react';
import acchio from 'acchio';

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    acchio.get('/api/users').then(response => {
      setUsers(response.data);
    });
  }, []);

  return <div>{/* render users */}</div>;
}
```

### 🎨 Configuração Global

```
import acchio from 'acchio';

// Configurar instância global
acchio.defaults.baseURL = 'https://api.meusite.com';
acchio.defaults.timeout = 5000;
acchio.defaults.headers.common['X-Requested-With'] = 'Acchio';

// Ou criar instância customizada
const api = acchio.create({
  baseURL: 'https://api.empresa.com',
  timeout: 10000
});
```

### 🚦 Todos os Métodos HTTP

```
// GET - Buscar dados
acchio.get('/users')

// POST - Criar novo
acchio.post('/users', { name: 'Maria' })

// PUT - Atualizar completo
acchio.put('/users/1', { name: 'Maria Silva' })

// PATCH - Atualizar parcial
acchio.patch('/users/1', { name: 'Maria' })

// DELETE - Remover
acchio.delete('/users/1')

// HEAD - Apenas cabeçalhos
acchio.head('/users')

// OPTIONS - Ver opções
acchio.options('/users')
```

### 🎪 Tipagem com TypeScript

```
import acchio from 'acchio';

// Defina a interface dos seus dados
interface User {
  id: number;
  name: string;
  email: string;
}

// Use a tipagem!
const response = await acchio.get<User[]>('/api/users');
const users: User[] = response.data; // ✅ Totalmente tipado!

// Request tipado
await acchio.post<User>('/api/users', {
  name: 'Pedro',
  email: 'pedro@exemplo.com'
  // age: 25        // ❌ Erro TypeScript!
});
```

### 🎯 Comparação Rápida

| 🧩 **Feature**         | ⚡ **Acchio** | 📦 **Axios** |
| ---------------------- | ------------- | ------------ |
| **Tipagem TypeScript** | ✅ Nativa     | ✅           |
| **Cancelamento**       | ✅            | ✅           |
| **Interceptores**      | ✅            | ✅           |
| **Node.js + Browser**  | ✅            | ✅           |
| **Zero Dependencies**  | ✅            | ❌           |
| **Tamanho**            | 🪶 Leve       | 📦 Médio     |

### 🚨 Tratamento de Erros

```
try {
  const response = await acchio.get('/api/data');
} catch (error) {
  if (acchio.isCancel(error)) {
    console.log('🎭 Request cancelado:', error.message);
  } else if (error.response) {
    console.log('😵 Status:', error.response.status);
    console.log('📝 Dados:', error.response.data);
  } else if (error.request) {
    console.log('🌐 Sem resposta do servidor');
  } else {
    console.log('⚙️ Erro de configuração:', error.message);
  }
}
```

### 🎪 Desempenho

Acchio é otimizado para ser rápido e eficiente:

📦 Bundle menor que alternativas populares

🧠 Alocação mínima de memória

⚡ Cache inteligente de adapters

📄 Licença
MIT — Use livremente! 🎉

### 🎊 Agradecimentos

Obrigado por usar Acchio!

“Porque requests HTTP deveriam ser mágicos, não complicados!” 🎩✨
