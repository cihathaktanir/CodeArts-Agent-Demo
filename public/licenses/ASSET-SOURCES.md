# Asset sources and licenses

## Turkey province boundaries

Source: William & Mary geoLab / geoBoundaries, gbOpen TUR ADM1, representing 2021, 81 provinces. [API metadata](https://www.geoboundaries.org/api/current/gbOpen/TUR/ADM1/) and [geoBoundaries API/license documentation](https://www.geoboundaries.org/api.html).

The original download URL and exact metadata are checked into `public/map/provenance.json`. The snapshot is commit `9469f09` of [wmgeolab/geoBoundaries](https://github.com/wmgeolab/geoBoundaries), simplified Turkey ADM1 GeoJSON. Attribution: **geoBoundaries / William & Mary geoLab; © OpenStreetMap contributors**. The boundary-specific metadata identifies Open Street Map as the source and **Creative Commons Attribution-ShareAlike 2.0** as its boundary license; preserve that attribution and share-alike notice for the redistributed/derived geometry. geoBoundaries documents its gbOpen releases as CC BY 4.0 compliant; preserve both the release attribution and the source metadata rather than treating these boundaries as public domain.

Reuse/license links: [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [OpenStreetMap copyright and current licensing](https://www.openstreetmap.org/copyright).

Modification: preserved all 81 geographic features and their names; normalized outer/hole polygon winding for D3's spherical projection. Coordinates are rendered in Mercator without a distorted aspect ratio. Secondary network nodes use province centroids and are fictional demo locations, not infrastructure claims. City coordinates are rounded geographic city-center coordinates.

## Surrounding geography and terrain

**Natural Earth**, public-domain cartographic data. [Terms of use](https://www.naturalearthdata.com/about/terms-of-use/) and [downloads](https://www.naturalearthdata.com/downloads/).

Countries: 1:50m Admin 0 country boundaries from [the official Natural Earth vector repository](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson). Filtered to 14 Turkey/surrounding countries, retained geographic geometry, normalized winding.

Relief: [Natural Earth II, 1:50m shaded relief and water](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/), original archive `https://naciscdn.org/naturalearth/50m/raster/NE2_50M_SR_W.zip`. Cropped to the viewport bounds, resampled to the same Mercator projection as the overlays, converted to a dark blue luminance palette, and stored as `public/map/terrain.jpg`. No generated or fabricated terrain is used. The downloaded source TIFF is development-only in ignored `.asset-source/`, outside the public build.

## Fonts and icons

- **Rajdhani**, Indian Type Foundry, SIL Open Font License 1.1. Bundled locally through `@fontsource/rajdhani`.
- **Barlow**, Jeremy Tribby, SIL Open Font License 1.1. Bundled locally through `@fontsource/barlow`.
- **Lucide** SVG icons, Lucide contributors, ISC license with Feather/MIT attribution. Bundled as local React SVG components.
- Favicon: original SVG authored for this demo.

Full font and icon license notices are copied to `public/licenses/`, and distributed with the built assets. The map geometry attribution is also distributed there. The supplied reference images are design specifications provided by the user; no claim of ownership or third-party product affiliation is made.
