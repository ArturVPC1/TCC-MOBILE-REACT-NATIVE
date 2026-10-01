# SONATA Mobile — Plano de hospedagem e banco (fase protótipo)

## Decisão resumida

| Item | Escolha | Custo | Por quê |
|---|---|---|---|
| Front | Expo Web (`expo export`) na **Vercel** (ou Netlify) | R$ 0 | O mesmo código React Native vira um site; a banca abre o link no celular ou no navegador, sem loja de apps |
| Banco (agora) | **Mock local** (AsyncStorage, vira `localStorage` na web) | R$ 0 | Zero infraestrutura; os dados persistem no navegador de quem testa |
| Banco (próxima fase) | **Supabase** (Postgres gerenciado) | R$ 0 no plano gratuito | Não exige criar API; o app fala direto com o banco |

> [!info] Limitação do mock
> Cada navegador tem seus próprios dados. O que um avaliador matricula não aparece para outro. Para um protótipo de TCC isso costuma bastar; se precisar de dados compartilhados, siga a seção "Migrar para Supabase".

## 1. Publicar o front na Vercel

Pré-requisitos:

- [ ] Node 20+ instalado
- [ ] Conta gratuita na Vercel (login com GitHub)
- [ ] Projeto em um repositório no GitHub

Passos:

1. Validar localmente (equivale a um "dry run" antes de publicar):
   ```bash
   npm install
   npm run typecheck
   npm run build:web      # gera a pasta dist/
   npx serve -s dist      # abrir http://localhost:3000 e testar o login
   ```
2. Subir o código para o GitHub (sem `node_modules` e sem `dist`; o `.gitignore` já cobre).
3. Na Vercel: **Add New → Project → Import** o repositório.
4. Conferir os campos (já vêm do `vercel.json` do projeto):
   - Build Command: `npx expo export --platform web`
   - Output Directory: `dist`
5. Clicar em **Deploy**. Em cerca de 2 minutos sai o link `https://<projeto>.vercel.app`.
6. A cada `git push` na branch principal, a Vercel republica sozinha.

Alternativa sem GitHub: `npm i -g vercel && vercel --prod` dentro da pasta do projeto.

Netlify também funciona: o `netlify.toml` está pronto (importar o repositório e publicar).

Teste final: abrir o link no celular, entrar com `admin@exemplo.com` / `admin123`, matricular um aluno e conferir se ele aparece na lista e no Dashboard.

## 2. Banco de dados

### Agora: mock local

Tudo passa por `src/data/repository.ts` (alunos e estatísticas) e `src/data/auth.tsx` (sessão). Os dados iniciais ficam em `src/data/seed.ts`. Nenhuma tela conhece o armazenamento, só o repositório.

### Depois: migrar para Supabase (quando precisar compartilhar dados)

1. Criar projeto em supabase.com (plano Free) e anotar `Project URL` e `anon key`.
2. No **SQL Editor**, criar a tabela:
   ```sql
   create table students (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     email text not null,
     phone text not null,
     birth_date date not null,
     instrument text not null,
     guardian text,
     notes text,
     status text not null default 'ativo' check (status in ('ativo','inativo')),
     created_at timestamptz not null default now()
   );
   alter table students enable row level security;
   create policy "admin autenticado" on students
     for all to authenticated using (true) with check (true);
   ```
3. Em **Authentication → Users**, criar o usuário administrador.
4. `npm i @supabase/supabase-js` e definir `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (também em Vercel → Settings → Environment Variables).
5. Reescrever só o corpo das funções de `repository.ts` (`listStudents`, `createStudent`, `getStats`) com `supabase.from('students')...` e trocar `signIn` em `auth.tsx` por `supabase.auth.signInWithPassword`. As telas não mudam.
6. A chave `anon` é pública por desenho; a segurança vem do RLS (passo 2).

> [!warning] Segurança
> O login do protótipo (`admin@exemplo.com` / `admin123`) está no código e serve só para demonstração. Remova-o ao ligar o Supabase.

## 3. Testar como app nativo (opcional)

- `npx expo start` e abrir no **Expo Go** (iOS/Android) lendo o QR code.
- APK Android para entregar à banca: `npx eas build -p android --profile preview` (conta Expo gratuita).
