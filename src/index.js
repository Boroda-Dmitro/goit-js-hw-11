import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const URL = 'https://pixabay.com/api/';
const KEY = '34143834-71f54a932c118a9a307ce5c6b';
let page = 1;

const refs = {
  form: document.querySelector('#search-form'),
  input: document.querySelector('#search-form input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const lightbox = new SimpleLightbox('.gallery a');

const seachPhotos = async event => {
  event.preventDefault();
  page = 1;
  const seach = refs.input.value.trim();

  const options = new URLSearchParams({
    key: KEY,
    q: seach,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: 40,
  });

  try {
    const apiAnsver = await axios.get(`${URL}?${options}`);
    const list = await getSeachList(apiAnsver);
    const markup = await createGalerry(list);
    refs.gallery.innerHTML = markup;
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
  refs.loadMoreBtn.classList.remove('hidden');

};

const getMorePhotos = async () => {
  page += 1;
  const seach = refs.input.value.trim();
  const options = new URLSearchParams({
    key: KEY,
    q: seach,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: 40,
  });
  try {
    const apiAnsver = await axios.get(`${URL}?${options}`);
    const list = await nextPageList(apiAnsver);
    const markup = await createGalerry(list);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
  smoothScrolling()
};

const getSeachList = list => {
  if (list.data.total === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  } else {
    Notiflix.Notify.success(
      `"Hooray! We found ${list.data.totalHits} images."`
    );
    return list.data.hits;
  }
};

const nextPageList = list => {
  if (list.data.totalHits <= page * 40) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    refs.loadMoreBtn.classList.add('hidden');
  }
  return list.data.hits;
};

const createGalerry = list => {
  return list
    .map(photo => {
      return `<a class="gallery__item" href="${photo.largeImageURL}" >
                <div class="photo-card">
                    <img loading="lazy" class="gallery__image" src="${photo.webformatURL}" alt="${photo.tags}" "/>
                   <div class="info">
                        <p class="info-item">
                         <b>Likes <span>${photo.likes}</span></b>
                        </p>
                        <p class="info-item">
                         <b>Views <span>${photo.views}</span></b>
                        </p>
                        <p class="info-item">
                         <b>Comments <span>${photo.comments}</span></b>
                        </p>
                        <p class="info-item">
                         <b>Downloads <span>${photo.downloads}</span></b>
                        </p>
                    </div>
                </div>
            </a>`;
    })
    .join('');
};

const smoothScrolling = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

refs.form.addEventListener('submit', seachPhotos);
refs.loadMoreBtn.addEventListener('click', getMorePhotos);
