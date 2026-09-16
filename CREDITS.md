# Créditos dos assets

Este jogo usa assets de terceiros, todos com licenças livres. Abaixo estão a origem e a
licença de cada um, conforme exigido por elas.

## Ícones — game-icons.net

- **O quê:** os 35 ícones vetoriais usados nos minérios, picaretas, drones, melhorias,
  impulsos, HUD e barra de abas.
- **Origem:** [game-icons.net](https://game-icons.net), obtidos via o pacote npm
  [`@iconify-json/game-icons`](https://www.npmjs.com/package/@iconify-json/game-icons)
  (repositório: https://github.com/game-icons/icons).
- **Licença:** [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) — uso livre,
  inclusive comercial, **desde que os autores sejam creditados** (é o que este arquivo faz).
- **Autores:** o acervo do game-icons.net é coletivo, com destaque para Lorc, Delapouite,
  John Colburn, Felbrigg, John Redman, Carl Olsen, Sbed, PriorBlue, Willdabeast, Viscious
  Speed, Lord Berandas, Irongamer, HeavenlyDog, Lucas, Faithtoken, Skoll, Andy Meneely,
  Cathelineau, Kier Heyl, Aussiesim, Sparker, Zeromancer, Rihlsul, Quoting, Guard13007,
  DarkZaitzev, SpencerDub, GeneralAce135, Zajkonur, Catsu, Starseeker, Pepijn Poolman,
  Pierre Leducq e Caro Asercion.
- **Como foram incluídos:** `scripts/extract-icons.mjs` copia apenas os ícones usados para
  `src/assets/gameIcons.ts`. Rode `node scripts/extract-icons.mjs` para regenerar.

## Áudio — Kenney

- **O quê:** os oito efeitos sonoros em `assets/sfx/` (batida, quebra, crítico, moedas,
  compra, ascensão, descida e clique de aba).
- **Origem:** starter kits oficiais do Kenney no GitHub
  ([Starter-Kit-3D-Platformer](https://github.com/KenneyNL/Starter-Kit-3D-Platformer),
  [Starter-Kit-City-Builder](https://github.com/KenneyNL/Starter-Kit-City-Builder) e
  [Starter-Kit-FPS](https://github.com/KenneyNL/Starter-Kit-FPS)).
- **Licença:** MIT — Copyright (c) 2023 Kenney ([kenney.nl](https://kenney.nl)).

| Arquivo no jogo | Arquivo original | Kit de origem |
| --- | --- | --- |
| `tap.ogg` | `removal-a.ogg` | Starter-Kit-City-Builder |
| `break.ogg` | `break.ogg` | Starter-Kit-3D-Platformer |
| `crit.ogg` | `enemy_destroy.ogg` | Starter-Kit-FPS |
| `coin.ogg` | `coin.ogg` | Starter-Kit-3D-Platformer |
| `purchase.ogg` | `placement-a.ogg` | Starter-Kit-City-Builder |
| `ascend.ogg` | `jump.ogg` | Starter-Kit-3D-Platformer |
| `descend.ogg` | `fall.ogg` | Starter-Kit-3D-Platformer |
| `toggle.ogg` | `toggle.ogg` | Starter-Kit-City-Builder |

## Fonte — Lilita One

- **O quê:** `assets/fonts/LilitaOne-Regular.ttf`, usada nos números, títulos e botões.
- **Origem:** distribuída junto aos starter kits do Kenney; criada por Juan Montoreano.
- **Licença:** [SIL Open Font License 1.1](https://scripts.sil.org/OFL).
