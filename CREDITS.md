# Créditos dos assets

Este jogo usa assets de terceiros, todos com licenças livres. Abaixo estão a origem e a
licença de cada um, conforme exigido por elas.

## Ícones — game-icons.net

- **O quê:** os 46 ícones vetoriais usados nos minérios, picaretas, drones, melhorias,
  poderes de gema, impulsos, HUD e barra de abas.
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
- **Obra derivada:** os 16 ícones que a grade da mina desenha (os 15 minérios e a picareta)
  também são distribuídos como PNG em `assets/sprites/`, gerados a partir dos mesmos
  vetores por `scripts/render-sprites.mjs` — é só uma rasterização, sem alteração de
  desenho, feita por desempenho (a grade monta 70 ícones e reprocessar os vetores a cada
  camada custa quadros). A CC BY 3.0 permite obras derivadas mediante crédito, que é o que
  esta seção faz.

## Áudio de mineração — Minetest Game

- **O quê:** os 20 arquivos em `assets/sfx/mining/` — as batidas da picareta e as quebras de
  bloco, separadas por material (terra, pedra, metal e cristal), com variações para que a
  mesma amostra não se repita seguidamente.
- **Origem:** mod `default` do [Minetest Game](https://github.com/luanti-org/minetest_game),
  copiados **sem modificação** (apenas renomeados).
- **Licença:** o `mods/default/license.txt` do projeto lista as mídias em três blocos —
  CC BY-SA 3.0, CC BY 3.0 e CC0 1.0 — sem mapear arquivo a arquivo. Por isso estes arquivos
  são tratados aqui pelo mais restritivo, a
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/): crédito abaixo, link para a
  licença e nenhuma alteração feita nos áudios.
- **Autores (lista completa do projeto):** celeron55 (Perttu Ahola), Cisoun, G4JC, VanessaE,
  RealBadAngel, Calinou, MirceaKitsune, Jordach, PilzAdam, jojoa1997, InfinityProject,
  Splizard, Zeg9, paramat, BlockMen, sofar, Neuromancer, Gambit, asl97, KevDoy, Mito551,
  GreenXenith, kaeza, kilbith, tobyplowy, CloudyProton, TumeniNodes, Mossmanikin,
  random-geek, Extex101, Lopano, An0n3m0us; e, nos blocos CC BY 3.0 / CC0: cmusounddesign,
  Tomlija, lsprice, sonictechtonic, yadronoff, HerbertBoland, AGFX, Iwan Gabovitch,
  Ottomaani138, Ogrebane, blukotek, Sevin7, Yoyodaman234, Ryding.

| Arquivo no jogo | Arquivo original |
| --- | --- |
| `dig_soil_1.ogg` | `default_dig_crumbly.ogg` |
| `dig_soil_2.ogg` / `dig_soil_3.ogg` | `default_gravel_dig.1.ogg` / `.2.ogg` |
| `dig_stone_1..3.ogg` | `default_dig_cracky.1..3.ogg` |
| `dig_metal_1.ogg` | `default_dig_metal.ogg` |
| `dig_crystal_1..3.ogg` | `default_ice_dig.1..3.ogg` |
| `break_soil_1..3.ogg` | `default_gravel_dug.1..3.ogg` |
| `break_stone_1..2.ogg` | `default_dug_node.1..2.ogg` |
| `break_metal_1..2.ogg` | `default_dug_metal.1..2.ogg` |
| `break_crystal_1.ogg` | `default_ice_dug.ogg` |
| `break_crystal_2.ogg` | `default_break_glass.3.ogg` |
| `crit.ogg` | `default_break_glass.1.ogg` |

## Áudio de interface — Kenney

- **O quê:** os quatro efeitos restantes em `assets/sfx/` (moedas ao vender, compra,
  ascensão e descida de camada).
- **Origem:** starter kits oficiais do Kenney no GitHub
  ([Starter-Kit-3D-Platformer](https://github.com/KenneyNL/Starter-Kit-3D-Platformer) e
  [Starter-Kit-City-Builder](https://github.com/KenneyNL/Starter-Kit-City-Builder)).
- **Licença:** MIT — Copyright (c) 2023 Kenney ([kenney.nl](https://kenney.nl)).

| Arquivo no jogo | Arquivo original | Kit de origem |
| --- | --- | --- |
| `coin.ogg` | `coin.ogg` | Starter-Kit-3D-Platformer |
| `purchase.ogg` | `placement-a.ogg` | Starter-Kit-City-Builder |
| `ascend.ogg` | `jump.ogg` | Starter-Kit-3D-Platformer |
| `descend.ogg` | `fall.ogg` | Starter-Kit-3D-Platformer |

## Fonte — Lilita One

- **O quê:** `assets/fonts/LilitaOne-Regular.ttf`, usada nos números, títulos e botões.
- **Origem:** distribuída junto aos starter kits do Kenney; criada por Juan Montoreano.
- **Licença:** [SIL Open Font License 1.1](https://scripts.sil.org/OFL).
