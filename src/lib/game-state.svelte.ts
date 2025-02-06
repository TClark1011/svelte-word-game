import { LETTER_STARTING_HEALTH, STARTING_TIME_MS, SUCCESS_BONUS_MS, WORDS } from '$lib/config';
import { letters } from '$lib/misc-constants';
import { dedupe, randomItemConditional } from '$lib/utils';

type WordSubmissionError = 'invalid' | 'already-used' | 'dead-letter-used' | 'subset-of-target';

export type LetterHealthTracker = Record<string, number>;

const getInitialLetterHealth = (): LetterHealthTracker => {
	const letterHealth: LetterHealthTracker = {};

	letters.forEach((letter) => {
		letterHealth[letter] = LETTER_STARTING_HEALTH;
	});

	return letterHealth;
};

export class GameState {
	letterHealth: LetterHealthTracker = $state(getInitialLetterHealth());
	targetWord: string = $state('');
	wordSubmissionError: WordSubmissionError | null = $state(null);
	inputValue: string = $state('');
	timeLeftMs: number = $state(STARTING_TIME_MS);
	lastSubmitAtMs: number = $state(new Date().getTime());
	usedWords: string[] = $state([]);
	gameOver: boolean = $state(false);
	previouslyDamagedLetters: string[] = $state([]);

	constructor(startIndex: number) {
		this.targetWord = WORDS[startIndex];
	}

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

	sendLetter = (letter: string) => {
		this.setInputValue(this.inputValue + letter);
	};

	backspace = () => {
		this.setInputValue(this.inputValue.slice(0, -1));
	};

	setInputValue(value: string) {
		this.inputValue = value.toLowerCase();
	}

	letterIsDead(letter: string) {
		return this.letterHealth[letter] === 0;
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

		const timeSinceLastSubmissionMs = new Date().getTime() - this.lastSubmitAtMs;
		const remainingTimeMs = this.timeLeftMs - timeSinceLastSubmissionMs;
		this.timeLeftMs = remainingTimeMs + SUCCESS_BONUS_MS;

		this.usedWords.push(this.inputValue, this.targetWord);

		this.targetWord = randomItemConditional(WORDS, (word) => !this.usedWords.includes(word));

		this.wordSubmissionError = null;
		this.lastSubmitAtMs = new Date().getTime();
		this.inputValue = '';
	}

	endGame() {
		this.gameOver = true;
	}
}
