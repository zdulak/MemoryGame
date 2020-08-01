"use strict";

const cardTypes = [
    "lemon",
    "banana",
    "watermelon",
    "kiwi",
    "orange",
    "red_apple",
    "green_apple",
    "yellow_fruit",
    "cherry",
    "strawberry"
];

class Card {
    constructor(i, j, cardType) {
        this.i = i;
        this.j = j;
        this.cardType = cardType;
    }
}

class Board {
    static get rowSize() {
        return 5;
    }
    static get columnSize() {
        return 4;
    }
    constructor() {
        this.cards = [];
        for (let i = 0; i < Board.columnSize; ++i) {
            const row = [];
            for (let j = 0; j < Board.rowSize; ++j) {
                row.push(cardTypes[(j + i * Board.rowSize) % cardTypes.length]);
            }
            this.cards.push(row);
        }
    }
    #projectIndex = function(i) {
        //return [row_index, column_index] for given index
        return [Math.floor(i / Board.rowSize), i % Board.rowSize];
    }
    #getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        //The maximum is exclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min)) + min; 
    }
    shuffle() {
        //Modern Fisher–Yates shuffle algorithm
        const size = Board.columnSize*Board.rowSize;
        for (let i = 0; i < size; ++i) {
            const j = this.#getRandomInt(0, size);
            const [rowI, colI] = this.#projectIndex(i);
            const [rowJ, colJ] = this.#projectIndex(j);
            [this.cards[rowI][colI], this.cards[rowJ][colJ]] = [this.cards[rowJ][colJ], this.cards[rowI][colI]];
        }
    }
}

class Game { 
    /**
     * @param {Board} board
     */
    constructor(board) {
        /** @type {Card[]} */
        this.checkedCards = [];
        this.counter = 0;
        this.board = board;
    }
    isMatch() {
        return this.checkedCards[0].cardType === this.checkedCards[1].cardType;
    }     
}

class View {
    #cardBackUrl = "url(images/cardBack.png)"; 
    #divBoard = document.querySelector(".game-board");
    createBoardView() {
        this.#divBoard.innerHTML = "";
        for (let i = 0; i < Board.columnSize; ++i) {
            for (let j = 0; j < Board.rowSize; ++j) {
                const cardTag = document.createElement("div");
                cardTag.classList.add("game-card");
                cardTag.setAttribute("data-row", i.toString());
                cardTag.setAttribute("data-col", j.toString());
                this.#divBoard.appendChild(cardTag);
                cardTag.style.left = 5 + (cardTag.offsetWidth + 5) * j + "px";
                cardTag.style.top = 5 + (cardTag.offsetHeight + 5) * i + "px";
                cardTag.style.backgroundImage = this.#cardBackUrl;
            }
        }
    }
    isBoardEmpty() {
        return !this.#divBoard.hasChildNodes();
    }
    /**
     * @param {Card[]} cards
     * @param {boolean} front
     */
    updateCards(cards, front) {
        for (const {i, j, cardType} of cards) {
            const cardTag = document.querySelector(`.game-card[data-row="${i}"][data-col="${j}"]`);
            if (front) {
                // @ts-ignore
                cardTag.style.backgroundImage = "url(images/" + cardType + ".png)";
            }
            else {
                // @ts-ignore
                cardTag.style.backgroundImage = this.#cardBackUrl;
            }
        }
    }
    /**
     * @param {Card[]} cards
     */
    deleteCards(cards) {
        for (const {i, j} of cards) {
            const cardTag = document.querySelector(`.game-card[data-row="${i}"][data-col="${j}"]`);
            cardTag.remove();
        }

    }
    updateCounter(counter) {
        const counterTag = document.querySelector(".game-score");
        counterTag.textContent = counter.toString();
    }
}

class Controller {
    /**
     * @param {Game} game
     * @param {View} view
     */
    constructor(game, view) {
        this.game = game;
        this.view = view;
        this.blockCards = false;
        const divStartButton = document.querySelector(".game-start");
        divStartButton.addEventListener("click", this.startGame);
        const divGame = document.querySelector(".game");
        divGame.addEventListener("click", this.cardClick);
    }
    startGame = () => {
        this.game.counter = 0;
        this.view.updateCounter(this.game.counter);
        this.game.board.shuffle();
        this.view.createBoardView();
    }


    cardClick = (event) => {
        if (event.target.classList.contains("game-card") && !this.blockCards) {
            const i = event.target.dataset.row;
            const j = event.target.dataset.col;
            if (this.game.checkedCards.length !== 1 ||
                 this.game.checkedCards[0].i !== i ||  this.game.checkedCards[0].j != j) {
                const card = new Card(i, j, this.game.board.cards[i][j]);
                this.game.checkedCards.push(card);
                this.view.updateCards([card], true);
                this.view.updateCounter(++this.game.counter);
                if (this.game.checkedCards.length === 2) {
                    this.blockCards = true;
                    setTimeout(() => {
                        if (this.game.isMatch()) {
    
                            this.view.deleteCards(this.game.checkedCards);
                        }
                        else {
                            this.view.updateCards(this.game.checkedCards, false);
                        }
                        this.game.checkedCards = [];
                        this.blockCards = false;
                        if (this.view.isBoardEmpty()) {
                            alert(`You won!\n Your score is ${this.game.counter}`);
                            this.startGame();
                        }
                    }, 500);
                }
            }
        }
    }
}

const controller = new Controller(new Game(new Board()), new View());