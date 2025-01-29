import { LETTER_STARTING_HEALTH, WORDS } from '$lib/config';
import { letters } from '$lib/misc-constants';
import { dedupe, randomItem } from '$lib/utils';

type GameError = 'invalid-word-submission';

type LetterHealthTracker = Record<string, number>;

const getInitialLetterHealth = (): LetterHealthTracker => {
	const letterHealth: LetterHealthTracker = {};

	letters.forEach((letter) => {
		letterHealth[letter] = LETTER_STARTING_HEALTH;
	});

	return letterHealth;
};

const damageLetter = (letterHealth: LetterHealthTracker, letter: string): LetterHealthTracker => {
	const currentHealth = letterHealth[letter];

	if (currentHealth === undefined) {
		throw new Error(`Letter ${letter} not found in letter health tracker`);
	}

	const newHealth = currentHealth - 1;

	if (newHealth < 0) {
		throw new Error(`Letter ${letter} has negative health`);
	}

	letterHealth[letter] = newHealth;

	return letterHealth;
};

export type GameState = {
	letterHealth: LetterHealthTracker;
	currentWord: string;
	error: GameError | null;
	inputValue: string;
};

export type GameStateAction = {
	type: 'submit-word';
};

type GetDamagedLettersInput = {
	currentWord: string;
	submittedWord: string;
};

const getDamagedLetters = ({ currentWord, submittedWord }: GetDamagedLettersInput): string[] =>
	dedupe(currentWord.split('').filter((letter) => !submittedWord.includes(letter)));

const getRandomWord = () => randomItem(WORDS);

export const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
	switch (action.type) {
		case 'submit-word': {
			if (!WORDS.includes(state.inputValue.toLowerCase())) {
				return {
					...state,
					error: 'invalid-word-submission'
				};
			}
			return {
				currentWord: getRandomWord(),
				letterHealth: getDamagedLetters({
					currentWord: state.currentWord,
					submittedWord: state.inputValue
				}).reduce(damageLetter, state.letterHealth),
				error: null,
				inputValue: ''
			};
		}
	}
};

export const gameState = $state<GameState>({
	currentWord: getRandomWord(),
	letterHealth: getInitialLetterHealth(),
	error: null,
	inputValue: ''
});

export const gameStateDispatch = (action: GameStateAction) => {
	const newState = gameStateReducer(gameState, action);

	Object.keys(newState).forEach((key) => {
		gameState[key as keyof GameState] = newState[key as keyof GameState] as never;
	});
};
