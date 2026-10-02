# SONATA Mobile (protótipo)

App React Native (Expo) do perfil Administrador. As 7 telas: Login, Dashboard, Horários, Alunos, Matrícula de aluno, Professores e Cadastro de professor.

```bash
npm install
npm start          # Expo Go / simulador (tecla w abre a versão web)
npm run build:web  # gera dist/ para hospedar
```

Login de demonstração: admin@exemplo.com / 123456. Dados: mock local em `src/data`. Hospedagem e migração para Supabase: `docs/PLANO-HOSPEDAGEM-E-BANCO.md`.

Relógio do protótipo: `src/config.ts` (`NOW_OVERRIDE = '11:20'` deixa a tela Horários igual à especificação; use `null` para o relógio real). `MOCK_EMPTY = true` zera os dados para testar estados vazios.
