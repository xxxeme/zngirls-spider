import _ from 'lodash';
import jQuery from 'jquery';
import Promise from 'bluebird';
import { env } from 'jsdom';
import { download } from './downloader';

const regexUrl = /https?:\/\/(.*)\.zngirls\.com\//;
const regexInt = /[+-]?([1-9][0-9]*)|0/;
const regexDate = /\d+\/\d+\/\d+/;
const parseInt = value => _.isString(value) && Number.parseInt(value.match(regexInt)[0]) || null;
const parseDate = value => _.isString(value) && new Date(value.match(regexDate)[0]) || null;
const replacer = (key, value) => _.isDate(value) ? value.toISOString() : value;

const infoLoaders = {
  title: $ => $('h1#htitle').text(),
  description: $ => $('div#ddesc').text(),
  count: $ => parseInt($('div#dinfo > span').text()),
  server: $ => $('ul#hgallery > img').attr('src').match(regexUrl)[1],
  date: $ => parseDate($('div#dinfo').text()),
};

export class Album {
  constructor(id, girlId) {
    this.id = id;
    this.girlId = girlId;
    this.p$info = Promise.all([
      download(`http://www.zngirls.com/g/${id}/`)
        .then(Promise.promisify(env))
        .then(jQuery)
        .then($ => _.mapValues(infoLoaders, loader => loader($))),
    ]).spread((info, albumIds) => _.assignIn(info, {
      id, girlId,
      coverImageUrl: `http://${info.server}.zngirls.com/gallery/${girlId}/${id}/cover/0.jpg`,
      images: _.reduce(_.range(1, info.count), (memo, idx) => {
        const name = info.count > 1000 ? `0000${idx}`.substr(-4) : `000${idx}`.substr(-3);
        memo.push({
          local: `${name}.jpg`,
          remote: `http://${info.server}.zngirls.com/gallery/${girlId}/${id}/${name}.jpg`,
        });
        return memo;
      }, [{
        local: info.count > 1000 ? '0000.jpg' : '000.jpg',
        remote: `http://${info.server}.zngirls.com/gallery/${girlId}/${id}/0.jpg`,
      }]),
    }));
  }

  toJSON() {
    return this.p$info.then(_.clone);
  }

  toJSONString() {
    return this.p$info.then(json => JSON.stringify(json, replacer, 2));
  }
}
