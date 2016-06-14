import { Girl } from './girl';
import { Album } from './album';
import { dumpGirl, dumpAlbum } from './file-system';
import { setup } from './downloader';

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

// const girl = new Girl(20735);
// girl.toJSONString().then(console.log);
// dumpGirl(girl);

const album = new Album(19212, 20735);
album.toJSONString().then(console.log);
dumpAlbum(album);
