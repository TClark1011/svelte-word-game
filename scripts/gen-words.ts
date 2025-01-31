import fs from 'fs';

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 16;

const MAX_REPEATED_LETTER_SEQUENCE = 2;

const getLongestSequenceOfRepeatedLetters = (word: string) => {
	let longestSequence = 0;
	let currentSequence = 0;
	let lastLetter = '';

	for (const letter of word) {
		if (letter === lastLetter) {
			currentSequence++;
		} else {
			currentSequence = 1;
		}

		if (currentSequence > longestSequence) {
			longestSequence = currentSequence;
		}

		lastLetter = letter;
	}

	return longestSequence;
};

// read "all-words.json" into variable, its a string array
const allWords = JSON.parse(fs.readFileSync('all-words.json', 'utf8')) as string[];

const validWords = allWords.filter((word) => {
	const lengthIsOkay = word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH;
	const noInvalidSequences =
		getLongestSequenceOfRepeatedLetters(word) <= MAX_REPEATED_LETTER_SEQUENCE;

	return lengthIsOkay && noInvalidSequences;
});

console.log(`${validWords.length}/${allWords.length} have been selected`);

// write the valid words to a new file
fs.writeFileSync('src/lib/words.json', JSON.stringify(validWords));
fs.writeFileSync('src/lib/word-count.json', JSON.stringify(validWords.length));
