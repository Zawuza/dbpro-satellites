import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ExploreResponse, Venue} from './explore.foursquare.response.types';

declare var L;

const CLIENT_ID = '1KUJLEW4UGEDVPKFFEQULUKMPSMQ2LUJJISXUXYMKC5THQMV';
const CLIENT_SECRET = 'XGIFLYYSK353YB2PY0PUSFQNJYO2SSOKTFO43GLB0NG55AI4';
const ZOOM_LEVEL_PARAMS = {
  3: {
    y_start: 12.004760925,
    y_divider: 0.00717807333,
    x_start: 53.2374297629616,
    x_divider: 0.00462631024,
    factor: 234
  },
  2: {
    y_start: 12.004760925,
    y_divider: 0.03589036666,
    x_start: 53.2189245219888,
    x_divider: 0.02313155121,
    factor: 47
  },
  1: {
    y_start: 12.004760925,
    y_divider: 0.07178073333,
    x_start: 53.1957929707727,
    x_divider: 0.04626310243,
    factor: 24
  },
  0: {
    y_start: 12.004760925,
    y_divider: 0.1076711,
    x_start: 53.1726614195567,
    x_divider: 0.06939465364,
    factor: 16
  }
};
const BASE_URL = location.href.slice(0, -1);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public venues: any;

  private cache: any;
  private search_timeout: any;
  private map: any;

  private markers = {};

  constructor(
    private http: HttpClient
  ) {

  }

  ngOnInit() {
    this.cache = {
      3: [],
      2: [],
      1: [],
      0: []
    };

    this.map = L.map('map').setView([52.514452, 13.350119], 15);

    L.control.scale().addTo(this.map);

    this.loadPatchesToMap();

    this.map.on('move', () => {
      this.loadPatchesToMap();
    });
  }

  searchForVenues(query: string) {
    this.removeAllMarkersFromMap();
    clearTimeout(this.search_timeout);

    if (!query) {
      this.venues = undefined;
      return;
    }

    this.venues = [];

    this.search_timeout = setTimeout(() => {
      this.http.get(`https://api.foursquare.com/v2/venues/explore`, {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          v: '20190131',
          near: 'Berlin',
          query: query,
          limit: '50'
        }
      }).subscribe((res: ExploreResponse) => {
        res.response.groups[0].items.forEach(item => this.venues.push(item.venue));
        this.loadImagesToVenues(this.venues);
      });
    }, 1000);
  }

  private loadPatchesToMap() {
    const factor_y = 0.00001 * 9.5;
    const factor_x = 0.00001 * 6;

    const mapBounds = this.map.getBounds();
    const zoomLevel = this.map.getZoom() - 12;

    const topRight = this.getRightBottomOffset(mapBounds.getNorth(), mapBounds.getEast(), zoomLevel);
    const bottomLeft = this.getRightBottomOffset(mapBounds.getSouth(), mapBounds.getWest(), zoomLevel);

    const ids = this.getPatchIds(bottomLeft, topRight, zoomLevel);
    if (ids.length === 0) {
      return;
    }

    const url = `${BASE_URL}/get_coordinates_by_ids?zoomLevel=${zoomLevel}&ids=${JSON.stringify(ids)}`;

    this.http.get(url).subscribe((coordinates: any) => {
      for (const c of coordinates) {
        const imageUrl = `${BASE_URL}/${zoomLevel}/${c.rid}/patch.png`;
        const imageBounds = [[c.x1 - factor_x, c.y1 - factor_y], [c.x2 + factor_x, c.y2 + factor_y]];
        L.imageOverlay(imageUrl, imageBounds).addTo(this.map);
      }
    });
  }

  // noinspection JSMethodCanBeStatic
  private getPatchIds(bottomLeft, topRight, zoomLevel) {
    const factor = ZOOM_LEVEL_PARAMS[zoomLevel].factor;

    const rightDiff = topRight.right - bottomLeft.right;
    const bottomDiff = bottomLeft.bottom - topRight.bottom;

    const ids = [];

    for (let bottom = topRight.bottom; bottom <= topRight.bottom + bottomDiff; ++bottom) {
      for (let right = bottomLeft.right; right <= bottomLeft.right + rightDiff; ++right) {
        const id = bottom * factor + right;
        if (this.cache[zoomLevel].indexOf(id) !== -1) {
          continue;
        }
        this.cache[zoomLevel].push(id);
        ids.push(id);
      }
    }

    return ids;
  }

  // noinspection JSMethodCanBeStatic
  private getRightBottomOffset(x, y, zoomLevel) {
    const params = ZOOM_LEVEL_PARAMS[zoomLevel];

    const moveRight = Math.trunc((y - params.y_start) / params.y_divider) + 1;
    const moveBottom = Math.trunc((params.x_start - x) / params.x_divider) + 1;

    const id = moveBottom * params.factor + moveRight;

    return {
      right: moveRight,
      bottom: moveBottom,
      id: id
    };
  }

  private placeVenueMarkerOnMap(venue: Venue, search?: boolean) {

    const geo_pos = [venue.location.lat, venue.location.lng];

    if (Object.keys(this.markers).includes(venue.id)) {
      if (search) {
        const m = this.markers[venue.id];
        this.map.panTo(geo_pos);
        this.closeAllMarkersOnMap();
        m.openPopup();
      }
      return;
    }

    const marker = L.marker(geo_pos).addTo(this.map).bindPopup(
      `
        <div class="text-center marker-popup-with-img">
          <img width="100px" src="${venue['img']}"/>
        </div>
        <p class="text-center">${venue.name}</p>
      `, {
        closeOnClick: false,
        autoClose: false
      });

    marker.on('mouseover', function () {
      this.openPopup();
    });
    marker.on('mouseout', function () {
      this.closePopup();
    });

    this.markers[venue.id] = marker;
  }

  private closeAllMarkersOnMap() {
    for (const marker of Object.keys(this.markers)) {
      this.markers[marker].closePopup();
    }
  }

  private removeAllMarkersFromMap() {
    for (const marker of Object.keys(this.markers)) {
      this.map.removeLayer(this.markers[marker]);
    }

    this.markers = {};
  }

  private loadImagesToVenues(venues: Venue[]) {
    for (const venue of venues) {
      const icon = venue.categories && venue.categories[0] && venue.categories[0].icon;

      if (!icon) {
        continue;
      }

      venue.img = icon.prefix + '64' + icon.suffix;
      this.placeVenueMarkerOnMap(venue);
    }
  }
}
