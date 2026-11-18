# Portfólio · Ryan Moreira

Meu portfólio pessoal: desenvolvedor full-stack, estudante de Engenharia de Software e explorando IA Generativa com AWS.

🔗 **Acesse:** https://ryanng0104.github.io/portfolio/

## Design

Linguagem visual inspirada em sites automotivos de luxo, em roxo, preto e branco:
tipografia larga em caixa alta (Archivo Expanded), seções em tela cheia e muito respiro.

Dois temas, alternados pelo botão na barra do topo: **claro** (branco + roxo) e **escuro** (preto + roxo).
O tema inicial segue a preferência do sistema e a escolha fica salva no navegador.

## Seções

- **Hero**: apresentação em tela cheia com traçado de pista animado
- **Ficha técnica**: números principais (o total de repositórios vem da API do GitHub)
- **01 · Perfil**: quem sou e no que estou focado
- **02 · Carreira**: Itpower Software e formação
- **03 · Tecnologias**: stack por categoria
- **04 · A coleção**: projetos em destaque (carrossel) e outros repositórios
- **05 · Contato**: e-mail, LinkedIn e GitHub

## Tecnologias

HTML, CSS e JavaScript puros. Sem dependências e sem build. Inclui:

- Menu em tela cheia e navbar que muda de transparente para sólida
- Carrossel com setas, teclado, swipe e barra de progresso
- Layout responsivo
- Animações de entrada que respeitam `prefers-reduced-motion`
- Dados atualizados automaticamente pela API pública do GitHub

## Rodando localmente

Basta abrir o `index.html` no navegador, ou usar um servidor simples:

```bash
npx serve .
```

## Estrutura

```
portfolio/
├── index.html
├── css/style.css
├── js/main.js
└── assets/favicon.svg
```

---

Feito por [Ryan Moreira](https://github.com/RyanNG0104).
