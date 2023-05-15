'use strict';
const axios = require('axios');
const { extract } = require('@extractus/oembed-extractor')

/**
 * media-embed.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

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

        let title = fetchedData.title;
        let thumbnail = fetchedData.thumbnail_url;

        console.log(fetchedData)


        data = {
          url,
          title,
          thumbnail,
          rawData: fetchedData,
        }

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