# Word Game

## Rules

A word appears on the screen, you have to type in a word that uses as many letters from that word as possible, and then a new word will be selected. Any letters from the original word that you did not use in your submission lose a health point. Once a letter has lost all it's health points, you can no longer use it in your submissions. The game ends when you run out of time. Your submission cannot be a subset of the target word, eg; if the target word is "apples" you cannot submit "apple".

## Todo

### 1.0

- [ ] Submission animation
- [ ] Word Change animation
- [x] Dynamic progress bar width based on time remaining
- [x] Show used words
- [ ] Make submission blocks more clear
- [ ] End game screen (score, words used)

### Post 1.0

- [ ] Track longest perfect word streak

## Ideas

- **Multiplayer:** Players take turns submitting words, when a player submits a word it becomes the target word for the other players.
- **Perfect Word Reward:** Give some kind of reward if the player submits a word that uses all the letters in the target word.
- **Learning:** Encourage education by showing definitions of words. After the game we could also show some instances where you took damage and suggest perfect words that used all the letters and show their definitions.

## Word List

To minimize the bundle size we send to the client we minimize the amount of word data we include. In the root of this repo there is a `all-words.json` file, that includes a string array of all english language words. Then we use a custom script, `scripts/gen-words.ts` that picks out words that match various criteria (which can be configured in the script) and writes them to `src/lib/words.json`, and also writes to `src/lib/word-count.json`, which is just an integer that represents the number of words in `src/lib/words.json`. We do this so on the server side if want to randomly select a word to be used on the client, we can just generate a random index to select the word without having to include the full list of words on the server.
