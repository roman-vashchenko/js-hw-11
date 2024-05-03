import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ApiPixabayService from './api-pixabay';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.wrrap-loader');

const apiPixabayService = new ApiPixabayService();
const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 250 });

form.addEventListener('submit', onSubmitForm);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmitForm(e) {
  loader.style.display = 'block';
  e.preventDefault();
  apiPixabayService.resetPage();
  clearingPage(gallery);
  const formValue = e.currentTarget.elements.searchQuery.value.trim();
  if (formValue === '') {
    loader.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    return;
  }
  apiPixabayService.searchQuery = formValue;
  try {
    await apiPixabayService.getData().then(({ data }) => {
      const { totalHits, hits } = data;
      if (hits.length < 40) {
        renderMarkup(gallery, createMarkup(hits));
        loadMoreBtn.style.display = 'none';
        loader.style.display = 'none';
        Notify.info(`Hooray! We found ${totalHits} images.`);
      } else if (totalHits !== 0) {
        Notify.info(`Hooray! We found ${totalHits} images.`);
        renderMarkup(gallery, createMarkup(hits));
        apiPixabayService.incrementPage();
        lightbox.refresh();
        loadMoreBtn.style.display = 'block';
        loader.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'none';
        loader.style.display = 'none';
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    });
  } catch (error) {
    Notify.failure(`${error.message}`);
  }

  form.reset();
}

async function onLoadMore() {
  loader.style.display = 'block';
  try {
    await apiPixabayService.getData().then(({ data }) => {
      const { totalHits, hits } = data;
      renderMarkup(gallery, createMarkup(hits));
      apiPixabayService.incrementPage();
      lightbox.refresh();
      loader.style.display = 'none';
      if (totalHits < apiPixabayService.page * 40) {
        apiPixabayService.getLatestData().then(({ data }) => {
          loader.style.display = 'block';
          const { totalHits, hits } = data;
          renderMarkup(gallery, createMarkup(hits));
          lightbox.refresh();
          loadMoreBtn.style.display = 'none';
          loader.style.display = 'none';
        });
        return Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
      }
    });
  } catch (error) {
    loadMoreBtn.style.display = 'none';
    loader.style.display = 'none';
    Notify.failure(`${error.message}`);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
      <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" title="${tags}" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`
    )
    .join('');
}

function clearingPage(element) {
  element.innerHTML = '';
}

function renderMarkup(element, arr) {
  element.insertAdjacentHTML('beforeend', arr);
}
