import axios from 'axios';

export default class apiServicePixabay {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }
  getData() {
    return axios.get(
      `https://pixabay.com/api/?key=33776129-06b0afe52f3ec0e98d1b43427&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40`
    );
  }
  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }
  getLatestData() {
    return axios.get(
      `https://pixabay.com/api/?key=33776129-06b0afe52f3ec0e98d1b43427&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=20`
    );
  }
}
