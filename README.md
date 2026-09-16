# Mestre da Mina ⛏️

Jogo mobile de mineração idle, fortemente inspirado em **Keep on Mining!** (Steam). Construído com Expo + React Native + TypeScript.

## Como jogar

- **Mina**: toque nos blocos para quebrá-los com sua picareta e conseguir ouro, minérios e gemas. Ao limpar toda a camada visível, você desce automaticamente para uma profundidade maior, com blocos mais resistentes e minérios mais raros e valiosos.
- **Loja**: compre picaretas cada vez mais poderosas (madeira → pedra → cobre → ferro → aço → prata → ouro → diamante → obsidiana → mythril → ancestral) e drones automáticos que continuam minerando sozinhos.
- **Melhorias**: invista ouro em quatro árvores de melhorias permanentes:
  - 💪 **Força de Mineração** — aumenta o dano por toque.
  - 🍀 **Sorte do Minerador** — aumenta a chance de achar minérios raros e gemas.
  - 💰 **Fortuna** — aumenta o ouro recebido ao vender minérios.
  - ⚡ **Robótica** — acelera os drones automáticos.
- **Ascender**: ao atingir 100m de profundidade, você pode voltar à superfície em troca de **Relíquias** permanentes, que dão um bônus fixo de ouro e poder de mineração em todas as próximas rodadas — reiniciando picareta, melhorias e drones para um novo ciclo mais forte.

## Minérios

Do mais comum ao mais raro: Terra, Pedra, Carvão, Cobre, Ferro, Prata, Ouro, Esmeralda 💚, Rubi ❤️, Safira 💙, Diamante 💎, Obsidiana, Mythril, Ametista 💜 e o lendário Núcleo de Cristal ✨.

## Rodando o projeto

```bash
npm install
npm run start   # abre o Metro/Expo Dev Tools
npm run android # ou npm run ios / npm run web
```

O progresso é salvo automaticamente no dispositivo (AsyncStorage).

## Estrutura

```
src/
  types.ts            tipos principais do jogo
  theme.ts             paleta de cores
  data/                definições estáticas (minérios, picaretas, melhorias, drones, prestígio)
  state/gameStore.ts   store zustand com toda a lógica e persistência
  utils/               formatação de números e geração aleatória ponderada
  components/          blocos, grade, HUD, cartões de loja/melhorias, barra de abas
  screens/             Mina, Loja, Melhorias, Ascensão
```
