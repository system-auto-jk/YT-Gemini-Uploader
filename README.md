# YT Gemini Uploader

Aplicacao web em Next.js para enviar videos ao YouTube com metadados gerados por IA. O projeto conecta uma conta Google via OAuth2, recebe arquivos de video, usa Gemini para sugerir titulo/descricao/tags/capitulos e publica o video no YouTube por uma fila BullMQ com Redis.

> Projeto MVP/didatico. Antes de usar em producao, revise autenticacao, autorizacao, armazenamento de arquivos, limites de upload, logs, tratamento de erros e seguranca das credenciais.

## Funcionalidades

- Login com Google OAuth2.
- Upload local de arquivos de video.
- Cadastro do video no banco via Prisma.
- Processamento em fila com BullMQ e Redis.
- Leitura tecnica do arquivo com FFprobe.
- Geracao de metadados com Google Gemini.
- Publicacao no YouTube usando YouTube Data API v3.
- Suporte a visibilidade `PRIVATE`, `UNLISTED` e `PUBLIC`.
- Dashboard simples com os ultimos envios e status.

## Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite por padrao
- BullMQ
- Redis
- Google OAuth2
- YouTube Data API v3
- Google Gemini API
- FFmpeg/FFprobe

## Como o sistema funciona

1. O usuario acessa a aplicacao e clica em **Conectar Google**.
2. O Google retorna para `/api/auth/callback` com o codigo OAuth.
3. A aplicacao salva os tokens do usuario no banco.
4. O usuario envia um arquivo pela tela `/videos/new`.
5. O arquivo e salvo em `uploads/<userId>/`.
6. Um registro `Video` e criado no Prisma.
7. Um job `process` e enviado para a fila `videoQueue`.
8. O worker usa FFprobe para ler informacoes tecnicas do video.
9. O usuario envia um brief para o Gemini gerar metadados.
10. Ao publicar, a API salva os metadados e enfileira o job `upload`.
11. O worker faz upload do arquivo no YouTube e atualiza o status.

## Estrutura do projeto

```txt
.
+-- prisma/
|   `-- schema.prisma
+-- public/
|   `-- logo.svg
+-- src/
|   +-- app/
|   |   +-- api/
|   |   |   +-- auth/
|   |   |   +-- gemini/
|   |   |   +-- upload/
|   |   |   `-- youtube/
|   |   +-- dashboard/
|   |   +-- videos/new/
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   `-- page.tsx
|   +-- jobs/
|   |   +-- index.ts
|   |   +-- videoProcess.ts
|   |   `-- youtubeUpload.ts
|   `-- lib/
|       +-- auth.ts
|       +-- bull.ts
|       +-- ffmpeg.ts
|       +-- gemini.ts
|       +-- logger.ts
|       +-- prisma.ts
|       `-- youtube.ts
+-- .env.example
+-- next.config.js
+-- package.json
+-- tailwind.config.ts
`-- tsconfig.json
```

## Pre-requisitos

- Node.js 20 ou superior recomendado.
- npm.
- Redis local ou remoto.
- FFmpeg e FFprobe instalados e disponiveis no PATH.
- Projeto no Google Cloud com OAuth2 configurado.
- YouTube Data API v3 habilitada.
- Chave de API do Google Gemini.

## Configuracao do Google Cloud

1. Crie um projeto no Google Cloud Console.
2. Ative a **YouTube Data API v3**.
3. Configure a tela de consentimento OAuth.
4. Crie uma credencial OAuth do tipo **Web application**.
5. Adicione a URL de callback:

```txt
http://localhost:3000/api/auth/callback
```

6. Copie o `Client ID` e o `Client Secret` para o arquivo `.env`.

## Variaveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Exemplo:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=supersecretlocal

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

YOUTUBE_API_KEY=

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-pro-exp-02-05

REDIS_URL=redis://localhost:6379

FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe

