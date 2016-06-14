import _ from 'lodash';
import rp from 'request-promise';
import jQuery from 'jquery';
import Promise from 'bluebird';
import { env } from 'jsdom';

const fromInput = name => $ => $(`input[name="${name}"]`).val() || undefined;
const fromTextArea = name => $ => $(`textarea[name="${name}"]`).text().trim() || undefined;
const defaultValue = value => val => val || value;
const parseInt = value => _.isString(value) && Number.parseInt(value) || undefined;
const parseDate = value => _.isString(value) && Date.parse(value) || undefined;
const replacer = (key, value) => _.isDate(value) ? value.toISOString() : value;

const infoLoaders = {
  realName: fromInput('txt_realname'),
  id: fromInput('txt_girlid'),
  chineseName: fromInput('txt_cname'),
  otherName: fromInput('txt_othername'),
  englishName: fromInput('txt_englishname'),
  country: fromInput('txt_country'),
  birthPlace: fromInput('txt_district'),
  birthday: _.flow([
    fromInput('txt_birth'),
    parseDate,
  ]),
  bloodType: fromInput('txt_bloodtype'),
  height: _.flow([
    fromInput('txt_height'),
    parseInt,
  ]),
  weight: _.flow([
    fromInput('txt_weight'),
    parseInt,
  ]),
  bust: _.flow([
    fromInput('txt_chest'),
    parseInt,
  ]),
  waist: _.flow([
    fromInput('txt_waist'),
    parseInt,
  ]),
  hip: _.flow([
    fromInput('txt_hip'),
    parseInt,
  ]),
  cup: fromInput('txt_cup'),
  shoeSize: _.flow([
    fromInput('txt_footsize'),
    parseInt,
  ]),
  company: fromInput('txt_company'),
  beginTime: _.flow([
    fromInput('txt_begintime'),
    parseDate,
  ]),
  endTime: _.flow([
    fromInput('txt_endtime'),
    parseDate,
  ]),
  photoUrl: fromInput('txt_photo'),
  interest: fromInput('txt_interest'),
  description: fromTextArea('txt_info'),
  coverImageUrl: $ => $('.infoleft_imgdiv > a.imglink > img').attr('src'),
};

export class Girl {
  constructor(id) {
    this.id = id;
    this.p$info = Promise.all([
      rp(`http://www.zngirls.com/girl/${id}/`)
        .then(Promise.promisify(env))
        .then(jQuery)
        .then($ => _.mapValues(infoLoaders, loader => loader($))),
      rp(`http://www.zngirls.com/girl/${id}/album/`)
        .then(Promise.promisify(env))
        .then(jQuery)
        .then($ => $('.igalleryli_title > a.caption').map((i, el) => {
          const $el = $(el);
          return $el.attr('href').match(/\/g\/(\d+)\/?/)[1];
        }).toArray())
    ]).spread((info, albumIds) => _.assignIn(info, { albumIds }));
  }

  toJSON() {
    return this.p$info.then(_.clone);
  }

  toJSONString() {
    return this.p$info.then(json => JSON.stringify(json, replacer, 2));
  }

  get bwh() {
    return this.p$info.then(info => _.compact([
      info.bust && `B${info.bust}`,
      info.waist && `W${info.waist}`,
      info.hip && `H${info.hip}`,
    ]).join(' '));
  }

}
