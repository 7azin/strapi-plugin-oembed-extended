'use strict';
const { extract } = require('@extractus/oembed-extractor')
const fetch = require('cross-fetch');

/**
 * media-embed.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */
const getBase64FromUrl = async (url) => {
  const response  = await fetch(url);
  return "data:image/jpg;base64, " + (await response.buffer()).toString('base64');
}

module.exports = (
  {
    strapi
  }
) => {
  return {
    async fetch(url) {
      let data;

      try {
        const fetchedData = await extract(url);
        let thumbnailUrl = fetchedData['thumbnail_url']
        if (thumbnailUrl !== undefined){
          // For privacy reasons:
          // save the thumbnail already, so we can show it to the users as an inline image, without them being tracked
          if (fetchedData.provider_name === 'YouTube'){
            // get the highres thumbnail
            thumbnailUrl = thumbnailUrl.substring(0, thumbnailUrl.lastIndexOf('/')+1) + "maxresdefault.jpg"
            fetchedData.thumbnail_url = thumbnailUrl;
          }
          fetchedData['fetched_thumbnail'] = await getBase64FromUrl(thumbnailUrl);
        }

        console.log(fetchedData)
        data = {...fetchedData, ...{url}};
      } catch (error) {
        if (url.includes("instagram.com") || url.includes("instagr.am")){
          console.log(url);
          return {url, provider_name: 'Instagram'};
        }
        if (url.includes("facebook.com") || url.includes("fb.com")){
          console.log(url);
          return {url, provider_name: 'Facebook'};
        }
        if (error.response.status === 404) {
          data = {
            error: 'This URL can\'t be found'
          }
        } else if (error.response.status === 401) {
          data = {
            error: 'Embedding has been disabled for this media'
          }
        } else {
          console.log("oembed.js error: " + error.stack);
          throw new Error(error);
        }
      }


      return data;
    }
  };
};