DATABASE_URL=file:./dev.db
```

## Instalacao

Instale as dependencias:

```bash
npm install
```

Gere o Prisma Client e aplique a migracao local:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Suba um Redis local com Docker:

```bash
docker run --name yt-gemini-redis -p 6379:6379 redis:7-alpine
```

## Executando em desenvolvimento

Em um terminal, execute a aplicacao:

```bash
npm run dev
```

Em outro terminal, execute o worker da fila:

```bash
npm run worker
```

Acesse:

```txt
http://localhost:3000
```

## Scripts

| Script | Descricao |
| --- | --- |
| `npm run dev` | Inicia o Next.js em modo desenvolvimento. |
| `npm run build` | Gera o build de producao. |
| `npm run start` | Inicia a aplicacao com o build de producao. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa migracoes Prisma em desenvolvimento. |
| `npm run worker` | Inicia o worker BullMQ para processar e publicar videos. |

## Rotas principais

### Paginas

| Rota | Descricao |
| --- | --- |
| `/` | Tela inicial. |
| `/dashboard` | Lista os ultimos videos cadastrados. |
| `/videos/new` | Tela para upload, geracao de metadados e publicacao. |

### API

| Rota | Metodo | Descricao |
| --- | --- | --- |
| `/api/auth/login` | `GET` | Redireciona para login OAuth do Google. |
| `/api/auth/callback` | `GET` | Recebe o callback OAuth e salva tokens. |
| `/api/upload/initiate` | `POST` | Recebe o arquivo de video e cria o registro no banco. |
| `/api/gemini/suggest` | `POST` | Gera metadados de YouTube com Gemini. |
| `/api/youtube/publish` | `POST` | Salva metadados e enfileira o upload para o YouTube. |
| `/api/youtube/thumbnail` | `POST` | Endpoint placeholder para futura associacao de thumbnail. |

## Modelo de dados

O Prisma define tres entidades principais:

- `User`: usuario autenticado via Google, com tokens OAuth.
- `Video`: arquivo enviado, metadados, status e ID do video no YouTube.
- `Log`: eventos registrados durante processamento e upload.

Status possiveis do video:

- `DRAFT`
- `QUEUED`
- `PROCESSING`
- `UPLOADING`
- `PUBLISHED`
- `FAILED`

## Fluxo de publicacao

1. Acesse `/api/auth/login` pelo botao **Conectar Google**.
2. Apos autenticar, va para `/videos/new`.
3. Selecione um arquivo de video.
4. Clique em **Enviar arquivo**.
5. Escreva um brief para a IA.
6. Clique em **Gerar metadados com Gemini**.
7. Revise os dados sugeridos.
8. Clique em **Publicar no YouTube**.
9. Acompanhe o status em `/dashboard`.

## Observacoes importantes

- Os videos sao armazenados localmente na pasta `uploads/`, criada em tempo de execucao.
- O cookie `uid` e usado para identificar o usuario autenticado neste MVP.
- Os tokens OAuth sao armazenados no banco como JSON.
- O upload para o YouTube acontece no worker, nao diretamente na rota HTTP.
- O endpoint de thumbnail ainda e um placeholder.
- O dashboard atual lista os ultimos videos sem filtro forte por usuario.
- Para producao, use armazenamento externo para videos, como S3, GCS ou equivalente.
- Para producao, criptografe tokens e implemente sessoes robustas.

## Solucao de problemas

### Redis nao conecta

Confira se o Redis esta rodando e se `REDIS_URL` aponta para a instancia correta:

```bash
docker ps
```

### FFprobe nao encontrado

Instale FFmpeg e configure `FFPROBE_PATH` no `.env`. Em muitos sistemas, basta deixar:

```env
FFPROBE_PATH=ffprobe
```

### Callback OAuth invalido

Garanta que `GOOGLE_REDIRECT_URI` no `.env` seja exatamente igual ao redirect URI configurado no Google Cloud.

### Gemini retorna texto em vez de JSON

O codigo tenta converter a resposta para JSON. Se o modelo responder fora do formato esperado, a API retorna o campo `raw`. Ajuste o prompt ou trate esse retorno na interface.

## Licenca

Defina a licenca antes de publicar o repositorio. Sugestao comum para projetos abertos: MIT.
