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
  return (await response.buffer()).toString('base64');
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
        const thumbnailUrl = fetchedData['thumbnail_url']
        if (thumbnailUrl !== undefined){
          // For privacy reasons:
          // save the thumbnail already, so we can show it to the users as an inline image, without them being tracked
          fetchedData['fetched_thumbnail'] = await getBase64FromUrl(thumbnailUrl);
        }

        console.log(fetchedData)
        data = {...fetchedData, ...{url}};
      } catch (error) {
        if (error.response.status === 404) {
          data = {
            error: 'This URL can\'t be found'
          }
        } else if (error.response.status === 401) {
          data = {
            error: 'Embedding has been disabled for this media'
          }
        } else {
          throw new Error(error);
        }
      }


      return data;
    }
  };
};