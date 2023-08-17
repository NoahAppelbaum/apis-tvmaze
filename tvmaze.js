"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMG_URL = "https://upload.wikimedia.org/wikipedia/commons/"
  + "thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png";

const TVMAZE_URL_BASE = "https://api.tvmaze.com";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const params = new URLSearchParams({ q: term });

  const response = await fetch(`${TVMAZE_URL_BASE}/search/shows?${params}`);
  const searchData = await response.json();
  //array w/ objects for each show
  const shows = searchData.map(entry => ({
    id: entry.show.id,
    name: entry.show.name,
    summary: entry.show.summary,
    image: (entry.show.image ? entry.show.image.medium : DEFAULT_IMG_URL)
  }));

  console.log(shows);
  return shows;
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="${show.name} image"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${TVMAZE_URL_BASE}/shows/${id}/episodes`);
  const episodesData = await response.json();

  const episodes = episodesData.map(episode => {
     const {id, name, season, number} = episode;
     return {id, name, season, number};
   });

  return episodes;
  //return array of objects with name, id, episode number

}

/** displayEpisodes: Generates episode strings and appends them to the list
 * in the episodes area
 */

function displayEpisodes(episodes) {
  console.log("displEpisodes has been called");
  $("#episodesList").html('');
  for (const episode of episodes) {
    const $listEntry = $("<li>").text(
      `${episode.name} (Season ${episode.season}, Number ${episode.number})`
    );
    $("#episodesList").append($listEntry);
    console.log("appending", `${$listEntry.text()}`);
  }

  $episodesArea.show();
}


/** getAndDisplayEpisodes: accepts a show ID to retrieve show episode data
 * and display
 */

async function getAndDisplayEpisodes(id) {
  const result = await getEpisodesOfShow(id);
  displayEpisodes(result);
}


/** useEpisodeButton: calls getAndDisplayEpisodes on parent of episodes button */
function useEpisodeButton(evt) {
  //FIXME: there must be a better way -> use .closest()
  const showId = $(evt.target).parent().parent().parent().attr("data-show-id");
  getAndDisplayEpisodes(showId);
}


/** Event listener for Episodes button */
$showsList.on("click", ".Show-getEpisodes", useEpisodeButton);

// add other functions that will be useful / match our structure & design
