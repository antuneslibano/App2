# Mestre da Mina ⛏️

Jogo mobile de mineração idle, fortemente inspirado em **Keep on Mining!** (Steam). Construído com Expo + React Native + TypeScript.

## Como jogar

- **Mina**: segure o dedo na grade. A picareta bate em **todos os blocos dentro do círculo**, não só no que está embaixo do dedo — e cada bloco atingido mostra a picareta batendo nele. O círculo começa pequeno e cresce com as melhorias de raio. Ao limpar toda a camada visível, você desce automaticamente para uma profundidade maior, com blocos mais resistentes e minérios mais raros e valiosos. A faixa acima da grade lista quais minérios ainda estão na camada atual.
- **Loja**: compre picaretas cada vez mais poderosas (madeira → pedra → cobre → ferro → aço → prata → ouro → diamante → obsidiana → mythril → ancestral) e drones automáticos que continuam minerando sozinhos.
- **Melhorias**: invista ouro nas árvores de melhorias da rodada — Força de Mineração, **Raio de Impacto** (tamanho do círculo), Sorte do Minerador, Fortuna, Robótica, Mochila Reforçada e Vendedor Automático.
- **Gemas**: a moeda premium, encontrada ao quebrar minérios de gema. Diferente do ouro, **gemas e tudo que é comprado com elas sobrevivem à ascensão**:
  - **Núcleo Titã** (+35% de poder por nível) e **Selo do Magnata** (+35% de ouro por nível);
  - **Onda de Choque** — raio de mineração permanente;
  - **Enxame de Drones** — multiplica o dano de todos os drones;
  - **Olho do Garimpeiro** — mais gemas por minério de gema;
  - **Cofre Temporal** — mais horas de ganho offline;
  - **Relíquia Instantânea** — compre uma Relíquia sem precisar ascender;
  - além dos impulsos temporários.
- **Ascender**: ao atingir 10.000m de profundidade, você pode voltar à superfície em troca de **Relíquias** permanentes, que dão um bônus fixo de ouro e poder de mineração em todas as próximas rodadas — reiniciando picareta, melhorias de ouro e drones para um novo ciclo mais forte. Gemas nunca são perdidas.

## Minérios

Do mais comum ao mais raro: Terra, Pedra, Carvão, Cobre, Ferro, Prata, Ouro, Esmeralda 💚, Rubi ❤️, Safira 💙, Diamante 💎, Obsidiana, Mythril, Ametista 💜 e o lendário Núcleo de Cristal ✨.

## Rodando o projeto

```bash
npm install
npm run start   # abre o Metro/Expo Dev Tools
npm run android # ou npm run ios / npm run web
```

O progresso é salvo automaticamente no dispositivo (AsyncStorage).

## Assets

Ícones do [game-icons.net](https://game-icons.net) (CC BY 3.0), sons de mineração do
[Minetest Game](https://github.com/luanti-org/minetest_game) (CC BY-SA 3.0), sons de
interface e fonte do [Kenney](https://kenney.nl) (MIT / SIL OFL). Os créditos completos, exigidos pelas licenças,
estão em [CREDITS.md](CREDITS.md).

## Estrutura

```
src/
  types.ts            tipos principais do jogo
  theme.ts             paleta de cores
  data/                definições estáticas (minérios, picaretas, melhorias, gemas, drones, prestígio)
  state/gameStore.ts   store zustand com toda a lógica e persistência
  utils/               formatação de números, geração aleatória, som e vibração
  assets/gameIcons.ts  ícones vetoriais extraídos do game-icons.net
  components/          blocos, grade, enxame de drones, legenda da camada, HUD, cartões, barra de abas
  screens/             Mina, Loja, Melhorias, Gemas, Ascensão
```
