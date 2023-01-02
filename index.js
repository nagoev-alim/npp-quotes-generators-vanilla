// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import config from './data/config.js';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='quote-generator'>
    <h2>Quote Generators</h2>
    <form data-form=''>
      <select name='source'>
        <option value=''>Select Source</option>
        ${config.map(({ name, value }) => `<option value='${value}'>${name}</option>`).join('')}
      </select>
      <button type='submit' data-submit=''>Submit</button>
    </form>
    <div class='result hide' data-target=''></div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      btnSubmit: document.querySelector('[data-submit]'),
      target: document.querySelector('[data-target]'),
      spinner: document.querySelector('[data-spinner]'),
    };

    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.target.addEventListener('click', this.copyToClipboard);
  }

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const { source } = Object.fromEntries(new FormData(form).entries());

    if (!source) {
      showNotification('warning', 'Please select source');
      return;
    }

    this.getQuote(source);
  };

  /**
   *
   * @param source
   * @returns {Promise<void>}
   */
  getQuote = async (source) => {
    try {
      this.DOM.btnSubmit.innerHTML = `Loading...`;

      switch (source) {
        case 'https://api.chucknorris.io/jokes/random': {
          const { data: { value } } = await axios.get(source);
          this.renderData(value, false);
          break;
        }
        case 'https://api.quotable.io/random': {
          const { data: { author, content } } = await axios.get(source);
          this.renderData(content, author ?? false);
          break;
        }
        case 'https://type.fit/api/quotes': {
          const { data } = await axios.get(source);
          const { text, author } = data[Math.floor(Math.random() * data.length)];
          this.renderData(text, author ?? false);
          break;
        }
        case 'https://api.goprogram.ai/inspiration': {
          const { data: { quote, author } } = await axios.get(source);
          this.renderData(quote, author ?? false);
          break;
        }
        case 'https://favqs.com/api/qotd': {
          const { data: { quote: { body, author } } } = await axios.get(source);
          this.renderData(body, author ?? false);
          break;
        }
        case 'https://api.themotivate365.com/stoic-quote': {
          const { data: { quote, author } } = await axios.get(source);
          this.renderData(quote, author ?? false);
          break;
        }
        case 'https://evilinsult.com/generate_insult.php?lang=en&type=json': {
          const { data: { insult } } = await axios.get(`https://cors-anywhere.herokuapp.com/${source}`);
          this.renderData(insult, false);
          break;
        }
        case 'https://ron-swanson-quotes.herokuapp.com/v2/quotes': {
          const { data } = await axios.get(source);
          this.renderData(data, false);
          break;
        }
        case 'https://www.affirmations.dev/': {
          const { data: { affirmation } } = await axios.get(`https://cors-anywhere.herokuapp.com/${source}`);
          this.renderData(affirmation, false);
          break;
        }
        case 'https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand': {
          const { data } = await axios.get(source);
          const { yoast_head_json: { og_title, og_description } } = data[Math.floor(Math.random() * data.length)];
          this.renderData(og_description, og_title ?? false);
          break;
        }
        case 'https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json': {
          const { data: { quoteText, quoteAuthor } } = await axios.get(`https://cors-anywhere.herokuapp.com/${source}`);
          this.renderData(quoteText, quoteAuthor ?? false);
          break;
        }
        case 'https://api.api-ninjas.com/v1/quotes': {
          const { data } = await axios.get(source, {
            headers: { 'X-Api-Key': 'akxWnVBvUmGAjheE9llulw==TVZ6WIhfWDdCsx9o' },
          });
          const { quote, author } = data[0];
          this.renderData(quote, author ?? false);
          break;
        }
        case 'https://official-joke-api.appspot.com/random_joke': {
          const { data: { punchline, setup } } = await axios.get(source);
          this.renderData(setup, punchline ?? false);
          break;
        }
        case 'https://motivational-quotes1.p.rapidapi.com/motivation': {
          const { data } = await axios.request({
            method: 'POST',
            url: source,
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': 'a07622a786mshaea27da6a042696p1c7a02jsncc2e1c7e534e',
              'X-RapidAPI-Host': 'motivational-quotes1.p.rapidapi.com',
            },
            data: '{"key1":"value","key2":"value"}',
          });
          this.renderData(data, false);
          break;
        }
        default:
          break;
      }

      this.DOM.btnSubmit.innerHTML = `Submit`;
    } catch (e) {
      console.log(e);
      showNotification('danger', 'Something went wrong, open dev console');
    }
  };

  /**
   *
   * @param text
   * @param hasAuthor
   */
  renderData = (text, hasAuthor) => {
    if (this.DOM.target.classList.contains('hide')) {
      this.DOM.target.classList.remove('hide');
    }
    this.DOM.target.innerHTML = `
       <button data-copy=''>${feather.icons.clipboard.toSvg()}</button>
       <p>"${text}"</p>
       ${hasAuthor ? `<p class='author'>${hasAuthor}</p>` : ''}
    `;
  };

  /**
   * @function copyToClipboard - Copy to clipboard
   */
  copyToClipboard = ({ target }) => {
    if (target.matches('[data-copy=""')) {
      const textarea = document.createElement('textarea');
      const text = this.DOM.target.querySelector('p').textContent;
      if (!text) return;
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      showNotification('success', 'Success copied to clipboard');
    }
  };
}

// ⚡️Class instance
new App();
