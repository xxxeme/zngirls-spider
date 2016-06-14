import yargs from 'yargs';

import { Girl } from './girl';
import { Album } from './album';
import { dumpGirl, dumpAlbum } from './file-system';
import { setup } from './downloader';

function doSync({ girl, album }) {
  setup({
    // concurrency: 1,
    onStart({ url }) {
      console.log(`start downloading ${url}`);
    },
    onComplete({ url }) {
      console.log(`complete downloading ${url}`);
    },
    onError({ url }) {
      console.log(`fail downloading ${url}`);
    }
  });

  const girlObject = new Girl(girl);

  dumpGirl(girlObject);
  if (album) {
    const albumObject = new Album(album, girl);
    dumpAlbum(albumObject);
  } else {
    girlObject.toJSON()
      .then(info => info.albumIds)
      .map(albumId => dumpAlbum(new Album(albumId, girl)));
  }
}

yargs.usage('$0 <cmd> [args]')
  .command('sync', 'sync a girl or an album', y => {
    return y.options({
      girl: { alias: 'g', describe: 'the girl id to sync', demand: true },
      album: { alias: 'a', describe: 'the album id to sync' },
    }).help()
  }, doSync)
  .help().argv;
