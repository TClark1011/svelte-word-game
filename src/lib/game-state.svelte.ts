import { LETTER_STARTING_HEALTH, STARTING_TIME_MS, SUCCESS_BONUS_MS, WORDS } from '$lib/config';
import { letters } from '$lib/misc-constants';
import { dedupe, randomItem } from '$lib/utils';

type GameError = 'invalid-word-submission' | 'already-used-word' | 'dead-letter-used';

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
	timeLeftMs: number;
	lastSubmitAt: number;
	usedWords: string[];
	gameOver: boolean;
};

export type GameStateAction =
	| {
			type: 'submit-word';
	  }
	| {
			type: 'game-over';
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
			if (
				!WORDS.includes(state.inputValue.toLowerCase()) ||
				state.inputValue.toLowerCase() === state.currentWord
			) {
				return {
					...state,
					error: 'invalid-word-submission'
				};
			}
			if (state.usedWords.includes(state.inputValue)) {
				return {
					...state,
					error: 'already-used-word'
				};
			}
			if (state.inputValue.split('').some((letter) => state.letterHealth[letter] === 0)) {
				return {
					...state,
					error: 'dead-letter-used'
				};
			}
			return {
				...state,
				currentWord: getRandomWord(),
				letterHealth: getDamagedLetters({
					currentWord: state.currentWord,
					submittedWord: state.inputValue
				}).reduce(damageLetter, state.letterHealth),
				error: null,
				inputValue: '',
				timeLeftMs:
					state.timeLeftMs - (new Date().getTime() - state.lastSubmitAt) + SUCCESS_BONUS_MS,
				lastSubmitAt: new Date().getTime(),
				usedWords: [...state.usedWords, state.inputValue]
			};
		}
		case 'game-over': {
			return {
				...state,
				gameOver: true
			};
		}
		default:
			// @ts-expect-error this will error if switch is not exhaustive
			action.toString();
			throw new Error('Invalid action');
	}
};

export const gameState = $state<GameState>({
	currentWord: getRandomWord(),
	letterHealth: getInitialLetterHealth(),
	error: null,
	inputValue: '',
	timeLeftMs: STARTING_TIME_MS,
	lastSubmitAt: new Date().getTime(),
	usedWords: [],
	gameOver: false
});

export const gameStateDispatch = (action: GameStateAction) => {
	const newState = gameStateReducer(gameState, action);

	Object.keys(newState).forEach((key) => {
		gameState[key as keyof GameState] = newState[key as keyof GameState] as never;
	});
};
