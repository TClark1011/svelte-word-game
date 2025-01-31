import { LETTER_STARTING_HEALTH, STARTING_TIME_MS, SUCCESS_BONUS_MS, WORDS } from '$lib/config';
import { letters } from '$lib/misc-constants';
import { dedupe, randomItem } from '$lib/utils';

type WordSubmissionError = 'invalid' | 'already-used' | 'dead-letter-used' | 'subset-of-target';

type LetterHealthTracker = Record<string, number>;

const getInitialLetterHealth = (): LetterHealthTracker => {
	const letterHealth: LetterHealthTracker = {};

	letters.forEach((letter) => {
		letterHealth[letter] = LETTER_STARTING_HEALTH;
	});

	return letterHealth;
};

export class GameState {
	letterHealth: LetterHealthTracker = $state(getInitialLetterHealth());
	targetWord: string = $state(randomItem(WORDS));
	wordSubmissionError: WordSubmissionError | null = $state(null);
	inputValue: string = $state('');
	timeLeftMs: number = $state(STARTING_TIME_MS);
	lastSubmitAtMs: number = $state(new Date().getTime());
	usedWords: string[] = $state([]);
	gameOver: boolean = $state(false);
	previouslyDamagedLetters: string[] = $state([]);

	private damageLetter(letter: string) {
		const currentHealth = this.letterHealth[letter];

		if (currentHealth === undefined) {
			throw new Error(`Letter ${letter} not found in letter health tracker`);
		}

		const newHealth = currentHealth - 1;
		if (newHealth < 0) {
			throw new Error(`Attempted to reduce health of letter "${letter}" below 0`);
		}

		this.letterHealth[letter] = newHealth;
	}

	useWordAtIndex(index: number) {
		const word = WORDS[index];
		if (!word) throw new Error(`No word found at index ${index}`);

		this.targetWord = word;
	}

	setInputValue(value: string) {
		this.inputValue = value.toLowerCase();
	}

	submitWord() {
		const wordIsValid = WORDS.includes(this.inputValue);

		if (!wordIsValid) {
			this.wordSubmissionError = 'invalid';
			return;
		}

		const wordIsSubsetOfCurrent = this.targetWord.includes(this.inputValue);
		if (wordIsSubsetOfCurrent) {
			this.wordSubmissionError = 'subset-of-target';
			return;
		}

		const wordHasBeenUsed = this.usedWords.includes(this.inputValue.toLowerCase());
		if (wordHasBeenUsed) {
			this.wordSubmissionError = 'already-used';
			return;
		}

		const wordContainsDeadLetter = this.inputValue
			.split('')
			.some((letter) => this.letterHealth[letter] === 0);
		if (wordContainsDeadLetter) {
			this.wordSubmissionError = 'dead-letter-used';
			return;
		}

		const unusedLetters = this.targetWord
			.split('')
			.filter((letter) => !this.inputValue.includes(letter));
		const damagedLetters = dedupe(unusedLetters);

		damagedLetters.forEach((letter) => {
			this.damageLetter(letter);
		});

		this.previouslyDamagedLetters = damagedLetters;

		const remainingTime = this.timeLeftMs - (new Date().getTime() - this.lastSubmitAtMs);
		this.timeLeftMs = remainingTime + SUCCESS_BONUS_MS;

		this.wordSubmissionError = null;
		this.targetWord = randomItem(WORDS);
		this.lastSubmitAtMs = new Date().getTime();
		this.usedWords.push(this.inputValue);
		this.inputValue = '';
	}

	endGame() {
		this.gameOver = true;
	}
}

export const gameState = new GameState();
