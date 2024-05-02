import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ApiPixabayService from './api-pixabay';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const apiPixabayService = new ApiPixabayService();

form.addEventListener('submit', onSubmitForm);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmitForm(e) {
  e.preventDefault();
  apiPixabayService.resetPage();
  gallery.innerHTML = '';
  const formValue = e.currentTarget.elements.searchQuery.value.trim();
  apiPixabayService.searchQuery = formValue;
  try {
    await apiPixabayService.getData().then(({ data }) => {
      const { totalHits, hits } = data;
      console.log(data);
      if (totalHits !== 0) {
        Notify.info(`Hooray! We found ${totalHits} images.`);

        gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
        loadMoreBtn.disabled = false;
        apiPixabayService.incrementPage();
      } else {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      console.log(data);
    });
  } catch (error) {
    const message = error.message;
    console.log(message);
    Notify.failure(`${message}`);
  }

  form.reset();
}

async function onLoadMore() {
  try {
    await apiPixabayService.getData().then(({ data }) => {
      const { totalHits, hits } = data;
      gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
      apiPixabayService.incrementPage();
      if (totalHits < apiPixabayService.page * 40) {
        loadMoreBtn.disabled = true;
        return Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
      }
    });
  } catch (error) {
    const message = error.message;
    console.log(message);
    Notify.failure(`${message}`);
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
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
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
