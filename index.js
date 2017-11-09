'use strict';

//app will get user input to start quiz from lister
//fetch token once the DOM loads
//choose categories, etc
//fetch token
//build query URL
//fetch questions
//pass session token into question API call

const BASE_URL = 'https://opentdb.com';
const MAIN_PATH = '/api.php';
const TOKEN_PATH = '/api_token.php';

function getTokenData(){}
  //code

// https://opentdb.com/api_token.php?command=request
// https://opentdb.com/?q=%2Fapi_token.php&command=request
// https://opentdb.com/api.php?amount=10&token=YOURTOKENHERE

//fetchData//request generates random token
let tokenCode

function fetchToken() {
  //send token with every question API request
  const tokenURL = BASE_URL+TOKEN_PATH;
  $.getJSON('https://opentdb.com/api_token.php?command=request', function(token){
    const tokenCode = token.token;
    console.log(token);
  });

}


function fetchQuestions(token, category) {
  //recieves token and category id from user
  const query = {
    q: MAIN_PATH, 
    amount: 10,
    category: $(category.id),
    token,
    type: 'multiple'
  };
  $.getJSON(BASE_URL, query, function(data) {
    console.log(data);
  });
}


function getCategories() {
  const url = BASE_URL+'/api_category.php';
  $.getJSON(url, function(data) {
    displayCategories(data);
    console.log(data);    
  });
}

function displayCategories(data) {
  const results = data.trivia_categories.map(function(item, index) {
    const categoryID = item.id;
    const categoryName = item.name;
    return {
      categoryID,
      categoryName,
      index
    };
  });
  CATEGORIES.push(results);
  generateQuestionCategoryHTML(results);
}

const CATEGORIES = [];
console.log(CATEGORIES);

const TOP_LEVEL_COMPONENTS = [
  'js-intro', 'js-question', 'js-question-feedback', 'js-outro', 'js-quiz-status'
];

const QUESTIONS = [
  {
    text: 'Capital of England?',
    answers: ['London', 'Paris', 'Rome', 'Washington DC'],
    correctAnswer: 'London'
  },
  {
    text: 'How many kilometers in one mile?',
    answers: ['0.6', '1.2', '1.6', '1.8'],
    correctAnswer: '1.6'
  }
];

const getInitialStore = function() {
  return {
    page: 'intro',
    currentQuestionIndex: null,
    userAnswers: [],
    feedback: null
  };
};

let store = getInitialStore();

// Helper functions
// ===============
const hideAll = function() {
  TOP_LEVEL_COMPONENTS.forEach(component => $(`.${component}`).hide());
};

const getScore = function() {
  return store.userAnswers.reduce((accumulator, userAnswer, index) => {
    const question = getQuestion(index);

    if (question.correctAnswer === userAnswer) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);
};

const getProgress = function() {
  return {
    current: store.currentQuestionIndex + 1,
    total: QUESTIONS.length
  };
};

const getCurrentQuestion = function() {
  return QUESTIONS[store.currentQuestionIndex];
};

const getQuestion = function(index) {
  return QUESTIONS[index];
};

// HTML generator functions
// ========================

const generateQuestionCategoryHTML = function(categories) {
  categories.map(function(item, index) { 
    return `
      <div class='js-intro js-categories js-category-index">Select from the following categories>${categories}
            </div>`;
  });
};


const generateAnswerItemHtml = function(answer) {
  return `
    <li class="answer-item">
      <input type="radio" name="answers" value="${answer}" />
      <span class="answer-text">${answer}</span>
    </li>
  `;
};

const generateQuestionHtml = function(question) {
  const answers = question.answers
    .map((answer, index) => generateAnswerItemHtml(answer, index))
    .join('');

  return `
    <form>
      <fieldset>
        <legend class="question-text">${question.text}</legend>
          ${answers}
          <button type="submit">Submit</button>
      </fieldset>
    </form>
  `;
};

const generateFeedbackHtml = function(feedback) {
  return `
    <p>${feedback}</p>
    <button class="continue js-continue">Continue</button>
  `;
};

// Render function - uses `store` object to construct entire page every time it's run
// ===============
const render = function() {
  let html;
  hideAll();

  const question = getCurrentQuestion();
  const { feedback } = store;
  const { current, total } = getProgress();

  $('.js-score').html(`<span>Score: ${getScore()}</span>`);
  $('.js-progress').html(`<span>Question ${current} of ${total}`);

  switch (store.page) {
  case 'intro':
    $('.js-intro').show();
    break;

  case 'question':
    html = generateQuestionHtml(question);
    $('.js-question').html(html);
    $('.js-question').show();
    $('.quiz-status').show();
    break;

  case 'answer':
    html = generateFeedbackHtml(feedback);
    $('.js-question-feedback').html(html);
    $('.js-question-feedback').show();
    $('.quiz-status').show();
    break;

  case 'outro':
    $('.js-outro').show();
    $('.quiz-status').show();
    break;

  default:
    return;
  }
};

// Event handler functions
// =======================
const handleStartQuiz = function() {
  store = getInitialStore();
  store.page = 'question';
  store.currentQuestionIndex = 0;
  render();
};

const handleSubmitAnswer = function(e) {
  e.preventDefault();
  const question = getCurrentQuestion();
  const selected = $('input:checked').val();
  store.userAnswers.push(selected);

  if (selected === question.correctAnswer) {
    store.feedback = 'You got it!';
  } else {
    store.feedback = `Too bad! The correct answer was: ${question.correctAnswer}`;
  }

  store.page = 'answer';
  render();
};

const handleNextQuestion = function() {
  if (store.currentQuestionIndex === QUESTIONS.length - 1) {
    store.page = 'outro';
    render();
    return;
  }

  store.currentQuestionIndex++;
  store.page = 'question';
  render();
};

// On DOM Ready, run render() and add event listeners
$(() => {
  render();
  getCategories();
  fetchToken();

  $('.js-intro, .js-outro').on('click', '.js-start', handleStartQuiz);
  $('.js-question').on('submit', handleSubmitAnswer);
  $('.js-question-feedback').on('click', '.js-continue', handleNextQuestion);
});